
import React, { useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Button, alpha, Grow, Paper, useTheme, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaymentIcon from '@mui/icons-material/Payment';

import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import useCoordinator from '../../hooks/useCoordinator';
import MetricsCard from '../../components/dashboard/MetricsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';

const CoordinatorDashboardPage: React.FC = () => {
  const theme = useTheme();
  const user = useSelector(selectCurrentUser);
  const { dashboardStats, todaysTasks, loading, error, refetch } = useCoordinator();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  return (
    <Container maxWidth="xl" sx={{ pb: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)', // Blue/Indigo
          color: 'white',
          pt: { xs: 4, md: 5 },
          pb: { xs: 6, md: 8 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mt: 3,
          mb: -4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Coordinator Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Welcome back, {user?.name || 'Coordinator'}. Here is your daily overview.
                </Typography>
            </Box>
            <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={refetch}
                sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    backdropFilter: 'blur(10px)', 
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } 
                }}
            >
                Refresh Data
            </Button>
        </Box>
      </Box>

      {error && <Box mt={6}><ErrorAlert error={error} /></Box>}

      {loading && !dashboardStats && (
        <Box display="flex" justifyContent="center" py={8} mt={4}>
          <LoadingSpinner size={48} message="Loading dashboard..." />
        </Box>
      )}

      {dashboardStats && (
        <Box mt={6}>
            {/* KPI Section - Overlapping Hero */}
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'none' }}>Overview</Typography> {/* Hidden visually but useful for screen readers/structure, actually prefer relying on visual grouping */}
            
            <Grid container spacing={3}>
               <Grid item xs={12} sm={6} md={4}>
                   <MetricsCard
                      title="Active Classes"
                      value={dashboardStats.activeClassesCount}
                      icon={<ClassIcon />}
                      gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                      loading={loading}
                    />
               </Grid>
               <Grid item xs={12} sm={6} md={4}>
                   <MetricsCard
                      title="Classes Handled"
                      value={dashboardStats.totalClassesHandled}
                      icon={<DashboardIcon />}
                      gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                      loading={loading}
                    />
               </Grid>
               <Grid item xs={12} sm={6} md={4}>
                   <MetricsCard
                      title="Performance Score"
                      value={dashboardStats.performanceScore}
                      icon={<TrendingUpIcon />}
                      gradient="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
                      loading={loading}
                    />
               </Grid>
            </Grid>

            {/* Detailed Stats Row 2 */}
            <Grid container spacing={3} mt={0.5}>
                <Grid item xs={12} sm={6} md={4}>
                   <MetricsCard
                      title="Pending Approvals"
                      value={dashboardStats.pendingAttendanceApprovals}
                      icon={<CheckCircleIcon />}
                      color="warning.main"
                      loading={loading}
                    />
               </Grid>
               <Grid item xs={12} sm={6} md={4}>
                   <MetricsCard
                      title="Today's Tasks"
                      value={dashboardStats.todaysTasksCount}
                      icon={<AssignmentIcon />}
                      color="error.main"
                      loading={loading}
                    />
               </Grid>
               <Grid item xs={12} sm={6} md={4}>
                   <MetricsCard
                      title="Total Assigned"
                      value={dashboardStats.totalClassesAssigned}
                      icon={<ClassIcon />}
                      color="info.main"
                      loading={loading}
                    />
               </Grid>
            </Grid>
            
            {/* Today's Tasks Summary Section */}
            <Box mt={5}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <AssignmentIcon color="primary" />
                    <Typography variant="h5" fontWeight={700}>Today's Priority Tasks</Typography>
                </Box>
                
                <Grid container spacing={3}>
                    {/* Pending Attendance */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: '100%',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.1),
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 2, borderColor: theme.palette.primary.main }
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                    <ScheduleIcon />
                                </Avatar>
                                <Typography variant="h4" fontWeight={800} color="primary.main">
                                    {todaysTasks?.counts?.pendingAttendance ?? 0}
                                </Typography>
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700}>Pending Attendance</Typography>
                            <Typography variant="body2" color="text.secondary">Sessions awaiting review</Typography>
                        </Paper>
                    </Grid>

                    {/* Payment Reminders */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: '100%',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.success.main, 0.1),
                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.02)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 2, borderColor: theme.palette.success.main }
                            }}
                        >
                             <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                    <PaymentIcon />
                                </Avatar>
                                <Typography variant="h4" fontWeight={800} color="success.main">
                                    {todaysTasks?.counts?.paymentReminders ?? 0}
                                </Typography>
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700}>Payment Reminders</Typography>
                            <Typography variant="body2" color="text.secondary">Due for follow-up</Typography>
                        </Paper>
                    </Grid>

                    {/* Tests to Schedule */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: '100%',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.warning.main, 0.1),
                                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.02)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 2, borderColor: theme.palette.warning.main }
                            }}
                        >
                             <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                                    <AssignmentIcon />
                                </Avatar>
                                <Typography variant="h4" fontWeight={800} color="warning.main">
                                    {todaysTasks?.counts?.testsToSchedule ?? 0}
                                </Typography>
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700}>Tests to Schedule</Typography>
                            <Typography variant="body2" color="text.secondary">Upcoming assessments</Typography>
                        </Paper>
                    </Grid>

                    {/* Parent Complaints */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: '100%',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.error.main, 0.1),
                                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.02)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 2, borderColor: theme.palette.error.main }
                            }}
                        >
                             <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
                                    <WarningAmberIcon />
                                </Avatar>
                                <Typography variant="h4" fontWeight={800} color="error.main">
                                    {todaysTasks?.counts?.parentComplaints ?? 0}
                                </Typography>
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700}>Parent Complaints</Typography>
                            <Typography variant="body2" color="text.secondary">Requires attention</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
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

export default CoordinatorDashboardPage;