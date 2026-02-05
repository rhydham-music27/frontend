import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { startOfWeek, startOfMonth, startOfYear, format, parseISO } from 'date-fns';
import { Box, Paper, Typography, Checkbox, FormControlLabel, FormGroup, FormControl, Select, MenuItem, InputLabel } from '@mui/material';

interface DataPoint {
  month: string; // Now acts as 'date' (YYYY-MM-DD)
  total: number;
  active: number;
  verified: number;
}

type IntervalType = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ChartType = 'line' | 'bar';

interface TeacherGrowthChartProps {
  data: DataPoint[];
  loading?: boolean;
}

const TeacherGrowthChart: React.FC<TeacherGrowthChartProps> = ({ data, loading }) => {
  const [interval, setInterval] = useState<IntervalType>('monthly');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [visibleSeries, setVisibleSeries] = useState({
    total: true,
    active: true,
    verified: true,
  });

  const handleToggle = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // 1. Group by interval
    const grouped: Record<string, DataPoint> = {};
    
    data.forEach(d => {
      const date = parseISO(d.month); // Input is YYYY-MM-DD
      let key = d.month;

      if (interval === 'weekly') {
        key = format(startOfWeek(date), 'yyyy-MM-dd');
      } else if (interval === 'monthly') {
        key = format(startOfMonth(date), 'yyyy-MM-dd');
      } else if (interval === 'yearly') {
        key = format(startOfYear(date), 'yyyy-MM-dd');
      }

      if (!grouped[key]) {
        grouped[key] = { month: key, total: 0, active: 0, verified: 0 };
      }

      // Sum up metrics for the interval
      grouped[key].total += d.total;
      grouped[key].active += d.active;
      grouped[key].verified += d.verified;
    });

    // 2. Convert to array and sort
    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
  }, [data, interval]);

  // Ref for scroll container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Calculate dynamic width for scrolling
  const chartWidth = React.useMemo(() => {
    let minPoints = 12;
    if (interval === 'daily') minPoints = 30; // Show 1 month
    else if (interval === 'weekly') minPoints = 12; // Show ~3 months
    else if (interval === 'monthly') minPoints = 12; // Show 1 year
    else if (interval === 'yearly') minPoints = 5; // Show 5 years

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
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Loading chart...</Typography>
      </Paper>
    );
  }

  // Format month label (e.g. "2023-11" -> "Nov '23")
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

  const renderSeries = (dataKey: string, name: string, color: string, hide: boolean) => {
    if (chartType === 'bar') {
      return (
        <Bar
          key={dataKey}
          dataKey={dataKey}
          name={name}
          fill={color}
          hide={hide}
          barSize={20}
          radius={[4, 4, 0, 0]}
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
        strokeWidth={2}
        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: color }}
        activeDot={{ r: 6 }}
        hide={hide}
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
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
        <Typography variant="h6" fontWeight={600}>
          Teacher Registration Trends
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
           <FormControl size="small" sx={{ minWidth: 100 }}>
             <InputLabel>Interval</InputLabel>
             <Select
               value={interval}
               label="Interval"
               onChange={(e) => setInterval(e.target.value as IntervalType)}
               sx={{ height: 32, fontSize: '0.875rem' }}
             >
               <MenuItem value="daily">Daily</MenuItem>
               <MenuItem value="weekly">Weekly</MenuItem>
               <MenuItem value="monthly">Monthly</MenuItem>
               <MenuItem value="yearly">Yearly</MenuItem>
             </Select>
           </FormControl>

           <FormControl size="small" sx={{ minWidth: 100 }}>
             <InputLabel>Type</InputLabel>
             <Select
               value={chartType}
               label="Type"
               onChange={(e) => setChartType(e.target.value as ChartType)}
               sx={{ height: 32, fontSize: '0.875rem' }}
             >
               <MenuItem value="line">Line</MenuItem>
               <MenuItem value="bar">Bar</MenuItem>
             </Select>
           </FormControl>

           <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleSeries.total}
                onChange={() => handleToggle('total')}
                size="small"
                sx={{ color: '#8884d8', '&.Mui-checked': { color: '#8884d8' } }}
              />
            }
            label={<Typography variant="caption">Total</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleSeries.active}
                onChange={() => handleToggle('active')}
                size="small"
                sx={{ color: '#82ca9d', '&.Mui-checked': { color: '#82ca9d' } }}
              />
            }
            label={<Typography variant="caption">Active</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleSeries.verified}
                onChange={() => handleToggle('verified')}
                size="small"
                sx={{ color: '#ffc658', '&.Mui-checked': { color: '#ffc658' } }}
              />
            }
            label={<Typography variant="caption">Verified</Typography>}
          />
          </FormGroup>
        </Box>
      </Box>

      <Box 
        ref={scrollContainerRef}
        sx={{ width: '100%', flexGrow: 1, minHeight: 300, overflowX: 'auto', overflowY: 'hidden' }}
      >
        <Box sx={{ width: chartWidth, minWidth: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tickFormatter={formatXAxis} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={formatXAxis}
              />
              {renderSeries('total', 'Total Registered', '#8884d8', !visibleSeries.total)}
              {renderSeries('active', 'Active Tutors', '#82ca9d', !visibleSeries.active)}
              {renderSeries('verified', 'Verified', '#ffc658', !visibleSeries.verified)}
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export default TeacherGrowthChart;
