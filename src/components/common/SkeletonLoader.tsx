import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid2 } from '@mui/material';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ py: 2, borderBottom: '1px solid #E2E8F0' }}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 3 }}>
              <Skeleton variant="text" width="80%" />
            </Grid2>
            <Grid2 size={{ xs: 3 }}>
              <Skeleton variant="text" width="60%" />
            </Grid2>
            <Grid2 size={{ xs: 3 }}>
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '8px' }} />
            </Grid2>
            <Grid2 size={{ xs: 3 }}>
              <Skeleton variant="text" width="70%" />
            </Grid2>
          </Grid2>
        </Box>
      ))}
    </Box>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '16px' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '8px' }} />
        </Box>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </CardContent>
    </Card>
  );
};

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => {
  return (
    <Box>
      {Array.from({ length: items }).map((_, index) => (
        <Box 
          key={index} 
          sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
          }}
        >
          <Box display="flex" gap={2} alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '8px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <Box>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: '12px' }} />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: '12px' }} />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '12px' }} />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: '10px' }} />
            <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: '10px' }} />
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
};