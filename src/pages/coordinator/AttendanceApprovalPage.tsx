import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Box, Typography, Tabs, Tab, Card, CardContent, Grid, Button, Divider, Chip, TextField, Grow, MenuItem, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
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
import AttendanceSheet, {
  AttendanceRecord,
  AssignedClass,
  TutorProfile,
} from '../../components/tutors/AttendanceSheet';
import {
  getCoordinatorPendingSheets,
  approveAttendanceSheet,
  rejectAttendanceSheet,
} from '../../services/attendanceSheetService';
import { getAssignedClasses } from '../../services/coordinatorService';
import { IAttendance, IAttendanceStatistics, IFinalClass, IAttendanceSheet } from '../../types';
import { ATTENDANCE_STATUS, FINAL_CLASS_STATUS } from '../../constants';
import useAuth from '../../hooks/useAuth';

const AttendanceApprovalPage: React.FC = () => {
  const { user } = useAuth();

  const [view, setView] = useState<'pending' | 'all' | 'history' | 'sheets'>('sheets');
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
  const [pendingSheets, setPendingSheets] = useState<IAttendanceSheet[]>([]);
  const sheetRef = useRef<{ exportPdf: () => Promise<void> } | null>(null);
  const [sheetTutorData, setSheetTutorData] = useState<TutorProfile | null>(null);
  const [sheetClassInfo, setSheetClassInfo] = useState<AssignedClass | null>(null);
  const [sheetRange, setSheetRange] = useState<{ start: string; end: string } | undefined>();

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
    if (view === 'sheets') {
      (async () => {
        try {
          const res = await getCoordinatorPendingSheets();
          setPendingSheets(res.data || []);
        } catch {
          setPendingSheets([]);
        }
      })();
    }
  }, [view, filters.classId, fetchAllAttendances, fetchClassHistory, fetchPendingApprovals]);

  const handleApproveSheet = useCallback(
    async (sheetId: string) => {
      setLoading(true);
      try {
        await approveAttendanceSheet(sheetId);
        setSnackbar({ open: true, message: 'Attendance sheet approved', severity: 'success' });
        const res = await getCoordinatorPendingSheets();
        setPendingSheets(res.data || []);
      } catch (e: any) {
        setSnackbar({ open: true, message: e?.message || 'Failed to approve sheet', severity: 'error' });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleViewMonthlySheet = useCallback(
    async (sheet: IAttendanceSheet) => {
      try {
        const finalClass: any = sheet.finalClass || {};
        const classIdStr = String(finalClass.id || finalClass._id || '');
        if (!classIdStr) {
          setSnackbar({ open: true, message: 'Class information missing for this sheet', severity: 'error' });
          return;
        }

        const res = await getAttendanceByClass(classIdStr);
        const attendances = (res.data || []) as any[];
        if (!attendances.length) {
          setSnackbar({ open: true, message: 'No attendance records found for this class', severity: 'info' });
          return;
        }

        const year = sheet.year;
        const month = sheet.month; // 1-12
        const monthStr = String(month).padStart(2, '0');

        const mapped: AttendanceRecord[] = attendances
          .map((a: any) => {
            const dateObj = a.sessionDate ? new Date(a.sessionDate as any) : null;
            const yyyyMmDd = dateObj
              ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
                dateObj.getDate()
              ).padStart(2, '0')}`
              : '';

            let durationHours =
              typeof a.durationHours === 'number'
                ? a.durationHours
                : (a.finalClass as any)?.classLead?.classDurationHours ?? undefined;

            if (typeof durationHours !== 'number') {
              durationHours = 1;
            }

            return {
              classId: classIdStr,
              date: yyyyMmDd,
              status: (a as any).studentAttendanceStatus || a.status || '',
              duration: typeof durationHours === 'number' ? durationHours : undefined,
              topicsCovered: a.topicCovered || undefined,
              markedAt: a.submittedAt
                ? String(a.submittedAt)
                : a.createdAt
                  ? String(a.createdAt)
                  : '',
            } as AttendanceRecord;
          })
          .filter((r) => r.date && r.date.startsWith(`${year}-${monthStr}`));

        if (!mapped.length) {
          setSnackbar({ open: true, message: 'No attendance records for this month', severity: 'info' });
          return;
        }

        const firstDay = `${year}-${monthStr}-01`;
        const lastDate = new Date(year, month, 0).getDate();
        const lastDay = `${year}-${monthStr}-${String(lastDate).padStart(2, '0')}`;

        setSheetTutorData({ attendanceRecords: mapped } as TutorProfile);
        setSheetClassInfo({
          classId: finalClass.className || classIdStr,
          studentName: finalClass.studentName || '',
          subject: Array.isArray(finalClass.subject)
            ? finalClass.subject.join(', ')
            : (finalClass.subject as any),
          tutorName: user?.name || 'Tutor',
        } as AssignedClass);
        setSheetRange({ start: firstDay, end: lastDay });

        setTimeout(async () => {
          try {
            await sheetRef.current?.exportPdf();
          } catch {
            // ignore
          }
        }, 0);
      } catch (e: any) {
        setSnackbar({ open: true, message: e?.message || 'Failed to prepare attendance sheet PDF', severity: 'error' });
      }
    },
    [user?.name]
  );

  const handleRejectSheet = useCallback(
    async (sheetId: string) => {
      // Simple inline reason collection for now
      const reason = window.prompt('Reason for rejecting this attendance sheet?');
      if (!reason) return;
      setLoading(true);
      try {
        await rejectAttendanceSheet(sheetId, reason);
        setSnackbar({ open: true, message: 'Attendance sheet rejected', severity: 'success' });
        const res = await getCoordinatorPendingSheets();
        setPendingSheets(res.data || []);
      } catch (e: any) {
        setSnackbar({ open: true, message: e?.message || 'Failed to reject sheet', severity: 'error' });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
          color: 'white',
          py: { xs: 4, md: 5 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 2, md: 3 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Attendance Approvals
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
              Review and manage attendance records submitted by parents.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
            }}
          >
            Refresh
          </Button>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Tabs 
            value={view} 
            onChange={(_e, v) => setView(v)}
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 600, minHeight: 48, fontSize: '0.95rem' },
              '& .Mui-selected': { color: '#fff !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 4 }
            }}
          >
            <Tab value="all" label="All Records" />
            <Tab value="history" label="Class History" />
            <Tab value="sheets" label="Monthly Sheets" />
          </Tabs>
        </Box>
        
        {/* Abstract shapes */}
        <Box sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -50,
          left: 100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>

      {error && (
        <Box mb={2}>
          <ErrorAlert error={error} />
        </Box>
      )}

      {view === 'sheets' && (
        <Box>
          {loading && pendingSheets.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Pending Monthly Sheets ({pendingSheets.length})
              </Typography>
              {pendingSheets.length === 0 ? (
                <Box textAlign="center" py={8} bgcolor="background.paper" borderRadius={3} border="1px dashed" borderColor="divider">
                  <Typography variant="body1" color="text.secondary">No pending attendance sheets</Typography>
                </Box>
              ) : (
                pendingSheets.map((sheet) => (
                  <Box key={sheet.id} sx={{ mb: 2, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                            {sheet.finalClass?.studentName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                             {(Array.isArray(sheet.finalClass?.subject) ? sheet.finalClass.subject.join(', ') : sheet.finalClass?.subject)}
                            </Typography>
                        </Box>
                        <Chip label={sheet.periodLabel || `${sheet.month}/${sheet.year}`} size="small" variant="outlined" />
                    </Box>
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={4}>
                             <Typography variant="caption" color="text.secondary">SESSIONS</Typography>
                             <Typography variant="body2" fontWeight={600}>{sheet.totalSessionsTaken ?? 0} / {sheet.totalSessionsPlanned ?? '—'}</Typography>
                        </Grid>
                         <Grid item xs={4}>
                             <Typography variant="caption" color="text.secondary">PRESENT</Typography>
                             <Typography variant="body2" fontWeight={600} color="success.main">{sheet.presentCount ?? 0}</Typography>
                        </Grid>
                         <Grid item xs={4}>
                             <Typography variant="caption" color="text.secondary">ABSENT</Typography>
                             <Typography variant="body2" fontWeight={600} color="error.main">{sheet.absentCount ?? 0}</Typography>
                        </Grid>
                    </Grid>
                    
                    <Box display="flex" gap={1.5} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewMonthlySheet(sheet)}
                      >
                        View Sheet
                      </Button>
                      <Box flex={1} />
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleRejectSheet(sheet.id)}
                        disabled={loading}
                      >
                        Reject
                      </Button>
                       <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleApproveSheet(sheet.id)}
                        disabled={loading || (Number(sheet.totalSessionsTaken || 0) < Number(sheet.totalSessionsPlanned || 0))}
                      >
                        Approve
                      </Button>
                    </Box>
                  </Box>
                ))
              )}
            </>
          )}
        </Box>
      )}

      {view === 'pending' && (
        <Box>
          {loading && pendingAttendances.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <>
              {pendingAttendances.length === 0 ? (
                <Box textAlign="center" py={8} bgcolor="background.paper" borderRadius={3} border="1px dashed" borderColor="divider">
                   <Typography variant="h6" color="text.secondary" gutterBottom>All Caught Up</Typography>
                   <Typography variant="body2" color="text.secondary">No pending approvals required.</Typography>
                </Box>
              ) : (
                pendingAttendances.map((a, index) => (
                  <Grow in={true} timeout={300 + index * 50} key={a.id}>
                    <Box sx={{ mb: 2 }}>
                      <AttendanceApprovalCard
                        attendance={a}
                        userRole="COORDINATOR"
                        onApprove={handleApprove}
                        onReject={handleRejectClick}
                        loading={loading}
                      />
                    </Box>
                  </Grow>
                ))
              )}
            </>
          )}
        </Box>
      )}

      {view === 'all' && (
        <Box>
          <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
             <CardContent sx={{ py: 2 }}>
                <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                    select
                    fullWidth
                    label="Class"
                    size="small"
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
                    size="small"
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
                    size="small"
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
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={filters.toDate || ''}
                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                    />
                </Grid>
                </Grid>
                 <Box display="flex" justifyContent="flex-end" mt={2}>
                     {activeFilterCount > 0 && (
                        <Button size="small" onClick={handleClearFilters} color="inherit">
                            Clear Filters ({activeFilterCount})
                        </Button>
                     )}
                 </Box>
            </CardContent>
          </Card>

          {loading && <LoadingSpinner />}
          {!loading && (
             <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                Showing {allAttendances.length} records
            </Typography>
          )}

          {allAttendances.length === 0 && !loading ? (
             <Box textAlign="center" py={8} bgcolor="background.paper" borderRadius={3} border="1px dashed" borderColor="divider">
                <Typography color="text.secondary">No attendance records found matching filters.</Typography>
             </Box>
          ) : (
            allAttendances.map((a, index) => (
              <Grow in={true} timeout={300 + index * 50} key={a.id}>
                <Box sx={{ mb: 2 }}>
                    <AttendanceApprovalCard
                    attendance={a}
                    userRole="COORDINATOR"
                    onApprove={handleApprove}
                    onReject={handleRejectClick}
                    loading={loading}
                    />
                </Box>
              </Grow>
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
      {sheetTutorData && sheetClassInfo && (
        <Box sx={{ position: 'absolute', left: -9999, top: -9999 }}>
          <AttendanceSheet
            ref={sheetRef}
            tutorData={sheetTutorData}
            classInfo={sheetClassInfo}
            range={sheetRange}
            sheetNo={1}
          />
        </Box>
      )}
    </Container>
  );
};

export default AttendanceApprovalPage;
