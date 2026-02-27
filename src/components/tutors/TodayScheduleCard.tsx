import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, CircularProgress, alpha } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ClassIcon from '@mui/icons-material/Class';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getMyClasses } from '../../services/finalClassService';
import { FINAL_CLASS_STATUS } from '../../constants';
import { IFinalClass } from '../../types';
import SubmitAttendanceModal from './SubmitAttendanceModal';
import ClassCard from '../parents/ClassCard';

const TodayScheduleCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<IFinalClass | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  const loadClasses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const tutorId = (user as any).id || (user as any)._id;
      const resp = await getMyClasses(tutorId, FINAL_CLASS_STATUS.ACTIVE, 1, 50);
      const all = resp.data || [];

      const todayIndex = new Date().getDay();
      const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const todayName = dayNames[todayIndex];

      const todayClasses = all.filter((cls: any) => {
        const schedule = cls.schedule || (cls as any).schedule;
        if (!schedule || !Array.isArray(schedule.daysOfWeek) || schedule.daysOfWeek.length === 0) {
          return true;
        }
        return schedule.daysOfWeek.includes(todayName);
      });

      setClasses(todayClasses);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load today\'s classes.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMarkClick = (cls: IFinalClass) => {
    setSelectedClass(cls);
    setAttendanceModalOpen(true);
  };

  const handleModalClose = () => {
    setAttendanceModalOpen(false);
    setSelectedClass(null);
  };

  const handleActionSuccess = () => {
    loadClasses();
    setAttendanceModalOpen(false);
    setSelectedClass(null);
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
          <Box display="flex" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1}>
            <ErrorOutlineIcon color="error" />
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!classes.length) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box textAlign="center" py={5}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha('#6366f1', 0.08),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 24, color: '#6366f1' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              No classes scheduled for today
            </Typography>
            <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
              Enjoy your free time! 🎉
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ ...cardSx, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 }, height: '100%' }}>
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
                <ScheduleIcon sx={{ fontSize: 20, color: '#6366f1' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                Today's Classes
              </Typography>
            </Box>
            <Chip
              size="small"
              label={`${classes.length} class${classes.length === 1 ? '' : 'es'}`}
              sx={{
                bgcolor: alpha('#6366f1', 0.08),
                color: '#6366f1',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 26,
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              flex: '1 1 auto',
              overflowY: 'auto',
              maxHeight: 600,
              pr: 1,
              '& > *': { flexShrink: 0 },
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
            }}
          >
            {classes.map((cls) => {
              const subjects = Array.isArray(cls.subject) ? cls.subject.join(', ') : (cls.subject as any) || '';
              const timeSlot = (cls as any)?.schedule?.timeSlot || '';
              const monthlyClasses =
                (cls as any)?.classLead?.classesPerMonth ??
                (cls as any)?.classesPerMonth ??
                0;

              return (
                <Box key={cls.id}>
                  <ClassCard
                    classId={cls.id}
                    subject={subjects}
                    grade={cls.grade || 'N/A'}
                    studentName={cls.studentName}
                    topic={(cls as any).topic || 'N/A'}
                    schedule={timeSlot}
                    completedSessions={cls.completedSessions}
                    totalSessions={monthlyClasses}
                    onMarkClick={() => handleMarkClick(cls)}
                  />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ClassIcon />}
                      onClick={() => navigate(`/tutor-tests?classId=${cls.id}`)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                    >
                      Record Test
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/tutor-attendance?classId=${cls.id}`)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                    >
                      Upload Report
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {selectedClass && attendanceModalOpen && (
        <SubmitAttendanceModal
          open={attendanceModalOpen}
          onClose={handleModalClose}
          finalClass={selectedClass}
          onSuccess={handleActionSuccess}
        />
      )}
    </>
  );
};

export default React.memo(TodayScheduleCard);
