import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Skeleton } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { IFinancialSummary } from '../../types';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface FinancialSummaryChartProps {
  data: IFinancialSummary | null | undefined;
  loading?: boolean;
  title?: string;
}

const currency = (n: number | undefined | null) =>
  typeof n === 'number' ? `₹${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '₹0';

const percentOf = (part: number, total: number) => {
  if (!total || total <= 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
};

const FinancialSummaryChart: React.FC<FinancialSummaryChartProps> = ({ data, loading = false, title = 'Financial Summary' }) => {
  const rate = data?.collectionRate ?? 0;
  const rateColor = rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'error';
  const RateIcon = rate >= 60 ? TrendingUpIcon : TrendingDownIcon;

  const growthData = data?.growth || [];

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">{title}</Typography>
          {loading ? (
            <Skeleton variant="rounded" width={140} height={28} />
          ) : data ? (
            <Chip
              color={rateColor as any}
              variant="outlined"
              icon={<RateIcon fontSize="small" />}
              label={`Collection Rate: ${rate.toFixed(1)}%`}
              size="small"
            />
          ) : null}
        </Box>

        {/* Top metrics */}
        {loading ? (
          <Grid container spacing={2} mb={2}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} item xs={12} sm={6} md={3}>
                <Skeleton variant="rounded" height={90} />
              </Grid>
            ))}
          </Grid>
        ) : data ? (
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box p={2} borderRadius={1} border={1} borderColor="divider">
                <Typography variant="overline" color="text.secondary">Gross Revenue</Typography>
                <Typography variant="h5" color="text.primary">{currency(data.grossRevenue)}</Typography>
                <Typography variant="caption" color="text.secondary">100%</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box p={2} borderRadius={1} border={1} borderColor="divider">
                <Typography variant="overline" color="text.secondary">Paid Revenue</Typography>
                <Typography variant="h5" color="success.main">{currency(data.paidRevenue)}</Typography>
                <Typography variant="caption" color="text.secondary">{percentOf(data.paidRevenue, data.grossRevenue)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box p={2} borderRadius={1} border={1} borderColor="divider">
                <Typography variant="overline" color="text.secondary">Pending Revenue</Typography>
                <Typography variant="h5" color="warning.main">{currency(data.pendingRevenue)}</Typography>
                <Typography variant="caption" color="text.secondary">{percentOf(data.pendingRevenue, data.grossRevenue)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box p={2} borderRadius={1} border={1} borderColor="divider">
                <Typography variant="overline" color="text.secondary">Overdue Revenue</Typography>
                <Typography variant="h5" color="error.main">{currency(data.overdueRevenue)}</Typography>
                <Typography variant="caption" color="text.secondary">{percentOf(data.overdueRevenue, data.grossRevenue)}</Typography>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" mb={2}>No data available</Typography>
        )}

        {/* Growth chart */}
        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : growthData.length > 0 ? (
          <Box height={300}>
            <ResponsiveContainer>
              <BarChart data={growthData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Monthly Revenue" fill="#1976d2">
                  {growthData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#1976d2' : '#42a5f5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          !loading && <Typography variant="body2" color="text.secondary">No growth data available</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryChart;
