import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, TextField, MenuItem, Button, Grid, Pagination, CircularProgress, Stack, IconButton, Grow, Fade, Tabs, Tab, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Divider, alpha, useTheme, Paper, Avatar, Tooltip, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import ClassDetailCard from '../../components/coordinator/ClassDetailCard';
import AssignedClassesTable from '../../components/coordinator/AssignedClassesTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { getAssignedClasses } from '../../services/coordinatorService';
import api from '../../services/api';
import { changeTutor, updateClassStatus, updateClassTestsPerMonth, updateAttendanceSubmissionWindow, downloadAttendancePdf } from '../../services/finalClassService';
import { getCoordinatorTutors } from '../../services/tutorService';
import { FINAL_CLASS_STATUS } from '../../constants';
import { getOptionLabel } from '../../utils/subjectUtils';
import { IFinalClass } from '../../types';

const AssignedClassesPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status?: string; subject?: string; grade?: string; page: number; limit: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }>({ page: 1, limit: 12 });
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
    <Container maxWidth="xl" sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: isDarkMode 
            ? 'linear-gradient(225deg, #1E3A8A 0%, #111827 100%)' 
            : 'linear-gradient(225deg, #2563EB 0%, #1D4ED8 100%)',
          color: 'white',
          pt: { xs: 5, md: 7 },
          pb: { xs: 10, md: 12 },
          px: { xs: 3, md: 5 },
          borderRadius: { xs: 0, md: '32px' },
          mt: 3,
          mb: -6,
          overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(37, 99, 235, 0.4)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            zIndex: 0
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ maxWidth: '600px' }}>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.03em' }}>
              Assigned Classes
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, mb: 4, lineHeight: 1.5 }}>
              Track student progress, manage schedules, and coordinate with tutors efficiently.
            </Typography>
            
            <Box display="flex" gap={1} mb={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 0.5, 
                  borderRadius: '16px', 
                  bgcolor: alpha('#fff', 0.1),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#fff', 0.2),
                  display: 'flex',
                  gap: 0.5
                }}
              >
                {[
                  { label: 'All Classes', value: '' },
                  { label: 'Active', value: FINAL_CLASS_STATUS.ACTIVE },
                  { label: 'Completed', value: FINAL_CLASS_STATUS.COMPLETED }
                ].map((s) => (
                  <Chip
                    key={s.value}
                    label={s.label}
                    onClick={() => handleStatusChange(s.value)}
                    sx={{
                      height: 36,
                      px: 1,
                      fontWeight: 700,
                      borderRadius: '12px',
                      bgcolor: (filters.status || '') === s.value ? 'white' : 'transparent',
                      color: (filters.status || '') === s.value ? 'primary.main' : 'white',
                      '&:hover': { bgcolor: (filters.status || '') === s.value ? 'white' : alpha('#fff', 0.2) },
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </Paper>
            </Box>
          </Box>
          
          <Box display="flex" gap={2}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={handleRefresh} 
                disabled={loading}
                sx={{ 
                  color: 'white', 
                  bgcolor: alpha('#fff', 0.1), 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#fff', 0.2),
                  '&:hover': { bgcolor: alpha('#fff', 0.2) } 
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 0.5, 
                borderRadius: '12px', 
                bgcolor: alpha('#fff', 0.1),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha('#fff', 0.2),
                display: 'flex'
              }}
            >
              {[
                { mode: 'table', icon: <ViewListIcon /> },
                { mode: 'grid', icon: <ViewModuleIcon /> }
              ].map((v) => (
                <IconButton
                  key={v.mode}
                  size="small"
                  onClick={() => setViewMode(v.mode as any)}
                  sx={{ 
                    color: 'white', 
                    borderRadius: '10px',
                    bgcolor: viewMode === v.mode ? alpha('#fff', 0.2) : 'transparent',
                    '&:hover': { bgcolor: alpha('#fff', 0.2) }
                  }}
                >
                  {v.icon}
                </IconButton>
              ))}
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Modern Filter Toolbar */}
      <Box sx={{ position: 'relative', zIndex: 2, mt: -4, px: { xs: 0, md: 5 } }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            borderRadius: '24px', 
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField 
                fullWidth 
                placeholder="Search subject or student..." 
                size="small"
                value={filters.subject || ''}
                onChange={(e) => handleSubjectChange(e.target.value)}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'primary.main', opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: '16px',
                    bgcolor: alpha(theme.palette.action.hover, 0.5),
                    '& fieldset': { border: 'none' }
                  }
                }} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                fullWidth 
                label="Grade Level"
                placeholder="e.g. 10th"
                size="small"
                value={filters.grade || ''}
                onChange={(e) => handleGradeChange(e.target.value)}
                InputProps={{ 
                  sx: { 
                    borderRadius: '16px',
                    bgcolor: alpha(theme.palette.action.hover, 0.5),
                    '& fieldset': { border: 'none' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                select
                fullWidth
                label="More Status"
                size="small"
                value={filters.status && filters.status !== FINAL_CLASS_STATUS.ACTIVE && filters.status !== FINAL_CLASS_STATUS.COMPLETED ? filters.status : ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                InputProps={{ 
                  sx: { 
                    borderRadius: '16px',
                    bgcolor: alpha(theme.palette.action.hover, 0.5),
                    '& fieldset': { border: 'none' }
                  }
                }}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value={FINAL_CLASS_STATUS.PAUSED}>Paused</MenuItem>
                <MenuItem value={FINAL_CLASS_STATUS.CANCELLED}>Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1.5} display="flex" justifyContent="flex-end">
              {activeFilterCount > 0 ? (
                <Button 
                  onClick={handleClearFilters} 
                  variant="text" 
                  color="error" 
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: '12px' }}
                >
                  Clear
                </Button>
              ) : (
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FilterListIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" mt={4} mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography variant="body1" fontWeight={700} color="text.secondary">
            Result Overview
          </Typography>
          <Chip 
            label={`${pagination.total} Classes`} 
            size="small" 
            sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: '8px' }} 
          />
          {loading && <CircularProgress size={16} thickness={5} />}
        </Box>
        
        <Box display="flex" gap={1}>
           {/* Add any secondary actions here if needed */}
        </Box>
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
            <Fade in timeout={500}>
              <Box>
                <AssignedClassesTable
                  classes={classes}
                  onOpenPayments={handleOpenPayments}
                  onEditClass={handleEditClass}
                  onViewDetails={handleViewDetails}
                />
              </Box>
            </Fade>
          ) : (
            <Grid container spacing={3}>
              {classes.map((cls, index) => (
                <Grid item xs={12} md={viewMode === 'list' ? 12 : 6} lg={viewMode === 'list' ? 12 : 4} key={cls.id}>
                  <Grow in timeout={500 + index * 100}>
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
                  {getOptionLabel((selectedClass as any).grade)} • {getOptionLabel((selectedClass as any).board)} • {getOptionLabel((selectedClass as any).mode)}
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
