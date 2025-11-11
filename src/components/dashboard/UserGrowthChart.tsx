import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, Skeleton } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { IUserGrowthData } from '../../types';

interface UserGrowthChartProps {
  data: IUserGrowthData[] | null | undefined;
  loading?: boolean;
  title?: string;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data, loading = false, title = 'User Growth Over Time' }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, next: 'line' | 'bar' | null) => {
    if (next) setChartType(next);
  };

  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">{title}</Typography>
          <ToggleButtonGroup size="small" value={chartType} exclusive onChange={handleTypeChange}>
            <ToggleButton value="line">Line</ToggleButton>
            <ToggleButton value="bar">Bar</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : !hasData ? (
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        ) : (
          <Box height={300}>
            <ResponsiveContainer>
              {chartType === 'line' ? (
                <LineChart data={data!} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Users" stroke="#1976d2" strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={data!} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Users" fill="#1976d2" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserGrowthChart;
