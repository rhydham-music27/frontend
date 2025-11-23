import React, { useEffect, useState, useMemo } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, IconButton, Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { getMyClasses } from '../../services/finalClassService';
import { IFinalClass } from '../../types';
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
  const dayNumber = date.getDate();
  const dateClasses = classesForDate;

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
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'grey.300',
        p: 1,
        minHeight: 110,
        bgcolor: 'background.paper',
        borderLeftWidth: hasClasses ? 4 : 1,
        borderLeftColor: hasClasses ? 'primary.main' : 'grey.300',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease',
        '&:hover': {
          bgcolor: 'grey.50',
          borderColor: hasClasses ? 'primary.light' : 'grey.400',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
          transform: 'translateY(-2px)',
        },
        cursor: hasClasses ? 'pointer' : 'default',
      }}
      onClick={() => hasClasses && onClick(date, dateClasses)}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color={isToday ? 'primary.main' : 'text.primary'}
        >
          {dayNumber}
        </Typography>
        {isToday && (
          <CalendarTodayIcon sx={{ fontSize: 16 }} color="primary" />
        )}
      </Box>

      <Box mt={0.5} flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
        {hasClasses ? (
          (() => {
            const first = dateClasses[0];
            const sched: any = (first as any).schedule || {};
            const timeSlot: string = sched.timeSlot || '';
            const extraCount = dateClasses.length - 1;
            return (
              <>
                <Box display="flex" alignItems="center" gap={0.5} mb={0.25}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} color="primary" />
                  <Typography variant="body2" noWrap>
                    <Box component="span" fontWeight={600}>{first.studentName}</Box>
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {timeSlot || 'Time N/A'}
                </Typography>
                {extraCount > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    +{extraCount} more class{extraCount > 1 ? 'es' : ''}
                  </Typography>
                )}
              </>
            );
          })()
        ) : (
          <Typography variant="caption" color="text.disabled">
            No class
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const TutorTimetablePage: React.FC = () => {
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

  const getClassesForDate = (date: Date) =>
    classes.filter((cls) => isClassOnDate(cls, date));

  const handleDayClick = (date: Date, dayClasses: IFinalClass[]) => {
    setSelectedDate(date);
    setSelectedClasses(dayClasses);
  };

  const handleCloseDialog = () => {
    setSelectedDate(null);
    setSelectedClasses([]);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ErrorAlert error={error} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" gutterBottom>
            My Timetable
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Calendar view of your active classes. Days with classes are highlighted with student name and time slot.
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={handlePrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600}>
            {formatMonthYear(currentMonth)}
          </Typography>
          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={0} mb={1}>
            {WEEKDAY_LABELS.map((label) => (
              <Grid item xs={12 / 7} key={label}>
                <Box
                  textAlign="center"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    py: 0.5,
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    {label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={1}>
            {monthDays.map((date, idx) => {
              if (!date) {
                return (
                  <Grid item xs={12 / 7} key={idx}>
                    <Box minHeight={80} />
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

      <Dialog open={!!selectedDate} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedDate
            ? `Classes on ${selectedDate.toLocaleDateString(undefined, {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}`
            : 'Classes'}
        </DialogTitle>
        <DialogContent>
          {selectedClasses.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No classes scheduled for this day.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Time Slot</TableCell>
                  <TableCell>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedClasses.map((cls) => {
                  const sched: any = (cls as any).schedule || {};
                  const timeSlot: string = sched.timeSlot || '';
                  const className: string = (cls as any).className || '-';
                  const address: string = (cls as any).location || (sched.address as string) || '-';
                  return (
                    <TableRow key={cls.id}>
                      <TableCell>{className}</TableCell>
                      <TableCell>{cls.studentName}</TableCell>
                      <TableCell>{timeSlot || 'Time N/A'}</TableCell>
                      <TableCell>{address}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TutorTimetablePage;
