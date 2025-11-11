import React from 'react';
import { Card, CardContent, Typography, Skeleton } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IStatusDistribution } from '../../types';

type Props = {
  data: IStatusDistribution[];
  loading?: boolean;
  title?: string;
};

const StatusDistributionChart: React.FC<Props> = ({ data, loading = false, title = 'Status Distribution' }) => {
  const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02', '#d32f2f', '#0288d1'];

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" mb={2}>{title}</Typography>
        {loading ? (
          <Skeleton variant="circular" width={250} height={250} />
        ) : !data || data.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" p={4}>
            No data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.percentage}%`}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusDistributionChart;
