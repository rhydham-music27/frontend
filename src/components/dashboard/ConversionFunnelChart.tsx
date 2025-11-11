import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Skeleton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, LabelList } from 'recharts';
import { IConversionFunnel } from '../../types';

type Props = {
  data: IConversionFunnel | null;
  loading?: boolean;
  title?: string;
};

const ConversionFunnelChart: React.FC<Props> = ({ data, loading = false, title = 'Conversion Funnel' }) => {
  const stages = data?.stages || [];
  const colors = ['#1976d2', '#42a5f5', '#90caf9', '#bbdefb', '#e3f2fd'];

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{title}</Typography>
          {data && (
            <Chip label={`Overall Conversion Rate: ${data.overallConversionRate}%`} color="success" size="small" />
          )}
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" height={350} />
        ) : !data || stages.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" p={4}>
            No data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stages} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={90} />
              <Tooltip
                formatter={(value: any, _name: any, props: any) => {
                  const count = props?.payload?.count ?? '';
                  return [`${value}%`, `Count: ${count}`];
                }}
              />
              <Bar dataKey="percentage">
                <LabelList
                  position="right"
                  formatter={(value: any, entry: any) => {
                    const count = entry?.count ?? entry?.payload?.count ?? '';
                    const pct = value ?? entry?.percentage ?? entry?.payload?.percentage ?? '';
                    return `${count} (${pct}%)`;
                  }}
                />
                {stages.map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelChart;
