import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Button,
  Grid,
  Divider,
  Alert,
  Badge,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import AttendanceApprovalCard from '../../components/attendance/AttendanceApprovalCard';
import RejectAttendanceModal from '../../components/attendance/RejectAttendanceModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import {
  getCoordinatorPendingApprovals,
  getAttendanceByClass,
  getAttendanceHistory,
  coordinatorApprove,
  rejectAttendance,
  getAttendances,
} from '../../services/attendanceService';
import { getAssignedClasses } from '../../services/coordinatorService';
import { IAttendance, IAttendanceStatistics, IFinalClass } from '../../types';
import { ATTENDANCE_STATUS, FINAL_CLASS_STATUS } from '../../constants';
import useAuth from '../../hooks/useAuth';

const AttendanceApprovalPage: React.FC = () => {
  const { user } = useAuth();

  const [view, setView] = useState<'pending' | 'all' | 'history'>('pending');
  const [pendingAttendances, setPendingAttendances] = useState<IAttendance[]>([]);
  const [allAttendances, setAllAttendances] = useState<IAttendance[]>([]);
  const [historyData, setHistoryData] = useState<{
    attendances: IAttendance[];
    statistics: IAttendanceStatistics;
  } | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status?: string;
    fromDate?: string;
    toDate?: string;
    classId?: string;
  }>({});
  const [selectedAttendance, setSelectedAttendance] = useState<IAttendance | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((v) => v && `${v}`.length > 0).length;
  }, [filters]);

  const fetchAssignedClasses = useCallback(async () => {
    try {
      const res = await getAssignedClasses(1, 100);
      const data: IFinalClass[] = res?.data || [];
      const active = data.filter((c) => c.status === FINAL_CLASS_STATUS.ACTIVE);
      setAssignedClasses(active);
    } catch (e) {
      setAssignedClasses([]);
    }
  }, []);

  const fetchPendingApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCoordinatorPendingApprovals();
      const list: IAttendance[] = (res?.data || []).slice().sort((a: any, b: any) => {
        return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
      });
      setPendingAttendances(list);
    } catch (e) {
      setPendingAttendances([]);
      setError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllAttendances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status, fromDate, toDate, classId } = filters;
      let res;
      if (classId) {
        res = await getAttendanceByClass(classId, status);
      } else {
        res = await getAttendances({ status, fromDate, toDate, coordinatorId: user?.id });
      }
      const list: IAttendance[] = (res?.data || []).slice().sort((a: any, b: any) => {
        return new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime();
      });
      setAllAttendances(list);
    } catch (e) {
      setAllAttendances([]);
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, [filters, user?.id]);

  const fetchClassHistory = useCallback(async (classId: string) => {
    if (!classId) {
      setHistoryData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getAttendanceHistory(classId);
      const data = res?.data || {};
      setHistoryData({
        attendances: data.attendances || [],
        statistics: data.statistics || {
          totalSessions: 0,
          approvedCount: 0,
          pendingCount: 0,
          rejectedCount: 0,
          approvalRate: 0,
        },
      });
    } catch (e) {
      setHistoryData(null);
      setError('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignedClasses();
    fetchPendingApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (view === 'all') {
      fetchAllAttendances();
    }
  }, [view, fetchAllAttendances]);

  useEffect(() => {
    if (view === 'all') {
      fetchAllAttendances();
    }
  }, [filters, view, fetchAllAttendances]);

  const handleApprove = useCallback(async (attendanceId: string) => {
    setLoading(true);
    try {
      await coordinatorApprove(attendanceId);
      setSnackbar({ open: true, message: 'Attendance approved successfully', severity: 'success' });
      await fetchPendingApprovals();
      if (view === 'all') await fetchAllAttendances();
      if (view === 'history' && filters.classId) await fetchClassHistory(filters.classId);
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.message || 'Failed to approve attendance', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [fetchAllAttendances, fetchClassHistory, fetchPendingApprovals, filters.classId, view]);

  const handleRejectClick = useCallback((attendance: IAttendance) => {
    setSelectedAttendance(attendance);
    setRejectModalOpen(true);
  }, []);

  const handleRejectSubmit = useCallback(async (reason: string) => {
    if (!selectedAttendance) return;
    setLoading(true);
    try {
      await rejectAttendance(selectedAttendance.id, reason);
      setSnackbar({ open: true, message: 'Attendance rejected', severity: 'success' });
      setRejectModalOpen(false);
      setSelectedAttendance(null);
      await fetchPendingApprovals();
      if (view === 'all') await fetchAllAttendances();
      if (view === 'history' && filters.classId) await fetchClassHistory(filters.classId);
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.message || 'Failed to reject attendance', severity: 'error' });
    } finally {
      setLoading(false);
      setRejectModalOpen(false);
    }
  }, [selectedAttendance, fetchAllAttendances, fetchClassHistory, fetchPendingApprovals, filters.classId, view]);

  const handleClassSelect = useCallback((classId: string) => {
    if (!classId) {
      setHistoryData(null);
      return;
    }
    fetchClassHistory(classId);
  }, [fetchClassHistory]);

  const handleFilterChange = useCallback((field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    if (view === 'history') setHistoryData(null);
  }, [view]);

  const handleRefresh = useCallback(() => {
    setSnackbar({ open: true, message: 'Refreshing data...', severity: 'info' });
    if (view === 'pending') fetchPendingApprovals();
    if (view === 'all') fetchAllAttendances();
    if (view === 'history' && filters.classId) fetchClassHistory(filters.classId);
  }, [view, filters.classId, fetchAllAttendances, fetchClassHistory, fetchPendingApprovals]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Attendance Approvals</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Box mb={2}>
          <ErrorAlert error={error} />
        </Box>
      )}

      <Card sx={{ mb: 2 }}>
        <Tabs
          value={view}
          onChange={(_, v) => setView(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
        >
          <Tab
            value="pending"
            label={
              <Badge color="primary" badgeContent={pendingAttendances.length} max={999} showZero>
                Pending Approvals
              </Badge>
            }
          />
          <Tab value="all" label="All Attendance" />
          <Tab value="history" label="Class History" />
        </Tabs>
      </Card>

      {view === 'pending' && (
        <Box>
          {loading && pendingAttendances.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pending Approvals ({pendingAttendances.length})
              </Typography>
              {pendingAttendances.length === 0 ? (
                <Typography color="text.secondary">No pending approvals</Typography>
              ) : (
                pendingAttendances.map((a) => (
                  <Box key={a.id} sx={{ mb: 2 }}>
                    <AttendanceApprovalCard
                      attendance={a}
                      userRole="COORDINATOR"
                      onApprove={handleApprove}
                      onReject={handleRejectClick}
                      loading={loading}
                    />
                  </Box>
                ))
              )}
            </>
          )}
        </Box>
      )}

      {view === 'all' && (
        <Box>
          <Card sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Class"
                  value={filters.classId || ''}
                  onChange={(e) => handleFilterChange('classId', e.target.value)}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {assignedClasses.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.studentName} • {(Array.isArray(cls.subject) ? cls.subject : [cls.subject]).join(', ')}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.values(ATTENDANCE_STATUS).map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  type="date"
                  fullWidth
                  label="From Date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.fromDate || ''}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  type="date"
                  fullWidth
                  label="To Date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.toDate || ''}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    {activeFilterCount > 0 && (
                      <Badge color="secondary" badgeContent={activeFilterCount} sx={{ mr: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Active filters
                        </Typography>
                      </Badge>
                    )}
                  </Box>
                  <Button variant="text" startIcon={<FilterListIcon />} onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {loading && <LoadingSpinner />}
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Showing {allAttendances.length} attendance records
          </Typography>
          {allAttendances.length === 0 && !loading ? (
            <Typography color="text.secondary">No attendance records found</Typography>
          ) : (
            allAttendances.map((a) => (
              <Box key={a.id} sx={{ mb: 2 }}>
                <AttendanceApprovalCard
                  attendance={a}
                  userRole="COORDINATOR"
                  onApprove={handleApprove}
                  onReject={handleRejectClick}
                  loading={loading}
                />
              </Box>
            ))
          )}
        </Box>
      )}

      {view === 'history' && (
        <Box>
          <Card sx={{ p: 2, mb: 2 }}>
            <TextField
              select
              fullWidth
              label="Select Class"
              value={filters.classId || ''}
              onChange={(e) => {
                handleFilterChange('classId', e.target.value);
                handleClassSelect(e.target.value);
              }}
            >
              <MenuItem value="">Select a class</MenuItem>
              {assignedClasses.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.studentName} • {(Array.isArray(cls.subject) ? cls.subject : [cls.subject]).join(', ')}
                </MenuItem>
              ))}
            </TextField>
          </Card>

          {!filters.classId && (
            <Alert severity="info">Please select a class to view attendance history</Alert>
          )}

          {loading && <LoadingSpinner />}

          {historyData && !loading && (
            <>
              <Card sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="h4">{historyData.statistics.totalSessions}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="h4" color="success.main">
                      {historyData.statistics.approvedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Approved</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="h4" color="warning.main">
                      {historyData.statistics.pendingCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="h4" color="primary.main">
                      {historyData.statistics.approvalRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Approval Rate</Typography>
                  </Grid>
                </Grid>
              </Card>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>Attendance Records</Typography>
              {historyData.attendances.length === 0 ? (
                <Typography color="text.secondary">No attendance records for this class</Typography>
              ) : (
                historyData.attendances.map((a) => (
                  <Box key={a.id} sx={{ mb: 2 }}>
                    <AttendanceApprovalCard
                      attendance={a}
                      userRole="COORDINATOR"
                      onApprove={handleApprove}
                      onReject={handleRejectClick}
                      loading={loading}
                    />
                  </Box>
                ))
              )}
            </>
          )}
        </Box>
      )}

      <RejectAttendanceModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        attendance={selectedAttendance}
        onReject={handleRejectSubmit}
      />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default AttendanceApprovalPage;
