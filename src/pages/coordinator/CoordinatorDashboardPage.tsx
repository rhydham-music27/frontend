import React, { useState } from 'react';
import { Container, Box, Typography, Grid2, Card, CardContent, Button, alpha } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import useCoordinator from '../../hooks/useCoordinator';
import MetricsCard from '../../components/dashboard/MetricsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';

const CoordinatorDashboardPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const { dashboardStats, todaysTasks, loading, error, refetch } = useCoordinator();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

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
            Coordinator Dashboard
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            Welcome back, {user?.name || 'Coordinator'}! Manage your classes and tasks.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={refetch}
          startIcon={<RefreshIcon />}
          sx={{
            py: { xs: 0.75, sm: 1 },
            px: { xs: 1.5, sm: 2 },
            borderRadius: '10px',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Refresh
        </Button>
      </Box>

      {loading && !dashboardStats && (
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner size={48} message="Loading dashboard..." />
        </Box>
      )}
      
      {error && <ErrorAlert error={error} />}

      {dashboardStats && (
        <>
          <Box mb={{ xs: 3, sm: 4 }}>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              mb={{ xs: 2, sm: 2.5, md: 3 }}
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Overview
            </Typography>
            <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <MetricsCard 
                  title="Total Classes Assigned" 
                  value={dashboardStats.totalClassesAssigned} 
                  icon={<ClassIcon />} 
                  color="primary.main" 
                  loading={loading} 
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <MetricsCard 
                  title="Active Classes" 
                  value={dashboardStats.activeClassesCount} 
                  icon={<ClassIcon />} 
                  color="success.main" 
                  loading={loading} 
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <MetricsCard 
                  title="Total Classes Handled" 
                  value={dashboardStats.totalClassesHandled} 
                  icon={<DashboardIcon />} 
                  color="info.main" 
                  loading={loading} 
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <MetricsCard 
                  title="Pending Attendance Approvals" 
                  subtitle="Requires your approval" 
                  value={dashboardStats.pendingAttendanceApprovals} 
                  icon={<CheckCircleIcon />} 
                  color="warning.main" 
                  loading={loading} 
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <MetricsCard 
                  title="Today's Tasks" 
                  subtitle="Tasks pending today" 
                  value={dashboardStats.todaysTasksCount} 
                  icon={<AssignmentIcon />} 
                  color="error.main" 
                  loading={loading} 
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <MetricsCard 
                  title="Performance Score" 
                  value={dashboardStats.performanceScore} 
                  icon={<TrendingUpIcon />} 
                  color="secondary.main" 
                  loading={loading} 
                />
              </Grid2>
            </Grid2>
          </Box>

          <Box>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              mb={{ xs: 2, sm: 2.5, md: 3 }}
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Today's Tasks Summary
            </Typography>
            <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Card 
                  elevation={0}
                  className="hover-lift"
                  sx={{ 
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${alpha('#0F62FE', 0.05)} 0%, ${alpha('#4589FF', 0.05)} 100%)`,
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Typography 
                      variant="overline" 
                      color="text.secondary" 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    >
                      Pending Attendance
                    </Typography>
                    <Typography 
                      variant="h3" 
                      fontWeight={700} 
                      color="primary.main" 
                      mt={{ xs: 0.5, sm: 1 }}
                      sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}
                    >
                      {todaysTasks?.counts?.pendingAttendance ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Card 
                  elevation={0}
                  className="hover-lift"
                  sx={{ 
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${alpha('#24A148', 0.05)} 0%, ${alpha('#42BE65', 0.05)} 100%)`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Payment Reminders
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="success.main" mt={1}>
                      {todaysTasks?.counts?.paymentReminders ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Card 
                  elevation={0}
                  className="hover-lift"
                  sx={{ 
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${alpha('#FF832B', 0.05)} 0%, ${alpha('#FFA66A', 0.05)} 100%)`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Tests to Schedule
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="warning.main" mt={1}>
                      {todaysTasks?.counts?.testsToSchedule ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <Card 
                  elevation={0}
                  className="hover-lift"
                  sx={{ 
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${alpha('#DA1E28', 0.05)} 0%, ${alpha('#FF4D5E', 0.05)} 100%)`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Parent Complaints
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="error.main" mt={1}>
                      {todaysTasks?.counts?.parentComplaints ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
            </Grid2>
          </Box>
        </>
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

export default CoordinatorDashboardPage;