import { useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Card, Tabs, Tab, TextField, MenuItem, Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AttendanceStatusChip from '../../components/attendance/AttendanceStatusChip';
import AttendanceApprovalCard from '../../components/attendance/AttendanceApprovalCard';
import RejectAttendanceModal from '../../components/attendance/RejectAttendanceModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import useAttendance from '../../hooks/useAttendance';
import useAuth from '../../hooks/useAuth';
import { IAttendance } from '../../types';
import { ATTENDANCE_STATUS, USER_ROLES } from '../../constants';
import {
  getCoordinatorPendingApprovals,
  getParentPendingApprovals,
} from '../../services/attendanceService';

export default function AttendanceListPage() {
  const { user } = useAuth();
  const role = user?.role as keyof typeof USER_ROLES | undefined;

  const [filters, setFilters] = useState<{ status?: string; fromDate?: string; toDate?: string; page: number; limit: number }>({ page: 1, limit: 10 });
  const { attendances, loading, error, pagination, refetch, approveAsCoordinator, approveAsParent, rejectRecord } = useAttendance(filters);

  const [view, setView] = useState<'all' | 'pending'>('pending');
  const [pending, setPending] = useState<IAttendance[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [selected, setSelected] = useState<IAttendance | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const isCoordinator = role === USER_ROLES.COORDINATOR;
  const isParent = role === USER_ROLES.PARENT;

  const fetchPending = async () => {
    try {
      setLoadingPending(true);
      const res = isCoordinator
        ? await getCoordinatorPendingApprovals()
        : isParent
        ? await getParentPendingApprovals()
        : { data: [] } as any;
      setPending(res.data || []);
    } catch (_) {
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    if (isCoordinator || isParent) fetchPending();
  }, [isCoordinator, isParent]);

  const handleApprove = async (id: string) => {
    if (isCoordinator) await approveAsCoordinator(id);
    if (isParent) await approveAsParent(id);
    setSnack({ open: true, message: 'Attendance approved', severity: 'success' });
    await fetchPending();
    await refetch();
  };

  const handleRejectClick = (a: IAttendance) => {
    setSelected(a);
    setRejectOpen(true);
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!selected) return;
    await rejectRecord(selected.id, reason as any);
    setSnack({ open: true, message: 'Attendance rejected', severity: 'success' });
    setRejectOpen(false);
    setSelected(null);
    await fetchPending();
    await refetch();
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'sessionDate',
        headerName: 'Date',
        width: 140,
        valueFormatter: (v: any) => (v?.value ? new Date(v.value).toLocaleDateString() : ''),
      },
      { field: 'sessionNumber', headerName: 'Session #', width: 110 },
      {
        field: 'student',
        headerName: 'Student',
        width: 200,
        valueGetter: (p: any) => p?.row?.finalClass?.studentName || '',
      },
      {
        field: 'subjects',
        headerName: 'Subjects',
        width: 200,
        valueGetter: (p: any) => (p?.row?.finalClass?.subject || []).join(', '),
      },
      {
        field: 'tutor',
        headerName: 'Tutor',
        width: 180,
        valueGetter: (p: any) => p?.row?.tutor?.name || '',
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 180,
        renderCell: (p: any) => <AttendanceStatusChip status={p?.value} />,
      },
    ],
    []
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Attendance Management</Typography>
      <Card sx={{ mb: 2 }}>
        <Tabs value={view} onChange={(_, v) => setView(v)}>
          <Tab label="Pending Approvals" value="pending" />
          <Tab label="All Attendance" value="all" />
        </Tabs>
      </Card>

      {view === 'pending' && (
        <Box>
          {loadingPending ? (
            <LoadingSpinner />
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Pending Approvals ({pending.length})</Typography>
              {pending.map((a) => (
                <AttendanceApprovalCard key={a.id} attendance={a} userRole={isCoordinator ? 'COORDINATOR' : 'PARENT'} onApprove={handleApprove} onReject={handleRejectClick} />
              ))}
              {pending.length === 0 && (
                <Typography color="text.secondary">No pending approvals.</Typography>
              )}
            </Box>
          )}
        </Box>
      )}

      {view === 'all' && (
        <Box>
          <Card sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField select label="Status" size="small" value={filters.status || ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))} sx={{ minWidth: 200 }}>
              <MenuItem value="">All</MenuItem>
              {Object.values(ATTENDANCE_STATUS).map((s) => (
                <MenuItem key={s} value={s}>{(s as string).replace(/_/g, ' ')}</MenuItem>
              ))}
            </TextField>
            <TextField type="date" label="From" size="small" InputLabelProps={{ shrink: true }} value={filters.fromDate || ''} onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value || undefined, page: 1 }))} />
            <TextField type="date" label="To" size="small" InputLabelProps={{ shrink: true }} value={filters.toDate || ''} onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value || undefined, page: 1 }))} />
            <Button onClick={() => setFilters({ page: 1, limit: 10 })}>Clear Filters</Button>
          </Card>
          <Card sx={{ p: 2 }}>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <DataGrid
                rows={attendances}
                columns={columns}
                getRowId={(r: any) => r.id || r._id}
                paginationMode="server"
                rowCount={pagination.total}
                pageSizeOptions={[filters.limit]}
                initialState={{ pagination: { paginationModel: { pageSize: filters.limit, page: filters.page - 1 } } }}
                onPaginationModelChange={(m: any) => setFilters((prev) => ({ ...prev, page: (m.page || 0) + 1 }))}
                disableRowSelectionOnClick
                autoHeight
                sx={{ border: 'none' }}
              />
            )}
            <ErrorAlert error={error} />
          </Card>
        </Box>
      )}

      <RejectAttendanceModal open={rejectOpen} onClose={() => setRejectOpen(false)} attendance={selected} onReject={handleRejectSubmit} />
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
