import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, CircularProgress } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ClassIcon from '@mui/icons-material/Class';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getMyClasses } from '../../services/finalClassService';
import { FINAL_CLASS_STATUS } from '../../constants';
import { IFinalClass } from '../../types';
import SubmitAttendanceModal from './SubmitAttendanceModal';
import ClassCard from '../parents/ClassCard';

const TodayScheduleCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
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

  if (loading) {
    return (
      <Card>
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
      <Card>
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
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <ScheduleIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No classes scheduled for today.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <ScheduleIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                Today's Classes {classes.length > 3 ? `(Showing 3 of ${classes.length})` : `(${classes.length} classes)`}
              </Typography>
            </Box>
            <Chip
              size="small"
              color="primary"
              label={`${classes.length} class${classes.length === 1 ? '' : 'es'}`}
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
              pr: 2,
              '& > *': {
                flexShrink: 0,
              },
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                borderRadius: '10px',
                margin: '4px 0',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '10px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}
          >
            {classes.map((cls) => {
              const subjects = Array.isArray(cls.subject) ? cls.subject.join(', ') : (cls.subject as any) || '';
              const timeSlot = (cls as any)?.schedule?.timeSlot || '';

              return (
                <ClassCard
                  key={cls.id}
                  classId={cls.id}
                  subject={subjects}
                  grade={cls.grade || 'N/A'}
                  studentName={cls.studentName}
                  topic={cls.topic || 'N/A'}
                  schedule={timeSlot}
                  completedSessions={cls.completedSessions}
                  totalSessions={cls.totalSessions}
                  onMarkClick={() => handleMarkClick(cls)}
                />
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
