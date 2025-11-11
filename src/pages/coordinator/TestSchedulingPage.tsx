import React, { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Grid2,
  Divider,
  Alert,
  Tabs,
  Tab,
  Chip,
  CardActions,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { getAssignedClasses } from '../../services/coordinatorService';
import { scheduleTest, getCoordinatorTests, cancelTest } from '../../services/testService';
import { IFinalClass, ITest, IScheduleTestFormData } from '../../types';
import { TEST_STATUS } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const TestSchedulingPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [view, setView] = useState<'schedule' | 'scheduled'>('schedule');
  const [assignedClasses, setAssignedClasses] = useState<IFinalClass[]>([]);
  const [scheduledTests, setScheduledTests] = useState<ITest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<IScheduleTestFormData>({ finalClassId: '', testDate: '', testTime: '', notes: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const fetchAssignedClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAssignedClasses(1, 100);
      const classes = (res.data || []).filter((cls: IFinalClass) => cls.status === 'ACTIVE');
      setAssignedClasses(classes);
    } catch (_e) {
      setError('Failed to load assigned classes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScheduledTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCoordinatorTests();
      const tests = (res.data || [])
        .filter((t: ITest) => [TEST_STATUS.SCHEDULED, TEST_STATUS.COMPLETED].includes(t.status as any))
        .sort((a: ITest, b: ITest) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());
      setScheduledTests(tests);
    } catch (_e) {
      setError('Failed to load scheduled tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignedClasses();
    fetchScheduledTests();
  }, [fetchAssignedClasses, fetchScheduledTests]);

  const handleInputChange = (field: keyof IScheduleTestFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClassSelect = (classId: string) => {
    setFormData({ finalClassId: classId, testDate: '', testTime: '', notes: '' });
  };

  const handleSubmit = async () => {
    if (!formData.finalClassId || !formData.testDate || !formData.testTime) {
      setSnackbar({ open: true, message: 'Please select class, date and time', severity: 'error' });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await scheduleTest(formData);
      if (res.success) {
        setSnackbar({ open: true, message: 'Test scheduled successfully', severity: 'success' });
        setFormData({ finalClassId: '', testDate: '', testTime: '', notes: '' });
        fetchScheduledTests();
        setView('scheduled');
      }
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to schedule test';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTest = async (testId: string) => {
    try {
      setLoading(true);
      await cancelTest(testId, 'Cancelled by coordinator');
      setSnackbar({ open: true, message: 'Test cancelled', severity: 'success' });
      fetchScheduledTests();
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to cancel test';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSnackbar({ open: true, message: 'Refreshing data...', severity: 'info' });
    fetchAssignedClasses();
    fetchScheduledTests();
  };

  const selectedClass = assignedClasses.find((c) => c.id === formData.finalClassId);

  return (
    <Container maxWidth="lg" disableGutters>
      <PageHeader
        title="Test Scheduling"
        subtitle="Schedule and manage student assessments"
        breadcrumbs={[
          { label: 'Dashboard', path: '/coordinator-dashboard' },
          { label: 'Test Scheduling' },
        ]}
        actions={
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            sx={{ borderRadius: '10px', fontWeight: 600 }}
          >
            Refresh
          </Button>
        }
      />

      {error && <ErrorAlert error={error} />}

      <Card 
        elevation={0}
        sx={{ 
          mb: { xs: 2, sm: 3 },
          border: '1px solid #E2E8F0',
          borderRadius: { xs: '12px', sm: '16px' },
        }}
      >
        <Tabs 
          value={view} 
          onChange={(_e, val) => setView(val)} 
          aria-label="test-tabs"
          variant={isXs ? 'fullWidth' : 'scrollable'}
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              textTransform: 'none',
              minHeight: { xs: 48, sm: 56 },
              px: { xs: 1, sm: 2 },
            },
            '& .MuiTab-iconWrapper': {
              fontSize: { xs: 18, sm: 20 },
            },
          }}
        >
          <Tab 
            label={isXs ? 'Schedule' : 'Schedule New Test'}
            value="schedule" 
            icon={<AddIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label={isXs ? `Tests (${scheduledTests.length})` : `Scheduled Tests (${scheduledTests.length})`}
            value="scheduled" 
            icon={<CalendarTodayIcon />} 
            iconPosition="start" 
          />
        </Tabs>
      </Card>

      {view === 'schedule' && (
        <Card 
          elevation={0}
          sx={{ 
            border: '1px solid #E2E8F0',
            borderRadius: { xs: '12px', sm: '16px' },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Schedule a New Test
            </Typography>
            <Alert 
              severity="info" 
              sx={{ 
                mb: { xs: 3, sm: 4 },
                borderRadius: { xs: '10px', sm: '12px' },
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                '& .MuiAlert-icon': {
                  fontSize: { xs: 20, sm: 24 },
                },
              }}
            >
              Select a class and schedule a test session to assess student progress
            </Alert>
            <Grid2 container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Select Class"
                  value={formData.finalClassId}
                  onChange={(e) => handleClassSelect(e.target.value)}
                  InputProps={{
                    sx: { borderRadius: '12px' },
                  }}
                >
                  {assignedClasses.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      <Box display="flex" flexDirection="column">
                        <Typography variant="body1">
                          {cls.studentName} - {cls.subject.join(', ')} (Grade {cls.grade})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tutor: {cls.tutor?.name}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  type="date"
                  label="Test Date"
                  value={formData.testDate}
                  onChange={(e) => handleInputChange('testDate', e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  InputProps={{
                    sx: { borderRadius: '12px' },
                  }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Test Time"
                  placeholder="e.g., 4:00 PM - 5:00 PM"
                  value={formData.testTime}
                  onChange={(e) => handleInputChange('testTime', e.target.value)}
                  fullWidth
                  InputProps={{
                    sx: { borderRadius: '12px' },
                  }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  label="Additional Notes"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special instructions or topics to focus on"
                  InputProps={{
                    sx: { borderRadius: '12px' },
                  }}
                />
              </Grid2>
            </Grid2>

            {selectedClass && (
              <Box
                sx={{
                  mt: { xs: 3, sm: 4 },
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: { xs: '10px', sm: '12px' },
                  background: alpha('#0F62FE', 0.04),
                  border: '1px solid',
                  borderColor: alpha('#0F62FE', 0.1),
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  fontWeight={700} 
                  gutterBottom 
                  sx={{ 
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                  }}
                >
                  Selected Class Details
                </Typography>
                <Grid2 container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={600}>
                        Student: {selectedClass.studentName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Grade {selectedClass.grade} · {selectedClass.board}
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <SchoolIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                      <Typography variant="body2" fontWeight={600}>
                        Subjects: {selectedClass.subject.join(', ')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Mode: {selectedClass.mode}
                    </Typography>
                  </Grid2>
                  {selectedClass.schedule?.timeSlot && (
                    <Grid2 size={{ xs: 12 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon fontSize="small" sx={{ color: 'info.main' }} />
                        <Typography variant="body2" fontWeight={600}>
                          Class Time: {selectedClass.schedule.timeSlot}
                        </Typography>
                      </Box>
                    </Grid2>
                  )}
                  <Grid2 size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                      Tutor Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedClass.tutor?.name} · {selectedClass.tutor?.email}
                      {selectedClass.tutor?.phone && ` · ${selectedClass.tutor.phone}`}
                    </Typography>
                  </Grid2>
                </Grid2>
              </Box>
            )}

            <Box 
              mt={{ xs: 3, sm: 4 }} 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 1.5, sm: 2 }}
            >
              <Button
                variant="contained"
                color="primary"
                size={isXs ? 'medium' : 'large'}
                startIcon={<AddIcon />}
                onClick={handleSubmit}
                disabled={loading || !formData.finalClassId || !formData.testDate || !formData.testTime}
                fullWidth={isXs}
                sx={{
                  borderRadius: { xs: '10px', sm: '12px' },
                  px: { xs: 3, sm: 4 },
                  fontWeight: 600,
                }}
              >
                {loading ? <LoadingSpinner size={24} /> : 'Schedule Test'}
              </Button>
              <Button
                variant="outlined"
                size={isXs ? 'medium' : 'large'}
                onClick={() => setFormData({ finalClassId: '', testDate: '', testTime: '', notes: '' })}
                fullWidth={isXs}
                sx={{
                  borderRadius: { xs: '10px', sm: '12px' },
                  px: { xs: 3, sm: 4 },
                  fontWeight: 600,
                }}
              >
                Clear Form
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {view === 'scheduled' && (
        <Box>
          {loading && (
            <Box display="flex" justifyContent="center" py={8}>
              <LoadingSpinner size={48} message="Loading scheduled tests..." />
            </Box>
          )}
          
          {!loading && scheduledTests.length === 0 && (
            <EmptyState
              icon={<CalendarTodayIcon />}
              title="No Scheduled Tests"
              description="You haven't scheduled any tests yet. Switch to the 'Schedule New Test' tab to create one."
              action={{
                label: 'Schedule Test',
                onClick: () => setView('schedule'),
              }}
            />
          )}
          
          {!loading && scheduledTests.length > 0 && (
            <>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                gutterBottom 
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                }}
              >
                Scheduled Tests ({scheduledTests.length})
              </Typography>
              {scheduledTests.map((test) => (
                <Card 
                  key={test.id} 
                  elevation={0}
                  className="hover-lift"
                  sx={{ 
                    mb: { xs: 2, sm: 3 },
                    border: '1px solid #E2E8F0',
                    borderRadius: { xs: '12px', sm: '16px' },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            background: alpha('#0F62FE', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CalendarTodayIcon sx={{ color: 'primary.main' }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {new Date(test.testDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {test.testTime}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={test.status} 
                        size="small" 
                        color={test.status === TEST_STATUS.SCHEDULED ? 'primary' : test.status === TEST_STATUS.COMPLETED ? 'warning' : 'default'}
                        sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '8px', height: 28 }}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid2 container spacing={2}>
                      <Grid2 size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Student
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {test.finalClass?.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Grade {test.finalClass?.grade}
                        </Typography>
                      </Grid2>
                      <Grid2 size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Subject
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {test.finalClass?.subject?.join(', ')}
                        </Typography>
                      </Grid2>
                      <Grid2 size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Tutor
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {test.tutor?.name}
                        </Typography>
                      </Grid2>
                      {test.notes && (
                        <Grid2 size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Notes
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {test.notes}
                          </Typography>
                        </Grid2>
                      )}
                    </Grid2>
                  </CardContent>
                  <CardActions sx={{ px: { xs: 2, sm: 2.5, md: 3 }, pb: { xs: 2, sm: 2.5, md: 3 }, gap: { xs: 1, sm: 1.5 }, flexWrap: 'wrap' }}>
                    {test.status === TEST_STATUS.SCHEDULED && (
                      <Button 
                        color="error" 
                        variant="outlined"
                        onClick={() => handleCancelTest(test.id)}
                        sx={{ borderRadius: '10px', fontWeight: 600 }}
                      >
                        Cancel Test
                      </Button>
                    )}
                    <Button 
                      variant="outlined"
                      onClick={() => navigate('/assigned-classes')}
                      sx={{ borderRadius: '10px', fontWeight: 600 }}
                    >
                      View Class
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </>
          )}
        </Box>
      )}

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default TestSchedulingPage;
