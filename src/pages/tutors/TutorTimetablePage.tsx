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
  useTheme,
  alpha
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SchoolIcon from '@mui/icons-material/School';
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
        bgcolor: isToday
          ? alpha('#6366f1', 0.04)
          : isRescheduledDay
            ? alpha('#f59e0b', 0.04)
            : '#fff',
        border: '1px solid',
        borderColor: isToday
          ? alpha('#6366f1', 0.3)
          : isRescheduledDay
            ? alpha('#f59e0b', 0.25)
            : hasClasses
              ? alpha('#6366f1', 0.12)
              : 'grey.100',
        borderLeftWidth: hasClasses ? 3 : 1,
        borderLeftColor: isRescheduledDay
          ? '#f59e0b'
          : hasClasses
            ? '#6366f1'
            : isToday
              ? alpha('#6366f1', 0.3)
              : 'grey.100',
        borderRadius: 2.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: hasClasses ? 'pointer' : 'default',
        '&:hover': hasClasses ? {
          bgcolor: alpha('#6366f1', 0.04),
          borderColor: alpha('#6366f1', 0.25),
          transform: { xs: 'none', sm: 'translateY(-1px)' },
          boxShadow: { xs: 'none', sm: `0 4px 12px ${alpha('#6366f1', 0.1)}` },
        } : {},
      }}
      onClick={() => hasClasses && onClick(date, dateClasses)}
    >
      {/* Day Number Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={{ xs: 0.5, sm: 0.75, md: 1 }}>
        <Typography
          variant="subtitle2"
          fontWeight={isToday ? 800 : 600}
          color={isToday ? '#6366f1' : 'text.primary'}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' } }}
        >
          {dayNumber}
        </Typography>
        {isToday && !isMobile && (
          <Chip
            label="Today"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 700,
              bgcolor: alpha('#6366f1', 0.08),
              color: '#6366f1',
            }}
          />
        )}
        {!isToday && isRescheduledDay && !isMobile && (
          <Chip
            label="Moved"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 700,
              bgcolor: alpha('#f59e0b', 0.1),
              color: '#d97706',
            }}
          />
        )}
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
                          bgcolor: '#6366f1',
                          fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                          fontWeight: 700,
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
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem' },
                        }}
                      >
                        {first.studentName}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccessTimeIcon sx={{ fontSize: { xs: 10, sm: 11, md: 12 }, color: '#6366f1' }} />
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
                        fontWeight={600}
                        sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.72rem' }, color: '#6366f1' }}
                      >
                        +{extraCount} more
                      </Typography>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ fontSize: '0.7rem', color: '#6366f1' }}
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
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.72rem' } }}>
              —
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const TutorTimetablePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDialogFullScreen = isMobile;
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

  // ─── Mobile week state ───────────────────────
  const [mobileWeekStart, setMobileWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday-based
    const mon = new Date(now);
    mon.setDate(now.getDate() - diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  });
  const [mobileSelectedDay, setMobileSelectedDay] = useState<Date>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });

  const mobileWeekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mobileWeekStart);
      d.setDate(mobileWeekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [mobileWeekStart]);

  const handleMobilePrevWeek = () => {
    setMobileWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleMobileNextWeek = () => {
    setMobileWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isDateToday = (d: Date) => isSameDay(d, new Date());

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

    const isRescheduleTarget = reschedules.some((r) => normalize(new Date(r.toDate)) === normalize(date));
    if (isRescheduleTarget) {
      return true;
    }

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

  const mobileSelectedDayClasses = useMemo(() => {
    return classes
      .filter((cls) => isClassOnDate(cls, mobileSelectedDay))
      .map((cls) => {
        const normalize = (dd: Date) => {
          const nd = new Date(dd);
          nd.setHours(0, 0, 0, 0);
          return nd.getTime();
        };
        const anyCls: any = { ...(cls as any) };
        const reschedules: any[] = (anyCls.oneTimeReschedules || []).map((r: any) => ({ ...r }));
        const match = reschedules.find((r) => normalize(new Date(r.toDate)) === normalize(mobileSelectedDay));
        if (match) {
          const sched = anyCls.schedule || {};
          anyCls.schedule = { ...sched, timeSlot: match.timeSlot };
          (anyCls as any).__isRescheduledForDate = true;
          return anyCls;
        }
        return cls;
      });
  }, [classes, mobileSelectedDay]);

  const mobileWeekLabel = useMemo(() => {
    const start = mobileWeekDays[0];
    const end = mobileWeekDays[6];
    const sameMonth = start.getMonth() === end.getMonth();
    if (sameMonth) {
      return `${start.toLocaleDateString(undefined, { month: 'short' })} ${start.getDate()} – ${end.getDate()}`;
    }
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }, [mobileWeekDays]);


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
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 0 }, pb: { xs: 10, sm: 0 } }}>
      {/* ─── Premium Header ──────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 3, sm: 4 },
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          p: { xs: 2.5, sm: 3.5 },
          mb: { xs: 2.5, sm: 4 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '50%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box position="relative" zIndex={1} display="flex" alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              My Timetable
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha('#fff', 0.6),
                mt: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.88rem' },
                maxWidth: 500,
              }}
            >
              View and manage your class schedule
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Chip
              label={`${classes.length} Active`}
              size="small"
              sx={{
                bgcolor: alpha('#fff', 0.1),
                color: alpha('#fff', 0.8),
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 28,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha('#fff', 0.1)}`,
              }}
            />
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                p: 1.25,
                borderRadius: 2.5,
                bgcolor: alpha('#fff', 0.08),
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha('#fff', 0.1)}`,
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 22, color: alpha('#fff', 0.7) }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ─── Unscheduled Classes Warning ──────────────── */}
      {unscheduledClasses.length > 0 && (
        <Box
          sx={{
            mb: { xs: 2, sm: 3 },
            border: '1px dashed',
            borderColor: alpha('#f59e0b', 0.35),
            bgcolor: alpha('#f59e0b', 0.03),
            borderRadius: 3,
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 0.75, fontWeight: 700, fontSize: { xs: '0.82rem', sm: '0.88rem' }, color: '#d97706' }}
          >
            ⚠️ Classes without fixed schedule
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          >
            These classes don&apos;t appear on the calendar grid yet.
          </Typography>
          <Stack spacing={1}>
            {unscheduledClasses.map((cls) => {
              const className: string = (cls as any).className || '-';
              const sched: any = (cls as any).schedule || {};
              const timeSlot: string = sched.timeSlot || 'Time not set';
              return (
                <Box
                  key={cls.id}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: alpha('#f59e0b', 0.04),
                    border: '1px solid',
                    borderColor: alpha('#f59e0b', 0.1),
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.78rem', sm: '0.82rem' }, fontWeight: 700 }}>
                      {cls.studentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.72rem' } }}>
                      {className !== '-' ? `• ${className}` : ''} • {timeSlot}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openScheduleModal(cls)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      borderColor: alpha('#f59e0b', 0.4),
                      color: '#d97706',
                      '&:hover': { borderColor: '#d97706', bgcolor: alpha('#f59e0b', 0.06) },
                    }}
                  >
                    Set timetable
                  </Button>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── MOBILE: Week Agenda View ─────────────────── */}
      {/* ═══════════════════════════════════════════════ */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        {/* Week Navigation */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
            p: 1.25,
            bgcolor: '#fff',
            border: '1px solid',
            borderColor: alpha('#6366f1', 0.1),
            borderRadius: 2.5,
          }}
        >
          <IconButton
            onClick={handleMobilePrevWeek}
            size="small"
            sx={{ width: 32, height: 32, bgcolor: alpha('#6366f1', 0.06) }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.88rem', letterSpacing: '-0.01em' }}>
            {mobileWeekLabel}
          </Typography>
          <IconButton
            onClick={handleMobileNextWeek}
            size="small"
            sx={{ width: 32, height: 32, bgcolor: alpha('#6366f1', 0.06) }}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Day Selector Pills */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.75,
            mb: 2,
            overflowX: 'auto',
            pb: 0.5,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {mobileWeekDays.map((day, i) => {
            const isSelected = isSameDay(day, mobileSelectedDay);
            const today = isDateToday(day);
            const dayClasses = classes.filter((cls) => isClassOnDate(cls, day));
            const hasClass = dayClasses.length > 0;
            return (
              <Box
                key={i}
                onClick={() => setMobileSelectedDay(day)}
                sx={{
                  flex: '1 0 auto',
                  minWidth: 44,
                  textAlign: 'center',
                  py: 1,
                  px: 0.5,
                  borderRadius: 2.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: isSelected
                    ? '#6366f1'
                    : today
                      ? alpha('#6366f1', 0.06)
                      : '#fff',
                  border: '1px solid',
                  borderColor: isSelected
                    ? '#6366f1'
                    : today
                      ? alpha('#6366f1', 0.2)
                      : 'grey.100',
                  position: 'relative',
                }}
              >
                <Typography
                  variant="caption"
                  display="block"
                  fontWeight={600}
                  sx={{
                    fontSize: '0.6rem',
                    color: isSelected ? alpha('#fff', 0.7) : 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 0.25,
                  }}
                >
                  {WEEKDAY_LABELS[i]}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  sx={{
                    fontSize: '0.92rem',
                    color: isSelected ? '#fff' : today ? '#6366f1' : 'text.primary',
                  }}
                >
                  {day.getDate()}
                </Typography>
                {hasClass && (
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: isSelected ? '#fff' : '#6366f1',
                      mx: 'auto',
                      mt: 0.25,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Selected Day Classes */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1.5,
              fontWeight: 700,
              fontSize: '0.72rem',
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {mobileSelectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>

          {mobileSelectedDayClasses.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 5,
                borderRadius: 3,
                border: '1px dashed',
                borderColor: alpha('#6366f1', 0.15),
                bgcolor: alpha('#6366f1', 0.02),
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: alpha('#6366f1', 0.06),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <EventNoteIcon sx={{ fontSize: 22, color: '#6366f1' }} />
              </Box>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                No classes today
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
                Enjoy your free time! 🎉
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {mobileSelectedDayClasses.map((cls, idx) => {
                const sched: any = (cls as any).schedule || {};
                const timeSlot: string = sched.timeSlot || '';
                const address: string = (cls as any).location || (sched.address as string) || '';
                const isRescheduled = Boolean((cls as any).__isRescheduledForDate);
                const subjects = Array.isArray(cls.subject) ? cls.subject.join(', ') : String(cls.subject || '');

                return (
                  <Box
                    key={cls.id || idx}
                    sx={{
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: isRescheduled ? alpha('#f59e0b', 0.2) : alpha('#6366f1', 0.1),
                      bgcolor: '#fff',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        height: 3,
                        background: isRescheduled
                          ? `linear-gradient(90deg, #f59e0b, ${alpha('#f59e0b', 0.3)})`
                          : `linear-gradient(90deg, #6366f1, ${alpha('#6366f1', 0.3)})`,
                      },
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      {/* Student info */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              bgcolor: '#6366f1',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                            }}
                          >
                            {cls.studentName?.charAt(0) || 'S'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.88rem' }}>
                              {cls.studentName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                              {subjects} • Grade {cls.grade}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" gap={0.5}>
                          {isRescheduled && (
                            <Chip
                              label="Moved"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                bgcolor: alpha('#f59e0b', 0.1),
                                color: '#d97706',
                              }}
                            />
                          )}
                          <Chip
                            label={cls.mode || 'N/A'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              bgcolor: cls.mode === 'ONLINE' ? alpha('#3b82f6', 0.08) : alpha('#10b981', 0.08),
                              color: cls.mode === 'ONLINE' ? '#2563eb' : '#059669',
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Time & Location */}
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1.5,
                          p: 1.25,
                          borderRadius: 2,
                          bgcolor: alpha('#6366f1', 0.03),
                          border: '1px solid',
                          borderColor: alpha('#6366f1', 0.06),
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={0.5} flex={1}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: '#6366f1' }} />
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
                            {timeSlot || 'Time N/A'}
                          </Typography>
                        </Box>
                        {address && (
                          <Box display="flex" alignItems="center" gap={0.5} flex={1}>
                            <LocationOnIcon sx={{ fontSize: 14, color: '#6366f1' }} />
                            <Typography variant="caption" fontWeight={600} noWrap sx={{ fontSize: '0.72rem' }}>
                              {address}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Actions */}
                      <Box display="flex" justifyContent="flex-end" gap={1} mt={1.5}>
                        {Boolean((cls as any).coordinator) && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openTestModalForClass(cls)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              borderColor: alpha('#6366f1', 0.25),
                              color: '#6366f1',
                              py: 0.5,
                            }}
                          >
                            Schedule Test
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setSelectedDate(mobileSelectedDay);
                            setSelectedClasses(mobileSelectedDayClasses);
                          }}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            bgcolor: '#6366f1',
                            boxShadow: 'none',
                            py: 0.5,
                            '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' },
                          }}
                        >
                          Details
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── DESKTOP: Calendar Month View ─────────────── */}
      {/* ═══════════════════════════════════════════════ */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        {/* Calendar Navigation */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { sm: 2.5, md: 3 },
            p: 2,
            bgcolor: '#fff',
            border: '1px solid',
            borderColor: alpha('#6366f1', 0.1),
            borderRadius: 3,
          }}
        >
          <IconButton
            onClick={handlePrevMonth}
            size="small"
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha('#6366f1', 0.06),
              '&:hover': { bgcolor: '#6366f1', color: 'white' },
              transition: 'all 0.2s',
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 22 }} />
          </IconButton>

          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ fontSize: { sm: '1.125rem', md: '1.25rem' }, letterSpacing: '-0.01em' }}
          >
            {formatMonthYear(currentMonth)}
          </Typography>

          <IconButton
            onClick={handleNextMonth}
            size="small"
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha('#6366f1', 0.06),
              '&:hover': { bgcolor: '#6366f1', color: 'white' },
              transition: 'all 0.2s',
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>

        {/* Calendar Grid */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'grey.100',
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <CardContent sx={{ p: { sm: 2.5, md: 3 } }}>
            {/* Weekday Headers */}
            <Grid container spacing={{ sm: 0.75, md: 1 }} mb={{ sm: 1.5, md: 2 }}>
              {WEEKDAY_LABELS.map((label) => (
                <Grid item xs={12 / 7} key={label}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: { sm: 0.75, md: 1 },
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: 'white',
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: { sm: '0.78rem', md: '0.85rem' },
                      letterSpacing: '0.02em',
                    }}
                  >
                    {label}
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Days */}
            <Grid container spacing={{ sm: 0.75, md: 1 }}>
              {monthDays.map((date, idx) => {
                if (!date) {
                  return (
                    <Grid item xs={12 / 7} key={idx}>
                      <Box minHeight={{ sm: 90, md: 110 }} />
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
      </Box>

      {/* ─── Class Details Dialog ────────────────────── */}
      <Dialog
        open={!!selectedDate}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        fullScreen={isDialogFullScreen}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            m: { xs: 0, sm: 2 },
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            pt: { xs: 2, sm: 3 },
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: alpha('#fff', 0.1), display: 'flex' }}>
              <CalendarTodayIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: alpha('#fff', 0.8) }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                component="div"
                fontWeight={700}
                sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, color: '#fff' }}
              >
                Classes Schedule
              </Typography>
              <Typography variant="body2" component="div" sx={{ fontSize: { xs: '0.78rem', sm: '0.82rem' }, color: alpha('#fff', 0.6) }}>
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

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc' }}>
          {selectedClasses.length === 0 ? (
            <Box sx={{ py: { xs: 4, sm: 6 }, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: alpha('#6366f1', 0.06),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <EventNoteIcon sx={{ fontSize: 28, color: '#6366f1' }} />
              </Box>
              <Typography variant="h6" gutterBottom fontWeight={700} sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' } }}>
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
                      borderColor: isRescheduled ? alpha('#f59e0b', 0.25) : alpha('#6366f1', 0.1),
                      borderRadius: 2.5,
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: { xs: 'none', sm: `0 4px 12px ${alpha('#6366f1', 0.08)}` },
                      },
                      '&::before': {
                        content: '""',
                        display: 'block',
                        height: 3,
                        background: isRescheduled
                          ? `linear-gradient(90deg, #f59e0b, ${alpha('#f59e0b', 0.4)})`
                          : `linear-gradient(90deg, #6366f1, ${alpha('#6366f1', 0.4)})`,
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
                                bgcolor: '#6366f1',
                                fontWeight: 700,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                              }}
                            >
                              {cls.studentName?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: { xs: '0.92rem', sm: '1rem' } }}>
                                {cls.studentName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.78rem', sm: '0.82rem' } }}>
                                {className}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={`Class ${index + 1}`}
                              size="small"
                              sx={{
                                bgcolor: isRescheduled ? alpha('#f59e0b', 0.1) : alpha('#6366f1', 0.08),
                                color: isRescheduled ? '#d97706' : '#4f46e5',
                                fontWeight: 700,
                                fontSize: { xs: '0.68rem', sm: '0.72rem' },
                              }}
                            />
                            {isRescheduled && (
                              <Chip
                                label="Rescheduled"
                                size="small"
                                sx={{
                                  bgcolor: alpha('#f59e0b', 0.1),
                                  color: '#d97706',
                                  fontWeight: 700,
                                  fontSize: { xs: '0.68rem', sm: '0.72rem' },
                                }}
                              />
                            )}
                            {Boolean((cls as any).coordinator) ? (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openTestModalForClass(cls)}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  borderColor: alpha('#6366f1', 0.3),
                                  color: '#6366f1',
                                  '&:hover': { borderColor: '#6366f1', bgcolor: alpha('#6366f1', 0.04) },
                                }}
                              >
                                Schedule Test
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                                Coordinator not assigned yet
                              </Typography>
                            )}
                          </Stack>
                        </Stack>

                        <Divider sx={{ borderColor: alpha('#6366f1', 0.06) }} />

                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha('#6366f1', 0.03) }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <AccessTimeIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#6366f1' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                                    Time
                                  </Typography>
                                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: { xs: '0.82rem', sm: '0.88rem' } }}>
                                    {timeSlot || 'Not specified'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha('#6366f1', 0.03) }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <LocationOnIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#6366f1' }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                                    Location
                                  </Typography>
                                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: { xs: '0.82rem', sm: '0.88rem' }, wordBreak: 'break-word' }}>
                                    {address}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
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

      {/* ─── Set Timetable Modal ─────────────────────── */}
      <Dialog
        open={scheduleModalOpen}
        onClose={scheduleSaving ? undefined : closeScheduleModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            pb: 2,
          }}
        >
          <Typography variant="h6" component="div" fontWeight={700} sx={{ fontSize: '1.05rem' }}>
            Set Timetable
          </Typography>
          {scheduleModalClass && (
            <Typography variant="body2" component="div" sx={{ mt: 0.5, color: alpha('#fff', 0.6), fontSize: '0.82rem' }}>
              {scheduleModalClass.studentName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, px: 3 }}>
          {(scheduleError || scheduleSuccess) && (
            <Box mb={1.5}>
              {scheduleError && (
                <Typography variant="caption" color="error.main" fontWeight={600}>
                  {scheduleError}
                </Typography>
              )}
              {scheduleSuccess && (
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                  {scheduleSuccess}
                </Typography>
              )}
            </Box>
          )}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.82rem' }}>
            Days of week
          </Typography>
          <FormGroup row sx={{ mb: 2.5 }}>
            {DAYS_ORDER.map((day) => (
              <FormControlLabel
                key={day}
                control={
                  <Checkbox
                    size="small"
                    checked={scheduleDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    sx={{
                      color: alpha('#6366f1', 0.4),
                      '&.Mui-checked': { color: '#6366f1' },
                    }}
                  />
                }
                label={day.charAt(0) + day.slice(1).toLowerCase()}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.82rem', fontWeight: 500 } }}
              />
            ))}
          </FormGroup>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.82rem' }}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={closeScheduleModal}
            disabled={scheduleSaving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSchedule}
            disabled={scheduleSaving}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' },
              boxShadow: 'none',
              px: 3,
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TutorTimetablePage;