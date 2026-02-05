import React from 'react';
import { Card, CardContent, Typography, Box, Grid2, useTheme, Tooltip as MuiTooltip } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface PerformanceChartsProps {
  improvementData: Array<{ date: string; score: number }>;
  swotData: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ improvementData, swotData }) => {
  const theme = useTheme();

  const swotMatrix = [
    { label: 'Strengths', data: swotData.strengths, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Weaknesses', data: swotData.weaknesses, color: '#EF4444', bg: '#FEF2F2' },
    { label: 'Opportunities', data: swotData.opportunities, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Threats', data: swotData.threats, color: '#F59E0B', bg: '#FFFBEB' },
  ];

  return (
    <Grid2 container spacing={3}>
      {/* Student Improvement Chart */}
      <Grid2 size={{ xs: 12, md: 8 }}>
        <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={700}>
                Student Improvement Trend
              </Typography>
              <MuiTooltip title="Percentage improvement based on session feedback">
                <InfoOutlinedIcon sx={{ color: 'text.secondary', cursor: 'help' }} fontSize="small" />
              </MuiTooltip>
            </Box>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={improvementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ r: 6, fill: theme.palette.primary.main, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      {/* SWOT Analysis Grid */}
      <Grid2 size={{ xs: 12, md: 4 }}>
        <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={3}>
              SWOT Analysis
            </Typography>
            <Grid2 container spacing={2}>
              {swotMatrix.map((item) => (
                <Grid2 key={item.label} size={{ xs: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: item.bg,
                      height: '100%',
                      border: `1px solid ${item.color}20`,
                    }}
                  >
                    <Typography variant="caption" fontWeight={800} sx={{ color: item.color, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                      {item.label}
                    </Typography>
                    {item.data.length > 0 ? (
                      item.data.map((text, idx) => (
                        <Typography key={idx} variant="body2" sx={{ fontSize: '0.75rem', color: 'text.primary', mb: 0.5 }}>
                          • {text}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">No data</Typography>
                    )}
                  </Box>
                </Grid2>
              ))}
            </Grid2>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
};

export default PerformanceCharts;
