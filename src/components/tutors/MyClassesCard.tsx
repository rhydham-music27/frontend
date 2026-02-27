import React, { useEffect, useState } from 'react';
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
  Card,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import ClassIcon from '@mui/icons-material/Class';
import QuizIcon from '@mui/icons-material/Quiz';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import SubmitAttendanceModal from './SubmitAttendanceModal';
import TutorClassesStatsBox from './TutorClassesStatsBox';
import { getMyClasses } from '../../services/finalClassService';
import { upsertAttendanceSheet, submitAttendanceSheet } from '../../services/attendanceSheetService';
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
  const [sheetGeneratingClassId, setSheetGeneratingClassId] = useState<string | null>(null);
  const [sheetSubmittingClassId, setSheetSubmittingClassId] = useState<string | null>(null);

  const handleViewAttendanceSheet = (cls: IFinalClass) => {
    const classIdStr = String((cls as any).id || (cls as any)._id || '');
    navigate(`/tutor-classes/${classIdStr}/attendance`);
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

  const getStatusThemeColor = (status: string) => {
    switch (status) {
      case FINAL_CLASS_STATUS.ACTIVE: return '#10b981';
      case FINAL_CLASS_STATUS.COMPLETED: return '#3b82f6';
      case FINAL_CLASS_STATUS.PAUSED: return '#f59e0b';
      case FINAL_CLASS_STATUS.CANCELLED: return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const calculateProgress = (cls: IFinalClass) => {
    if ((cls as any).progressPercentage != null) return Math.round((cls as any).progressPercentage);
    const completed = Number(cls.completedSessions || 0);
    const total = Number(cls.totalSessions || 0);
    if (!total) return 0;
    return Math.round((completed / total) * 100);
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

  const cardSx = {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'grey.100',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s',
    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  };

  if (loading) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" justifyContent="center" py={4}>
            <LoadingSpinner message="Loading your classes..." />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && classes.length === 0) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <ErrorAlert error={error} />
            <Button variant="outlined" onClick={fetchClasses} sx={{ borderRadius: 2, textTransform: 'none' }}>Retry</Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!loading && classes.length === 0) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <EmptyState
            icon={<ClassIcon color="primary" />}
            title="No Active Classes"
            description="You don't have any active classes assigned yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Card Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 2,
                bgcolor: alpha('#6366f1', 0.08),
                display: 'flex',
              }}
            >
              <ClassIcon sx={{ fontSize: 20, color: '#6366f1' }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              My Classes
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${classes.length} active`}
            sx={{
              bgcolor: alpha('#6366f1', 0.08),
              color: '#4f46e5',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 26,
            }}
          />
        </Box>

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}

        {/* Stats */}
        <TutorClassesStatsBox classes={classes} newClassLeads={0} />

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Left: Class Cards */}
          <Grid item xs={12} md={7}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              gutterBottom
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.primary',
                fontSize: '0.88rem',
                mb: 2,
              }}
            >
              <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: '#6366f1' }} />
              Assigned Classes
            </Typography>
            <Box
              sx={{
                maxHeight: 600,
                overflow: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
              }}
            >
              {classes.map((cls) => {
                const progress = calculateProgress(cls);
                const isSelected = selectedClass?.id === cls.id;
                const classIdStr = String((cls as any).id || (cls as any)._id || '');
                const statusColor = getStatusThemeColor(cls.status);
                const progressColor = progress >= 75 ? '#10b981' : progress >= 40 ? '#6366f1' : '#f59e0b';

                return (
                  <Box
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    sx={{
                      border: '1px solid',
                      borderColor: isSelected ? alpha('#6366f1', 0.35) : alpha('#6366f1', 0.08),
                      borderRadius: 2.5,
                      p: 2.5,
                      mb: 2,
                      cursor: 'pointer',
                      bgcolor: isSelected ? alpha('#6366f1', 0.03) : '#fff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: alpha('#6366f1', 0.25),
                        bgcolor: alpha('#6366f1', 0.02),
                      },
                    }}
                  >
                    {/* Student Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <Box
                          sx={{
                            width: 38, height: 38, borderRadius: 2,
                            bgcolor: isSelected ? '#6366f1' : alpha('#6366f1', 0.08),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isSelected ? 'white' : '#6366f1',
                            transition: 'all 0.2s',
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.92rem' }}>{cls.studentName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Grade {cls.grade} • {cls.board}</Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={cls.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(statusColor, 0.08),
                          color: statusColor,
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 22,
                        }}
                      />
                    </Box>

                    {/* Subject & Mode Chips */}
                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                      {(Array.isArray(cls.subject) ? cls.subject : [cls.subject]).map((sub) => (
                        <Chip
                          key={String(sub)}
                          size="small"
                          label={String(sub)}
                          sx={{
                            bgcolor: alpha('#6366f1', 0.06),
                            color: '#4f46e5',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 22,
                          }}
                        />
                      ))}
                      <Chip
                        size="small"
                        label={cls.mode}
                        sx={{
                          bgcolor: cls.mode === 'ONLINE' ? alpha('#3b82f6', 0.08) : cls.mode === 'OFFLINE' ? alpha('#10b981', 0.08) : alpha('#8b5cf6', 0.08),
                          color: cls.mode === 'ONLINE' ? '#2563eb' : cls.mode === 'OFFLINE' ? '#059669' : '#7c3aed',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 22,
                        }}
                      />
                    </Box>

                    {/* Meta Info */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 2,
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: alpha('#f8fafc', 0.8),
                        border: '1px solid',
                        borderColor: 'grey.50',
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                        <AccessTimeIcon sx={{ fontSize: 13 }} />
                        <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem' }}>{(cls.schedule as any)?.timeSlot || 'No schedule'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                        <PersonIcon sx={{ fontSize: 13 }} />
                        <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem' }}>{cls.coordinator?.name}</Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>Progress {cls.completedSessions}/{cls.totalSessions}</Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: progressColor, fontSize: '0.72rem' }}>{progress}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: alpha(progressColor, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: progressColor,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    {/* Action Row */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ pt: 2, borderTop: '1px solid', borderColor: alpha('#6366f1', 0.06) }}>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Mark Attendance">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleAttendanceClick(cls); }}
                            sx={{ bgcolor: alpha('#10b981', 0.08), '&:hover': { bgcolor: alpha('#10b981', 0.15) }, width: 32, height: 32 }}
                          >
                            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10b981' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Tests">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); navigate('/tutor-tests'); }}
                            sx={{ bgcolor: alpha('#6366f1', 0.08), '&:hover': { bgcolor: alpha('#6366f1', 0.15) }, width: 32, height: 32 }}
                          >
                            <QuizIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Notes">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); navigate('/tutor-notes'); }}
                            sx={{ bgcolor: alpha('#3b82f6', 0.08), '&:hover': { bgcolor: alpha('#3b82f6', 0.15) }, width: 32, height: 32 }}
                          >
                            <NoteAddIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Button
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleViewAttendanceSheet(cls); }}
                          sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', minWidth: 'auto' }}
                        >
                          View Sheet
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => { e.stopPropagation(); handleSubmitMonthlySheet(cls); }}
                          disabled={sheetSubmittingClassId === classIdStr}
                          startIcon={<SendIcon sx={{ fontSize: 13 }} />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: 'none',
                            px: 2,
                            borderRadius: 2,
                            bgcolor: '#6366f1',
                            fontSize: '0.72rem',
                            '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' },
                          }}
                        >
                          {sheetSubmittingClassId === classIdStr ? 'Submitting...' : 'Submit'}
                        </Button>
                        <Tooltip title={`Call ${cls.coordinator?.name || 'Coordinator'}`}>
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleCallCoordinator(cls); }}
                            sx={{ bgcolor: alpha('#3b82f6', 0.08), '&:hover': { bgcolor: alpha('#3b82f6', 0.15) }, width: 32, height: 32 }}
                          >
                            <LocalPhoneIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Right: Attendance Tracker */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: alpha('#6366f1', 0.1),
                borderRadius: 3,
                p: 2.5,
                height: '100%',
                bgcolor: '#fff',
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                mb={2}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '0.88rem',
                }}
              >
                <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: '#10b981' }} />
                Attendance Tracker
              </Typography>
              {selectedClass ? (
                <>
                  <Box
                    sx={{
                      borderRadius: 2.5,
                      p: 2.5,
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: '#fff',
                      mb: 2.5,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        right: '-30%',
                        width: '60%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} sx={{ position: 'relative', zIndex: 1 }}>{selectedClass.studentName}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, position: 'relative', zIndex: 1, fontSize: '0.82rem' }}>Grade {selectedClass.grade} • {selectedClass.board}</Typography>
                  </Box>
                  <Box mb={2.5}>
                    {[
                      { label: 'Total Sessions', value: selectedClass.totalSessions, color: 'text.primary' },
                      { label: 'Completed', value: selectedClass.completedSessions, color: '#10b981' },
                      { label: 'Remaining', value: (selectedClass.totalSessions || 0) - (selectedClass.completedSessions || 0), color: '#f59e0b' },
                    ].map((item, i) => (
                      <Box key={i} display="flex" justifyContent="space-between" alignItems="center" py={1} sx={i < 2 ? { borderBottom: '1px solid', borderColor: alpha('#6366f1', 0.06) } : {}}>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{item.label}</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: item.color, fontSize: '0.88rem' }}>{item.value}</Typography>
                      </Box>
                    ))}
                    <Box mt={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Progress</Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: '#6366f1', fontSize: '0.7rem' }}>{calculateProgress(selectedClass)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={calculateProgress(selectedClass)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha('#6366f1', 0.08),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#6366f1',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAttendanceClick(selectedClass!)}
                    sx={{
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.25,
                      bgcolor: '#10b981',
                      '&:hover': { bgcolor: '#059669' },
                      boxShadow: 'none',
                    }}
                  >
                    Mark Today's Attendance
                  </Button>
                </>
              ) : (
                <Box textAlign="center" py={6}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: alpha('#6366f1', 0.06),
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 24, color: '#6366f1' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Select a class to view details
                  </Typography>
                  <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                    Click any class card on the left
                  </Typography>
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
      </CardContent>
    </Card>
  );
};

export default React.memo(MyClassesCard);
