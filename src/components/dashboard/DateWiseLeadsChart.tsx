import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Skeleton, useTheme, Card, CardContent } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, TooltipProps } from 'recharts';
import { IDateWiseData } from '../../types';

type Props = {
  data: IDateWiseData[];
  loading?: boolean;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', p: 1.5, border: '1px solid #eee', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Box sx={{ typography: 'subtitle2', color: 'text.secondary', mb: 0.5 }}>{label}</Box>
        <Box sx={{ typography: 'h6', fontWeight: 700, color: 'primary.main' }}>
          {payload[0].value} Leads
        </Box>
      </Box>
    );
  }
  return null;
};

const DateWiseLeadsChart: React.FC<Props> = ({ data, loading = false }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const handleChartTypeChange = (_: any, value: 'area' | 'bar') => {
    if (value) setChartType(value);
  };

  if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />;
  if (!data || data.length === 0) return <Box p={4} textAlign="center" color="text.secondary">No data available</Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small" sx={{ height: 32 }}>
          <ToggleButton value="area" sx={{ borderRadius: 2 }}>
            <ShowChartIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="bar" sx={{ borderRadius: 2 }}>
            <BarChartIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} minTickGap={30} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: theme.palette.primary.light, strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
                type="monotone" 
                dataKey="total" 
                stroke={theme.palette.primary.main} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorLeads)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} minTickGap={30} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar dataKey="total" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Box>
  );
};

export default DateWiseLeadsChart;
