import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, TextField, MenuItem, Button, Grid, Pagination, CircularProgress, Stack, IconButton, Grow, Tabs, Tab, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import ClassDetailCard from '../../components/coordinator/ClassDetailCard';
import AssignedClassesTable from '../../components/coordinator/AssignedClassesTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { getAssignedClasses } from '../../services/coordinatorService';
import api from '../../services/api';
import { changeTutor, downloadAttendancePdf, updateAttendanceSubmissionWindow, updateClassStatus, updateClassTestsPerMonth } from '../../services/finalClassService';
import { getCoordinatorTutors } from '../../services/tutorService';
import { IFinalClass } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';

const AssignedClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status?: string; subject?: string; grade?: string; page: number; limit: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }>({ page: 1, limit: 25 });
  const [pagination, setPagination] = useState<{ total: number; pages: number }>({ total: 0, pages: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('table');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  const [selectedClass, setSelectedClass] = useState<IFinalClass | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [windowValue, setWindowValue] = useState<number>(2);
  const [testsPerMonthValue, setTestsPerMonthValue] = useState<number>(2);
  const [statusValue, setStatusValue] = useState<string>(FINAL_CLASS_STATUS.ACTIVE);
  const [tutors, setTutors] = useState<any[]>([]);
  const [newTutorUserId, setNewTutorUserId] = useState<string>('');
  const [changeTutorReason, setChangeTutorReason] = useState<string>('');
  const navigate = useNavigate();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count += 1;
    if (filters.subject) count += 1;
    if (filters.grade) count += 1;
    return count;
  }, [filters]);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAssignedClasses(filters.page, filters.limit, filters.status, filters.subject, filters.grade, filters.sortBy, filters.sortOrder);
      // expecting res to be PaginatedResponse<IFinalClass[]>
      const data = (res as any).data as IFinalClass[];
      const pag = (res as any).pagination || { total: data?.length || 0, pages: Math.ceil((data?.length || 0) / filters.limit) };
      setClasses(Array.isArray(data) ? data : []);
      setPagination({ total: pag.total || 0, pages: pag.pages || 0 });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to load assigned classes';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleStatusChange = (status: string) => setFilters((f) => ({ ...f, status: status || undefined, page: 1 }));
  const handleSubjectChange = (subject: string) => setFilters((f) => ({ ...f, subject: subject || undefined, page: 1 }));
  const handleGradeChange = (grade: string) => setFilters((f) => ({ ...f, grade: grade || undefined, page: 1 }));
  const handleClearFilters = () => setFilters({ page: 1, limit: 9 });
  const handlePageChange = (_: any, page: number) => setFilters((f) => ({ ...f, page }));
  const handleRefresh = () => fetchClasses();
  const handleViewDetails = (classId: string) => navigate(`/classes/${classId}`);
  const handleGenerateAdvancePayment = async (classId: string) => {
    try {
      setError(null);
      await api.post(`/api/payments/class/${classId}/advance`);
      setSnackbar({ open: true, message: 'Advance payment created successfully', severity: 'success' });
      // Optionally refresh classes to update any payment metrics
      fetchClasses();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to create advance payment';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };
  const handleChangeTestsPerMonth = async (classId: string, value: number) => {
    try {
      setError(null);
      await updateClassTestsPerMonth(classId, value);
      setSnackbar({ open: true, message: 'Tests per month updated', severity: 'success' });
      fetchClasses();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update tests per month';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };
  const handleToggleView = () => setViewMode((v) => {
    if (v === 'table') return 'grid';
    if (v === 'grid') return 'list';
    return 'table';
  });

  // Table action handlers
  const handleOpenAttendance = (_classId: string) => navigate(`/attendance-approvals`);
  const handleOpenPayments = (_classId: string) => navigate(`/payment-tracking`);

  const handleEditClass = (cls: any) => {
    setSelectedClass(cls as IFinalClass);
    setWindowValue((cls as any)?.attendanceSubmissionWindow ?? 2);
    setTestsPerMonthValue((cls as any)?.testPerMonth ?? 2);
    setStatusValue((cls as any)?.status || FINAL_CLASS_STATUS.ACTIVE);
    setNewTutorUserId('');
    setChangeTutorReason('');
    setEditOpen(true);
  };

  useEffect(() => {
    const fetchTutors = async () => {
      if (!editOpen) return;
      try {
        const res = await getCoordinatorTutors({ page: 1, limit: 200 });
        setTutors(Array.isArray((res as any)?.data) ? (res as any).data : []);
      } catch {
        setTutors([]);
      }
    };
    fetchTutors();
  }, [editOpen]);

  const handleUpdateStatus = async () => {
    if (!selectedClass?.id) return;
    try {
      setActionLoading(true);
      await updateClassStatus(selectedClass.id, statusValue);
      setSnackbar({ open: true, message: 'Class status updated', severity: 'success' });
      setEditOpen(false);
      fetchClasses();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update class status';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeTutor = async () => {
    if (!selectedClass?.id) return;
    if (!newTutorUserId) {
      setSnackbar({ open: true, message: 'Please select a tutor', severity: 'error' });
      return;
    }
    try {
      setActionLoading(true);
      await changeTutor(selectedClass.id, newTutorUserId, changeTutorReason || undefined);
      setSnackbar({ open: true, message: 'Tutor changed successfully', severity: 'success' });
      setEditOpen(false);
      fetchClasses();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to change tutor';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateWindow = async () => {
    if (!selectedClass?.id) return;
    try {
      setActionLoading(true);
      await updateAttendanceSubmissionWindow(selectedClass.id, windowValue);
      setSnackbar({ open: true, message: 'Submission window updated', severity: 'success' });
      setEditOpen(false);
      fetchClasses();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update submission window';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTestsPerMonth = async () => {
    if (!selectedClass?.id) return;
    try {
      setActionLoading(true);
      await updateClassTestsPerMonth(selectedClass.id, testsPerMonthValue);
      setSnackbar({ open: true, message: 'Tests per month updated', severity: 'success' });
      setEditOpen(false);
      fetchClasses();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update tests per month';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadAttendance = async () => {
    if (!selectedClass?.id) return;
    try {
      setActionLoading(true);
      await downloadAttendancePdf(selectedClass.id);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to download attendance';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
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
              My Assigned Classes
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
              Track your student progress, manage schedules, and handle payments.
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton 
              onClick={handleToggleView}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            >
              {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Tabs 
            value={filters.status === FINAL_CLASS_STATUS.ACTIVE ? 1 : filters.status === FINAL_CLASS_STATUS.COMPLETED ? 2 : 0} 
            onChange={(_, v) => {
               const status = v === 1 ? FINAL_CLASS_STATUS.ACTIVE : v === 2 ? FINAL_CLASS_STATUS.COMPLETED : '';
               handleStatusChange(status);
            }}
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 600, minHeight: 48 },
              '& .Mui-selected': { color: '#fff !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 4 }
            }}
          >
            <Tab label="All Classes" />
            <Tab label="Active" />
            <Tab label="Completed" />
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

      {/* Filters & Actions */}
      <Card elevation={0} sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                placeholder="Filter by Subject..." 
                size="small"
                value={filters.subject || ''}
                onChange={(e) => handleSubjectChange(e.target.value)}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                }} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                fullWidth 
                label="Grade"
                placeholder="e.g. 10th"
                size="small"
                value={filters.grade || ''}
                onChange={(e) => handleGradeChange(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
               <TextField
                select
                fullWidth
                label="Other Status"
                size="small"
                value={filters.status && filters.status !== FINAL_CLASS_STATUS.ACTIVE && filters.status !== FINAL_CLASS_STATUS.COMPLETED ? filters.status : ''}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value={FINAL_CLASS_STATUS.PAUSED}>Paused</MenuItem>
                <MenuItem value={FINAL_CLASS_STATUS.CANCELLED}>Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2} display="flex" justifyContent="flex-end">
               {activeFilterCount > 0 && (
                <Button onClick={handleClearFilters} color="inherit" size="small">
                  Clear Filters
                </Button>
               )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Showing {classes.length} of {pagination.total} assigned classes
        </Typography>
        {loading && <CircularProgress size={16} thickness={5} />}
      </Box>

      {error ? <ErrorAlert error={error} onClose={() => setError(null)} /> : null}

      {loading && classes.length === 0 ? (
        <LoadingSpinner />
      ) : classes.length === 0 ? (
        <Box textAlign="center" py={8} bgcolor="background.paper" borderRadius={3} border="1px dashed" borderColor="divider">
          <Typography variant="h6" color="text.secondary" gutterBottom>No classes found</Typography>
          <Typography variant="body2" color="text.secondary">Try adjusting your filters or check back later.</Typography>
        </Box>
      ) : (
        <>
          {viewMode === 'table' ? (
            <AssignedClassesTable
              classes={classes}
              onOpenAttendance={handleOpenAttendance}
              onOpenPayments={handleOpenPayments}
              onEditClass={handleEditClass}
            />
          ) : viewMode === 'list' ? (
            <Stack spacing={2}>
              {classes.map((cls, index) => (
                <Grow in={true} timeout={300 + index * 50} key={cls.id}>
                  <div>
                    <ClassDetailCard
                      finalClass={cls}
                      onViewDetails={handleViewDetails}
                      onGenerateAdvancePayment={handleGenerateAdvancePayment}
                      onChangeTestsPerMonth={handleChangeTestsPerMonth}
                    />
                  </div>
                </Grow>
              ))}
            </Stack>
          ) : (
            <Grid container spacing={3}>
              {classes.map((cls, index) => (
                <Grid item xs={12} md={6} lg={4} key={cls.id}>
                   <Grow in={true} timeout={300 + index * 50}>
                    <Box height="100%">
                      <ClassDetailCard
                        finalClass={cls}
                        onViewDetails={handleViewDetails}
                        onGenerateAdvancePayment={handleGenerateAdvancePayment}
                        onChangeTestsPerMonth={handleChangeTestsPerMonth}
                        onUpdate={fetchClasses}
                      />
                    </Box>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          )}

          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination 
                color="primary" 
                count={pagination.pages} 
                page={filters.page} 
                onChange={handlePageChange} 
                size="large" 
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />

      <Dialog
        open={editOpen}
        onClose={() => !actionLoading && setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Edit Class: {selectedClass?.className || selectedClass?.studentName || ''}</Typography>
            <IconButton onClick={() => setEditOpen(false)} disabled={actionLoading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedClass && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Student</Typography>
                <Typography variant="body2" fontWeight={700}>{selectedClass.studentName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedClass as any).grade} • {(selectedClass as any).board} • {(selectedClass as any).mode}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Class Status</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Status"
                      value={statusValue}
                      onChange={(e) => setStatusValue(e.target.value)}
                      disabled={actionLoading}
                    >
                      <MenuItem value={FINAL_CLASS_STATUS.ACTIVE}>Active</MenuItem>
                      <MenuItem value={FINAL_CLASS_STATUS.PAUSED}>Paused</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleUpdateStatus}
                      disabled={actionLoading || statusValue === ((selectedClass as any)?.status || FINAL_CLASS_STATUS.ACTIVE)}
                    >
                      Update
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Change Tutor</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="New Tutor"
                      value={newTutorUserId}
                      onChange={(e) => setNewTutorUserId(e.target.value)}
                      disabled={actionLoading}
                    >
                      <MenuItem value=""><em>Select tutor</em></MenuItem>
                      {tutors.map((t: any) => (
                        <MenuItem key={t?.user?.id || t?.user?._id || t?.id || t?._id} value={t?.user?.id || t?.user?._id || t?.userId || t?.user || t?.id || t?._id}>
                          {t?.user?.name || t?.name || 'Tutor'}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Reason (optional)"
                      value={changeTutorReason}
                      onChange={(e) => setChangeTutorReason(e.target.value)}
                      disabled={actionLoading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleChangeTutor}
                      disabled={actionLoading || !newTutorUserId}
                    >
                      Change Tutor
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>Attendance Settings</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Submission Window (Days)"
                      value={windowValue}
                      onChange={(e) => setWindowValue(Number(e.target.value))}
                      disabled={actionLoading}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleUpdateWindow}
                      disabled={actionLoading || windowValue === ((selectedClass as any).attendanceSubmissionWindow ?? 2)}
                    >
                      Update
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Test Settings</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Tests / Month"
                      value={testsPerMonthValue}
                      onChange={(e) => setTestsPerMonthValue(Number(e.target.value))}
                      disabled={actionLoading}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleUpdateTestsPerMonth}
                      disabled={actionLoading || testsPerMonthValue === ((selectedClass as any).testPerMonth ?? 2)}
                    >
                      Update
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Downloads</Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleDownloadAttendance}
                  disabled={actionLoading}
                >
                  Download Attendance PDF
                </Button>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={actionLoading}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignedClassesPage;
