import { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Paper,
  Avatar,
  Divider,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TodayIcon from '@mui/icons-material/Today';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { getMyClasses, updateFinalClassSchedule } from '../../services/finalClassService';
import { IFinalClass } from '../../types';
import ScheduleTestModal from '../../components/tutors/ScheduleTestModal';
import { FINAL_CLASS_STATUS } from '../../constants';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CalendarDayCellProps {
  date: Date;
  classesForDate: IFinalClass[];
  onClick: (date: Date, classesForDate: IFinalClass[]) => void;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ date, classesForDate, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dayNumber = date.getDate();
  const dateClasses = classesForDate;

  const isRescheduledDay = dateClasses.some((cls: any) => cls && (cls as any).__isRescheduledForDate);

  const isToday = (() => {
    const now = new Date();
    return (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() === date.getDate()
    );
  })();

  const hasClasses = dateClasses.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 0.75, sm: 1, md: 1.5 },
        minHeight: { xs: 70, sm: 90, md: 110 },
        height: '100%',
        bgcolor: isToday ? 'rgba(15, 98, 254, 0.05)' : isRescheduledDay ? 'rgba(245, 158, 11, 0.06)' : 'background.paper',
        border: '1px solid',
        borderColor: isToday
          ? 'primary.main'
          : isRescheduledDay
            ? 'warning.light'
            : hasClasses
              ? 'grey.300'
              : 'grey.200',
        borderLeftWidth: hasClasses ? 4 : 1,
        borderLeftColor: isRescheduledDay
          ? 'warning.main'
          : hasClasses
            ? 'primary.main'
            : isToday
              ? 'primary.light'
              : 'grey.200',
        borderRadius: { xs: '8px', sm: '10px', md: '12px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        cursor: hasClasses ? 'pointer' : 'default',
        '&:hover': hasClasses ? {
          bgcolor: 'rgba(15, 98, 254, 0.05)',
          borderColor: 'primary.main',
          transform: { xs: 'none', sm: 'translateY(-2px)' },
          boxShadow: { xs: 'none', sm: '0 4px 12px rgba(15, 98, 254, 0.1)' },
        } : {},
      }}
      onClick={() => hasClasses && onClick(date, dateClasses)}
    >
      {/* Day Number Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={{ xs: 0.5, sm: 0.75, md: 1 }}>
        <Typography
          variant="subtitle2"
          fontWeight={isToday ? 700 : 600}
          color={isToday ? 'primary.main' : 'text.primary'}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' } }}
        >
          {dayNumber}
        </Typography>
        {isToday && !isMobile && (
          <Chip
            icon={<TodayIcon sx={{ fontSize: 12 }} />}
            label="Today"
            size="small"
            color="primary"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />
        )}
        {!isToday && isRescheduledDay && !isMobile && (
          <Chip
            label="Rescheduled"
            size="small"
            color="warning"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
            }}
          />
        )}
        {/* On mobile we no longer show the dot indicator, only the day number */}
      </Box>

      {/* Class Information */}
      <Box flexGrow={1} display="flex" flexDirection="column" gap={{ xs: 0.25, sm: 0.5 }}>
        {hasClasses ? (
          (() => {
            const first = dateClasses[0];
            const sched: any = (first as any).schedule || {};
            const timeSlot: string = sched.timeSlot || '';
            const extraCount = dateClasses.length - 1;
            return (
              <>
                {!isMobile ? (
                  <>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Avatar
                        sx={{
                          width: { xs: 16, sm: 18, md: 20 },
                          height: { xs: 16, sm: 18, md: 20 },
                          bgcolor: 'primary.main',
                          fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                          fontWeight: 600,
                        }}
                      >
                        {first.studentName?.charAt(0) || 'S'}
                      </Avatar>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{
                          flex: 1,
                          color: 'text.primary',
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        }}
                      >
                        {first.studentName}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccessTimeIcon sx={{ fontSize: { xs: 10, sm: 11, md: 12 }, color: 'primary.main' }} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={500}
                        noWrap
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}
                      >
                        {timeSlot || 'Time N/A'}
                      </Typography>
                    </Stack>

                    {extraCount > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={500}
                        sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' } }}
                      >
                        +{extraCount} more
                      </Typography>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      color="primary.main"
                      fontWeight={700}
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {dateClasses.length}
                    </Typography>
                  </Box>
                )}
              </>
            );
          })()
        ) : (
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}>
              No classes
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const TutorTimetablePage: React.FC = () => {
  // Hooks must be called unconditionally at the top of the component
  const theme = useTheme();
  const isDialogFullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector(selectCurrentUser);
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<IFinalClass[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleModalClass, setScheduleModalClass] = useState<IFinalClass | null>(null);
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testModalClass, setTestModalClass] = useState<IFinalClass | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!user) {
          setError('User not found');
          setLoading(false);
          return;
        }
        const tutorId = (user as any).id || (user as any)._id;
        const res = await getMyClasses(tutorId, FINAL_CLASS_STATUS.ACTIVE);
        setClasses(res.data || []);
      } catch (e: any) {
        const msg = e?.response?.data?.message || 'Failed to load timetable';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  const isClassOnDate = (cls: IFinalClass, date: Date): boolean => {
    const normalize = (d: Date) => {
      const nd = new Date(d);
      nd.setHours(0, 0, 0, 0);
      return nd.getTime();
    };

    const reschedules: any[] = ((cls as any).oneTimeReschedules || []).map((r: any) => ({ ...r }));

    // If there is a one-time reschedule target for this exact date, treat it as a class day
    const isRescheduleTarget = reschedules.some((r) => normalize(new Date(r.toDate)) === normalize(date));
    if (isRescheduleTarget) {
      return true;
    }

    // If this date is an original date that has been moved to another date, hide it from timetable
    const isMovedFromDate = reschedules.some(
      (r) => normalize(new Date(r.fromDate)) === normalize(date) && normalize(new Date(r.toDate)) !== normalize(new Date(r.fromDate))
    );
    if (isMovedFromDate) {
      return false;
    }

    const sched: any = (cls as any).schedule || {};
    const daysOfWeek: string[] = Array.isArray(sched.daysOfWeek) ? sched.daysOfWeek : [];
    if (!daysOfWeek.length) return false;

    const classStart = cls.startDate ? new Date(cls.startDate) : null;
    const classEnd = (cls as any).endDate ? new Date((cls as any).endDate) : null;

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    if (classStart) {
      const start = new Date(classStart);
      start.setHours(0, 0, 0, 0);
      if (day < start) return false;
    }
    if (classEnd) {
      const end = new Date(classEnd);
      end.setHours(0, 0, 0, 0);
      if (day > end) return false;
    }

    const weekdayIndex = (day.getDay() + 6) % 7;
    const weekdayName = DAYS_ORDER[weekdayIndex];
    return daysOfWeek.includes(weekdayName);
  };

  const unscheduledClasses = useMemo(() => {
    return classes.filter((cls) => {
      const sched: any = (cls as any).schedule || {};
      const days: string[] = Array.isArray(sched.daysOfWeek) ? sched.daysOfWeek : [];
      const hasDays = days.length > 0;
      const hasTime = !!sched.timeSlot;
      return !hasDays || !hasTime;
    });
  }, [classes]);

  const openScheduleModal = (cls: IFinalClass) => {
    const sched: any = (cls as any).schedule || {};
    const days: string[] = Array.isArray(sched.daysOfWeek) ? sched.daysOfWeek : [];
    const timeSlot: string = sched.timeSlot || '';
    let start = '';
    let end = '';
    if (timeSlot && timeSlot.includes('-')) {
      const parts = timeSlot.split('-');
      if (parts.length === 2) {
        start = parts[0].trim();
        end = parts[1].trim();
      }
    }
    setScheduleModalClass(cls);
    setScheduleDays(days);
    setScheduleStartTime(start);
    setScheduleEndTime(end);
    setScheduleError(null);
    setScheduleSuccess(null);
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    setScheduleModalClass(null);
  };

  const toggleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveSchedule = async () => {
    if (!scheduleModalClass) return;
    if (!scheduleDays.length) {
      setScheduleError('Please select at least one day.');
      return;
    }
    if (!scheduleStartTime || !scheduleEndTime) {
      setScheduleError('Please select both start and end time.');
      return;
    }

    const parseTimeToMinutes = (value: string): number | null => {
      const v = value.trim();
      if (!v) return null;
      // Expecting HH:MM (24h) from input[type="time"]
      const [h, m] = v.split(':').map((n) => Number(n));
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };

    const startMinutes = parseTimeToMinutes(scheduleStartTime);
    const endMinutes = parseTimeToMinutes(scheduleEndTime);
    if (startMinutes == null || endMinutes == null) {
      setScheduleError('Invalid time format.');
      return;
    }
    if (endMinutes <= startMinutes) {
      setScheduleError('End time must be after start time.');
      return;
    }

    // Clash detection against other classes for this tutor
    const hasClash = classes.some((c) => {
      if (c.id === scheduleModalClass.id) return false;
      const sched: any = (c as any).schedule || {};
      const days: string[] = Array.isArray(sched.daysOfWeek) ? sched.daysOfWeek : [];
      if (!days.length) return false;
      const intersects = days.some((d) => scheduleDays.includes(d));
      if (!intersects) return false;
      const slot: string = sched.timeSlot || '';
      if (!slot || !slot.includes('-')) return false;
      const [s1, s2] = slot.split('-');
      if (!s1 || !s2) return false;
      const otherStart = parseTimeToMinutes(s1.trim());
      const otherEnd = parseTimeToMinutes(s2.trim());
      if (otherStart == null || otherEnd == null) return false;
      return Math.max(startMinutes, otherStart) < Math.min(endMinutes, otherEnd);
    });

    if (hasClash) {
      setScheduleError('This time range clashes with another class on one or more selected days.');
      return;
    }
    try {
      setScheduleSaving(true);
      setScheduleError(null);
      setScheduleSuccess(null);
      const timeSlot = `${scheduleStartTime} - ${scheduleEndTime}`;
      const resp = await updateFinalClassSchedule(scheduleModalClass.id, {
        daysOfWeek: scheduleDays,
        timeSlot,
      });
      const updated = resp.data;
      setClasses((prev) => prev.map((c) => (c.id === updated.id ? (updated as any) : c)));
      setScheduleSuccess('Timetable updated successfully.');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update timetable.';
      setScheduleError(msg);
    } finally {
      setScheduleSaving(false);
    }
  };

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const firstWeekdayIndex = (firstOfMonth.getDay() + 6) % 7;

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstWeekdayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const formatMonthYear = (date: Date) =>
    date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const getClassesForDate = (date: Date) => {
    const normalize = (d: Date) => {
      const nd = new Date(d);
      nd.setHours(0, 0, 0, 0);
      return nd.getTime();
    };

    return classes
      .filter((cls) => isClassOnDate(cls, date))
      .map((cls) => {
        const anyCls: any = { ...(cls as any) };
        const reschedules: any[] = (anyCls.oneTimeReschedules || []).map((r: any) => ({ ...r }));
        const match = reschedules.find((r) => normalize(new Date(r.toDate)) === normalize(date));

        if (match) {
          const sched = anyCls.schedule || {};
          anyCls.schedule = { ...sched, timeSlot: match.timeSlot };
          (anyCls as any).__isRescheduledForDate = true;
          return anyCls;
        }

        return cls;
      });
  };

  const handleDayClick = (date: Date, dayClasses: IFinalClass[]) => {
    setSelectedDate(date);
    setSelectedClasses(dayClasses);
  };

  const handleCloseDialog = () => {
    setSelectedDate(null);
    setSelectedClasses([]);
  };

  const openTestModalForClass = (cls: IFinalClass) => {
    setTestModalClass(cls);
    setTestModalOpen(true);
  };

  const closeTestModal = () => {
    setTestModalOpen(false);
    setTestModalClass(null);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" disableGutters>
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner size={48} message="Loading timetable..." />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" disableGutters>
        <ErrorAlert error={error} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Header Section */}
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={{ xs: 3, sm: 4 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 2 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            My Timetable
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            View and manage your class schedule
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayIcon color="primary" />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {classes.length} Active Classes
          </Typography>
        </Box>
      </Box>

      {unscheduledClasses.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mb: { xs: 2, sm: 3 },
            border: '1px dashed',
            borderColor: 'warning.light',
            bgcolor: 'warning.50',
            borderRadius: { xs: '10px', sm: '12px' },
          }}
        >
          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.75, sm: 2.5 } }}>
            <Typography
              variant="subtitle2"
              color="warning.main"
              sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Classes without fixed schedule
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              These classes do not have days of week or a time slot set yet and therefore don&apos;t appear on the calendar grid.
            </Typography>
            <Stack spacing={0.75}>
              {unscheduledClasses.map((cls) => {
                const className: string = (cls as any).className || '-';
                const sched: any = (cls as any).schedule || {};
                const timeSlot: string = sched.timeSlot || 'Time not set';
                return (
                  <Box key={cls.id} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' }, fontWeight: 600 }}
                      >
                        {cls.studentName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {className !== '-' ? `• ${className}` : ''}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        • {timeSlot}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openScheduleModal(cls)}
                    >
                      Set timetable
                    </Button>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Calendar Navigation */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 2.5, md: 3 },
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: { xs: '10px', sm: '12px' },
        }}
      >
        <IconButton
          onClick={handlePrevMonth}
          size="small"
          sx={{
            '&:hover': { bgcolor: 'primary.main', color: 'white' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </IconButton>

        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
        >
          {formatMonthYear(currentMonth)}
        </Typography>

        <IconButton
          onClick={handleNextMonth}
          size="small"
          sx={{
            '&:hover': { bgcolor: 'primary.main', color: 'white' },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </IconButton>
      </Box>

      {/* Calendar Grid */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: '16px',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Weekday Headers */}
          <Grid container spacing={{ xs: 0.5, sm: 0.75, md: 1 }} mb={{ xs: 1, sm: 1.5, md: 2 }}>
            {WEEKDAY_LABELS.map((label) => (
              <Grid item xs={12 / 7} key={label}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: { xs: 0.5, sm: 0.75, md: 1 },
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: { xs: '6px', sm: '8px' },
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.8125rem', md: '0.875rem' },
                  }}
                >
                  {label}
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Days */}
          <Grid container spacing={{ xs: 0.5, sm: 0.75, md: 1 }}>
            {monthDays.map((date, idx) => {
              if (!date) {
                return (
                  <Grid item xs={12 / 7} key={idx}>
                    <Box minHeight={{ xs: 70, sm: 90, md: 110 }} />
                  </Grid>
                );
              }

              const dateClasses = getClassesForDate(date);

              return (
                <Grid item xs={12 / 7} key={idx}>
                  <CalendarDayCell date={date} classesForDate={dateClasses} onClick={handleDayClick} />
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Class Details Dialog */}
      <Dialog
        open={!!selectedDate}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        fullScreen={isDialogFullScreen}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: '16px' },
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ pb: 2, pt: { xs: 2, sm: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <CalendarTodayIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
            <Box>
              <Typography
                variant="h6"
                component="div"
                fontWeight={700}
                sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
              >
                Classes Schedule
              </Typography>
              <Typography variant="body2" component="div" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                {selectedDate
                  ? selectedDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                  : 'Select a date'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedClasses.length === 0 ? (
            <Box
              sx={{
                py: { xs: 4, sm: 6 },
                textAlign: 'center',
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'grey.300', mb: 2 }} />
              <Typography
                variant="h6"
                color="text.primary"
                gutterBottom
                fontWeight={600}
                sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
              >
                No Classes Scheduled
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any classes on this day
              </Typography>
            </Box>
          ) : (
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              {selectedClasses.map((cls, index) => {
                const sched: any = (cls as any).schedule || {};
                const timeSlot: string = sched.timeSlot || '';
                const className: string = (cls as any).className || '-';
                const address: string = (cls as any).location || (sched.address as string) || '-';
                const isRescheduled = Boolean((cls as any).__isRescheduledForDate);

                return (
                  <Card
                    key={cls.id}
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: isRescheduled ? 'warning.light' : 'grey.200',
                      borderLeft: '4px solid',
                      borderLeftColor: isRescheduled ? 'warning.main' : 'primary.main',
                      borderRadius: { xs: '10px', sm: '12px' },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: { xs: 'none', sm: '0 2px 8px rgba(15, 98, 254, 0.1)' },
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Stack spacing={{ xs: 1.5, sm: 2 }}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          justifyContent="space-between"
                          spacing={{ xs: 1, sm: 0 }}
                        >
                          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
                            <Avatar
                              sx={{
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 },
                                bgcolor: 'primary.main',
                                fontWeight: 700,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                              }}
                            >
                              {cls.studentName?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}
                              >
                                {cls.studentName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                              >
                                {className}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={`Class ${index + 1}`}
                              color={isRescheduled ? 'warning' : 'primary'}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              }}
                            />
                            {isRescheduled && (
                              <Chip
                                label="Rescheduled"
                                color="warning"
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                }}
                              />
                            )}
                            {Boolean((cls as any).coordinator) ? (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openTestModalForClass(cls)}
                              >
                                Schedule Test
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Coordinator not assigned yet — tests will be enabled once a coordinator is assigned.
                              </Typography>
                            )}
                          </Stack>
                        </Stack>

                        <Divider />

                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <AccessTimeIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                >
                                  Time
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                                >
                                  {timeSlot || 'Not specified'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <LocationOnIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                >
                                  Location
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {address}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {testModalClass && (
        <ScheduleTestModal
          open={testModalOpen}
          onClose={closeTestModal}
          finalClass={testModalClass}
        />
      )}

      <Dialog
        open={scheduleModalOpen}
        onClose={scheduleSaving ? undefined : closeScheduleModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6" component="div" fontWeight={700}>
            Set Timetable
          </Typography>
          {scheduleModalClass && (
            <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 0.5 }}>
              {scheduleModalClass.studentName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          {(scheduleError || scheduleSuccess) && (
            <Box mb={1.5}>
              {scheduleError && (
                <Typography variant="caption" color="error.main">
                  {scheduleError}
                </Typography>
              )}
              {scheduleSuccess && (
                <Typography variant="caption" color="success.main">
                  {scheduleSuccess}
                </Typography>
              )}
            </Box>
          )}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Days of week
          </Typography>
          <FormGroup row sx={{ mb: 2 }}>
            {DAYS_ORDER.map((day) => (
              <FormControlLabel
                key={day}
                control={
                  <Checkbox
                    size="small"
                    checked={scheduleDays.includes(day)}
                    onChange={() => toggleDay(day)}
                  />
                }
                label={day.charAt(0) + day.slice(1).toLowerCase()}
              />
            ))}
          </FormGroup>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Time slot
          </Typography>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Start time"
                type="time"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                value={scheduleStartTime}
                onChange={(e) => setScheduleStartTime(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="End time"
                type="time"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                value={scheduleEndTime}
                onChange={(e) => setScheduleEndTime(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeScheduleModal} disabled={scheduleSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSchedule}
            disabled={scheduleSaving}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TutorTimetablePage;