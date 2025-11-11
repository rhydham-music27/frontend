import React from 'react';
import { Card, CardContent, Typography, Skeleton, Box } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { IUserStatsByRole } from '../../types';

interface RoleDistributionChartProps {
  data: IUserStatsByRole | null | undefined;
  loading?: boolean;
  title?: string;
}

const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02', '#d32f2f', '#0288d1'];

const RoleDistributionChart: React.FC<RoleDistributionChartProps> = ({ data, loading = false, title = 'User Distribution by Role' }) => {
  const transformed = React.useMemo(() => {
    if (!data) return [] as Array<{ name: string; value: number; active: number }>;
    const entries: Array<{ name: string; value: number; active: number }> = Object.keys(data).map((key) => {
      const k = key as keyof IUserStatsByRole;
      const entry = data[k] as { count: number; active: number };
      return { name: key, value: entry?.count || 0, active: entry?.active || 0 };
    });
    return entries.filter((e) => e.value > 0);
  }, [data]);

  const hasData = transformed.length > 0;

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">{title}</Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <Skeleton variant="circular" width={250} height={250} />
            </Box>
          ) : !hasData ? (
            <Typography variant="body2" color="text.secondary">No data available</Typography>
          ) : (
            <Box height={360} sx={{ overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 64, right: 12, bottom: 12, left: 12 }}>
                  <Legend layout="horizontal" align="center" verticalAlign="top" wrapperStyle={{ paddingBottom: 8 }} />
                  <Pie
                    data={transformed}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="60%"
                    innerRadius={45}
                    outerRadius={85}
                    labelLine={false}
                    label={false}
                  >
                    {transformed.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, _name, props) => {
                    const active = (props?.payload as any)?.active ?? 0;
                    return [`${value} (active: ${active})`, props?.name];
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoleDistributionChart;
