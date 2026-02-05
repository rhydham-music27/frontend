import React from 'react';
import { Typography, Box, Chip, Skeleton, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, LabelList, TooltipProps } from 'recharts';
import { IConversionFunnel } from '../../types';

type Props = {
  data: IConversionFunnel | null;
  loading?: boolean;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
       <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', p: 1.5, border: '1px solid #eee', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Box sx={{ typography: 'subtitle2', fontWeight: 700, mb: 0.5 }}>{data.name}</Box>
          <Box sx={{ typography: 'body2' }}>Count: <strong>{data.count}</strong></Box>
          <Box sx={{ typography: 'body2', color: 'text.secondary' }}>Drop-off: {data.percentage}% retained</Box>
       </Box>
    );
  }
  return null;
};

const ConversionFunnelChart: React.FC<Props> = ({ data, loading = false }) => {
  const theme = useTheme();
  const stages = data?.stages || [];
  
  // Funnel Colors (Gradient-like transition)
  const colors = [
     theme.palette.primary.dark,
     theme.palette.primary.main,
     theme.palette.primary.light,
     theme.palette.secondary.main,
     theme.palette.secondary.light,
  ];

  if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />;
  if (!data || stages.length === 0) return <Box p={4} textAlign="center" color="text.secondary">No data available</Box>;

  return (
    <Box>
       <Box display="flex" justifyContent="flex-end" mb={2}>
           <Chip label={`Conversion Rate: ${data.overallConversionRate}%`} color="warning" size="small" sx={{ fontWeight: 600 }} />
       </Box>
       <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stages} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
             <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
             <XAxis type="number" domain={[0, 100]} hide />
             <YAxis 
                type="category" 
                dataKey="name" 
                width={100} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 13, fontWeight: 500, fill: theme.palette.text.primary }} 
             />
             <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
             <Bar dataKey="percentage" barSize={30} radius={[0, 4, 4, 0]}>
                <LabelList
                   position="right"
                   content={(props: any) => {
                      const { x, y, width, value } = props;
                      // Display Count instead of percentage if space allows, or both
                      // Safely access payload, sometimes it might be missing or structure differs in LabelList
                      const count = props?.source?.count ?? props?.payload?.count ?? '';
                      
                      if (!value && !count) return null;

                      return (
                         <text x={x + width + 8} y={y + 20} fill="#6b7280" fontSize={12} textAnchor="start">
                            {count ? `${count} (${value}%)` : `${value}%`}
                         </text>
                      );
                   }}
                />
                {stages.map((_, idx) => (
                   <Cell key={idx} fill={colors[idx % colors.length]} />
                ))}
             </Bar>
          </BarChart>
       </ResponsiveContainer>
    </Box>
  );
};

export default ConversionFunnelChart;
