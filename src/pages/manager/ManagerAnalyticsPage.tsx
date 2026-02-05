
import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Paper, useTheme, alpha, Avatar } from '@mui/material';
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
import TimelineIcon from '@mui/icons-material/Timeline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const ManagerAnalyticsPage: React.FC = () => {
  const theme = useTheme();
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
          console.error(e);
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
            // Sort history by date ascending for charts
            const sorted = (h.data || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setHistory(sorted);
          }
        } catch (e: any) {
          console.error('Failed to load manager performance history', e);
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
        <Typography variant="h5" color="error">Access Denied</Typography>
      </Container>
    );
  }

  // Format chart data
  const chartData = history.map(h => ({
      date: format(new Date(h.date), 'MMM dd'),
      Leads: h.leadsCreated,
      Conversions: h.classesConverted,
      Revenue: h.revenue
  }));

  return (
    <Container maxWidth="xl" sx={{ pb: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', // Violet
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
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap-reverse', gap: 2 }}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Performance Analytics
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                  Deep dive into your operational efficiency and revenue growth.
                </Typography>
            </Box>
            {/* Date Range Picker Floating in Hero */}
            <Paper sx={{ p: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <DateRangePicker fromDate={dateRange.fromDate} toDate={dateRange.toDate} onDateChange={setDateRange} />
            </Paper>
        </Box>
      </Box>

      {error && <Box mt={6}><ErrorAlert error={error} onClose={() => setError(null)} /></Box>}

      <Box mt={6}>
          {loading && !metrics ? (
             <Box py={10} display="flex" justifyContent="center"><LoadingSpinner /></Box>
          ) : metrics && (
             <Grid container spacing={3}>
                 {/* KPI Cards */}
                 <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Leads Generated" value={metrics.classLeadsCreated ?? 0} icon={<AssignmentIcon />} gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" />
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Conversions" value={metrics.classesConverted ?? 0} icon={<ClassIcon />} gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)" />
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Total Revenue" value={`₹${Number(metrics.revenueGenerated || 0).toLocaleString()}`} icon={<PaymentIcon />} gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" />
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Conversion Rate" value={`${metrics.conversionRate ?? 0}%`} icon={<TrendingUpIcon />} gradient="linear-gradient(135deg, #EC4899 0%, #DB2777 100%)" />
                 </Grid>

                 {/* Charts Section */}
                 <Grid item xs={12} md={8}>
                     <Paper sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 400 }}>
                         <Box display="flex" alignItems="center" gap={1} mb={3}>
                             <TimelineIcon color="primary" />
                             <Typography variant="h6" fontWeight={700}>Growth Trends</Typography>
                         </Box>
                         <ResponsiveContainer width="100%" height={300}>
                             <AreaChart data={chartData}>
                                 <defs>
                                     <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                                         <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                     </linearGradient>
                                     <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                         <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                     </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                                 <Tooltip 
                                     contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                 />
                                 <Legend verticalAlign="top" height={36} />
                                 <Area type="monotone" dataKey="Leads" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                                 <Area type="monotone" dataKey="Conversions" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" />
                             </AreaChart>
                         </ResponsiveContainer>
                     </Paper>
                 </Grid>

                 <Grid item xs={12} md={4}>
                     <Paper sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 400 }}>
                         <Typography variant="h6" fontWeight={700} mb={3}>Efficiency Metrics</Typography>
                         <Stack spacing={3}>
                             <Box>
                                 <Typography variant="body2" color="text.secondary" gutterBottom>Avg Revenue per Class</Typography>
                                 <Typography variant="h4" fontWeight={700} color="text.primary">
                                     ₹{Number(metrics.averageRevenuePerClass || 0).toLocaleString()}
                                 </Typography>
                             </Box>
                             <Divider />
                             <Box>
                                 <Typography variant="body2" color="text.secondary" gutterBottom>Avg Demos Per Lead</Typography>
                                 <Typography variant="h4" fontWeight={700} color="text.primary">
                                     {metrics.averageDemosPerLead || 0}
                                 </Typography>
                             </Box>
                             <Divider />
                             <Box>
                                 <Typography variant="body2" color="text.secondary" gutterBottom>Tutors Verified</Typography>
                                 <Typography variant="h4" fontWeight={700} color="text.primary">
                                     {metrics.tutorsVerified || 0}
                                 </Typography>
                             </Box>
                         </Stack>
                     </Paper>
                 </Grid>

                 {/* Detailed History Table */}
                 <Grid item xs={12}>
                     <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
                         <Box p={2} bgcolor={alpha(theme.palette.primary.main, 0.04)} borderBottom="1px solid" borderColor="divider">
                             <Typography variant="subtitle1" fontWeight={700}>Detailed Performance Log</Typography>
                         </Box>
                         <Table>
                             <TableHead>
                                 <TableRow>
                                     <TableCell>Date</TableCell>
                                     <TableCell align="right">Leads</TableCell>
                                     <TableCell align="right">Converted</TableCell>
                                     <TableCell align="right">Revenue</TableCell>
                                     <TableCell align="right">Conversion Rate</TableCell>
                                 </TableRow>
                             </TableHead>
                             <TableBody>
                                 {history.length === 0 ? (
                                     <TableRow>
                                         <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                             No data available for the selected range.
                                         </TableCell>
                                     </TableRow>
                                 ) : (
                                     history.map((row) => (
                                         <TableRow key={row.date} hover>
                                             <TableCell sx={{ fontWeight: 500 }}>{format(new Date(row.date), 'MMM dd, yyyy')}</TableCell>
                                             <TableCell align="right">{row.leadsCreated}</TableCell>
                                             <TableCell align="right">{row.classesConverted}</TableCell>
                                             <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                                                 ₹{Number(row.revenue || 0).toLocaleString()}
                                             </TableCell>
                                             <TableCell align="right">
                                                 <Typography variant="body2" fontWeight={600} color={row.conversionRate && row.conversionRate > 20 ? 'success.main' : 'text.primary'}>
                                                     {row.conversionRate}%
                                                 </Typography>
                                             </TableCell>
                                         </TableRow>
                                     ))
                                 )}
                             </TableBody>
                         </Table>
                     </Paper>
                 </Grid>
             </Grid>
          )}
      </Box>
    </Container>
  );
};

export default ManagerAnalyticsPage;
