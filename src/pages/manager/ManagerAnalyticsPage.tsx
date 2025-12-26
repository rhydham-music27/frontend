import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useSelector } from 'react-redux';
import { subDays, format } from 'date-fns';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { IManager, IManagerMetrics, IManagerPerformanceHistory } from '../../types';
import managerService from '../../services/managerService';
import DateRangePicker from '../../components/dashboard/DateRangePicker';
import MetricsCard from '../../components/dashboard/MetricsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClassIcon from '@mui/icons-material/Class';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const ManagerAnalyticsPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [managerProfile, setManagerProfile] = useState<IManager | null>(null);
  const [metrics, setMetrics] = useState<IManagerMetrics | null>(null);
  const [history, setHistory] = useState<IManagerPerformanceHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string}>(
    {
      fromDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      toDate: format(new Date(), 'yyyy-MM-dd'),
    }
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ensure we have manager profile to know manager id
        let profile: IManager | null = managerProfile;
        if (!profile) {
          try {
            const res = await managerService.getMyProfile();
            profile = res.data;
            setManagerProfile(res.data);
          } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || 'Failed to load manager profile';
            setError(msg);
            return;
          }
        }

        // Load metrics for current manager
        try {
          const m = await managerService.getMyMetrics(dateRange.fromDate, dateRange.toDate);
          setMetrics(m.data);
        } catch (e: any) {
          const msg = e?.response?.data?.message || e?.message || 'Failed to load metrics';
          setError(msg);
        }

        // Load performance history for charts / table
        try {
          if (profile) {
            const h = await managerService.getManagerPerformanceHistory(
              profile.id,
              dateRange.fromDate || '',
              dateRange.toDate || '',
              'day'
            );
            setHistory(h.data || []);
          }
        } catch (e: any) {
          // History is optional; log but do not block page
          // eslint-disable-next-line no-console
          console.error('Failed to load manager performance history', e?.response?.data || e?.message || e);
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [dateRange.fromDate, dateRange.toDate]);

  if (!user || user.role !== 'MANAGER') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Analytics
        </Typography>
        <Typography color="text.secondary">
          Analytics is currently available only for manager accounts.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 1.5, sm: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} gutterBottom>
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your leads, conversions, revenue, and performance trends over time.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Box mb={2}>
          <ErrorAlert error={error} onClose={() => setError(null)} />
        </Box>
      )}

      <Box mb={3}>
        <DateRangePicker fromDate={dateRange.fromDate} toDate={dateRange.toDate} onDateChange={setDateRange} />
      </Box>

      {loading && !metrics && (
        <Box mt={4} display="flex" justifyContent="center">
          <LoadingSpinner />
        </Box>
      )}

      {metrics && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard title="Class Leads Created" value={metrics.classLeadsCreated ?? '-'} icon={<AssignmentIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard title="Demos Scheduled" value={metrics.demosScheduled ?? '-'} icon={<AssignmentIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard title="Classes Converted" value={metrics.classesConverted ?? '-'} icon={<ClassIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard title="Revenue Generated" value={`₹${Number(metrics.revenueGenerated || 0).toLocaleString()}`} icon={<PaymentIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard title="Tutors Verified" value={metrics.tutorsVerified ?? '-'} icon={<PeopleIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard title="Conversion Rate" value={`${metrics.conversionRate ?? 0}%`} icon={<TrendingUpIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard title="Avg Revenue/Class" value={`₹${Number(metrics.averageRevenuePerClass || 0).toLocaleString()}`} icon={<PaymentIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard title="Avg Demos/Lead" value={metrics.averageDemosPerLead ?? '-'} icon={<AssignmentIcon />} />
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Performance Over Time</Typography>
            <Typography variant="body2" color="text.secondary">
              Daily breakdown of your leads, conversions, and revenue.
            </Typography>
          </Box>
          {history.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No performance history available for the selected date range.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Leads Created</TableCell>
                  <TableCell align="right">Classes Converted</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Conversion Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{row.leadsCreated}</TableCell>
                    <TableCell align="right">{row.classesConverted}</TableCell>
                    <TableCell align="right">₹{Number(row.revenue || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">{row.conversionRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ManagerAnalyticsPage;
