import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Skeleton, useTheme } from '@mui/material';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { IRevenueAnalytics } from '../../types';

type Props = {
  data: IRevenueAnalytics | null;
  loading?: boolean;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', p: 1.5, border: '1px solid #eee', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Box sx={{ typography: 'subtitle2', color: 'text.secondary', mb: 0.5 }}>{label}</Box>
        {payload.map((entry, idx) => (
           <Box key={idx} sx={{ typography: 'body2', fontWeight: 600, color: entry.color }}>
             {entry.name}: ₹{Number(entry.value).toLocaleString()}
           </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const RevenueChart: React.FC<Props> = ({ data, loading = false }) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState<'timeline' | 'byTutor' | 'monthly'>('timeline');

  const handleViewChange = (_: any, value: 'timeline' | 'byTutor' | 'monthly') => {
    if (value) setViewType(value);
  };

  const getChartData = () => {
    if (!data) return [] as any[];
    if (viewType === 'byTutor') {
        return (data.revenueByTutor || [])
            .filter(t => t?.tutor?.user?.name) // Filter invalid entries
            .slice(0, 10)
            .map((t) => ({ 
                name: (t.tutor.user.name || 'Unknown').split(' ')[0], 
                totalRevenue: t.totalRevenue 
            }));
    }
    if (viewType === 'monthly') return data.monthlyRevenue || [];
    return data.revenueByDate || [];
  };

  if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />;
  
  const chartData = getChartData();
  if (!data || chartData.length === 0) return <Box p={4} textAlign="center" color="text.secondary">No data available for this period</Box>;

  const xKey = viewType === 'timeline' ? 'date' : viewType === 'byTutor' ? 'name' : 'month';

  return (
    <Box>
       <Box display="flex" justifyContent="flex-end" mb={2}>
           <ToggleButtonGroup value={viewType} exclusive onChange={handleViewChange} size="small" sx={{ height: 32 }}>
            <ToggleButton value="timeline" sx={{ borderRadius: 2, textTransform: 'none', px: 2, fontSize: 13 }}>Timeline</ToggleButton>
            <ToggleButton value="byTutor" sx={{ borderRadius: 2, textTransform: 'none', px: 2, fontSize: 13 }}>By Tutor</ToggleButton>
            <ToggleButton value="monthly" sx={{ borderRadius: 2, textTransform: 'none', px: 2, fontSize: 13 }}>Monthly</ToggleButton>
          </ToggleButtonGroup>
       </Box>
       
       <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
             <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} minTickGap={30} />
             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val/1000}k`} />
             <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
             <Legend verticalAlign="top" height={36} iconType="circle" />
             
             {viewType === 'timeline' ? (
                <>
                  <Bar dataKey="revenue" fill={theme.palette.success.light} radius={[4, 4, 0, 0]} barSize={20} name="Total Revenue" />
                  <Line type="monotone" dataKey="paidRevenue" stroke={theme.palette.success.main} strokeWidth={3} dot={false} name="Paid Revenue" />
                </>
              ) : (
                <Bar 
                    dataKey={viewType === 'byTutor' ? 'totalRevenue' : 'revenue'} 
                    fill={theme.palette.success.main} 
                    radius={[4, 4, 0, 0]} 
                    barSize={viewType === 'byTutor' ? 30 : 20}
                    name="Revenue" 
                />
              )}
          </ComposedChart>
       </ResponsiveContainer>
    </Box>
  );
};

export default RevenueChart;
