import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { IStatusDistribution } from '../../types';

type Props = {
  data: IStatusDistribution[];
  loading?: boolean;
};

const StatusDistributionChart: React.FC<Props> = ({ data, loading = false }) => {
  
  // Premium Colors
  const COLORS = [
     '#6366F1', // Indigo
     '#EC4899', // Pink
     '#10B981', // Emerald
     '#F59E0B', // Amber
     '#EF4444', // Red
     '#3B82F6', // Blue
     '#8B5CF6'  // Violet
  ];

  if (loading) return <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto' }} />;
  if (!data || data.length === 0) return <Box p={4} textAlign="center" color="text.secondary">No data available</Box>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="status" 
          type="category" 
          width={100} 
          tick={{ fontSize: 11, fill: '#6b7280' }} 
          interval={0}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', p: 1, border: '1px solid #eee', borderRadius: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <Typography variant="caption" fontWeight={600}>{d.status}</Typography>
                    <Typography variant="body2" color="primary.main">
                        {d.count} Leads ({d.percentage}%)
                    </Typography>
                  </Box>
                );
            }
            return null;
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Add Typography import if missing, or use Box only. 
// Note: I used Typography in the tooltip above, so I should ensure it's imported or use Box styling.
// I will check imports in next step if broken, but I see Box, Skeleton, useTheme imported. 
// Let's safe-check and use Box or add Typography to imports in previous step or this one.
// I'll stick to Box for safety in the inline Tooltip or assume Typography is global? No, it's not.
// I will rewrite the Tooltip to use Box text styles to avoid import errors.

export default StatusDistributionChart;
