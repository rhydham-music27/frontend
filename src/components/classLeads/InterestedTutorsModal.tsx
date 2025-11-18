import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Chip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import announcementService from '../../services/announcementService';
import { ITutorComparison } from '../../types';

export default function InterestedTutorsModal({ open, onClose, announcementId, onSelectTutor }: { open: boolean; onClose: () => void; announcementId: string; onSelectTutor: (t: ITutorComparison) => void; }) {
  const [tutors, setTutors] = useState<ITutorComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutors = async () => {
      if (!open) return;
      try {
        setLoading(true);
        setError(null);
        const res = await announcementService.getInterestedTutors(announcementId);
        const list = (res as any)?.data ?? res;

        const normalized = (Array.isArray(list) ? list : []).map((r: any, idx: number) => {
          const user = r?.user || null;
          const rawId = r?.id || r?._id || user?._id || user?.id || `${user?.email || 'row'}-${idx}`;
          const id = String(rawId);

          return {
            // keep original fields
            ...r,
            // normalized/derived fields used by the grid
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
          } as ITutorComparison as any;
        });
        setTutors(normalized);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load interested tutors');
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, [open, announcementId]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tutor Name',
      width: 200,
      renderCell: (params: any) => {
        const r = params?.row || {};
        const name = r.name ?? r.user?.name ?? '-';
        return <Typography variant="body2">{name}</Typography>;
      },
    },
    {
      field: 'experienceHours',
      headerName: 'Experience (hrs)',
      width: 150,
      renderCell: (params: any) => <Typography variant="body2">{params?.row?.experienceHours ?? 0}</Typography>,
    },
    {
      field: 'subjects',
      headerName: 'Subjects',
      width: 220,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(params?.row?.subjects || []).map((s: string) => (
            <Chip key={s} label={s} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: 'classesAssigned',
      headerName: 'Classes Assigned',
      width: 160,
      renderCell: (params: any) => <Typography variant="body2">{params?.row?.classesAssigned ?? 0}</Typography>,
    },
    {
      field: 'demosTaken',
      headerName: 'Demos Taken',
      width: 130,
      renderCell: (params: any) => <Typography variant="body2">{params?.row?.demosTaken ?? 0}</Typography>,
    },
    {
      field: 'approvalRatio',
      headerName: 'Approval Rate',
      width: 130,
      renderCell: (params: any) => {
        const v = Number(params?.row?.approvalRatio ?? 0);
        return <Typography variant="body2">{`${v.toFixed(1)}%`}</Typography>;
      },
    },
    {
      field: 'ratings',
      headerName: 'Rating',
      width: 110,
      renderCell: (params: any) => <Typography variant="body2">{params?.row?.ratings ?? 0}</Typography>,
    },
    {
      field: 'verificationStatus',
      headerName: 'Status',
      width: 140,
      renderCell: (params: any) => {
        const status = params?.row?.verificationStatus ?? 'UNKNOWN';
        return <Chip label={status} size="small" color={status === 'VERIFIED' ? 'success' : 'default'} />;
      },
    },
    {
      field: 'interestedAt',
      headerName: 'Interested At',
      width: 210,
      renderCell: (params: any) => {
        const raw = params?.row?.interestedAt;
        const label = raw ? new Date(raw).toLocaleString() : '-';
        return <Typography variant="body2">{label}</Typography>;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: any) => (
        <Button size="small" variant="contained" onClick={() => onSelectTutor(params.row)}>Select</Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Interested Tutors - Comparison View</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 500 }}>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorAlert error={error} />
          ) : (
            <DataGrid
              rows={tutors || []}
              columns={columns}
              getRowId={(r: any) => r.id}
              pageSizeOptions={[5, 10, 20]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              disableRowSelectionOnClick
              sx={{ border: 'none' }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
