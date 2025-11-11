import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, Skeleton } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IDateWiseData } from '../../types';

type Props = {
  data: IDateWiseData[];
  loading?: boolean;
  title?: string;
};

const DateWiseLeadsChart: React.FC<Props> = ({ data, loading = false, title = 'Date-wise Class Leads' }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const handleChartTypeChange = (_: any, value: 'line' | 'bar') => {
    if (value) setChartType(value);
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{title}</Typography>
          <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small">
            <ToggleButton value="line">
              <ShowChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="bar">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : !data || data.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" p={4}>
            No data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#1976d2" strokeWidth={2} name="Total Leads" />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#1976d2" name="Total Leads" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DateWiseLeadsChart;
