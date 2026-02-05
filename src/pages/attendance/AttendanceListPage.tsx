import React, { useEffect, useMemo, useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  TextField, 
  MenuItem, 
  Button,
  Grid,
  Paper,
  InputAdornment,
  alpha,
  useTheme,
  Chip,
  Divider
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AttendanceStatusChip from '../../components/attendance/AttendanceStatusChip';
import RejectAttendanceModal from '../../components/attendance/RejectAttendanceModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useAttendance from '../../hooks/useAttendance';
import useAuth from '../../hooks/useAuth';
import { IAttendance, IAttendanceSheet } from '../../types';
import { ATTENDANCE_STATUS, USER_ROLES } from '../../constants';
import {
  getCoordinatorPendingApprovals,
  getParentPendingApprovals,
  getAttendanceByClass,
} from '../../services/attendanceService';
import {
  getAllPendingSheets,
  getCoordinatorPendingSheets,
  approveAttendanceSheet,
  rejectAttendanceSheet
} from '../../services/attendanceSheetService';
import AttendanceSheetComponent, { AttendanceRecord, AssignedClass, TutorProfile } from '../../components/tutors/AttendanceSheet';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import FilePresentIcon from '@mui/icons-material/FilePresent';


export default function AttendanceListPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const role = user?.role as keyof typeof USER_ROLES | undefined;

  const [filters, setFilters] = useState<{ status?: string; fromDate?: string; toDate?: string; page: number; limit: number }>({ page: 1, limit: 10 });
  const { attendances, loading, error, pagination, refetch, approveAsCoordinator, approveAsParent, rejectRecord } = useAttendance(filters);

  const [view, setView] = useState<'pending' | 'all'>('pending');
  const [pending, setPending] = useState<IAttendance[]>([]);
  const [pendingSheets, setPendingSheets] = useState<IAttendanceSheet[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [selected, setSelected] = useState<IAttendance | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvingLoading, setApprovingLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  // For PDF Preview
  const [sheetTutorData, setSheetTutorData] = useState<TutorProfile | null>(null);
  const [sheetClassInfo, setSheetClassInfo] = useState<AssignedClass | null>(null);
  const [sheetRange, setSheetRange] = useState<{ start: string; end: string } | undefined>();
  const sheetRef = React.useRef<{ exportPdf: () => Promise<void> } | null>(null);

  const isAdmin = role === USER_ROLES.ADMIN;
  const isManager = role === USER_ROLES.MANAGER;
  const isCoordinator = role === USER_ROLES.COORDINATOR;
  const isParent = role === USER_ROLES.PARENT;

  // Auto-switch view based on role or data
  useEffect(() => {
    // If Admin/Manager, ONLY show pending
    if (isAdmin || isManager) {
      setView('pending');
    } else if (!isCoordinator && !isParent) {
      setView('all');
    }
  }, [isAdmin, isManager, isCoordinator, isParent]);

  const fetchPending = async () => {
    try {
      setLoadingPending(true);
      if (isAdmin || isManager) {
        const res = await getAllPendingSheets();
        setPendingSheets(res.data || []);
      } else if (isCoordinator) {
        const res = await getCoordinatorPendingApprovals();
        setPending(res.data || []);
        // Also fetch sheets if coordinator
        const resSheets = await getCoordinatorPendingSheets();
        setPendingSheets(resSheets.data || []);
      } else if (isParent) {
        const res = await getParentPendingApprovals();
        setPending(res.data || []);
      } else {
        setPending([]);
        setPendingSheets([]);
      }
    } catch (_) {
      setPending([]);
      setPendingSheets([]);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    if (isCoordinator || isParent || isAdmin || isManager) fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCoordinator, isParent, isAdmin, isManager]);


  const performApprove = async () => {
    if (!approvingId) return;
    try {
      setApprovingLoading(true);
      if (isCoordinator) await approveAsCoordinator(approvingId);
      if (isParent) await approveAsParent(approvingId);
      setSnack({ open: true, message: 'Attendance approved', severity: 'success' });
      setConfirmApproveOpen(false);
      setApprovingId(null);
      await fetchPending();
      await refetch();
    } catch (e: any) {
      setSnack({ open: true, message: e.message || 'Approval failed', severity: 'error' });
    } finally {
      setApprovingLoading(false);
    }
  };


  const handleRejectSubmit = async (reason: string) => {
    if (!selected) return;
    try {
      await rejectRecord(selected.id, reason as any);
      setSnack({ open: true, message: 'Attendance rejected', severity: 'success' });
      setRejectOpen(false);
      setSelected(null);
      await fetchPending();
      await refetch();
    } catch (e: any) {
      setSnack({ open: true, message: e.message || 'Rejection failed', severity: 'error' });
    }
  };

  const handleApproveSheet = async (sheetId: string) => {
    try {
      setApprovingLoading(true);
      await approveAttendanceSheet(sheetId);
      setSnack({ open: true, message: 'Attendance sheet approved', severity: 'success' });
      await fetchPending();
    } catch (e: any) {
      setSnack({ open: true, message: e.message || 'Approval failed', severity: 'error' });
    } finally {
      setApprovingLoading(false);
    }
  };

  const handleRejectSheet = async (sheetId: string) => {
    const reason = window.prompt('Reason for rejecting this attendance sheet?');
    if (!reason) return;
    try {
      await rejectAttendanceSheet(sheetId, reason);
      setSnack({ open: true, message: 'Attendance sheet rejected', severity: 'success' });
      await fetchPending();
    } catch (e: any) {
      setSnack({ open: true, message: e.message || 'Rejection failed', severity: 'error' });
    }
  };

  const handleViewMonthlySheet = async (sheet: IAttendanceSheet) => {
    try {
      const finalClass: any = sheet.finalClass || {};
      const classIdStr = String(finalClass.id || finalClass._id || '');
      if (!classIdStr) {
        setSnack({ open: true, message: 'Class information missing for this sheet', severity: 'error' });
        return;
      }

      const res = await getAttendanceByClass(classIdStr);
      const attendances = (res.data || []) as any[];
      if (!attendances.length) {
        setSnack({ open: true, message: 'No attendance records found for this class', severity: 'info' });
        return;
      }

      const year = sheet.year;
      const month = sheet.month;
      const monthStr = String(month).padStart(2, '0');

      const mapped: AttendanceRecord[] = attendances
        .map((a: any) => {
          const dateObj = a.sessionDate ? new Date(a.sessionDate as any) : null;
          const yyyyMmDd = dateObj
            ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
              dateObj.getDate()
            ).padStart(2, '0')}`
            : '';

          let durationHours = typeof a.durationHours === 'number' ? a.durationHours : (a.finalClass as any)?.classLead?.classDurationHours ?? 1;

          return {
            classId: classIdStr,
            date: yyyyMmDd,
            status: a.studentAttendanceStatus || a.status || '',
            duration: durationHours,
            topicsCovered: a.topicCovered || undefined,
            markedAt: a.submittedAt ? String(a.submittedAt) : a.createdAt ? String(a.createdAt) : '',
          } as AttendanceRecord;
        })
        .filter((r) => r.date && r.date.startsWith(`${year}-${monthStr}`));

      if (!mapped.length) {
        setSnack({ open: true, message: 'No attendance records for this month', severity: 'info' });
        return;
      }

      const firstDay = `${year}-${monthStr}-01`;
      const lastDate = new Date(year, month, 0).getDate();
      const lastDay = `${year}-${monthStr}-${String(lastDate).padStart(2, '0')}`;

      setSheetTutorData({ attendanceRecords: mapped } as TutorProfile);
      setSheetClassInfo({
        classId: finalClass.className || classIdStr,
        studentName: finalClass.studentName || '',
        subject: Array.isArray(finalClass.subject) ? finalClass.subject.join(', ') : String(finalClass.subject),
        tutorName: sheet.coordinator?.name || 'Your Shikshak',
      } as AssignedClass);
      setSheetRange({ start: firstDay, end: lastDay });

      setTimeout(async () => {
        try {
          await sheetRef.current?.exportPdf();
        } catch { /* ignore */ }
      }, 0);
    } catch (e: any) {
      setSnack({ open: true, message: e.message || 'Failed to prepare PDF', severity: 'error' });
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'sessionDate',
        headerName: 'Date',
        width: 140,
        renderCell: (params) => {
          const d = params.value ? new Date(params.value) : null;
          return (
            <Typography variant="body2" fontWeight={500}>
              {d ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' }) : '-'}
            </Typography>
          );
        }
      },
      { 
        field: 'sessionNumber', 
        headerName: 'Session #', 
        width: 100,
        renderCell: (p) => <Chip label={`#${p.value}`} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
      },
      {
        field: 'student',
        headerName: 'Student',
        width: 180,
        valueGetter: (p: any) => p?.row?.finalClass?.studentName || '',
        renderCell: (p) => <Typography variant="body2" fontWeight={600}>{p.value}</Typography>
      },
      {
        field: 'subjects',
        headerName: 'Subjects',
        width: 200,
        valueGetter: (p: any) => (p?.row?.finalClass?.subject || []).join(', '),
        renderCell: (p) => (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {p.value.split(', ').filter(Boolean).map((s: string) => (
               <Chip key={s} label={s} size="small" sx={{ fontSize: '0.75rem', height: 24 }} />
            ))}
          </Box>
        )
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
        width: 200,
        renderCell: (p: any) => <AttendanceStatusChip status={p?.value} />,
      },
    ],
    []
  );

  return (
    <Container maxWidth="xl" sx={{ pb: 5 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
          color: 'white',
          pt: { xs: 4, md: 5 },
          pb: 0,
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mt: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-start' }, mb: 2 }}>
          <Box mb={{ xs: 2, md: 0 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Attendance Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
              Track sessions, approve records, and manage student attendance history.
            </Typography>
          </Box>
        </Box>

        {/* Tabs Integrated in Hero */}
        <Box sx={{ position: 'relative', zIndex: 1, mt: 3 }}>
          <Tabs 
            value={view} 
            onChange={(_, v) => setView(v)}
             sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                minWidth: 'auto',
                px: 3,
                pb: 2,
              },
              '& .Mui-selected': { color: '#fff !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 4, borderRadius: '4px 4px 0 0' }
            }}
          >
            {(isCoordinator || isParent || isAdmin || isManager) && (
              <Tab 
                icon={<AccessTimeIcon fontSize="small" />} 
                iconPosition="start" 
                label={`Pending Approvals ${pendingSheets.length > 0 ? `(${pendingSheets.length})` : ''}`} 
                value="pending" 
              />
            )}
            {(!isAdmin && !isManager) && (
              <Tab 
                icon={<HistoryIcon fontSize="small" />} 
                iconPosition="start" 
                label="All Records" 
                value="all" 
              />
            )}
          </Tabs>
        </Box>

        {/* Background Shapes */}
        <Box sx={{
          position: 'absolute',
          bottom: -20,
          right: -20,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>

      {/* Content Area */}
      {view === 'pending' && (isCoordinator || isParent || isAdmin || isManager) && (
        <Box className="animate-fade-in">
          {loadingPending ? (
             <Box display="flex" justifyContent="center" py={5}><LoadingSpinner /></Box>
          ) : (
            <>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <CheckCircleIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Items Requiring Action
                </Typography>
              </Box>
              
              {pending.length === 0 && pendingSheets.length === 0 ? (
                <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
                  <Typography color="text.secondary" variant="body1">No pending approvals found. You're all caught up!</Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                   {/* Monthly Sheets Section */}
                  {pendingSheets.map((sheet) => (
                    <Grid item xs={12} md={6} lg={4} key={sheet.id}>
                      <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                         <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                               <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 1, borderRadius: 2 }}>
                                  <FilePresentIcon sx={{ color: theme.palette.success.main }} />
                               </Box>
                               <Box>
                                  <Typography variant="subtitle2" fontWeight={700}>{sheet.finalClass?.studentName}</Typography>
                                  <Chip label={sheet.periodLabel} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                               </Box>
                            </Box>
                            {(isAdmin || isManager) && (
                               <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
                                 By {sheet.coordinator?.name}
                               </Typography>
                            )}
                         </Box>

                         <Divider sx={{ my: 1.5, opacity: 0.6 }} />

                         <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                               <Typography variant="caption" color="text.secondary" display="block">SESSIONS</Typography>
                               <Typography variant="body2" fontWeight={700}>{sheet.totalSessionsTaken} / {sheet.totalSessionsPlanned}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                               <Typography variant="caption" color="text.secondary" display="block">STATUS</Typography>
                               <Chip label="PENDING" size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                            </Grid>
                         </Grid>

                         <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 1 }}>
                            <Button variant="outlined" size="small" fullWidth onClick={() => handleViewMonthlySheet(sheet)}>View</Button>
                            <Button variant="outlined" size="small" color="error" fullWidth onClick={() => handleRejectSheet(sheet.id)}>Reject</Button>
                            <Button 
                              variant="contained" 
                              size="small" 
                              fullWidth 
                              onClick={() => handleApproveSheet(sheet.id)}
                              disabled={approvingLoading || (Number(sheet.totalSessionsTaken || 0) < Number(sheet.totalSessionsPlanned || 0))}
                            >
                              Approve
                            </Button>
                         </Box>
                      </Paper>
                    </Grid>
                  ))}

                </Grid>
              )}
            </>
          )}
        </Box>
      )}

      {view === 'all' && (
        <Box className="animate-fade-in">
          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                 <TextField 
                   select 
                   fullWidth
                   label="Status" 
                   size="small" 
                   value={filters.status || ''} 
                   onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))}
                   InputProps={{
                     startAdornment: <InputAdornment position="start"><FilterListIcon fontSize="small" /></InputAdornment>
                   }}
                 >
                    <MenuItem value="">All Statuses</MenuItem>
                    {Object.values(ATTENDANCE_STATUS).map((s) => (
                      <MenuItem key={s} value={s}>{(s as string).replace(/_/g, ' ')}</MenuItem>
                    ))}
                 </TextField>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField 
                  type="date" 
                  fullWidth
                  label="From Date" 
                  size="small" 
                  InputLabelProps={{ shrink: true }} 
                  value={filters.fromDate || ''} 
                  onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value || undefined, page: 1 }))} 
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField 
                  type="date" 
                  fullWidth
                  label="To Date" 
                  size="small" 
                  InputLabelProps={{ shrink: true }} 
                  value={filters.toDate || ''} 
                  onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value || undefined, page: 1 }))} 
                />
              </Grid>
              <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
                <Button variant="outlined" color="inherit" onClick={() => setFilters({ page: 1, limit: 10 })}>
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={5}><LoadingSpinner /></Box>
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
                sx={{ 
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    fontWeight: 700,
                  },
                  '& .MuiDataGrid-row:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }
                }}
              />
            )}
            <ErrorAlert error={error} />
          </Paper>
        </Box>
      )}

      <RejectAttendanceModal open={rejectOpen} onClose={() => setRejectOpen(false)} attendance={selected} onReject={handleRejectSubmit} />
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
      
      <ConfirmDialog
        open={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={performApprove}
        title="Approve Attendance"
        message="Are you sure you want to approve this attendance record?"
        severity="info"
        loading={approvingLoading}
      />

      {sheetTutorData && sheetClassInfo && (
        <Box sx={{ position: 'absolute', left: -9999, top: -9999 }}>
          <AttendanceSheetComponent
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
}
