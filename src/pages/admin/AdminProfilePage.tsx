import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import EditIcon from '@mui/icons-material/Edit';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { IAdmin } from '../../types';
import MetricsCard from '../../components/dashboard/MetricsCard';
import DateRangePicker from '../../components/dashboard/DateRangePicker';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { subDays, format } from 'date-fns';
import ChangePasswordOtpModal from '../../components/common/ChangePasswordOtpModal';
import LockResetIcon from '@mui/icons-material/LockReset';

const AdminProfilePage: React.FC = () => {
  const user = useSelector(selectCurrentUser);

  const [adminProfile, setAdminProfile] = useState<IAdmin | null>(null);
  const [profileMissing, setProfileMissing] = useState<boolean>(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string }>(() => {
    const to = new Date();
    const from = subDays(to, 30);
    return {
      fromDate: format(from, 'yyyy-MM-dd'),
      toDate: format(to, 'yyyy-MM-dd'),
    };
  });
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>(
    { open: false, message: '', severity: 'info' }
  );
  const [activityLog, setActivityLog] = useState<any[]>([]);

  // Placeholder service structure for future integration
  const adminService = {
    async getMyProfile() {
      const err: any = new Error('Not Found');
      err.status = 404;
      throw err;
    },
    async getMyActivityLog(_page: number, _limit: number) {
      return { data: [] };
    },
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const _from = dateRange.fromDate;
        const _to = dateRange.toDate;
        void _from;
        void _to;
        const profileRes: any = await adminService.getMyProfile();
        if (!isMounted) return;
        setAdminProfile(profileRes?.data ?? null);
        setProfileMissing(false);
      } catch (e: any) {
        if (!isMounted) return;
        if (e?.status === 404) {
          setProfileMissing(true);
          setAdminProfile(null);
        } else {
          setError(e?.message || 'Failed to load admin profile');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [dateRange.fromDate, dateRange.toDate]);

  useEffect(() => {
    let isMounted = true;
    const loadActivity = async () => {
      if (tabValue !== 1) return;
      try {
        const res: any = await adminService.getMyActivityLog(1, 20);
        if (!isMounted) return;
        setActivityLog(res?.data ?? []);
      } catch (_e) {
        if (!isMounted) return;
        setActivityLog([]);
      }
    };
    loadActivity();
    return () => {
      isMounted = false;
    };
  }, [tabValue]);

  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <Container maxWidth="lg" sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>My Profile</Typography>

      {loading && !adminProfile ? (
        <LoadingSpinner />
      ) : null}

      {error ? <ErrorAlert error={error} /> : null}

      {profileMissing ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Admin profile not found</Typography>
            <Typography color="text.secondary">
              Your account is active but does not have an admin profile yet. Please contact a system administrator.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Once created, you will see your work metrics and system activity here.
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      {adminProfile ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                    {initials || <AccountCircleIcon fontSize="large" />}
                  </Avatar>
                  <Typography variant="h5">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                  <Chip label={user?.role} color="primary" />
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<LockResetIcon />} 
                    onClick={() => setChangePasswordOpen(true)}
                    sx={{ mt: 1 }}
                  >
                    Change Password
                  </Button>
                </Box>

                <Divider sx={{ width: '100%', my: 1 }} />

                <Box>
                  {adminProfile.department ? (
                    <Typography variant="body2">Department: {adminProfile.department}</Typography>
                  ) : null}
                  <Typography variant="body2">
                    Joined: {adminProfile.joiningDate ? new Date(adminProfile.joiningDate as any).toLocaleDateString() : '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Status:
                    <Chip
                      size="small"
                      label={adminProfile.isActive ? 'Active' : 'Inactive'}
                      color={adminProfile.isActive ? 'success' : 'default'}
                    />
                  </Typography>
                  {adminProfile.lastActivityAt ? (
                    <Typography variant="body2">
                      Last Active: {new Date(adminProfile.lastActivityAt as any).toLocaleString()}
                    </Typography>
                  ) : null}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <DateRangePicker
                    fromDate={dateRange.fromDate}
                    toDate={dateRange.toDate}
                    onDateChange={setDateRange}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                      title="Total Users Managed"
                      value={adminProfile.totalUsersManaged ?? 0}
                      icon={<PeopleIcon />}
                      color="primary.main"
                      subtitle="All roles combined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                      title="Managers Created"
                      value={adminProfile.managersCreated ?? 0}
                      icon={<SupervisorAccountIcon />}
                      color="info.main"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                      title="Coordinators Created"
                      value={adminProfile.coordinatorsCreated ?? 0}
                      icon={<AdminPanelSettingsIcon />}
                      color="secondary.main"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                      title="Tutors Created"
                      value={adminProfile.tutorsCreated ?? 0}
                      icon={<SchoolIcon />}
                      color="success.main"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                      title="Parents Created"
                      value={adminProfile.parentsCreated ?? 0}
                      icon={<FamilyRestroomIcon />}
                      color="warning.main"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                      title="Data Modifications"
                      value={adminProfile.dataModifications ?? 0}
                      icon={<EditIcon />}
                      color="info.main"
                      subtitle="Bulk updates performed"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                      title="System Actions"
                      value={adminProfile.systemActionsPerformed ?? 0}
                      icon={<DataUsageIcon />}
                      color="primary.main"
                      subtitle="Total operations"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                      title="Avg Actions/Day"
                      value={Number(adminProfile.averageActionsPerDay ?? 0).toFixed(1)}
                      icon={<TrendingUpIcon />}
                      color="success.main"
                      subtitle="Since joining"
                    />
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
                  <Tab label={tabValue === 1 ? `Activity Log (${activityLog.length})` : 'Activity'} />
                </Tabs>

                {tabValue === 0 ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Work Summary
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Your contribution to system administration and user management
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                              Users Created
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 1 }}>
                              {(adminProfile.managersCreated ?? 0) + (adminProfile.coordinatorsCreated ?? 0) + (adminProfile.tutorsCreated ?? 0) + (adminProfile.parentsCreated ?? 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Managers: {adminProfile.managersCreated ?? 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Coordinators: {adminProfile.coordinatorsCreated ?? 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Tutors: {adminProfile.tutorsCreated ?? 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Parents: {adminProfile.parentsCreated ?? 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                              Data Operations
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 1 }}>
                              {(adminProfile.dataModifications ?? 0) + (adminProfile.systemActionsPerformed ?? 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Modifications: {adminProfile.dataModifications ?? 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              System Actions: {adminProfile.systemActionsPerformed ?? 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                              Activity Metrics
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 1 }}>
                              Avg {Number(adminProfile.averageActionsPerDay ?? 0).toFixed(1)} / day
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Users Managed: {adminProfile.totalUsersManaged ?? 0}
                            </Typography>
                            {adminProfile.lastActivityAt ? (
                              <Typography variant="body2" color="text.secondary">
                                Last Active: {new Date(adminProfile.lastActivityAt as any).toLocaleString()}
                              </Typography>
                            ) : null}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                ) : null}

                {tabValue === 1 ? (
                  <Box sx={{ mt: 2 }}>
                    {activityLog.length === 0 ? (
                      <Typography color="text.secondary">No recent activity</Typography>
                    ) : (
                      <List>
                        {activityLog.map((item: any, idx: number) => (
                          <ListItem key={idx} divider>
                            <ListItemText
                              primary={item?.actionDescription || item?.actionType || 'Action'}
                              secondary={item?.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}

      <ChangePasswordOtpModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default AdminProfilePage;
