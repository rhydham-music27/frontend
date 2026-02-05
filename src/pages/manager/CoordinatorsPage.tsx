
import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, TextField, Button, Grid, Autocomplete, CircularProgress, Paper, Chip, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, useTheme, alpha, IconButton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { createCoordinator, getEligibleCoordinatorUsers, getCoordinators } from '../../services/coordinatorService';
import { IUser } from '../../types';

const CoordinatorsPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Data State
  const [users, setUsers] = useState<IUser[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [maxClassCapacity, setMaxClassCapacity] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  
  // Table State
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadCoordinators = async (p = 0, l = 10) => {
    setTableLoading(true);
    try {
      const res = await getCoordinators(p + 1, l);
      setRows(res.data as any[]);
      setTotal(res.pagination.total);
    } catch (e) {
      console.error(e);
    } finally {
      setTableLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await getEligibleCoordinatorUsers();
      const mapped = (data as any[]).map((u: any) => ({
        id: u.id || u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as IUser[];
      setUsers(mapped);
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Failed to load eligible users', severity: 'error' });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadCoordinators(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleOpenCreateDialog = () => {
      setCreateDialogOpen(true);
      loadUsers(); // Fetch users only when needed
  };

  const onSubmit = async () => {
    setError(null);
    if (!selectedUser?.id) {
      setError('Please select a user');
      return;
    }
    setLoading(true);
    try {
      await createCoordinator({ userId: selectedUser.id, maxClassCapacity });
      setSnackbar({ open: true, message: 'Coordinator created successfully', severity: 'success' });
      setSelectedUser(null);
      setMaxClassCapacity(10);
      setCreateDialogOpen(false);
      loadCoordinators(page, rowsPerPage); // Refresh list
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to create coordinator';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
       field: 'name',
       headerName: 'Coordinator',
       width: 250,
       renderCell: (params: any) => (
          <Box display="flex" alignItems="center" gap={1.5}>
             <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32, fontSize: 13 }}>
                {(params.row.user?.name || '?').charAt(0).toUpperCase()}
             </Avatar>
             <Box>
                 <Typography variant="body2" fontWeight={600}>{params.row.user?.name}</Typography>
                 <Typography variant="caption" color="text.secondary" display="block">{params.row.user?.email}</Typography>
             </Box>
          </Box>
       )
    },
    {
        field: 'activeClassesCount',
        headerName: 'Active Classes',
        width: 140,
        type: 'number',
        renderCell: (params) => (
             <Box display='flex' alignItems='center' gap={0.5}>
                 <SchoolIcon fontSize='small' color='primary' sx={{ opacity: 0.7 }} />
                 <Typography variant="body2" fontWeight={600}>{params.value || 0}</Typography>
             </Box>
        )
    },
    {
        field: 'totalClassesHandled',
        headerName: 'Total History',
        width: 140,
        type: 'number'
    },
    {
        field: 'isActive',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => (
            <Chip 
              size="small" 
              label={params.value ? 'Active' : 'Inactive'} 
              color={params.value ? 'success' : 'default'}
              variant={params.value ? 'filled' : 'outlined'}
            />
        )
    },
    // Adding Actions column for future extensibility (view details, edit)
    {
       field: 'actions',
       headerName: 'Actions',
       width: 100,
       sortable: false,
       renderCell: () => (
          <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
       )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ pb: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', // Cyan/Teal
          color: 'white',
          pt: { xs: 4, md: 5 },
          pb: { xs: 6, md: 8 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mt: 3,
          mb: -4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Coordinators
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage academic coordinators and their assignments.
                </Typography>
            </Box>
            <Box display="flex" gap={2}>
                 <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => loadCoordinators(page, rowsPerPage)}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                    sx={{ bgcolor: 'white', color: theme.palette.primary.main, '&:hover': { bgcolor: '#f0f9ff' } }}
                  >
                    Add Coordinator
                  </Button>
            </Box>
        </Box>
        
        {/* KPI Row (Overlapping) */}
        <Grid container spacing={3} sx={{ position: 'relative', top: 30 }}>
            <Grid item xs={12} md={4}>
               <Paper sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 3 }}>
                   <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, width: 56, height: 56 }}>
                       <PersonIcon fontSize="large" />
                   </Avatar>
                   <Box>
                       <Typography variant="h4" fontWeight={800} color="info.main">{total}</Typography>
                       <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Coordinators</Typography>
                   </Box>
               </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
               <Paper sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 3 }}>
                   <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, width: 56, height: 56 }}>
                       <SchoolIcon fontSize="large" />
                   </Avatar>
                   <Box>
                       <Typography variant="h4" fontWeight={800} color="success.main">
                           {rows.reduce((acc, curr) => acc + (curr.activeClassesCount || 0), 0)}
                       </Typography>
                       <Typography variant="body2" color="text.secondary" fontWeight={600}>Active Class Assignments</Typography>
                   </Box>
               </Paper>
            </Grid>
             <Grid item xs={12} md={4}>
               <Paper sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 3 }}>
                   <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, width: 56, height: 56 }}>
                       <CheckCircleIcon fontSize="large" />
                   </Avatar>
                   <Box>
                       <Typography variant="h4" fontWeight={800} color="warning.main">
                            {rows.filter(r => r.isActive).length}
                       </Typography>
                       <Typography variant="body2" color="text.secondary" fontWeight={600}>Active Profiles</Typography>
                   </Box>
               </Paper>
            </Grid>
        </Grid>
      </Box>

      {/* Main List */}
      <Box mt={10}>
         <Paper elevation={0} sx={{ p: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
             <DataGrid
                 rows={rows}
                 columns={columns}
                 getRowId={(row) => row.id || row._id}
                 rowCount={total}
                 paginationMode="server"
                 paginationModel={{ page, pageSize: rowsPerPage }}
                 onPaginationModelChange={(model) => { setPage(model.page); setRowsPerPage(model.pageSize); }}
                 loading={tableLoading}
                 autoHeight
                 pageSizeOptions={[10, 25, 50]}
                 disableRowSelectionOnClick
                 sx={{
                     border: 0,
                     '& .MuiDataGrid-columnHeaders': {
                         bgcolor: alpha(theme.palette.primary.main, 0.04),
                         fontWeight: 700
                     }
                 }}
             />
         </Paper>
      </Box>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Add New Coordinator</DialogTitle>
          <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" paragraph>
                 Select an existing user with the ORDINATOR role to activate their coordinator profile.
              </Typography>
              {error && <ErrorAlert error={error} />}
              
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12}>
                     <Autocomplete
                      options={users}
                      loading={usersLoading}
                      getOptionLabel={(option) => `${option.name} (${option.email})`}
                      value={selectedUser}
                      onChange={(_e, val) => setSelectedUser(val)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select User"
                          placeholder="Search by name or email"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Max Class Capacity"
                      type="number"
                      inputProps={{ min: 1 }}
                      value={maxClassCapacity}
                      onChange={(e) => setMaxClassCapacity(Number(e.target.value))}
                      fullWidth
                      helperText="Maximum number of classes this coordinator can manage simultaneously."
                    />
                  </Grid>
              </Grid>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={onSubmit} variant="contained" disabled={loading || !selectedUser}>
                  {loading ? 'Creating...' : 'Create Profile'}
              </Button>
          </DialogActions>
      </Dialog>
      
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default CoordinatorsPage;
