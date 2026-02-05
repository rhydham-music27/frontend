import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { Box, Paper, Typography, alpha, useTheme, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { IDateWiseData } from '../../types';

interface ClassLeadsChartProps {
  data: IDateWiseData[];
  loading?: boolean;
}

type IntervalType = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ChartType = 'line' | 'bar';

const ClassLeadsChart: React.FC<ClassLeadsChartProps> = ({ data, loading }) => {
  const theme = useTheme();
  const [interval, setInterval] = useState<IntervalType>('monthly');
  const [chartType, setChartType] = useState<ChartType>('bar'); // Default is Bar for this one

  const chartData = useMemo(() => {
    if (!data) return [];

    // Aggregate by Interval
    const aggregated: Record<string, { date: string; total: number }> = {};
    
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

      if (!aggregated[key]) {
        aggregated[key] = { date: key, total: 0 };
      }
      aggregated[key].total += d.total;
    });

    return Object.values(aggregated)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        ...d,
        displayDate: format(parseISO(d.date), interval === 'yearly' ? 'yyyy' : (interval === 'monthly' ? 'MMM yy' : 'MMM dd'))
      }));
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
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
        <Typography color="text.secondary">Loading leads data...</Typography>
      </Paper>
    );
  }

  const renderSeries = () => {
    if (chartType === 'line') {
      return (
        <Line 
          dataKey="total" 
          name="New Leads" 
          stroke={theme.palette.primary.main} 
          fill={theme.palette.primary.main} 
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: theme.palette.primary.main }}
          activeDot={{ r: 7 }}
          type="monotone"
        />
      );
    }
    
    // Default Bar
    return (
      <Bar 
        dataKey="total" 
        name="New Leads" 
        fill={theme.palette.primary.main} 
        radius={[4, 4, 0, 0]} 
        barSize={interval === 'daily' ? 8 : 32}
      >
          {chartData.map((_entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={alpha(theme.palette.primary.main, 0.7 + (index / Math.max(1, chartData.length)) * 0.3)} 
          />
        ))}
      </Bar>
    );
  };

  return (
    <Paper 
      elevation={0} 
      variant="outlined"
      sx={{ 
        p: 3, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '16px',
        borderColor: '#E2E8F0',
        background: '#fff'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} gap={2}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Class Leads vs Time   
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Trend of new student enquiries   
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Type</InputLabel>
                <Select
                    value={chartType}
                    label="Type"
                    onChange={(e) => setChartType(e.target.value as ChartType)}
                    sx={{ borderRadius: '8px' }}
                >
                    <MenuItem value="bar">Bar</MenuItem>
                    <MenuItem value="line">Line</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel id="interval-select-label">View   </InputLabel>
            <Select
                labelId="interval-select-label"
                value={interval}
                label="View"
                onChange={(e) => setInterval(e.target.value as IntervalType)}
                sx={{ borderRadius: '8px' }}
            >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
            </FormControl>
        </Box>
      </Box>

      <Box 
        ref={scrollContainerRef}
        sx={{ width: '100%', flexGrow: 1, minHeight: 300, overflowX: 'auto', overflowY: 'hidden' }}
      >
        <Box sx={{ width: chartWidth, minWidth: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                dy={10}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: alpha(theme.palette.primary.main, 0.04) }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              {renderSeries()}
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export default ClassLeadsChart;
