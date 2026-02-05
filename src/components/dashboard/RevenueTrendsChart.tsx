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
import { Box, Paper, Typography, useTheme, Checkbox, FormControlLabel, FormGroup, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

interface RevenueTrendPoint {
  date: string;
  feesCollected: number;
  tutorPayout: number;
  serviceCharge: number;
}

interface RevenueTrendsChartProps {
  data: RevenueTrendPoint[];
  loading?: boolean;
}

type ChartType = 'line' | 'bar';
type IntervalType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const RevenueTrendsChart: React.FC<RevenueTrendsChartProps> = ({ data, loading }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [interval, setInterval] = useState<IntervalType>('daily');
  const [visibleSeries, setVisibleSeries] = useState({
    fees: true,
    payout: true,
    service: true,
  });

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Ref for scroll container - defined at top
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Memoize sorted data/aggregated to ensure safety and hook order
  const sortedData = React.useMemo(() => {
     if (!data) return [];
     
     // Aggregate data based on interval
     const aggregated: Record<string, RevenueTrendPoint> = {};

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
         aggregated[key] = { date: key, feesCollected: 0, tutorPayout: 0, serviceCharge: 0 };
       }

       aggregated[key].feesCollected += d.feesCollected;
       aggregated[key].tutorPayout += d.tutorPayout;
       aggregated[key].serviceCharge += d.serviceCharge;
     });

     return Object.values(aggregated).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, interval]);

   // Calculate dynamic width for scrolling
   const chartWidth = React.useMemo(() => {
    let minPoints = 12;
    if (interval === 'daily') minPoints = 30; // Show 1 month
    else if (interval === 'weekly') minPoints = 12; // Show ~3 months
    else if (interval === 'monthly') minPoints = 12; // Show 1 year
    else if (interval === 'yearly') minPoints = 5; // Show 5 years

    return sortedData.length > minPoints 
      ? `${(sortedData.length / minPoints) * 100}%` 
      : '100%';
  }, [sortedData, interval]);

  // Scroll to end (latest data) on load/update
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [sortedData, chartWidth, loading]); // Added loading to deps just in case

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Loading revenue trends...</Typography>
      </Paper>
    );
  }

  if (sortedData.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No revenue data available</Typography>
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

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  // Calculate max value for Left Axis (Fees, Service)
  const getMaxLeft = () => {
    if (!sortedData.length) return 0;
    return Math.max(...sortedData.map(d => Math.max(
      visibleSeries.fees ? d.feesCollected : 0,
      visibleSeries.service ? d.serviceCharge : 0
    )));
  };

  const maxLeft = getMaxLeft();
  const stepLeft = 15000;
  const ceilingLeft = maxLeft > 0 ? Math.ceil(maxLeft / stepLeft) * stepLeft : stepLeft;
  
  const ticksLeft = [];
  for (let i = 0; i <= ceilingLeft; i += stepLeft) {
    ticksLeft.push(i);
  }

  // Helper to render series based on type
  const renderSeries = (
    dataKey: string,
    name: string,
    color: string,
    yAxisId: string,
    hide: boolean,
    dashed = false
  ) => {
    if (chartType === 'bar') {
      return (
        <Bar
          key={dataKey}
          yAxisId={yAxisId}
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
        yAxisId={yAxisId}
        type="monotone"
        dataKey={dataKey}
        name={name}
        stroke={color}
        fill={color}
        strokeWidth={dashed ? 2 : 3}
        strokeDasharray={dashed ? '5 5' : undefined}
        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: color }}
        activeDot={{ r: 7 }}
        hide={hide}
      />
    );
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Financial Trends
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fees & Net (Left) vs Payouts (Right)
          </Typography>
        </Box>
        
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
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
                    checked={visibleSeries.fees}
                    onChange={() => toggleSeries('fees')}
                    sx={{
                    color: theme.palette.primary.main,
                    '&.Mui-checked': { color: theme.palette.primary.main },
                    }}
                />
                }
                label={<Typography variant="body2">Fees</Typography>}
            />
            <FormControlLabel
                control={
                <Checkbox
                    checked={visibleSeries.payout}
                    onChange={() => toggleSeries('payout')}
                    sx={{
                    color: theme.palette.error.main,
                    '&.Mui-checked': { color: theme.palette.error.main },
                    }}
                />
                }
                label={<Typography variant="body2">Payouts</Typography>}
            />
            <FormControlLabel
                control={
                <Checkbox
                    checked={visibleSeries.service}
                    onChange={() => toggleSeries('service')}
                    sx={{
                    color: theme.palette.success.main,
                    '&.Mui-checked': { color: theme.palette.success.main },
                    }}
                />
                }
                label={<Typography variant="body2">Net</Typography>}
            />
            </FormGroup>
        </Box>
      </Box>

      <Box 
        ref={scrollContainerRef}
        sx={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}
      >
        <Box sx={{ width: chartWidth, minWidth: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sortedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis} 
                tick={{ fontSize: 12 }} 
                stroke={theme.palette.text.secondary}
              />
              {/* Left Axis: Fees & Net */}
              <YAxis 
                yAxisId="left"
                ticks={ticksLeft}
                domain={[0, ceilingLeft]}
                tickFormatter={(val) => `₹${val / 1000}k`} 
                tick={{ fontSize: 12 }} 
                stroke={theme.palette.text.secondary}
                orientation="left"
              />
               {/* Right Axis: Payouts */}
               <YAxis 
                yAxisId="right"
                tickFormatter={(val) => `₹${val / 1000}k`} 
                tick={{ fontSize: 12 }} 
                stroke={theme.palette.error.main}
                orientation="right"
                hide={!visibleSeries.payout} // Hide if payout not selected
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={formatXAxis}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />


              {renderSeries('feesCollected', 'Fees Collected', theme.palette.primary.main, 'left', !visibleSeries.fees)}
              {renderSeries('tutorPayout', 'Tutor Payment', theme.palette.error.main, 'right', !visibleSeries.payout, true)}
              {renderSeries('serviceCharge', 'Service Charge (Net)', theme.palette.success.main, 'left', !visibleSeries.service)}

            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export default RevenueTrendsChart;
