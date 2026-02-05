import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Grid, Card, CardContent, Avatar, Divider, Chip, Tabs, Tab, Button } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import ChangePasswordOtpModal from '../../components/common/ChangePasswordOtpModal';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClassIcon from '@mui/icons-material/Class';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { ICoordinator, ICoordinatorProfileMetrics } from '../../types';
import { getCoordinatorByUserId, getProfileMetrics } from '../../services/coordinatorService';
import * as coordinatorService from '../../services/coordinatorService';
import MetricsCard from '../../components/dashboard/MetricsCard';
import DateRangePicker from '../../components/dashboard/DateRangePicker';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { subDays, format } from 'date-fns';

const CoordinatorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector(selectCurrentUser);
  const [coordinatorProfile, setCoordinatorProfile] = useState<ICoordinator | null>(null);
  const [profileMetrics, setProfileMetrics] = useState<ICoordinatorProfileMetrics | null>(null);
  const [profileMissing, setProfileMissing] = useState<boolean>(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string}>({
    fromDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    toDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let profile: ICoordinator | null = null;
        let userIdForMetrics: string | undefined = undefined;

        if (id) {
          const profileRes = await coordinatorService.getCoordinatorById(id);
          profile = profileRes.data as unknown as ICoordinator;
          userIdForMetrics = profile.user?.toString() || (profile as any).user?._id;
        } else if (user?.id) {
          const profileRes = await getCoordinatorByUserId(user.id);
          profile = profileRes.data as unknown as ICoordinator;
          userIdForMetrics = user.id;
        }

        if (profile) {
          setCoordinatorProfile(profile);
          setProfileMissing(false);
          // Only fetch metrics if we have a userId to fetch for
          if (userIdForMetrics) {
             const metricsRes = await getProfileMetrics(dateRange.fromDate, dateRange.toDate, userIdForMetrics);
             setProfileMetrics(metricsRes.data as ICoordinatorProfileMetrics);
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setProfileMissing(true);
          setCoordinatorProfile(null);
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.id, dateRange.fromDate, dateRange.toDate]);

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <Container maxWidth="lg" sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>{id ? 'Coordinator Profile' : 'My Profile'}</Typography>

      {loading && !coordinatorProfile && <LoadingSpinner />}
      {error && <ErrorAlert error={error} />}

      {profileMissing && (
        <Card>
          <CardContent>
            <Typography variant="h6">Coordinator profile not found</Typography>
            <Typography color="text.secondary">Your account is active but does not have a coordinator profile yet. Please ask an administrator to create your coordinator profile.</Typography>
            <Typography variant="body2" color="text.secondary">Once created, you will see your performance metrics and activity here.</Typography>
          </CardContent>
        </Card>
      )}

      {coordinatorProfile && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                    {initials || <AccountCircleIcon fontSize="large" />}
                  </Avatar>
                  <Typography variant="h5">{coordinatorProfile.user?.name || user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{coordinatorProfile.user?.email || user?.email}</Typography>
                  <Chip label={coordinatorProfile.user?.role || user?.role} color="primary" />
                  {!id && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setChangePasswordOpen(true)}
                      sx={{ mt: 1 }}
                      startIcon={<LockResetIcon />}
                    >
                      Change Password
                    </Button>
                  )}
                  <Divider sx={{ width: '100%', my: 2 }} />
                  <Typography variant="body2">Joined: {new Date(coordinatorProfile.joiningDate).toLocaleDateString()}</Typography>
                  <Typography variant="body2">Max Capacity: {coordinatorProfile.maxClassCapacity}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">Status:</Typography>
                    <Chip size="small" label={coordinatorProfile.isActive ? 'Active' : 'Inactive'} color={coordinatorProfile.isActive ? 'success' : 'default'} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <DateRangePicker fromDate={dateRange.fromDate} toDate={dateRange.toDate} onDateChange={setDateRange} />
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Total Classes Handled" value={profileMetrics?.totalClassesHandled ?? '-'} icon={<ClassIcon />} color="primary.main" loading={loading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Active Classes" value={profileMetrics?.activeClassesCount ?? '-'} icon={<ClassIcon />} color="success.main" loading={loading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Completed Classes" value={profileMetrics?.completedClassesCount ?? '-'} subtitle="In selected period" icon={<CheckCircleIcon />} color="info.main" loading={loading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Paused Classes" value={profileMetrics?.pausedClassesCount ?? '-'} subtitle="In selected period" icon={<ClassIcon />} color="warning.main" loading={loading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Attendance Approval Rate" value={profileMetrics?.attendanceApprovalRate !== undefined ? `${profileMetrics.attendanceApprovalRate}%` : '-'} icon={<CheckCircleIcon />} color="success.main" loading={loading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Performance Score" value={profileMetrics?.performanceScore !== undefined ? `${profileMetrics.performanceScore}/100` : '-'} icon={<TrendingUpIcon />} color="secondary.main" loading={loading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Available Capacity" value={profileMetrics?.availableCapacity ?? '-'} subtitle={`Max: ${profileMetrics?.maxClassCapacity ?? '-'}`} icon={<WorkIcon />} color="info.main" loading={loading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Pending Approvals" value={profileMetrics?.pendingApprovalsCount ?? '-'} icon={<AssignmentIcon />} color="warning.main" loading={loading} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                  <Tab label="Overview" />
                  <Tab label="Activity" />
                </Tabs>
                {tabValue === 0 && (
                  <Box mt={2}>
                    <Typography variant="h6" gutterBottom>
                      Performance Overview
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Your contribution to managing classes and coordinating tutors
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Card>
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1}>
                              <TaskAltIcon color="success" />
                              <Typography variant="subtitle1">Today's Tasks</Typography>
                            </Box>
                            <Typography variant="h5" mt={1}>{profileMetrics?.todaysTasksCount ?? 0}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1">Capacity Utilization</Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                              {(profileMetrics?.activeClassesCount ?? 0)} / {(profileMetrics?.maxClassCapacity ?? 0)} ({Math.round(((profileMetrics?.activeClassesCount ?? 0) / ((profileMetrics?.maxClassCapacity ?? 1))) * 100)}%)
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {tabValue === 1 && (
                  <Box mt={2}>
                    <Typography color="text.secondary">Activity log coming soon</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <ChangePasswordOtpModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
      
      <SnackbarNotification open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Container>
  );
};

export default CoordinatorProfilePage;
