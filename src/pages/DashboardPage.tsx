
import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { subDays, format } from 'date-fns';

import useDashboard from '../hooks/useDashboard';
import DateRangePicker from '../components/dashboard/DateRangePicker';
import ExportButtons from '../components/dashboard/ExportButtons';
import RefreshButton from '../components/dashboard/RefreshButton';
import DateWiseLeadsChart from '../components/dashboard/DateWiseLeadsChart';
import ConversionFunnelChart from '../components/dashboard/ConversionFunnelChart';
import CumulativeGrowthChart from '../components/dashboard/CumulativeGrowthChart';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import RevenueChart from '../components/dashboard/RevenueChart';
import TutorProgressTable from '../components/dashboard/TutorProgressTable';
import TodaysTasks from '../components/dashboard/TodaysTasks';
import ErrorAlert from '../components/common/ErrorAlert';
import SnackbarNotification from '../components/common/SnackbarNotification';

const DashboardPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);

  const defaultFrom = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const defaultTo = format(new Date(), 'yyyy-MM-dd');
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string }>({ fromDate: defaultFrom, toDate: defaultTo });
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [tutorReportPage, setTutorReportPage] = useState<number>(1);
  const [tutorReportSort, setTutorReportSort] = useState<{ sortBy?: string; sortOrder?: 'asc' | 'desc' }>({});

  const {
    overallStats,
    dateWiseLeads,
    statusDistribution,
    conversionFunnel,
    cumulativeGrowth,
    tutorReport,
    revenueAnalytics,
    loading,
    error,
    refetch,
    fetchTutorReport,
    exportCSV,
    exportPDF,
  } = useDashboard(dateRange, autoRefresh, 30000);

  useEffect(() => {
    fetchTutorReport(tutorReportPage, 10, tutorReportSort.sortBy, tutorReportSort.sortOrder);
  }, [tutorReportPage, tutorReportSort.sortBy, tutorReportSort.sortOrder, dateRange.fromDate, dateRange.toDate]);

  const handleDateChange = (range: { fromDate?: string; toDate?: string }) => setDateRange(range);
  const handleAutoRefreshToggle = (enabled: boolean) => { setAutoRefresh(enabled); setLastRefreshed(new Date()); };
  const handleManualRefresh = async () => { await refetch(); setLastRefreshed(new Date()); };

  const handleExportCSV = async (reportType: string) => {
    await exportCSV(reportType);
    setSnackbar({ open: true, message: 'CSV export started', severity: 'success' });
  };

  const handleExportPDF = async (reportType: string) => {
    await exportPDF(reportType);
    setSnackbar({ open: true, message: 'PDF export started', severity: 'success' });
  };

  const handleTutorReportPageChange = (p: number) => setTutorReportPage(p);
  const handleTutorReportSortChange = (sortBy?: string, sortOrder?: 'asc' | 'desc') => setTutorReportSort({ sortBy, sortOrder });

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode, gradient: string) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          background: gradient,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px -10px rgba(0,0,0,0.3)'
          }
        }}
      >
        <Box sx={{
            position: 'absolute',
            top: -20, right: -20,
            width: 100, height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
          }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box 
              sx={{ 
                p: 1, 
                borderRadius: '12px', 
                bgcolor: 'rgba(255,255,255,0.2)', 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              {icon}
            </Box>
          </Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {value}
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ pb: 6 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
          color: 'white',
          pt: { xs: 4, md: 6 },
          pb: { xs: 8, md: 10 },
          px: { xs: 3, md: 5 },
          borderRadius: { xs: 0, md: 4 },
          mt: 3,
          mb: -6, // Negative margin to allow filter bar to overlap
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
         <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
                <Typography variant="h3" fontWeight={800} gutterBottom>
                    Manager Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    Welcome back, <strong>{user?.name || 'Manager'}</strong>! Here is your performance overview.
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <RefreshButton 
                    onRefresh={handleManualRefresh} 
                    autoRefresh={autoRefresh} 
                    onAutoRefreshToggle={handleAutoRefreshToggle} 
                    loading={loading} 
                    lastRefreshed={lastRefreshed} 
                />
                <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} /> 
            </Box>
         </Box>
      </Box>

      {error && (
        <Box mb={3} mt={8}><ErrorAlert error={error} /></Box>
      )}

      {/* Floating Filter Bar */}
      <Paper 
        elevation={0} 
        sx={{ 
            p: 2, 
            borderRadius: 3, 
            mb: 5, 
            position: 'relative', 
            zIndex: 3, 
            mx: { xs: 2, md: 4 },
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)'
        }}
      >
         <Box display="flex" alignItems="center" gap={1}>
             <TrendingUpIcon color="action" />
             <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                 Reporting Period:
             </Typography>
         </Box>
         <DateRangePicker fromDate={dateRange.fromDate} toDate={dateRange.toDate} onDateChange={handleDateChange} presets />
      </Paper>



      {/* Metric Cards */}
      <Box mb={5} sx={{ px: { xs: 1 } }}>
        <Grid container spacing={3}>
            {/* ... stats cards ... */}
            {renderStatCard(
                'Total Class Leads', 
                overallStats?.classLeads.total ?? '-', 
                <GroupAddIcon />, 
                'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)'
            )}
            {renderStatCard(
                'Fees Collected', 
                `₹${Number(overallStats?.payments.feesCollected || 0).toLocaleString()}`, 
                <AttachMoneyIcon />, 
                'linear-gradient(135deg, #059669 0%, #047857 100%)'
            )}
             {renderStatCard(
                'Verified Tutors', 
                overallStats?.tutors.verified ?? '-', 
                <PeopleIcon />, 
                'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)'
            )}
             {renderStatCard(
                'Tutor Payouts', 
                `₹${Number(overallStats?.payments.tutorPayout || 0).toLocaleString()}`, 
                <PaymentIcon />, 
                'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
            )}
        </Grid>
      </Box>

      {/* Today's Tasks Widget */}
      <Box mb={5}>
          <Grid container spacing={4}>
             <Grid item xs={12} lg={4}>
                 <TodaysTasks stats={overallStats} loading={loading} />
             </Grid>
             <Grid item xs={12} lg={8}>
                 <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                     <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <Box width={4} height={20} bgcolor="primary.main" borderRadius={1} />
                        <Typography variant="h6" fontWeight={700}>Lead Generation Growth</Typography>
                     </Box>
                     <DateWiseLeadsChart data={dateWiseLeads} loading={loading} />
                 </Paper>
             </Grid>
          </Grid>
      </Box>

      {/* Main Charts Grid */}
      <Box mb={6}>
        <Grid container spacing={4}>
            {/* Status Distribution */}
             <Grid item xs={12} lg={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                       <Box width={4} height={20} bgcolor="secondary.main" borderRadius={1} />
                       <Typography variant="h6" fontWeight={700}>Lead Status</Typography>
                    </Box>
                    <StatusDistributionChart data={statusDistribution} loading={loading} />
                </Paper>
            </Grid>
            
            {/* Financials & Funnel */}
             <Grid item xs={12} lg={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                       <Box width={4} height={20} bgcolor="success.main" borderRadius={1} />
                       <Typography variant="h6" fontWeight={700}>Revenue Trends</Typography>
                    </Box>
                    <RevenueChart data={revenueAnalytics} loading={loading} />
                </Paper>
            </Grid>
             <Grid item xs={12} lg={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                       <Box width={4} height={20} bgcolor="warning.main" borderRadius={1} />
                       <Typography variant="h6" fontWeight={700}>Conversion Funnel</Typography>
                    </Box>
                    <ConversionFunnelChart data={conversionFunnel} loading={loading} />
                </Paper>
            </Grid>

            {/* Cumulative Growth */}
            <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Cumulative Growth</Typography>
                    <CumulativeGrowthChart data={cumulativeGrowth} loading={loading} />
                </Paper>
            </Grid>
        </Grid>
      </Box>

      {/* Tutor Performance Table */}
      <Box>
         <Typography variant="h5" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
            Tutor Performance
         </Typography>
         <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <TutorProgressTable
                tutors={tutorReport.tutors}
                total={tutorReport.total}
                page={tutorReportPage}
                limit={tutorReport.limit}
                loading={loading}
                onPageChange={handleTutorReportPageChange}
                onSortChange={handleTutorReportSortChange}
            />
         </Paper>
      </Box>

      <SnackbarNotification open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Container>
  );
};

export default DashboardPage;
