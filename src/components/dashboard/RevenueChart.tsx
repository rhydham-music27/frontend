import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, Skeleton } from '@mui/material';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IRevenueAnalytics } from '../../types';

type Props = {
  data: IRevenueAnalytics | null;
  loading?: boolean;
  title?: string;
};

const RevenueChart: React.FC<Props> = ({ data, loading = false, title = 'Revenue Analytics' }) => {
  const [viewType, setViewType] = useState<'timeline' | 'byTutor' | 'monthly'>('timeline');

  const handleViewChange = (_: any, value: 'timeline' | 'byTutor' | 'monthly') => {
    if (value) setViewType(value);
  };

  const getChartData = () => {
    if (!data) return [] as any[];
    if (viewType === 'byTutor') return (data.revenueByTutor || []).slice(0, 10).map((t) => ({ name: t.tutor.user.name, totalRevenue: t.totalRevenue }));
    if (viewType === 'monthly') return data.monthlyRevenue || [];
    return data.revenueByDate || [];
  };

  const xKey = viewType === 'timeline' ? 'date' : viewType === 'byTutor' ? 'name' : 'month';

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{title}</Typography>
          <ToggleButtonGroup value={viewType} exclusive onChange={handleViewChange} size="small">
            <ToggleButton value="timeline">Timeline</ToggleButton>
            <ToggleButton value="byTutor">By Tutor</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : !data ? (
          <Typography color="text.secondary" textAlign="center" p={4}>
            No data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {viewType === 'timeline' ? (
                <>
                  <Bar dataKey="revenue" fill="#1976d2" name="Revenue" />
                  <Line type="monotone" dataKey="paidRevenue" stroke="#2e7d32" name="Paid Revenue" />
                </>
              ) : (
                <Bar dataKey={viewType === 'byTutor' ? 'totalRevenue' : 'revenue'} fill="#1976d2" name="Revenue" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
