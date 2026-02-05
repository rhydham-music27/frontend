
import React from 'react';
import { Card, CardContent, Typography, Rating, Chip, Stack, Grid, Divider, Box, Avatar } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { ITutorPerformance } from '../../types';

type Props = {
  tutors: ITutorPerformance[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy?: string, sortOrder?: 'asc' | 'desc') => void;
  onRowClick?: (tutor: ITutorPerformance) => void;
};

const TutorProgressTable: React.FC<Props> = ({ tutors, total, page, limit, loading = false, onPageChange, onSortChange, onRowClick }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tutor',
      width: 200,
      renderCell: (params: any) => (
         <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 32, height: 32, fontSize: 13, fontWeight: 600 }}>
             {(params?.row?.tutor?.user?.name || '?').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
                <Typography variant="body2" fontWeight={600}>
                    {params?.row?.tutor?.user?.name || '-'}
                </Typography>
            </Box>
         </Box>
      ),
    },
    {
      field: 'experienceHours',
      headerName: 'Experience',
      width: 140,
      type: 'number',
      renderCell: (params: any) => (<Box color="text.secondary">{Number(params?.row?.tutor?.experienceHours ?? 0)} hrs</Box>),
    },
    {
       field: 'status',
       headerName: 'Status',
       width: 130,
       renderCell: (params: any) => {
          const status = params?.row?.tutor?.verificationStatus || 'UNKNOWN';
          const isVerified = status === 'VERIFIED';
          return (
             <Chip 
               label={isVerified ? 'Verified' : status} 
               size="small" 
               sx={{ 
                  bgcolor: isVerified ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                  color: isVerified ? 'success.dark' : 'warning.dark',
                  fontWeight: 600,
                  fontSize: 11
               }} 
             />
          );
       }
    },
    {
      field: 'subjects',
      headerName: 'Subjects',
      width: 220,
      renderCell: (params: any) => (
         <Typography variant="caption" color="text.secondary" noWrap>
            {(params?.row?.tutor?.subjects || []).join(', ')}
         </Typography>
      ),
    },
    {
      field: 'classesCompleted',
      headerName: 'Classes',
      width: 130,
      type: 'number',
      renderCell: (params: any) => (
         <Box fontWeight={600} color="primary.main">{Number(params?.row?.classesCompleted ?? 0)}</Box>
      ),
    },
    {
      field: 'totalRevenue',
      headerName: 'Revenue',
      width: 140,
      type: 'number',
      renderCell: (params: any) => (
         <Box component="span" fontWeight={600} color="success.dark">
             ₹{Number(params?.row?.totalRevenue ?? 0).toLocaleString()}
         </Box>
      ),
    },
    {
      field: 'averageRating',
      headerName: 'Rating',
      width: 140,
      type: 'number',
      renderCell: (params: any) => (
        <Rating value={Number(params?.row?.averageRating ?? 0)} readOnly size="small" precision={0.1} />
      ),
    },
  ];

  const handleSortChange = (model: GridSortModel) => {
    if (model.length > 0) onSortChange(model[0].field, (model[0].sort as 'asc' | 'desc') || undefined);
    else onSortChange(undefined, undefined);
  };

  // Mobile Card View
  if (isXs) {
      return (
         <Stack spacing={2}>
            {tutors.map((row) => (
               <Card key={row.tutor.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent>
                     <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                           <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 13 }}>{(row.tutor.user.name || '?').charAt(0)}</Avatar>
                           <Typography variant="subtitle2" fontWeight={700}>{row.tutor.user.name}</Typography>
                        </Box>
                        <Chip size="small" label={row.tutor.verificationStatus} color={row.tutor.verificationStatus === 'VERIFIED' ? 'success' : 'default'} />
                     </Box>
                     <Divider sx={{ my: 1.5 }} />
                     <Grid container spacing={2}>
                        <Grid item xs={6}>
                           <Typography variant="caption" color="text.secondary">Revenue</Typography>
                           <Typography variant="body2" fontWeight={600}>₹{Number(row.totalRevenue || 0).toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                           <Typography variant="caption" color="text.secondary">Classes</Typography>
                           <Typography variant="body2" fontWeight={600}>{row.classesCompleted}</Typography>
                        </Grid>
                     </Grid>
                  </CardContent>
               </Card>
            ))}
         </Stack>
      );
  }

  // Desktop DataGrid View
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <DataGrid
        rows={tutors || []}
        columns={columns}
        getRowId={(row) => row?.tutor?.id || row?.tutor?._id || row?.id || `${row?.name || 'row'}-${Math.random()}`}
        pageSizeOptions={[limit]}
        pagination
        paginationMode="server"
        rowCount={total}
        paginationModel={{ page: Math.max(0, page - 1), pageSize: limit }}
        onPaginationModelChange={(model) => onPageChange(model.page + 1)}
        sortingMode="server"
        onSortModelChange={handleSortChange}
        loading={loading}
        autoHeight
        disableRowSelectionOnClick
        onRowClick={onRowClick ? (params) => onRowClick(params?.row) : undefined}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
             bgcolor: alpha(theme.palette.primary.main, 0.04), // Subtle highlight header
             borderBottom: '1px solid',
             borderColor: 'divider',
             fontSize: '0.85rem',
             fontWeight: 700,
             color: theme.palette.text.primary,
             minHeight: '52px !important'
          },
          '& .MuiDataGrid-cell': {
             borderBottom: '1px solid',
             borderColor: 'divider',
             display: 'flex',
             alignItems: 'center',
             py: 1
          },
          '& .MuiDataGrid-row:hover': {
             bgcolor: alpha(theme.palette.primary.main, 0.02)
          }
        }}
      />
    </div>
  );
};

export default TutorProgressTable;
