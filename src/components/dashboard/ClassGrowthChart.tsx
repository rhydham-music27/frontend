import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { startOfWeek, startOfMonth, startOfYear, format, parseISO } from 'date-fns';
import { Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { ICumulativeGrowth } from '../../types';

type IntervalType = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ChartType = 'line' | 'bar';

interface ClassGrowthChartProps {
  data: ICumulativeGrowth[];
  loading?: boolean;
}

const ClassGrowthChart: React.FC<ClassGrowthChartProps> = ({ data, loading }) => {
  const [interval, setInterval] = useState<IntervalType>('monthly');
  const [chartType, setChartType] = useState<ChartType>('line');

  const chartData = useMemo(() => {
    if (!data) return [];

    // The backend already returns daily/monthly points based on created/ended aggregation.
    // However, if we want to re-aggregate locally for different intervals:
    
    const aggregated: Record<string, { date: string; total: number; active: number; inactive: number }> = {};

    // Note: Since 'active' is a snapshot/cumulative difference, re-aggregating active counts by SUMMING them is wrong.
    // We should take the LAST value in the interval for 'Stock' metrics (Active, Total Cumulative).
    // But our backend returns 'cumulative' already.
    // If backend returns Daily, and we want Monthly, we should take the last Day of the Month.
    
    // Simplification: We will plot the data as returned if interval matches, 
    // or we might need backend to support dynamic interval grouping if the dataset is large.
    // Given the current backend implementation supports 'day', 'week', 'month', 
    // and we default to 'day' in service but 'monthly' in UI?
    
    // Let's assume data comes in appropriate granularity or we take the latest point for each interval.
    
    data.forEach(d => {
      const date = parseISO(d.date);
      let key = d.date;
      
      if (interval === 'weekly') {
        key = format(startOfWeek(date), 'yyyy-MM-dd');
      } else if (interval === 'monthly') {
        key = format(startOfMonth(date), 'yyyy-MM-dd');
      } else if (interval === 'yearly') {
        key = format(startOfYear(date), 'yyyy-MM-dd');
      }

      // Using last-value logic for cumulative stats
      aggregated[key] = { 
        date: key, 
        total: d.totalClasses, 
        active: d.activeClasses, 
        inactive: d.inactiveClasses 
      };
    });

    return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
  }, [data, interval]);

  // Ref for scroll container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Calculate dynamic width for scrolling
  const chartWidth = React.useMemo(() => {
    let minPoints = 12;
    if (interval === 'daily') minPoints = 30;
    else if (interval === 'weekly') minPoints = 12;
    else if (interval === 'monthly') minPoints = 12;
    else if (interval === 'yearly') minPoints = 5;

    return chartData.length > minPoints 
      ? `${(chartData.length / minPoints) * 100}%` 
      : '100%';
  }, [chartData, interval]);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [chartData, chartWidth, loading]);

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        }}
      >
        <Typography color="text.secondary">Loading chart...</Typography>
      </Paper>
    );
  }

  const formatXAxis = (tick: string) => {
    try {
      const date = parseISO(tick);
      if (interval === 'daily') return format(date, 'MMM dd');
      if (interval === 'weekly') return format(date, 'MMM dd');
      if (interval === 'monthly') return format(date, 'MMM yy');
      if (interval === 'yearly') return format(date, 'yyyy');
      return tick;
    } catch {
      return tick;
    }
  };

  const renderSeries = (dataKey: string, name: string, color: string) => {
    if (chartType === 'bar') {
      return (
        <Bar
          key={dataKey}
          dataKey={dataKey}
          name={name}
          fill={color}
          barSize={20}
          radius={[8, 8, 0, 0]}
        />
      );
    }
    // Line (Default)
    return (
      <Line
        key={dataKey}
        type="monotone"
        dataKey={dataKey}
        name={name}
        stroke={color}
        fill={color}
        strokeWidth={3}
        dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: color }}
        activeDot={{ r: 7, strokeWidth: 2 }}
      />
    );
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        background: '#ffffff',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.08), 0px 16px 32px rgba(0, 0, 0, 0.08)',
          borderColor: 'rgba(45, 104, 196, 0.2)',
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            Class Growth Over Time
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Track new, active, and ended classes
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ minWidth: 200 }} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 100 }}>
             <InputLabel>Type</InputLabel>
             <Select
               value={chartType}
               label="Type"
               onChange={(e) => setChartType(e.target.value as ChartType)}
             >
               <MenuItem value="line">Line</MenuItem>
               <MenuItem value="bar">Bar</MenuItem>
             </Select>
           </FormControl>

           <FormControl size="small" sx={{ minWidth: 100 }}>
             <InputLabel>Interval</InputLabel>
             <Select
               value={interval}
               label="Interval"
               onChange={(e) => setInterval(e.target.value as IntervalType)}
             >
               <MenuItem value="daily">Daily</MenuItem>
               <MenuItem value="weekly">Weekly</MenuItem>
               <MenuItem value="monthly">Monthly</MenuItem>
               <MenuItem value="yearly">Yearly</MenuItem>
             </Select>
           </FormControl>
        </Stack>
      </Box>

      <Box 
        ref={scrollContainerRef}
        sx={{ 
          width: '100%', 
          flexGrow: 1, 
          minHeight: 300, 
          overflowX: 'auto', 
          overflowY: 'hidden',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F1F5F9',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #2D68C4 0%, #00B7EB 100%)',
            borderRadius: '10px',
          },
        }}
      >
        <Box sx={{ width: chartWidth, minWidth: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D68C4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2D68C4" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis} 
                stroke="#94A3B8"
                style={{ fontSize: '0.75rem', fontWeight: 500 }}
                tickLine={false}
              />
              <YAxis 
                stroke="#94A3B8"
                style={{ fontSize: '0.75rem', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: '8px', color: '#1E293B' }}
                itemStyle={{ fontSize: '0.875rem', fontWeight: 500 }}
                labelFormatter={formatXAxis}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '16px' }}
                iconType="circle"
              />

              {renderSeries('total', 'New Classes', '#2D68C4')}
              {renderSeries('active', 'Active Classes', '#10B981')}
              {renderSeries('inactive', 'Ended Classes', '#EF4444')}
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export default ClassGrowthChart;
