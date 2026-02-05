
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  Tooltip, 
  CircularProgress, 
  alpha, 
  useTheme,
  Paper,
  LinearProgress
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';

import { getAdvancedAnalytics } from '../../services/adminService';
import { IAdvancedAnalytics } from '../../types';
import ErrorAlert from '../../components/common/ErrorAlert';

interface MetricDef {
  title: string;
  key: keyof IAdvancedAnalytics | string;
  icon: React.ReactNode;
  color: string;
  description: string;
  formula: string;
  format: (val: any) => string;
  category: 'economics' | 'growth' | 'operations';
}

const AdvancedAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IAdvancedAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAdvancedAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      setError('Failed to load advanced analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const metrics: MetricDef[] = [
    // Unit Economics
    {
      title: 'Student LTV',
      key: 'studentLTV',
      icon: <MonetizationOnIcon />,
      color: theme.palette.primary.main,
      description: 'Lifetime Value: Average total revenue generated per student.',
      formula: 'Total Revenue / Total Unique Students',
      format: (val) => `₹${Number(val).toLocaleString()}`,
      category: 'economics'
    },
    {
      title: 'Gross Margin',
      key: 'grossMargin',
      icon: <SpeedIcon />,
      color: theme.palette.success.main,
      description: 'Profitability after tutor payouts.',
      formula: '(Total Revenue - Teacher Payouts) / Total Revenue',
      format: (val) => `${Number(val).toFixed(2)}%`,
      category: 'economics'
    },
    {
      title: 'Student CAC',
      key: 'studentCAC',
      icon: <AddShoppingCartIcon />,
      color: theme.palette.warning.main,
      description: 'Cost to acquire a single student.',
      formula: 'Marketing Spend / New Students',
      format: (val) => `₹${Number(val).toLocaleString()}`,
      category: 'economics'
    },
    {
      title: 'ARPU',
      key: 'arpu',
      icon: <TrendingUpIcon />,
      color: theme.palette.info.main,
      description: 'Average Revenue Per User (Monthly).',
      formula: 'Monthly Revenue / Active Students',
      format: (val) => `₹${Number(val).toLocaleString()}`,
      category: 'economics'
    },
    // Growth & Retention
    {
      title: 'Lead Conversion',
      key: 'conversionRate',
      icon: <StarIcon />,
      color: '#f59e0b',
      description: 'Percentage of leads converting to paid classes.',
      formula: '(Converted / Total Leads) * 100',
      format: (val) => `${Number(val).toFixed(2)}%`,
      category: 'growth'
    },
    {
      title: 'Monthly Churn',
      key: 'studentChurn',
      icon: <TrendingDownIcon />,
      color: theme.palette.error.main,
      description: 'Percentage of students stopping classes monthly.',
      formula: 'Churned Students / Start Students',
      format: (val) => `${Number(val).toFixed(2)}%`,
      category: 'growth'
    },
    {
      title: 'Net Revenue Churn',
      key: 'netRevenueChurn',
      icon: <TrendingDownIcon />,
      color: '#ef4444',
      description: 'Lost revenue percentage adjusted for expansion.',
      formula: '(Churned Rev - Expansion Rev) / Total Rev',
      format: (val) => `${Number(val).toFixed(2)}%`,
      category: 'growth'
    },
    {
      title: 'Refund Rate',
      key: 'refundRate',
      icon: <AssessmentIcon />,
      color: '#facc15',
      description: 'Percentage of revenue refunded.',
      formula: 'Refunds / Total Revenue',
      format: (val) => `${Number(val).toFixed(2)}%`,
      category: 'growth'
    },
    // Operations
    {
      title: 'Avg Tutor Earnings',
      key: 'avgTeacherEarnings',
      icon: <PeopleIcon />,
      color: '#8b5cf6',
      description: 'Average payout per active tutor.',
      formula: 'Payouts / Active Tutors',
      format: (val) => `₹${Number(val).toLocaleString()}`,
      category: 'operations'
    },
    {
      title: 'Coord Cost Per User',
      key: 'coordinatorCostPerUser',
      icon: <GroupWorkIcon />,
      color: '#6366f1',
      description: 'Operational cost per student.',
      formula: 'Coord Salaries / Students',
      format: (val) => `₹${Number(val).toLocaleString()}`,
      category: 'operations'
    },
    {
      title: 'Time to Value',
      key: 'timeToValue',
      icon: <TimerIcon />,
      color: '#14b8a6',
      description: 'Avg days from enquiry to first class.',
      formula: 'Avg(Conversion Date - Lead Date)',
      format: (val) => `${Number(val).toFixed(1)} Days`,
      category: 'operations'
    },

  ];

  const renderMetricCard = (m: MetricDef) => {
    const value = data ? (m.key in (data as any) ? (data as any)[m.key] : 0) : 0;
    return (
      <Grid item xs={12} sm={6} md={3} key={m.title}>
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 3, 
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
            transition: 'all 0.2s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              boxShadow: `0 8px 20px -4px ${alpha(m.color, 0.2)}`,
              borderColor: alpha(m.color, 0.4),
              transform: 'translateY(-2px)'
            }
          }}
        >
           <Box sx={{
            position: 'absolute',
            top: -20, right: -20,
            width: 80, height: 80,
            borderRadius: '50%',
            bgcolor: alpha(m.color, 0.05),
          }} />
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box 
                sx={{ 
                  p: 1.25, 
                  borderRadius: 2, 
                  bgcolor: alpha(m.color, 0.1), 
                  color: m.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {m.icon}
              </Box>
              <Tooltip 
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="caption" fontWeight={700} display="block" gutterBottom>
                      {m.description}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: 'monospace' }}>
                      {m.formula}
                    </Typography>
                  </Box>
                }
                placement="top"
                arrow
              >
                <IconButton size="small" sx={{ color: 'text.secondary', opacity: 0.6 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
              {m.format(value)}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {m.title}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: 8 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)',
          color: 'white',
          py: 4,
          px: { xs: 2, md: 4 },
          borderRadius: 3,
          mb: 5,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Advanced Analytics
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 800 }}>
             Comprehensive insights into unit economics, growth trajectories, and operational efficiency.
          </Typography>
        </Box>
        {/* Background Shapes */}
         <Box sx={{
          position: 'absolute',
          top: -50, right: -50,
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>

      {error && <Box mb={3}><ErrorAlert error={error} /></Box>}

      {/* Retention Summary Benchmarks at Top */}
      <Box mb={5}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" />
          Global Retention Benchmarks
        </Typography>
        <Grid container spacing={3}>
          {[
            { label: 'Day 30', value: data?.retention.d30, color: '#0F62FE', icon: <TimerIcon /> },
            { label: 'Day 60', value: data?.retention.d60, color: '#8B5CF6', icon: <TrendingUpIcon /> },
            { label: 'Day 90', value: data?.retention.d90, color: '#F59E0B', icon: <StarIcon /> },
            { label: 'Day 365', value: data?.retention.d365, color: '#10B981', icon: <PeopleIcon /> },
          ].map((bench: { label: string; value: number | undefined; color: string; icon: React.ReactNode }) => (
            <Grid item xs={12} sm={6} md={3} key={bench.label}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3, 
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(bench.color, 0.1), color: bench.color }}>
                  {bench.icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{(bench.value || 0).toFixed(1)}%</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {bench.label} Retention
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Unit Economics Section */}
      <Box mb={5}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 1 }} />
          Unit Economics
        </Typography>
        <Grid container spacing={3}>
          {metrics.filter(m => m.category === 'economics').map(renderMetricCard)}
        </Grid>
      </Box>

      {/* Growth & Retention Section */}
      <Box mb={5}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'warning.main', borderRadius: 1 }} />
          Growth & Retention
        </Typography>
        <Grid container spacing={3}>
           {/* Retention Box */}
           <Grid item xs={12} md={3}>
             <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  borderRadius: 3, 
                  bgcolor: alpha(theme.palette.primary.main, 0.04), // darker standout
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}
             >
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Retention Benchmarks</Typography>
                <Box mt={3} display="flex" flexDirection="column" gap={3}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                       <Typography variant="caption" fontWeight={600}>Day 30</Typography>
                       <Typography variant="caption" fontWeight={700}>{data?.retention.d30.toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={data?.retention.d30 || 0} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                       <Typography variant="caption" fontWeight={600}>Day 60</Typography>
                       <Typography variant="caption" fontWeight={700}>{data?.retention.d60.toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={data?.retention.d60 || 0} color="secondary" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                       <Typography variant="caption" fontWeight={600}>Day 90</Typography>
                       <Typography variant="caption" fontWeight={700}>{data?.retention.d90.toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={data?.retention.d90 || 0} color="warning" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                       <Typography variant="caption" fontWeight={600}>Day 365</Typography>
                       <Typography variant="caption" fontWeight={700}>{data?.retention.d365.toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={data?.retention.d365 || 0} color="success" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                </Box>
             </Paper>
           </Grid>
           {/* Growth Metrics */}
           <Grid item xs={12} md={9}>
             <Grid container spacing={3}>
                {metrics.filter(m => m.category === 'growth').map(renderMetricCard)}
             </Grid>
           </Grid>
        </Grid>
      </Box>

      {/* Operational Efficiency Section */}
      <Box mb={5}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'secondary.main', borderRadius: 1 }} />
          Operational Efficiency
        </Typography>
        <Grid container spacing={3}>
          {metrics.filter(m => m.category === 'operations').map(renderMetricCard)}
        </Grid>
      </Box>

    </Container>
  );
};

export default AdvancedAnalyticsPage;
