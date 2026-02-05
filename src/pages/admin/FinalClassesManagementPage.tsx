import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Paper,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Link,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import GroupStudentsModal from '../../components/classLeads/GroupStudentsModal';
import finalClassService from '../../services/finalClassService';
import { IFinalClass } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';
import TutorSelectionModal from '../../components/common/TutorSelectionModal';
import { changeTutor, recordTutorLeaving, repostAsLead } from '../../services/finalClassService';

const FinalClassesManagementPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [coordinatorFilter, setCoordinatorFilter] = useState<string>(searchParams.get('coordinator') || 'all');

  const [selectedClass, setSelectedClass] = useState<IFinalClass | null>(null);
  const [windowValue, setWindowValue] = useState<number>(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [selectedLeadStudents, setSelectedLeadStudents] = useState<any[]>([]);
  const [selectedLeadName, setSelectedLeadName] = useState('');
  
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => Promise<void> | void;
    severity?: 'warning' | 'error' | 'info';
  }>({
    open: false,
    title: '',
    message: '',
    action: () => {},
  });
  
  const navigate = useNavigate();

  const debouncedSearch = useMemo(() => {
    let timer: any;
    return (q: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSearchQuery(q);
      }, 500);
    };
  }, []);

  const loadClasses = useCallback(async (p = page, l = rowsPerPage) => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        noCoordinator: coordinatorFilter === 'unassigned',
      };
      const res = await finalClassService.getFinalClasses(p + 1, l, filters);
      setClasses(res.data);
      setTotal(res.pagination.total);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, searchQuery, coordinatorFilter]);

  const [tutorModalOpen, setTutorModalOpen] = useState(false);

  const handleChangeTutor = async (newTutorId: string, tutorName: string) => {
    if (!selectedClass) return;
    
    setConfirmConfig({
      open: true,
      title: 'Change Tutor',
      message: `Are you sure you want to change the tutor to ${tutorName} for ${selectedClass.className}?`,
      severity: 'info',
      action: async () => {
        const reason = window.prompt(`Reason for changing tutor to ${tutorName}:`);
        if (reason === null) return;

        try {
          setActionLoading(true);
          await changeTutor(selectedClass.id, newTutorId, reason);
          setTutorModalOpen(false);
          setNotification({ message: 'Tutor changed successfully', severity: 'success' });
          loadClasses();
          setIsModalOpen(false);
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (e: any) {
          setNotification({ message: e?.response?.data?.message || 'Failed to change tutor', severity: 'error' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleTutorLeavingAction = async () => {
    if (!selectedClass) return;
    
    setConfirmConfig({
      open: true,
      title: 'Tutor Left',
      message: `Are you sure you want to mark the current tutor as LEFT for ${selectedClass.className}?`,
      severity: 'warning',
      action: async () => {
        const reason = window.prompt('Reason for tutor leaving:');
        if (reason === null) return;

        try {
          setActionLoading(true);
          await recordTutorLeaving(selectedClass.id, reason);
          setNotification({ message: 'Tutor departure recorded', severity: 'success' });
          loadClasses();
          setIsModalOpen(false);
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (e: any) {
          setNotification({ message: e?.response?.data?.message || 'Failed to record tutor leaving', severity: 'error' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleRepostAction = async () => {
    if (!selectedClass) return;

    setConfirmConfig({
      open: true,
      title: 'Repost as Lead',
      message: `Are you sure you want to repost ${selectedClass.className} as a new lead?`,
      severity: 'info',
      action: async () => {
        try {
          setActionLoading(true);
          await repostAsLead(selectedClass.id);
          setNotification({ message: 'Class reposted as lead successfully', severity: 'success' });
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (e: any) {
          setNotification({ message: e?.response?.data?.message || 'Failed to repost lead', severity: 'error' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  useEffect(() => {
    loadClasses(0, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(0);
    loadClasses(0, rowsPerPage);
  }, [statusFilter, searchQuery, rowsPerPage, coordinatorFilter]);

  const totalPages = Math.ceil(total / rowsPerPage) || 1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case FINAL_CLASS_STATUS.ACTIVE: return 'success';
      case FINAL_CLASS_STATUS.PAUSED: return 'warning';
      case FINAL_CLASS_STATUS.COMPLETED: return 'info';
      case FINAL_CLASS_STATUS.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  const handleEditClick = (cls: IFinalClass) => {
    setSelectedClass(cls);
    setWindowValue(cls.attendanceSubmissionWindow ?? 2);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedClass) return;
    
    setConfirmConfig({
      open: true,
      title: `${newStatus === FINAL_CLASS_STATUS.PAUSED ? 'Pause' : 'Resume'} Class`,
      message: `Are you sure you want to ${newStatus === FINAL_CLASS_STATUS.PAUSED ? 'pause' : 'resume'} ${selectedClass.className}?`,
      severity: newStatus === FINAL_CLASS_STATUS.PAUSED ? 'warning' : 'info',
      action: async () => {
        setActionLoading(true);
        try {
          await finalClassService.updateClassStatus(selectedClass.id, newStatus);
          setNotification({ message: `Class ${newStatus.toLowerCase()} successfully`, severity: 'success' });
          setIsModalOpen(false);
          loadClasses();
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (e: any) {
          setNotification({ message: e?.response?.data?.error || 'Failed to update status', severity: 'error' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleStudentNameClick = useCallback((row: any) => {
    const classLead = row.classLead || {};
    const studentType = classLead.studentType || row.studentType;
    if (studentType === 'GROUP') {
      setSelectedLeadStudents(classLead.associatedStudents || classLead.studentDetails || row.associatedStudents || row.studentDetails || []);
      setSelectedLeadName(row.studentName || classLead.studentName || 'Group Lead');
      setGroupModalOpen(true);
    } else {
      const studentId = classLead.associatedStudents?.[0]?.studentId || classLead.studentId || row.associatedStudents?.[0]?.studentId || row.studentId;
      if (studentId) {
        navigate(`/admin/student-profile/${studentId}`);
      } else {
        setNotification({ message: 'No student profile associated with this record', severity: 'info' });
      }
    }
  }, [navigate]);

  const handleDownloadAttendance = async () => {
    if (!selectedClass) return;
    setActionLoading(true);
    try {
      await finalClassService.downloadAttendancePdf(selectedClass.id);
      setNotification({ message: 'Attendance sheet downloaded successfully', severity: 'success' });
    } catch (e: any) {
      setNotification({ message: 'No attendance records found for this class', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewMonthlyClass = async () => {
    if (!selectedClass) return;
    
    setConfirmConfig({
      open: true,
      title: 'Renew Monthly Class',
      message: `Are you sure you want to renew ${selectedClass.className} for the next cycle? Progress will be reset to 0.`,
      severity: 'warning',
      action: async () => {
        setActionLoading(true);
        try {
          await finalClassService.updateClassProgress(selectedClass.id, 0);
          setNotification({ message: 'Class renewed for the new month successfully', severity: 'success' });
          setIsModalOpen(false);
          loadClasses();
          setConfirmConfig(prev => ({ ...prev, open: false }));
        } catch (e: any) {
          setNotification({ message: e?.response?.data?.error || 'Failed to renew class', severity: 'error' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleUpdateWindow = async () => {
    if (!selectedClass) return;
    try {
      setActionLoading(true);
      await finalClassService.updateAttendanceSubmissionWindow(selectedClass.id, windowValue);
      setNotification({ message: 'Submission window updated successfully', severity: 'success' });
      setIsModalOpen(false);
      loadClasses();
    } catch (e: any) {
      setNotification({ message: e?.response?.data?.error || 'Failed to update window', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #4A148C 0%, #311B92 100%)',
          color: 'white',
          py: { xs: 4, md: 5 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, mb: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Final Classes Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
             Monitor ongoing classes, track progress, and manage student-tutor assignments.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Tabs 
            value={statusFilter === 'all' ? 0 : statusFilter === FINAL_CLASS_STATUS.ACTIVE ? 1 : statusFilter === FINAL_CLASS_STATUS.PAUSED ? 2 : statusFilter === FINAL_CLASS_STATUS.COMPLETED ? 3 : 4} 
            onChange={(_, v) => {
               const map = [
                 'all', 
                 FINAL_CLASS_STATUS.ACTIVE, 
                 FINAL_CLASS_STATUS.PAUSED, 
                 FINAL_CLASS_STATUS.COMPLETED,
                 FINAL_CLASS_STATUS.CANCELLED
               ];
               setStatusFilter(map[v]);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
              '& .Mui-selected': { color: '#fff !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 4 }
            }}
          >
            <Tab label="All Classes" />
            <Tab label="Active" />
            <Tab label="Paused" />
            <Tab label="Completed" />
            <Tab label="Cancelled" />
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

      {error && <Box mb={2}><ErrorAlert error={error} /></Box>}

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by student, class name, or subject"
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Active Filter Chips */}
      {coordinatorFilter === 'unassigned' && (
        <Box mb={2}>
           <Chip 
             label="Filter: Unassigned Coordinator" 
             onDelete={() => setCoordinatorFilter('all')} 
             color="secondary" 
           />
        </Box>
      )}

      {!isXs ? (
        <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }} elevation={0}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main', '& th': { color: 'white', fontWeight: 700 } }}>
                  <TableCell sx={{ color: 'inherit' }}>Class Name</TableCell>
                  <TableCell sx={{ color: 'inherit' }}>Student</TableCell>
                  <TableCell sx={{ color: 'inherit' }}>Subject / Grade</TableCell>
                  <TableCell sx={{ color: 'inherit' }}>Tutor</TableCell>
                  <TableCell sx={{ color: 'inherit' }}>Coordinator</TableCell>
                  <TableCell align="right" sx={{ color: 'inherit' }}>Progress</TableCell>
                  <TableCell sx={{ color: 'inherit' }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'inherit' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center"><CircularProgress size={24} sx={{ my: 2 }} /></TableCell>
                  </TableRow>
                ) : classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>No classes found</TableCell>
                  </TableRow>
                ) : (
                  classes.map((cls) => (
                    <TableRow key={cls.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{cls.className}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.light' }}>
                                {(cls.studentName || 'S').charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography 
                            color="primary" 
                            sx={{ cursor: 'pointer', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => handleStudentNameClick(cls)}
                            variant="body2"
                            >
                            {cls.studentName}
                            </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{cls.subject.join(', ')}</Typography>
                        <Typography variant="caption" color="text.secondary">{cls.grade}</Typography>
                      </TableCell>
                      <TableCell>
                        {cls.tutor ? (
                          <Link component={RouterLink} to={`/tutor-profile/${(cls.tutor as any).id || (cls.tutor as any)._id}`} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                            {(cls.tutor as any).name || 'Unknown'}
                          </Link>
                        ) : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {cls.coordinator ? (
                          <Link component={RouterLink} to={`/coordinator-profile/${(cls.coordinator as any).id || (cls.coordinator as any)._id}`} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                            {(cls.coordinator as any).name || 'Unknown'}
                          </Link>
                        ) : 'Not Assigned'}
                      </TableCell>
                      <TableCell align="right">
                        {cls.completedSessions} / {cls.totalSessions}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {Math.round(cls.progressPercentage || 0)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={cls.status} color={getStatusColor(cls.status) as any} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Class">
                          <IconButton size="small" onClick={() => handleEditClick(cls)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_e, newPage) => { setPage(newPage); loadClasses(newPage, rowsPerPage); }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { const v = parseInt(e.target.value, 10); setRowsPerPage(v); setPage(0); loadClasses(0, v); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {loading ? <LoadingSpinner /> : classes.length === 0 ? (
            <Typography>No classes found</Typography>
          ) : classes.map((cls) => (
            <Card key={cls.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{cls.className}</Typography>
                    <Typography 
                      variant="body2" 
                      color="primary" 
                      sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handleStudentNameClick(cls)}
                    >
                      {cls.studentName}
                    </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                    <Chip label={cls.status} color={getStatusColor(cls.status) as any} size="small" />
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />} 
                      variant="outlined"
                      onClick={() => handleEditClick(cls)}
                    >
                      Edit
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Subject/Grade</Typography>
                    <Typography variant="body2">{cls.subject.join(', ')} ({cls.grade})</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Progress</Typography>
                    <Typography variant="body2">{cls.completedSessions}/{cls.totalSessions} ({Math.round(cls.progressPercentage || 0)}%)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Tutor</Typography>
                    <Typography variant="body2">{cls.tutor ? (cls.tutor as any).name : 'Unknown'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Coordinator</Typography>
                    <Typography variant="body2">{cls.coordinator ? (cls.coordinator as any).name : 'Not Assigned'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          <Box display="flex" justifyContent="center" mt={2}>
            <Typography>Page {page + 1} of {totalPages}</Typography>
          </Box>
        </Stack>
      )}

      <SnackbarNotification
        open={!!error}
        message={error || ''}
        severity="error"
        onClose={() => setError(null)}
      />

      <SnackbarNotification
        open={!!notification}
        message={notification?.message || ''}
        severity={notification?.severity || 'success'}
        onClose={() => setNotification(null)}
      />

      {/* Edit Class Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => !actionLoading && setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Edit Class: {selectedClass?.className}</Typography>
            <IconButton onClick={() => setIsModalOpen(false)} disabled={actionLoading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedClass && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Session Progress</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ flexGrow: 1, bgcolor: 'action.hover', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                    <Box 
                      sx={{ 
                        width: `${selectedClass.progressPercentage}%`, 
                        height: '100%', 
                        bgcolor: getStatusColor(selectedClass.status) + '.main',
                        transition: 'width 0.5s ease-in-out'
                      }} 
                    />
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedClass.completedSessions} / {selectedClass.totalSessions}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Student Name</Typography>
                  <Typography variant="body1">{selectedClass.studentName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Current Status</Typography>
                  <Box><Chip size="small" label={selectedClass.status} color={getStatusColor(selectedClass.status) as any} /></Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tutor</Typography>
                  <Typography variant="body1">{selectedClass.tutor ? (selectedClass.tutor as any).name : 'Unknown'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Coordinator</Typography>
                  <Typography variant="body1">{selectedClass.coordinator ? (selectedClass.coordinator as any).name : 'Not Assigned'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Subjects & Grade</Typography>
                  <Typography variant="body1">{selectedClass.subject.join(', ')} ({selectedClass.grade})</Typography>
                </Grid>
              </Grid>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Management Actions</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    {selectedClass.status === FINAL_CLASS_STATUS.ACTIVE ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        startIcon={<PauseIcon />}
                        onClick={() => handleStatusChange(FINAL_CLASS_STATUS.PAUSED)}
                        disabled={actionLoading}
                      >
                        Pause Class
                      </Button>
                    ) : selectedClass.status === FINAL_CLASS_STATUS.PAUSED ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleStatusChange(FINAL_CLASS_STATUS.ACTIVE)}
                        disabled={actionLoading}
                      >
                        Resume Class
                      </Button>
                    ) : null}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      startIcon={<AutorenewIcon />}
                      onClick={handleRenewMonthlyClass}
                      disabled={actionLoading || (selectedClass.completedSessions || 0) < (selectedClass.totalSessions || 0)}
                    >
                      Renew Monthly Class
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadAttendance}
                      disabled={actionLoading}
                    >
                      Download Attendance
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

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
                      helperText="Number of days tutors have to submit attendance"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={handleUpdateWindow}
                      disabled={actionLoading || windowValue === selectedClass.attendanceSubmissionWindow}
                    >
                      Update
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              
              {selectedClass.status === FINAL_CLASS_STATUS.ACTIVE && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Tutor Management</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={4}>
                       <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => setTutorModalOpen(true)}
                        disabled={actionLoading}
                      >
                        Change Tutor
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                       <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        color="warning"
                        onClick={handleTutorLeavingAction}
                        disabled={actionLoading}
                      >
                        Tutor Left
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                       <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        color="info"
                        onClick={handleRepostAction}
                        disabled={actionLoading}
                      >
                        Repost Lead
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} disabled={actionLoading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <GroupStudentsModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        students={selectedLeadStudents}
        leadName={selectedLeadName}
      />

      <TutorSelectionModal
        open={tutorModalOpen}
        onClose={() => setTutorModalOpen(false)}
        onSelect={handleChangeTutor}
        excludeTutorId={selectedClass?.tutor?.id || (selectedClass?.tutor as any)?._id}
      />

      <ConfirmDialog
        open={confirmConfig.open}
        onClose={() => setConfirmConfig(prev => ({ ...prev, open: false }))}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        message={confirmConfig.message}
        severity={confirmConfig.severity}
        loading={actionLoading}
      />
    </Container>
  );
};

export default FinalClassesManagementPage;
