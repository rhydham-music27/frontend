import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SchoolIcon from '@mui/icons-material/School';
import { subDays, format } from 'date-fns';

// Placeholder hook import; will be implemented in a later phase
import useAdmin from '../../hooks/useAdmin';

import MetricsCard from '../../components/dashboard/MetricsCard';
import DateRangePicker from '../../components/dashboard/DateRangePicker';
import ExportButtons from '../../components/dashboard/ExportButtons';
import RefreshButton from '../../components/dashboard/RefreshButton';
import CumulativeGrowthChart from '../../components/dashboard/CumulativeGrowthChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import UserGrowthChart from '../../components/dashboard/UserGrowthChart';
import RoleDistributionChart from '../../components/dashboard/RoleDistributionChart';
import FinancialSummaryChart from '../../components/dashboard/FinancialSummaryChart';
import SystemHealthCard from '../../components/dashboard/SystemHealthCard';
import RolePerformanceTable from '../../components/dashboard/RolePerformanceTable';
import { IAdminAnalytics } from '../../types';

const AdminDashboardPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);

  const defaultFrom = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const defaultTo = format(new Date(), 'yyyy-MM-dd');
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string }>({ fromDate: defaultFrom, toDate: defaultTo });
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>(
    { open: false, message: '', severity: 'success' }
  );

  const {
    analytics,
    loading,
    error,
    refetch,
    exportCSV,
    exportPDF,
  }: {
    analytics: IAdminAnalytics | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    exportCSV: (reportType: string) => Promise<void>;
    exportPDF: (reportType: string) => Promise<void>;
  } = useAdmin(dateRange, autoRefresh, 30000);

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

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive Report' },
    { value: 'users', label: 'User Analytics' },
    { value: 'financial', label: 'Financial Summary' },
    { value: 'performance', label: 'Role Performance' },
    { value: 'health', label: 'System Health' },
  ];

  const calcHealthScore = () => {
    const pa = analytics?.health.pendingApprovals.totalPending ?? analytics?.health.pendingApprovals.attendance?.total ?? 0;
    const op = analytics?.health.overduePayments ?? 0;
    const cr = analytics?.finance.collectionRate ?? 0;
    const inactive = Object.values(analytics?.health.inactiveUsersByRole || {}).reduce((s, v) => s + (v || 0), 0);

    let score = 0;
    // Pending approvals (lower is better)
    score += pa <= 5 ? 25 : pa <= 15 ? 15 : 5;
    // Overdue payments (lower is better)
    score += op <= 5 ? 25 : op <= 15 ? 15 : 5;
    // Collection rate (higher is better)
    score += cr >= 90 ? 25 : cr >= 75 ? 15 : 5;
    // Inactive users (lower is better)
    score += inactive <= 10 ? 25 : inactive <= 30 ? 15 : 5;

    return Math.min(100, Math.max(0, score));
  };

  const healthScore = analytics ? calcHealthScore() : 0;
  const healthColor = healthScore > 80 ? 'success.main' : healthScore > 60 ? 'warning.main' : 'error.main';

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
            Admin Dashboard
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            Welcome back, {user?.name || 'Admin'}! System-wide overview.
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
          <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} reportTypes={reportTypes as any} />
        </Box>
      </Box>

      {error && <ErrorAlert error={error} />}

      <Box mb={{ xs: 2, sm: 3 }}>
        <DateRangePicker fromDate={dateRange.fromDate} toDate={dateRange.toDate} onDateChange={handleDateChange} presets />
      </Box>

      {/* Key Metrics */}
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
            <MetricsCard
              title="Total Users"
              value={analytics?.users.totals.totalUsers?.toLocaleString() ?? '-'}
              subtitle={`${analytics?.users.totals.totalActiveUsers?.toLocaleString() ?? 0} active`}
              icon={<PeopleIcon />}
              color="primary.main"
              loading={loading && !analytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Active Managers"
              value={analytics?.managers.activeManagers?.toLocaleString() ?? '-'}
              subtitle={`${analytics?.managers.totals.totalLeads?.toLocaleString() ?? 0} leads created`}
              icon={<SupervisorAccountIcon />}
              color="info.main"
              loading={loading && !analytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Active Coordinators"
              value={analytics?.coordinators?.activeCoordinators?.toLocaleString() ?? '-'}
              subtitle={`${analytics?.coordinators?.totalClasses?.toLocaleString() ?? 0} classes handled`}
              icon={<AdminPanelSettingsIcon />}
              color="secondary.main"
              loading={loading && !analytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Verified Tutors"
              value={analytics?.tutors?.VERIFIED?.count?.toLocaleString() ?? '-'}
              subtitle={`${analytics?.tutors?.PENDING?.count?.toLocaleString() ?? 0} pending verification`}
              icon={<SchoolIcon />}
              color="success.main"
              loading={loading && !analytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Total Classes"
              value={analytics?.base.finalClasses.total?.toLocaleString() ?? '-'}
              subtitle={`${analytics?.base.finalClasses.active?.toLocaleString() ?? 0} active`}
              icon={<ClassIcon />}
              color="primary.main"
              loading={loading && !analytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Gross Revenue"
              value={`₹${Number(analytics?.finance.grossRevenue || 0).toLocaleString()}`}
              subtitle={`${(analytics?.finance.collectionRate ?? 0).toFixed(1)}% collected`}
              icon={<PaymentIcon />}
              color="success.main"
              loading={loading && !analytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Pending Approvals"
              value={analytics?.health.pendingApprovals.totalPending ?? analytics?.health.pendingApprovals.attendance?.total ?? '-'}
              subtitle="Requires attention"
              icon={<PendingActionsIcon />}
              color="warning.main"
              loading={loading && !analytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="System Health Score"
              value={analytics ? `${healthScore}` : '-'}
              subtitle="Overall system status"
              icon={<TrendingUpIcon />}
              color={healthColor}
              loading={loading && !analytics}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Analytics & Charts */}
      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Analytics & Insights
        </Typography>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <UserGrowthChart data={analytics?.users.growth} loading={loading} />
          </Grid>
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <RoleDistributionChart data={analytics?.users.byRole} loading={loading} />
          </Grid>
          <Grid item xs={12} sx={{ minWidth: 0 }}>
            <FinancialSummaryChart data={analytics?.finance} loading={loading} />
          </Grid>
          <Grid item xs={12} md={8} sx={{ minWidth: 0 }}>
            <CumulativeGrowthChart data={analytics?.classes.growth || []} loading={loading} title="Cumulative Class Growth" />
          </Grid>
          <Grid item xs={12} md={4} sx={{ minWidth: 0 }}>
            <SystemHealthCard data={analytics?.health} loading={loading} />
          </Grid>
        </Grid>
      </Box>

      {/* Role Performance */}
      <Box>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Role Performance Summary
        </Typography>
        <RolePerformanceTable managerData={analytics?.managers} coordinatorData={analytics?.coordinators} loading={loading} />
      </Box>

      {loading && !analytics && <LoadingSpinner message="Loading admin dashboard..." />}

      <SnackbarNotification open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Container>
  );
};

export default AdminDashboardPage;
