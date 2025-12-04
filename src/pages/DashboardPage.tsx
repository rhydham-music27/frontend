import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent } from '@mui/material';
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

      {/* KPI row similar to TutorDashboardKpiRow for consistent visual style */}
      <Box mb={{ xs: 3, sm: 4 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: 'common.white',
                borderRadius: 3,
                boxShadow: 4,
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      display: 'inline-flex',
                    }}
                  >
                    <DashboardIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    {overallStats?.classLeads.total ?? '-'}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Class Leads
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #16A34A, #15803D)',
                color: 'common.white',
                borderRadius: 3,
                boxShadow: 4,
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      display: 'inline-flex',
                    }}
                  >
                    <PaymentIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    ₹{Number(overallStats?.payments.feesCollected || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Fees Collected
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                color: 'common.white',
                borderRadius: 3,
                boxShadow: 4,
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      display: 'inline-flex',
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    {overallStats?.tutors.verified ?? '-'}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Verified Tutors
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: 'common.white',
                borderRadius: 3,
                boxShadow: 4,
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      display: 'inline-flex',
                    }}
                  >
                    <PaymentIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    ₹{Number(overallStats?.payments.tutorPayout || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Tutor Payout
                </Typography>
              </CardContent>
            </Card>
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
