import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Grid, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { subDays, format } from 'date-fns';

// Placeholder hook import; will be implemented in a later phase
import useAdmin from '../../hooks/useAdmin';
import { getLeadFilterOptions } from '../../services/leadService'; // Import service to fetch cities

import MetricsCard from '../../components/dashboard/MetricsCard';
import DateRangePicker from '../../components/dashboard/DateRangePicker'; 
import ExportButtons from '../../components/dashboard/ExportButtons';
import RefreshButton from '../../components/dashboard/RefreshButton';
// import CumulativeGrowthChart from '../../components/dashboard/CumulativeGrowthChart'; // Removed
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
// import FinancialSummaryChart from '../../components/dashboard/FinancialSummaryChart'; // Removed as per request
import SystemHealthCard from '../../components/dashboard/SystemHealthCard';
import RolePerformanceTable from '../../components/dashboard/RolePerformanceTable';
import TeacherGrowthChart from '../../components/dashboard/TeacherGrowthChart';
import ClassGrowthChart from '../../components/dashboard/ClassGrowthChart';
import ClassLeadsChart from '../../components/dashboard/ClassLeadsChart';
import RevenueTrendsChart from '../../components/dashboard/RevenueTrendsChart';
// import { IAdminAnalytics } from '../../types'; // Removed

const AdminDashboardPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  // Default to last 365 days so user can see yearly/monthly trends
  const defaultFrom = format(subDays(new Date(), 365), 'yyyy-MM-dd');
  const defaultTo = format(new Date(), 'yyyy-MM-dd');
  
  // State for Filters
  const [dateRange, setDateRange] = useState<{ fromDate: string; toDate: string; city?: string }>({
    fromDate: defaultFrom, toDate: defaultTo
  });
  const [cities, setCities] = useState<string[]>([]);
  
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>(
    { open: false, message: '', severity: 'success' }
  );

  // Fetch cities for filter
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await getLeadFilterOptions();
        if (res.data?.cities) {
          setCities(res.data.cities);
        }
      } catch (err) {
        console.error('Failed to fetch city filters', err);
      }
    };
    fetchCities();
  }, []);

  const {
    analytics: kpiAnalytics,
    loading: kpiLoading,
    error: kpiError,
    refetch: refetchKpi,
  } = useAdmin(dateRange, autoRefresh, 30000);

  // Separate hook for Charts/Graphs to keep them independent of top-level KPI filters
  // Using defaultFrom (365 days) and defaultTo (today) with NO city filter
  const {
    analytics: chartAnalytics,
    loading: chartLoading,
    error: chartError,
    refetch: refetchCharts,
    exportCSV,
    exportPDF,
  } = useAdmin({ fromDate: defaultFrom, toDate: defaultTo }, autoRefresh, 30000);

  const handleDateChange = (range: { fromDate?: string; toDate?: string }) => {
    setDateRange(prev => ({ ...prev, ...range }));
  };

  const handleCityChange = (event: SelectChangeEvent) => {
    const city = event.target.value;
    setDateRange(prev => ({ ...prev, city: city === 'all' ? undefined : city }));
  };

  const handleAutoRefreshToggle = (enabled: boolean) => { 
    setAutoRefresh(enabled); 
    setLastRefreshed(new Date()); 
  };
  
  const handleManualRefresh = async () => { 
    await Promise.all([refetchKpi(), refetchCharts()]); 
    setLastRefreshed(new Date()); 
  };

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

  return (
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 0 } }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1A237E 0%, #0D47A1 100%)',
          color: 'white',
          py: { xs: 4, md: 5 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            Welcome back, {user?.name || 'Admin'}! Here's your system-wide overview and performance metrics.
          </Typography>
        </Box>
        
        {/* Abstract shapes for visual interest */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -40,
          right: 40,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>

      {/* Action Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
        }}
      >
         {/* Filters Group */}
         <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" flex={1}>
            <Box sx={{ minWidth: { xs: '100%', sm: 240 } }}>
              <DateRangePicker fromDate={dateRange.fromDate} toDate={dateRange.toDate} onDateChange={handleDateChange} presets />
            </Box>
            <Box sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="city-select-label">Filter by City</InputLabel>
                  <Select
                    labelId="city-select-label"
                    value={dateRange.city || 'all'}
                    label="Filter by City"
                    onChange={handleCityChange}
                  >
                  <MenuItem value="all">All Cities</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
         </Box>

         {/* Actions Group */}
         <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
            <RefreshButton onRefresh={handleManualRefresh} autoRefresh={autoRefresh} onAutoRefreshToggle={handleAutoRefreshToggle} loading={kpiLoading || chartLoading} lastRefreshed={lastRefreshed} />
            <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} reportTypes={reportTypes as any} />
         </Box>
      </Paper>

      {(kpiError || chartError) && <ErrorAlert error={kpiError || chartError} />}

      {/* Key Metrics - Uses kpiAnalytics (Filtered) */}
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
              title="Total Class Leads"
              value={kpiAnalytics?.base.kpi?.totalClassLeads?.toLocaleString() ?? '-'}
              subtitle="All time"
              icon={<ContactPhoneIcon />}
              color="secondary.main"
              loading={kpiLoading && !kpiAnalytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Total Tutors"
              value={kpiAnalytics?.base.kpi?.totalTeachers?.toLocaleString() ?? '-'}
              subtitle={`${kpiAnalytics?.base.kpi?.verifiedTeachers?.toLocaleString() ?? 0} Verified • ${kpiAnalytics?.base.kpi?.activeTeachers?.toLocaleString() ?? 0} Active`}
              icon={<PeopleIcon />}
              color="primary.main"
              loading={kpiLoading && !kpiAnalytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Total Active Classes"
              value={kpiAnalytics?.base.kpi?.activeClasses?.toLocaleString() ?? '-'}
              subtitle="Currently running"
              icon={<ClassIcon />}
              color="info.main"
              loading={kpiLoading && !kpiAnalytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Monthly Revenue"
              value={`₹${kpiAnalytics?.base.kpi?.monthlyRevenue?.toLocaleString() ?? '-'}`}
              subtitle="Current Month"
              icon={<TrendingUpIcon />}
              color="success.main"
              loading={kpiLoading && !kpiAnalytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Gross Revenue"
              value={`₹${kpiAnalytics?.base.kpi?.grossRevenue?.toLocaleString() ?? '-'}`}
              subtitle="Revenue in period"
              icon={<PaymentIcon />}
              color="success.dark"
              loading={kpiLoading && !kpiAnalytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Student Churn"
              value={`${kpiAnalytics?.base.kpi?.studentChurn ?? 0}%`}
              subtitle="Cancelled Classes"
              icon={<TrendingDownIcon />}
              color="error.main"
              loading={kpiLoading && !kpiAnalytics}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
             <MetricsCard
               title="Teacher Churn"
               value={`${kpiAnalytics?.base.kpi?.teacherChurn ?? 0}%`}
               subtitle="Inactive Teachers"
               icon={<TrendingDownIcon />}
               color="error.main"
               loading={kpiLoading && !kpiAnalytics}
             />
           </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
            <MetricsCard
              title="Pending Approvals"
              value={
                chartAnalytics?.health 
                  ? ((chartAnalytics.health.pendingApprovals?.totalPending || 0) + (chartAnalytics.health.pendingTutorVerifications || 0)).toLocaleString() 
                  : '-'
              }
              subtitle={`${chartAnalytics?.health?.pendingApprovals?.attendance?.total || 0} Attendance • ${chartAnalytics?.health?.pendingTutorVerifications || 0} Tutors`}
              icon={<AssignmentIndIcon />}
              color="warning.main"
              loading={chartLoading && !chartAnalytics}
              onClick={() => navigate('/admin/approvals')}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Analytics & Charts - Uses chartAnalytics (Unfiltered / Default Range) */}
      {/* Analytics & Charts - Uses chartAnalytics (Unfiltered / Default Range) */}
      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Analytics & Insights
        </Typography>

        {/* Charts Grid: 2 per row */}
        <Box mb={3}>
           <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                   <TeacherGrowthChart data={chartAnalytics?.tutors.growth || []} />
               </Grid>
               <Grid item xs={12} md={6}>
                   <ClassGrowthChart 
                     data={chartAnalytics?.classes.growth || []} 
                   />
               </Grid>
               <Grid item xs={12} md={6}>
                   <ClassLeadsChart data={chartAnalytics?.classes.leadsGrowth || []} />
               </Grid>
               <Grid item xs={12} md={6}>
                   <RevenueTrendsChart data={chartAnalytics?.finance?.revenueTrends || []} loading={chartLoading && !chartAnalytics} />
               </Grid>
           </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* Growth & Health */}
          
          <Grid item xs={12} md={6} lg={4}>
             <SystemHealthCard data={chartAnalytics?.health} />
          </Grid>

          {/* Role Performance */}
          <Grid item xs={12}>
            <RolePerformanceTable 
              managerData={chartAnalytics?.managers} 
              coordinatorData={chartAnalytics?.coordinators} 
              loading={chartLoading && !chartAnalytics}
            />
          </Grid>
        </Grid>
      </Box>

      {((kpiLoading && !kpiAnalytics) || (chartLoading && !chartAnalytics)) && (
        <LoadingSpinner message="Loading admin dashboard..." />
      )}

      <SnackbarNotification open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Container>
  );
};

export default AdminDashboardPage;
