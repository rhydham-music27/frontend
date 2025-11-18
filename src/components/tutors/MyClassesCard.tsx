import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CardContent,
  Grid,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import EmailIcon from '@mui/icons-material/Email';
import ClassIcon from '@mui/icons-material/Class';
import { StyledCard } from '../common/StyledCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import SubmitAttendanceModal from './SubmitAttendanceModal';
import ScheduleTestModal from './ScheduleTestModal';
import { getMyClasses } from '../../services/finalClassService';
import { IFinalClass } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

const MyClassesCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<IFinalClass | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState<boolean>(false);
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user?.id && !(user as any)?._id) {
        setClasses([]);
        setLoading(false);
        return;
      }
      const tutorId = (user as any).id || (user as any)._id;
      const res = await getMyClasses(tutorId, FINAL_CLASS_STATUS.ACTIVE);
      setClasses(res.data);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to load classes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    return () => {};
  }, []);

  const handleAttendanceClick = (cls: IFinalClass) => {
    setSelectedClass(cls);
    setAttendanceModalOpen(true);
  };

  const handleTestClick = (cls: IFinalClass) => {
    setSelectedClass(cls);
    setTestModalOpen(true);
  };

  const handleContactCoordinator = (cls: IFinalClass) => {
    const email = cls?.coordinator?.email;
    const subject = `Regarding Class: ${cls?.studentName}`;
    if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    }
  };

  const handleModalClose = () => {
    setAttendanceModalOpen(false);
    setTestModalOpen(false);
    setSelectedClass(null);
  };

  const handleActionSuccess = () => {
    setActionSuccess('Action completed successfully.');
    fetchClasses();
    setAttendanceModalOpen(false);
    setTestModalOpen(false);
    const timer = setTimeout(() => setActionSuccess(null), 5000);
    return () => clearTimeout(timer);
  };

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case FINAL_CLASS_STATUS.ACTIVE:
        return 'success' as const;
      case FINAL_CLASS_STATUS.COMPLETED:
        return 'info' as const;
      case FINAL_CLASS_STATUS.PAUSED:
        return 'warning' as const;
      case FINAL_CLASS_STATUS.CANCELLED:
        return 'error' as const;
      default:
        return 'default' as const;
    }
  };

  const calculateProgress = (cls: IFinalClass) => {
    if ((cls as any).progressPercentage != null) return Math.round((cls as any).progressPercentage);
    const completed = Number(cls.completedSessions || 0);
    const total = Number(cls.totalSessions || 0);
    if (!total) return 0;
    return Math.round((completed / total) * 100);
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
            <Box>
              <Button variant="outlined" onClick={fetchClasses}>Retry</Button>
            </Box>
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
            description="You don't have any active classes assigned yet. Check the Class Opportunities section for new leads!"
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
          <Chip size="small" color="primary" variant="outlined" label={`${classes.length} active`} />
        </Box>

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}

        <Box sx={{ maxHeight: 600, overflow: 'auto', pr: 1 }}>
          {classes.map((cls) => {
            const progress = calculateProgress(cls);
            const isOffline = cls.mode === 'OFFLINE' || cls.mode === 'HYBRID';
            return (
              <Box
                key={cls.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 3,
                  p: 2.5,
                  mb: 2,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'grey.50',
                    borderColor: 'primary.light',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SchoolIcon fontSize="small" />
                    <Typography variant="h6" fontWeight={600}>{cls.studentName}</Typography>
                  </Box>
                  <Chip label={cls.status} color={getStatusColor(cls.status) as any} size="small" />
                </Box>

                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">Grade {cls.grade} • {cls.board}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {(Array.isArray(cls.subject) ? cls.subject : [cls.subject]).filter(Boolean).map((sub) => (
                        <Chip key={String(sub)} size="small" variant="outlined" color="primary" label={String(sub)} />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      size="small"
                      label={cls.mode}
                      color={cls.mode === 'ONLINE' ? 'info' : cls.mode === 'OFFLINE' ? 'success' : 'secondary'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {cls.schedule && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">
                          {(cls.schedule as any).daysOfWeek?.join(', ')} • {(cls.schedule as any).timeSlot}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarTodayIcon fontSize="small" />
                      <Typography variant="body2">Started: {cls.startDate ? formatDate(cls.startDate) : '-'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" />
                      <Typography variant="body2">Coordinator: {cls.coordinator?.name}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUpIcon fontSize="small" />
                      <Typography variant="body2">
                        Session Progress: {cls.completedSessions}/{cls.totalSessions} ({progress}%)
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    color={progress >= 50 ? 'primary' : 'secondary'}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={1.5} flexWrap="wrap">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAttendanceClick(cls)}
                  >
                    Submit Attendance
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<EventIcon />}
                    onClick={() => handleTestClick(cls)}
                  >
                    Schedule Test
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={<EmailIcon />}
                    onClick={() => handleContactCoordinator(cls)}
                  >
                    Contact Coordinator
                  </Button>
                </Box>

                {cls.location && isOffline && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Location: {cls.location}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {selectedClass && attendanceModalOpen && (
          <SubmitAttendanceModal
            open={attendanceModalOpen}
            onClose={handleModalClose}
            finalClass={selectedClass}
            onSuccess={handleActionSuccess}
          />
        )}

        {selectedClass && testModalOpen && (
          <ScheduleTestModal
            open={testModalOpen}
            onClose={handleModalClose}
            finalClass={selectedClass}
            onSuccess={handleActionSuccess}
          />
        )}
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(MyClassesCard);
