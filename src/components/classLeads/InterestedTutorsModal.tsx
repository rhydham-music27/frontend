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
          const user = r?.user || r?.tutor?.user || (r?.tutor && (r.tutor as any)) || null;
          const id = r?.id || r?._id || user?.id || r?.tutor?.id || r?.tutorId || r?.userId || r?.interestedAt || `${user?.email || 'row'}-${r?.interestedAt || idx}`;
          return {
            ...r,
            id,
            user,
            verificationStatus: r?.verificationStatus ?? r?.tutor?.verificationStatus ?? r?.status ?? r?.tutor?.status ?? 'UNKNOWN',
            name: r?.name ?? user?.name ?? r?.tutor?.name ?? '-',
            experienceHours: r?.experienceHours ?? r?.tutor?.experienceHours ?? 0,
            subjects: r?.subjects ?? r?.tutor?.subjects ?? [],
            classesAssigned: r?.classesAssigned ?? r?.tutor?.classesAssigned ?? 0,
            demosTaken: r?.demosTaken ?? r?.tutor?.demosTaken ?? 0,
            approvalRatio: r?.approvalRatio ?? r?.tutor?.approvalRatio ?? 0,
            ratings: r?.ratings ?? r?.tutor?.ratings ?? 0,
            interestedAt: r?.interestedAt ?? r?.createdAt ?? r?.tutor?.interestedAt ?? r?.tutor?.createdAt ?? null,
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
    { field: 'name', headerName: 'Tutor Name', width: 200, valueGetter: (p: any) => p?.row?.name ?? p?.row?.user?.name ?? p?.row?.tutor?.user?.name ?? p?.row?.tutor?.name ?? '-' },
    { field: 'experienceHours', headerName: 'Experience (hrs)', width: 150, type: 'number', valueGetter: (p: any) => p?.row?.experienceHours ?? 0 },
    { field: 'subjects', headerName: 'Subjects', width: 220, renderCell: (p: any) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{(p?.row?.subjects || []).map((s: string) => (<Chip key={s} label={s} size="small" />))}</Box>
    ) },
    { field: 'classesAssigned', headerName: 'Classes Assigned', width: 160, type: 'number', valueGetter: (p: any) => p?.row?.classesAssigned ?? 0 },
    { field: 'demosTaken', headerName: 'Demos Taken', width: 130, type: 'number', valueGetter: (p: any) => p?.row?.demosTaken ?? 0 },
    { field: 'approvalRatio', headerName: 'Approval Rate', width: 130, type: 'number', valueGetter: (p: any) => p?.row?.approvalRatio ?? 0, valueFormatter: (v: any) => `${Number(v?.value ?? 0)}%` },
    { field: 'ratings', headerName: 'Rating', width: 110, type: 'number', valueGetter: (p: any) => p?.row?.ratings ?? 0 },
    { field: 'verificationStatus', headerName: 'Status', width: 140, valueGetter: (p: any) => p?.row?.verificationStatus ?? p?.row?.status ?? p?.row?.tutor?.verificationStatus ?? p?.row?.tutor?.status ?? 'UNKNOWN', renderCell: (p: any) => <Chip label={p?.value ?? '-'} size="small" color={p?.value === 'VERIFIED' ? 'success' : 'default'} /> },
    { field: 'interestedAt', headerName: 'Interested At', width: 210, valueGetter: (p: any) => p?.row?.interestedAt ?? p?.row?.createdAt ?? p?.row?.tutor?.interestedAt ?? p?.row?.tutor?.createdAt, valueFormatter: (v: any) => (v?.value ? new Date(v.value).toLocaleString() : '-') },
    { field: 'actions', headerName: 'Actions', width: 120, sortable: false, renderCell: (p: any) => (
      <Button size="small" variant="contained" onClick={() => onSelectTutor(p.row)}>Select</Button>
    ) },
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
              getRowId={(r: any) => r?.id || r?._id || r?.user?.id || r?.user?._id || r?.tutorId || r?.userId || r?.interestedAt || `${r?.user?.email || 'row'}-${r?.interestedAt || ''}`}
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
