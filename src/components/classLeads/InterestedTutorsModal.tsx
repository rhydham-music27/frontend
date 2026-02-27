import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Chip, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import announcementService from '../../services/announcementService';
import { ITutorComparison } from '../../types';

export default function InterestedTutorsModal({ open, onClose, announcementId, onSelectTutor }: { open: boolean; onClose: () => void; announcementId: string; onSelectTutor: (t: ITutorComparison) => void; }) {
  const [interestedTutors, setInterestedTutors] = useState<ITutorComparison[]>([]);
  const [recommendedTutors, setRecommendedTutors] = useState<ITutorComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      try {
        setLoading(true);
        setError(null);

        const [interestedRes, recommendedRes] = await Promise.all([
          announcementService.getInterestedTutors(announcementId),
          announcementService.getRecommendedTutors(announcementId)
        ]);

        const normalizeTutors = (list: any) => {
          const items = (list as any)?.data ?? list;
          return (Array.isArray(items) ? items : []).map((r: any, idx: number) => {
            const user = r?.user || null;
            const rawId = r?.id || r?._id || user?._id || user?.id || `${user?.email || 'row'}-${idx}`;
            const id = String(rawId);

            return {
              ...r,
              id,
              user,
              name: r?.name ?? user?.name ?? '-',
              experienceHours: r?.experienceHours ?? 0,
              subjects: Array.isArray(r?.subjects) ? r.subjects : [],
              classesAssigned: r?.classesAssigned ?? 0,
              demosTaken: r?.demosTaken ?? 0,
              approvalRatio: r?.approvalRatio ?? 0,
              ratings: r?.ratings ?? 0,
              verificationStatus: r?.verificationStatus ?? 'UNKNOWN',
              interestedAt: r?.interestedAt ?? null,
              matchPercentage: r?.matchPercentage ?? 0,
              teacherId: r?.teacherId,
            } as ITutorComparison as any;
          });
        };

        setInterestedTutors(normalizeTutors(interestedRes));
        setRecommendedTutors(normalizeTutors(recommendedRes));
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load tutor data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, announcementId]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tutor Name',
      width: 180,
      renderCell: (params: any) => {
        const name = params?.row?.name ?? params?.row?.user?.name ?? '-';
        const teacherId = params?.row?.teacherId;

        if (teacherId) {
          return (
            <MuiLink
              component={Link}
              to={`/ourtutor/${teacherId}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {name}
            </MuiLink>
          );
        }

        return <Typography variant="body2" sx={{ fontWeight: 500 }}>{name}</Typography>;
      },
    },
    {
      field: 'experienceHours',
      headerName: 'Exp (hrs)',
      width: 100,
      renderCell: (params: any) => <Typography variant="body2">{params?.row?.experienceHours ?? 0}</Typography>,
    },
    {
      field: 'subjects',
      headerName: 'Subjects',
      width: 200,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(params?.row?.subjects || []).slice(0, 3).map((s: string) => (
            <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
          ))}
          {(params?.row?.subjects || []).length > 3 && (
            <Typography variant="caption" color="textSecondary">+{params.row.subjects.length - 3}</Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'approvalRatio',
      headerName: 'Approval Rate',
      width: 110,
      renderCell: (params: any) => {
        const v = Number(params?.row?.approvalRatio ?? 0);
        return <Typography variant="body2">{`${v.toFixed(0)}%`}</Typography>;
      },
    },
    {
      field: 'ratings',
      headerName: 'Rating',
      width: 80,
      renderCell: (params: any) => <Typography variant="body2">{params?.row?.ratings ?? 0}★</Typography>,
    },
    {
      field: 'matchPercentage',
      headerName: 'Match Score',
      width: 110,
      renderCell: (params: any) => {
        const v = Number(params?.row?.matchPercentage ?? 0);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: v >= 80 ? 'success.main' : v >= 50 ? 'primary.main' : 'text.secondary' }}>
              {v}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'interestedAt',
      headerName: 'Info',
      width: 140,
      renderCell: (params: any) => {
        if (params.row.isRecommendation) {
          return <Typography variant="caption" color="textSecondary">Recommended</Typography>;
        }
        const raw = params?.row?.interestedAt;
        return <Typography variant="caption">{raw ? new Date(raw).toLocaleDateString() : '-'}</Typography>;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: (params: any) => {
        const status = params?.row?.verificationStatus;
        const isVerified = status === 'VERIFIED';
        const tutorId = params?.row?.id || params?.row?._id;

        if (isVerified) {
          return <Button size="small" variant="contained" onClick={() => onSelectTutor(params.row)} sx={{ fontSize: '0.7rem' }}>Select</Button>;
        }

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              component={Link}
              to={`/tutor-profile/${tutorId}`}
              sx={{ fontSize: '0.65rem', lineHeight: 1.2, py: 0.3 }}
            >
              Verify First
            </Button>
            <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>
              Not verified
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Typography variant="h6">Mentor Matching for Class Lead</Typography>
      </DialogTitle>
      <DialogContent sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <ErrorAlert error={error} />}

        {loading ? (
          <Box sx={{ p: 4 }}><LoadingSpinner /></Box>
        ) : (
          <>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                Interested Tutors ({interestedTutors.length})
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <DataGrid
                  rows={interestedTutors}
                  columns={columns}
                  getRowId={(r: any) => r.id}
                  hideFooter={interestedTutors.length <= 5}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                    sorting: { sortModel: [{ field: 'matchPercentage', sort: 'desc' }] }
                  }}
                  sx={{ border: 'none', backgroundColor: 'rgba(0,0,0,0.01)' }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'secondary.main' }}>
                Recommended Mentors ({recommendedTutors.length})
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <DataGrid
                  rows={recommendedTutors}
                  columns={columns}
                  getRowId={(r: any) => r.id}
                  hideFooter={recommendedTutors.length <= 5}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                    sorting: { sortModel: [{ field: 'matchPercentage', sort: 'desc' }] }
                  }}
                  sx={{ border: 'none', backgroundColor: 'rgba(0,0,0,0.01)' }}
                />
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
