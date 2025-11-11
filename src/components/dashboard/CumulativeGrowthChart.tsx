import React from 'react';
import { Card, CardContent, Typography, Skeleton } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ICumulativeGrowth } from '../../types';

type Props = {
  data: ICumulativeGrowth[];
  loading?: boolean;
  title?: string;
};

const CumulativeGrowthChart: React.FC<Props> = ({ data, loading = false, title = 'Cumulative Class Growth' }) => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" mb={2}>{title}</Typography>
        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : !data || data.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" p={4}>
            No data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="newClasses" stackId="1" stroke="#9c27b0" fill="#ce93d8" name="New Classes" />
              <Area type="monotone" dataKey="cumulativeClasses" stroke="#1976d2" fill="#90caf9" fillOpacity={0.6} name="Cumulative Total" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CumulativeGrowthChart;
