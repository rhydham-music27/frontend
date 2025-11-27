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

// Array of gradient backgrounds with light to solid color fade from left to right
const GRADIENT_BGS = [
  'linear-gradient(to right, #e0e1ff 0%, #6366F1 100%)', // Light indigo to indigo
  'linear-gradient(to right, #dbeafe 0%, #3B82F6 100%)', // Light blue to blue
  'linear-gradient(to right, #dcfce7 0%, #10B981 100%)', // Light green to green
  'linear-gradient(to right, #fef3c7 0%, #F59E0B 100%)', // Light amber to amber
  'linear-gradient(to right, #fce7f3 0%, #EC4899 100%)', // Light pink to pink
];

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
              maxHeight: 404,
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
                <Box
                  key={cls.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '0 8px 8px 0',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderLeft: 'none',
                    position: 'relative',
                    background: GRADIENT_BGS[classes.indexOf(cls) % GRADIENT_BGS.length],
                    color: 'rgba(0, 0, 0, 0.87)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '0',
                      bottom: '0',
                      width: '4px',
                      backgroundColor: 'primary.main',
                      borderTopLeftRadius: '8px',
                      borderBottomLeftRadius: '8px',
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'common.white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ClassIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {cls.studentName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subjects} • {cls.grade}
                      </Typography>
                      {timeSlot && (
                        <Typography variant="body2" color="text.secondary">
                          {timeSlot}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {cls.completedSessions}/{cls.totalSessions} sessions completed
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleMarkClick(cls)}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: 'text.primary',
                        '&:hover': {
                          backgroundColor: 'white',
                        },
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      Mark
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
