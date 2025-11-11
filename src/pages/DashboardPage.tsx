import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { subDays, format } from 'date-fns';

import useDashboard from '../hooks/useDashboard';
import MetricsCard from '../components/dashboard/MetricsCard';
import DateRangePicker from '../components/dashboard/DateRangePicker';
import ExportButtons from '../components/dashboard/ExportButtons';
import RefreshButton from '../components/dashboard/RefreshButton';
import DateWiseLeadsChart from '../components/dashboard/DateWiseLeadsChart';
import ConversionFunnelChart from '../components/dashboard/ConversionFunnelChart';
import CumulativeGrowthChart from '../components/dashboard/CumulativeGrowthChart';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import RevenueChart from '../components/dashboard/RevenueChart';
import TutorProgressTable from '../components/dashboard/TutorProgressTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
    classProgress,
    cumulativeGrowth,
    tutorReport,
    pendingApprovals,
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

  return (
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 0 } }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 2 }}
        mb={{ xs: 3, sm: 4 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography 
            sx={{ 
              typography: { xs: 'h5', sm: 'h4' },
              fontWeight: 700,
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            Manager Dashboard
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            Welcome back, {user?.name || 'Manager'}! Here's your overview.
          </Typography>
        </Box>
        <Box 
          display="flex" 
          alignItems="center" 
          gap={{ xs: 1, sm: 1.5, md: 2 }} 
          flexWrap="wrap"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <RefreshButton onRefresh={handleManualRefresh} autoRefresh={autoRefresh} onAutoRefreshToggle={handleAutoRefreshToggle} loading={loading} lastRefreshed={lastRefreshed} />
          <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
        </Box>
      </Box>

      {error && <ErrorAlert error={error} />}

      <Box mb={{ xs: 2, sm: 3 }}>
        <DateRangePicker fromDate={dateRange.fromDate} toDate={dateRange.toDate} onDateChange={handleDateChange} presets />
      </Box>

      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Key Metrics
        </Typography>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          <MetricsCard title="Total Class Leads" value={overallStats?.classLeads.total ?? '-'} subtitle={`${overallStats?.classLeads.new ?? 0} new, ${overallStats?.classLeads.converted ?? 0} converted`} icon={<DashboardIcon />} color="primary.main" loading={loading && !overallStats} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          <MetricsCard title="Active Classes" value={overallStats?.finalClasses.active ?? '-'} subtitle={`${overallStats?.finalClasses.completed ?? 0} completed`} icon={<ClassIcon />} color="success.main" loading={loading && !overallStats} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          <MetricsCard title="Verified Tutors" value={overallStats?.tutors.verified ?? '-'} subtitle={`${overallStats?.tutors.total ?? 0} total tutors`} icon={<PeopleIcon />} color="info.main" loading={loading && !overallStats} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          <MetricsCard title="Total Revenue" value={`₹${Number(overallStats?.payments.totalRevenue || 0).toLocaleString()}`} subtitle={`₹${Number(overallStats?.payments.paidRevenue || 0).toLocaleString()} paid`} icon={<PaymentIcon />} color="secondary.main" loading={loading && !overallStats} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          <MetricsCard title="Conversion Rate" value={`${overallStats?.conversionRate ?? 0}%`} icon={<TrendingUpIcon />} color="primary.main" loading={loading && !overallStats} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
          <MetricsCard title="Pending Approvals" value={overallStats?.pendingApprovals ?? pendingApprovals?.totalPending ?? '-'} subtitle="Requires attention" icon={<PendingActionsIcon />} color="warning.main" loading={loading && !overallStats} />
        </Grid>
      </Grid>
      </Box>

      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Analytics & Charts
        </Typography>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12} md={8} lg={8} sx={{ minWidth: 0 }}>
          <DateWiseLeadsChart data={dateWiseLeads} loading={loading} />
        </Grid>
        <Grid item xs={12} md={4} lg={4} sx={{ minWidth: 0 }}>
          <StatusDistributionChart data={statusDistribution} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6} lg={6} sx={{ minWidth: 0 }}>
          <ConversionFunnelChart data={conversionFunnel} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6} lg={6} sx={{ minWidth: 0 }}>
          <RevenueChart data={revenueAnalytics} loading={loading} />
        </Grid>
        <Grid item xs={12} sx={{ minWidth: 0 }}>
          <CumulativeGrowthChart data={cumulativeGrowth} loading={loading} />
        </Grid>
      </Grid>
      </Box>

      <Box>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Tutor Performance
        </Typography>
        <Box sx={{ overflowX: 'auto', mx: { xs: -1.5, sm: 0 } }}>
        <TutorProgressTable
          tutors={tutorReport.tutors}
          total={tutorReport.total}
          page={tutorReportPage}
          limit={tutorReport.limit}
          loading={loading}
          onPageChange={handleTutorReportPageChange}
          onSortChange={handleTutorReportSortChange}
        />
        </Box>
      </Box>

      <SnackbarNotification open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Container>
  );
};

export default DashboardPage;
