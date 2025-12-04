import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Avatar, Divider, Chip, List, ListItem, ListItemText, Tabs, Tab } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { IManager, IManagerMetrics } from '../../types';
import managerService from '../../services/managerService';
import MetricsCard from '../../components/dashboard/MetricsCard';
import DateRangePicker from '../../components/dashboard/DateRangePicker';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { subDays, format } from 'date-fns';

const ManagerProfilePage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [managerProfile, setManagerProfile] = useState<IManager | null>(null);
  const [managerMetrics, setManagerMetrics] = useState<IManagerMetrics | null>(null);
  const [profileMissing, setProfileMissing] = useState<boolean>(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string }>({ fromDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'), toDate: format(new Date(), 'yyyy-MM-dd') });
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch profile first
        let p: any = null;
        let profileExists = false;
        try {
          p = await managerService.getMyProfile();
          setManagerProfile(p.data);
          setProfileMissing(false);
          profileExists = true;
        } catch (e: any) {
          const status = e?.response?.status;
          if (status === 404) {
            setProfileMissing(true);
            setManagerProfile(null);
            profileExists = false;
          } else {
            throw e;
          }
        }

        // Fetch metrics only if profile exists
        if (profileExists) {
          try {
            const m = await managerService.getMyMetrics(dateRange.fromDate, dateRange.toDate);
            setManagerMetrics(m.data);
          } catch (e: any) {
            const status = e?.response?.status;
            if (status !== 404) {
              throw e;
            }
          }
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateRange.fromDate, dateRange.toDate]);

  useEffect(() => {
    const loadActivity = async () => {
      if (tabValue !== 1) return;
      try {
        const res = await managerService.getMyActivityLog(1, 20);
        setActivityLog(res.data);
      } catch (e) {}
    };
    loadActivity();
  }, [tabValue]);

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={{ xs: 3, sm: 4 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 2 }}
        sx={{ px: { xs: 1.5, sm: 3 } }}
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
            My Profile
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            View your manager profile, performance metrics, and recent activity.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 1.5, sm: 3 }, pb: 3 }}>
        {loading && !managerProfile && <LoadingSpinner />}
        {error && <ErrorAlert error={error} />}
        {profileMissing && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Manager profile not found</Typography>
              <Typography color="text.secondary" paragraph>
                Your account is active but does not have a manager profile yet. Please ask an administrator to create your manager profile.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Once created, you will see your performance metrics and activity here.
              </Typography>
            </CardContent>
          </Card>
        )}

        {managerProfile && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                  color: 'common.white',
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 96,
                        height: 96,
                        bgcolor: 'primary.main',
                        fontSize: 32,
                      }}
                    >
                      {initials || <AccountCircleIcon fontSize="large" />}
                    </Avatar>
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight={700}>{user?.name}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>{user?.email}</Typography>
                    </Box>
                    <Chip label={user?.role} color="primary" sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }} />
                    <Divider sx={{ width: '100%', my: 1.5, borderColor: 'rgba(148, 163, 184, 0.6)' }} />
                    <Box width="100%" display="flex" flexDirection="column" gap={1}>
                      {managerProfile.department && (
                        <Typography variant="body2">Department: {managerProfile.department}</Typography>
                      )}
                      <Typography variant="body2">
                        Joined: {new Date(managerProfile.joiningDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        Status:{' '}
                        <Chip
                          size="small"
                          label={managerProfile.isActive ? 'Active' : 'Inactive'}
                          color={managerProfile.isActive ? 'success' : 'default'}
                        />
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box mb={2}>
                    <DateRangePicker fromDate={dateRange.fromDate} toDate={dateRange.toDate} onDateChange={setDateRange} />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricsCard title="Class Leads Created" value={managerMetrics?.classLeadsCreated ?? '-'} icon={<AssignmentIcon />} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricsCard title="Demos Scheduled" value={managerMetrics?.demosScheduled ?? '-'} icon={<AssignmentIcon />} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricsCard title="Classes Converted" value={managerMetrics?.classesConverted ?? '-'} icon={<ClassIcon />} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricsCard title="Revenue Generated" value={`₹${Number(managerMetrics?.revenueGenerated || 0).toLocaleString()}`} icon={<PaymentIcon />} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricsCard title="Tutors Verified" value={managerMetrics?.tutorsVerified ?? '-'} icon={<PeopleIcon />} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricsCard title="Conversion Rate" value={`${managerMetrics?.conversionRate ?? 0}%`} icon={<TrendingUpIcon />} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricsCard title="Avg Revenue/Class" value={`₹${Number(managerMetrics?.averageRevenuePerClass || 0).toLocaleString()}`} icon={<PaymentIcon />} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricsCard title="Avg Demos/Lead" value={managerMetrics?.averageDemosPerLead ?? '-'} icon={<AssignmentIcon />} />
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
                    <Tab label={`Activity Log (${activityLog.length})`} />
                  </Tabs>
                  {tabValue === 0 ? (
                    <Box mt={2}>
                      <Typography variant="body1" color="text.secondary">Your contribution to overall business metrics</Typography>
                    </Box>
                  ) : (
                    <Box mt={2}>
                      {activityLog.length === 0 ? (
                        <Typography color="text.secondary">No recent activity</Typography>
                      ) : (
                        <List>
                          {activityLog.map((item: any, idx: number) => (
                            <ListItem key={idx} divider>
                              <ListItemText primary={item.actionDescription || item.actionType} secondary={new Date(item.createdAt).toLocaleString()} />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      <SnackbarNotification open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Container>
  );
};

export default ManagerProfilePage;
