import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CardContent,
  Grid,
  LinearProgress,
  Alert,
  Tooltip,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import ClassIcon from '@mui/icons-material/Class';
import QuizIcon from '@mui/icons-material/Quiz';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PersonIcon from '@mui/icons-material/Person';
import { StyledCard } from '../common/StyledCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import SubmitAttendanceModal from './SubmitAttendanceModal';
import TutorClassesStatsBox from './TutorClassesStatsBox';
import { getMyClasses } from '../../services/finalClassService';
import { getAttendanceByClass } from '../../services/attendanceService';
import {
  upsertAttendanceSheet,
  submitAttendanceSheet,
} from '../../services/attendanceSheetService';
import AttendanceSheet, {
  AttendanceRecord,
  AssignedClass,
  TutorProfile,
} from './AttendanceSheet';
import { IFinalClass } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../../store/slices/authSlice';

const MyClassesCard: React.FC = () => {
  const theme = useTheme();
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<IFinalClass | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // State for client-side AttendanceSheet PDF generation
  const sheetRef = useRef<{ exportPdf: () => Promise<void> } | null>(null);
  const [sheetTutorData, setSheetTutorData] = useState<TutorProfile | null>(null);
  const [sheetClassInfo, setSheetClassInfo] = useState<AssignedClass | null>(null);
  const [sheetRange, setSheetRange] = useState<{ start: string; end: string } | undefined>();
  const [downloadingClassId, setDownloadingClassId] = useState<string | null>(null);
  const [sheetGeneratingClassId, setSheetGeneratingClassId] = useState<string | null>(null);
  const [sheetSubmittingClassId, setSheetSubmittingClassId] = useState<string | null>(null);


  const handleViewAttendanceSheet = async (cls: IFinalClass) => {
    const classIdStr = String((cls as any).id || (cls as any)._id || '');
    try {
      setDownloadingClassId(classIdStr);
      const res = await getAttendanceByClass(classIdStr);
      const attendances = res.data || [];
      if (!attendances.length) {
        setDownloadingClassId(null);
        return;
      }

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
              : (a.finalClass as any)?.classLead?.classDurationHours ?? 1;

          return {
            classId: classIdStr,
            date: yyyyMmDd,
            status: (a as any).studentAttendanceStatus || a.status || '',
            duration: durationHours,
            topicsCovered: a.topicCovered || undefined,
            markedAt: a.submittedAt
              ? String(a.submittedAt)
              : a.createdAt
              ? String(a.createdAt)
              : '',
          } as AttendanceRecord;
        })
        .filter((r) => r.date);

      if (!mapped.length) {
        setDownloadingClassId(null);
        return;
      }

      const dates = mapped.map((r) => r.date).sort();
      const start = dates[0];
      const end = dates[dates.length - 1];

      setSheetTutorData({ attendanceRecords: mapped } as TutorProfile);
      setSheetClassInfo({
        classId: (cls as any).className || classIdStr,
        studentName: cls.studentName,
        subject: Array.isArray(cls.subject) ? cls.subject.join(', ') : (cls.subject as any),
        tutorName: user?.name || 'Tutor',
      } as AssignedClass);
      setSheetRange({ start, end });

      setTimeout(async () => {
        try {
          await sheetRef.current?.exportPdf();
        } finally {
          setDownloadingClassId(null);
        }
      }, 0);
    } catch (e) {
      setDownloadingClassId(null);
      console.error('Failed to generate attendance sheet', e);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const tutorId = (user as any).id || (user as any)._id;
      if (!tutorId) {
          setClasses([]);
          setLoading(false);
          return;
      }
      const res = await getMyClasses(tutorId, FINAL_CLASS_STATUS.ACTIVE);
      setClasses(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const handleAttendanceClick = (cls: IFinalClass) => {
    setSelectedClass(cls);
    setAttendanceModalOpen(true);
  };

  const handleCallCoordinator = (cls: IFinalClass) => {
    const phone = cls?.coordinator?.phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleModalClose = () => {
    setAttendanceModalOpen(false);
    setSelectedClass(null);
  };

  const handleActionSuccess = () => {
    setActionSuccess('Action completed successfully.');
    fetchClasses();
    setAttendanceModalOpen(false);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case FINAL_CLASS_STATUS.ACTIVE: return 'success' as const;
      case FINAL_CLASS_STATUS.COMPLETED: return 'info' as const;
      case FINAL_CLASS_STATUS.PAUSED: return 'warning' as const;
      case FINAL_CLASS_STATUS.CANCELLED: return 'error' as const;
      default: return 'default' as const;
    }
  };

  const calculateProgress = (cls: IFinalClass) => {
    if ((cls as any).progressPercentage != null) return Math.round((cls as any).progressPercentage);
    const completed = Number(cls.completedSessions || 0);
    const total = Number(cls.totalSessions || 0);
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  const handleGenerateMonthlySheet = async (cls: IFinalClass) => {
    const classIdStr = String((cls as any).id || (cls as any)._id || '');
    try {
      setSheetGeneratingClassId(classIdStr);
      const now = new Date();
      await upsertAttendanceSheet(classIdStr, now.getMonth() + 1, now.getFullYear());
      setActionSuccess('Monthly attendance sheet generated.');
    } catch (e) {
      console.error(e);
    } finally {
      setSheetGeneratingClassId(null);
    }
  };

  const handleSubmitMonthlySheet = async (cls: IFinalClass) => {
    const classIdStr = String((cls as any).id || (cls as any)._id || '');
    try {
      setSheetSubmittingClassId(classIdStr);
      const now = new Date();
      const res = await upsertAttendanceSheet(classIdStr, now.getMonth() + 1, now.getFullYear());
      if (res.data?.id) {
        await submitAttendanceSheet(res.data.id);
        setActionSuccess('Monthly attendance sheet submitted.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSheetSubmittingClassId(null);
    }
  };

  if (loading) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" justifyContent="center" py={4}>
            <LoadingSpinner message="Loading your classes..." />
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (error && classes.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <ErrorAlert error={error} />
            <Button variant="outlined" onClick={fetchClasses}>Retry</Button>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (!loading && classes.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          <EmptyState
            icon={<ClassIcon color="primary" />}
            title="No Active Classes"
            description="You don't have any active classes assigned yet."
          />
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <ClassIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>My Classes</Typography>
          </Box>
          <Chip size="small" color="primary" variant="filled" label={`${classes.length} active`} sx={{ fontWeight: 700 }} />
        </Box>

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}

        <TutorClassesStatsBox classes={classes} newClassLeads={0} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Assigned Classes</Typography>
            <Box sx={{ maxHeight: 500, overflow: 'auto', pr: 1 }}>
              {classes.map((cls) => {
                const progress = calculateProgress(cls);
                const isSelected = selectedClass?.id === cls.id;
                const classIdStr = String((cls as any).id || (cls as any)._id || '');
                
                return (
                  <Box
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    sx={{
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderRadius: 4,
                      p: 2.5,
                      mb: 2,
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'rgba(99, 102, 241, 0.04)' : 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.light',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box 
                          sx={{ 
                            width: 40, height: 40, borderRadius: '50%', 
                            bgcolor: isSelected ? 'primary.main' : 'primary.light',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                          }}
                        >
                          <SchoolIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>{cls.studentName}</Typography>
                          <Typography variant="caption" color="text.secondary">Grade {cls.grade} • {cls.board}</Typography>
                        </Box>
                      </Box>
                      <Chip label={cls.status} color={getStatusColor(cls.status)} size="small" sx={{ fontWeight: 700 }} />
                    </Box>

                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                      {(Array.isArray(cls.subject) ? cls.subject : [cls.subject]).map((sub) => (
                        <Chip key={String(sub)} size="small" variant="outlined" label={String(sub)} />
                      ))}
                      <Chip size="small" label={cls.mode} variant="outlined" color="info" />
                    </Box>

                    <Grid container spacing={1} mb={2}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                          <AccessTimeIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" noWrap>{(cls.schedule as any)?.timeSlot || 'No schedule'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                          <PersonIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" noWrap>{cls.coordinator?.name}</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">Progress {cls.completedSessions}/{cls.totalSessions}</Typography>
                        <Typography variant="caption" fontWeight={700} color="primary.main">{progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleAttendanceClick(cls); }}>
                          <CheckCircleOutlineIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); navigate('/tutor-tests'); }}>
                          <QuizIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); navigate('/tutor-notes'); }}>
                          <NoteAddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Button 
                          variant="text" 
                          size="small" 
                          onClick={(e) => { e.stopPropagation(); handleViewAttendanceSheet(cls); }} 
                          disabled={downloadingClassId === classIdStr}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          {downloadingClassId === classIdStr ? 'Loading...' : 'View Sheet'}
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={(e) => { e.stopPropagation(); handleSubmitMonthlySheet(cls); }}
                          disabled={sheetSubmittingClassId === classIdStr}
                          startIcon={<SendIcon fontSize="small" />}
                          sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600,
                            boxShadow: 'none',
                            px: 2
                          }}
                        >
                          {sheetSubmittingClassId === classIdStr ? 'Submitting...' : 'Submit'}
                        </Button>
                         <Tooltip title={`Call Coordinator: ${cls.coordinator?.name || 'Assigned'}`}>
                          <IconButton 
                            size="small" 
                            color="info" 
                            onClick={(e) => { e.stopPropagation(); handleCallCoordinator(cls); }}
                            sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) } }}
                          >
                            <LocalPhoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, p: 2.5, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Attendance Tracker</Typography>
              {selectedClass ? (
                <>
                  <Box sx={{ borderRadius: 2, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700}>{selectedClass.studentName}</Typography>
                    <Typography variant="body2">Grade {selectedClass.grade} • {selectedClass.board}</Typography>
                  </Box>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Total Sessions</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedClass.totalSessions}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Completed</Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">{selectedClass.completedSessions}</Typography>
                    </Box>
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">Progress</Typography>
                      <LinearProgress variant="determinate" value={calculateProgress(selectedClass)} sx={{ height: 8, borderRadius: 1, mt: 0.5 }} />
                    </Box>
                  </Box>
                  <Button fullWidth variant="contained" startIcon={<CheckCircleIcon />} onClick={() => handleAttendanceClick(selectedClass!)}>
                    Mark Today's Attendance
                  </Button>
                </>
              ) : (
                <Box textAlign="center" py={6}>
                  <ClassIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">Select a class to view details</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>


        {selectedClass && attendanceModalOpen && (
          <SubmitAttendanceModal
            open={attendanceModalOpen}
            onClose={handleModalClose}
            finalClass={selectedClass}
            onSuccess={handleActionSuccess}
          />
        )}

        {sheetTutorData && sheetClassInfo && (
          <Box sx={{ position: 'absolute', left: -9999, top: -9999 }}>
            <AttendanceSheet ref={sheetRef} tutorData={sheetTutorData} classInfo={sheetClassInfo} range={sheetRange} sheetNo={1} />
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(MyClassesCard);
