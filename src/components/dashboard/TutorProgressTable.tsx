import React from 'react';
import { Card, CardContent, Typography, Rating, Chip, Stack, Grid, Divider, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

  console.log('TutorProgressTable rows', tutors);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tutor Name',
      width: 180,
      renderCell: (params: any) => params?.row?.tutor?.user?.name || '-',
    },
    {
      field: 'experienceHours',
      headerName: 'Experience (hrs)',
      width: 140,
      type: 'number',
      renderCell: (params: any) => Number(params?.row?.tutor?.experienceHours ?? 0),
    },
    {
      field: 'subjects',
      headerName: 'Subjects',
      width: 200,
      renderCell: (params: any) => (params?.row?.tutor?.subjects || []).join(', '),
    },
    {
      field: 'classesCompleted',
      headerName: 'Classes Completed',
      width: 160,
      type: 'number',
      renderCell: (params: any) => Number(params?.row?.classesCompleted ?? 0),
    },
    {
      field: 'totalRevenue',
      headerName: 'Revenue (₹)',
      width: 140,
      type: 'number',
      renderCell: (params: any) => `₹${Number(params?.row?.totalRevenue ?? 0).toLocaleString()}`,
    },
    {
      field: 'averageRating',
      headerName: 'Rating',
      width: 140,
      type: 'number',
      renderCell: (params: any) => (
        <Rating
          value={Number(params?.row?.averageRating ?? 0)}
          readOnly
          size="small"
          precision={0.1}
        />
      ),
    },
    {
      field: 'demoApprovalRatio',
      headerName: 'Demo Approval',
      width: 140,
      type: 'number',
      renderCell: (params: any) => `${Number(params?.row?.demoApprovalRatio ?? 0)}%`,
    },
    {
      field: 'attendanceApprovalRate',
      headerName: 'Attendance Approval',
      width: 170,
      type: 'number',
      renderCell: (params: any) => `${Number(params?.row?.attendanceApprovalRate ?? 0)}%`,
    },
    {
      field: 'verificationStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params: any) => {
        const status = params?.row?.tutor?.verificationStatus || 'UNKNOWN';
        return <Chip label={status} size="small" color={status === 'VERIFIED' ? 'success' : 'default'} />;
      },
    },
  ];

  const handleSortChange = (model: GridSortModel) => {
    if (model.length > 0) onSortChange(model[0].field, (model[0].sort as 'asc' | 'desc') || undefined);
    else onSortChange(undefined, undefined);
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" mb={2}>Tutor Progress Report</Typography>
        {isXs ? (
          <Stack spacing={1.25}>
            {tutors.map((row) => (
              <Card key={row.tutor.id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>{row.tutor.user.name}</Typography>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Classes</Typography>
                      <div>{row.classesCompleted}</div>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Revenue</Typography>
                      <div>₹{Number(row.totalRevenue || 0).toLocaleString()}</div>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Rating</Typography>
                      <Box><Rating value={Number(row.averageRating || 0)} readOnly size="small" precision={0.1} /></Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Experience</Typography>
                      <div>{row.tutor.experienceHours || 0} hrs</div>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 1 }} />
                  <Chip size="small" label={row.tutor.verificationStatus} color={row.tutor.verificationStatus === 'VERIFIED' ? 'success' : 'default'} />
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <div style={{ width: '100%' }}>
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
              sx={{ border: 'none' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TutorProgressTable;
