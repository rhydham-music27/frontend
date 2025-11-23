import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid2, Card, CardContent, TextField, Button, MenuItem } from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import ProfileVerificationCard from '../../components/tutors/ProfileVerificationCard';
import ClassLeadsFeedCard from '../../components/tutors/ClassLeadsFeedCard';
import DemoClassesCard from '../../components/tutors/DemoClassesCard';
import MyClassesCard from '../../components/tutors/MyClassesCard';
import PaymentsEarningsCard from '../../components/tutors/PaymentsEarningsCard';
import FeedbackPerformanceCard from '../../components/tutors/FeedbackPerformanceCard';
import FeedbackSummaryCard from '../../components/tutors/FeedbackSummaryCard';
import NotificationsCenterCard from '../../components/tutors/NotificationsCenterCard';
import AttendanceHistoryCard from '../../components/tutors/AttendanceHistoryCard';
import { getMyClasses, createOneTimeReschedule } from '../../services/finalClassService';
import { FINAL_CLASS_STATUS } from '../../constants';
import { IFinalClass } from '../../types';

const TutorDashboardPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [loading] = useState(false);
  const [error] = useState<any>(null);
  const [rescheduleClasses, setRescheduleClasses] = useState<IFinalClass[]>([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleToDate, setRescheduleToDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [savingReschedule, setSavingReschedule] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      if (!user) return;
      try {
        setRescheduleLoading(true);
        setRescheduleError(null);
        const tutorId = (user as any).id || (user as any)._id;
        const resp = await getMyClasses(tutorId, FINAL_CLASS_STATUS.ACTIVE, 1, 50);
        setRescheduleClasses(resp.data || []);
      } catch (e: any) {
        const msg = e?.response?.data?.message || 'Failed to load classes for rescheduling.';
        setRescheduleError(msg);
      } finally {
        setRescheduleLoading(false);
      }
    };

    loadClasses();
  }, [user]);

  const handleSaveReschedule = async () => {
    if (!selectedClassId || !rescheduleDate || !rescheduleTime.trim()) {
      setRescheduleError('Please select a class, original date, and time slot.');
      return;
    }

    try {
      setSavingReschedule(true);
      setRescheduleError(null);
      setRescheduleSuccess(null);

      const targetDate = rescheduleToDate || rescheduleDate;
      await createOneTimeReschedule(selectedClassId, {
        fromDate: rescheduleDate,
        toDate: targetDate,
        timeSlot: rescheduleTime.trim(),
      });
      setRescheduleTime('');
      setRescheduleToDate('');
      setRescheduleSuccess('Temporary reschedule saved successfully.');

    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to save reschedule.';
      setRescheduleError(msg);
    } finally {
      setSavingReschedule(false);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters>
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
            Tutor Dashboard
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            Welcome back, {user?.name || 'Tutor'}! Track your classes, demos, and performance.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <DashboardIcon fontSize="small" />
        </Box>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner size={48} message="Loading dashboard..." />
        </Box>
      )}

      {error && <ErrorAlert error={error} />}

      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Quick Overview
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12, lg: 8 }}>
            <ProfileVerificationCard />
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 4 }}>
            <FeedbackSummaryCard />
          </Grid2>
        </Grid2>
      </Box>

      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          My Activity
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12, md: 8 }}>
            <ClassLeadsFeedCard />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <DemoClassesCard />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <MyClassesCard />
          </Grid2>
        </Grid2>
      </Box>

      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Temporary Reschedule
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                {(rescheduleError || rescheduleSuccess) && (
                  <Box mb={1.5}>
                    {rescheduleError && (
                      <Typography variant="caption" color="error.main">
                        {rescheduleError}
                      </Typography>
                    )}
                    {rescheduleSuccess && (
                      <Typography variant="caption" color="success.main">
                        {rescheduleSuccess}
                      </Typography>
                    )}
                  </Box>
                )}
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Class"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    disabled={rescheduleLoading || savingReschedule || rescheduleClasses.length === 0}
                  >
                    {rescheduleClasses.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.studentName}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="Which date's session?"
                    InputLabelProps={{ shrink: true }}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    disabled={savingReschedule}
                  />
                </Box>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={2}>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    label="Move session to which date? (optional)"
                    helperText="If empty, the same date above will be used."
                    InputLabelProps={{ shrink: true }}
                    value={rescheduleToDate}
                    onChange={(e) => setRescheduleToDate(e.target.value)}
                    disabled={savingReschedule}
                  />
                </Box>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'flex-end' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="New time slot"
                    placeholder="e.g. 7:00 PM - 8:00 PM"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    disabled={savingReschedule}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSaveReschedule}
                    disabled={savingReschedule || rescheduleLoading}
                  >
                    Save
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Box>

      <Box mt={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Attendance History
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12 }}>
            <AttendanceHistoryCard />
          </Grid2>
        </Grid2>
      </Box>

      <Box mt={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Financial Overview & Performance
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12, lg: 8 }}>
            <PaymentsEarningsCard />
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 4 }}>
            <FeedbackPerformanceCard />
          </Grid2>
        </Grid2>
      </Box>

      <Box mt={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Notifications & Updates
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12 }}>
            <NotificationsCenterCard />
          </Grid2>
        </Grid2>
      </Box>
    </Container>
  );
};

export default TutorDashboardPage;