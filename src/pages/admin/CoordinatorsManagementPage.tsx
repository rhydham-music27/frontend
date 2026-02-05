import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Checkbox,
  TableSortLabel,
  Select,
  MenuItem,
  Link,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CreateCoordinatorModal from '../../components/admin/CreateCoordinatorModal';
import EditCoordinatorModal from '../../components/admin/EditCoordinatorModal';
import coordinatorService from '../../services/coordinatorService';
import { ICoordinator, IUser } from '../../types';

const CoordinatorsManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const [coordinators, setCoordinators] = useState<ICoordinator[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState<ICoordinator | null>(null);
  const [coordinatorToDelete, setCoordinatorToDelete] = useState<ICoordinator | null>(null);
  const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    isActive: 'all' as 'all' | 'active' | 'inactive',
    hasCapacity: 'all' as 'all' | 'yes' | 'no',
    search: '',
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const loadCoordinators = useCallback(async (p = page, l = rowsPerPage) => {
    setLoading(true);
    try {
      const isActiveValue = debouncedFilters.isActive === 'all' ? undefined : debouncedFilters.isActive === 'active';
      const hasCapacityValue = debouncedFilters.hasCapacity === 'all' ? undefined : debouncedFilters.hasCapacity === 'yes';
      
      const res = await coordinatorService.getCoordinators(
        p + 1, 
        l, 
        isActiveValue, 
        hasCapacityValue, 
        sortBy, 
        sortOrder,
        debouncedFilters.name || undefined,
        debouncedFilters.email || undefined,
        debouncedFilters.phone || undefined,
        debouncedFilters.specialization || undefined,
        debouncedFilters.search || undefined
      );
      setCoordinators(res.data as unknown as ICoordinator[]);
      setTotal(res.pagination.total);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load coordinators');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedFilters, sortBy, sortOrder]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (columnId: string) => {
    const isAsc = sortBy === columnId && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(columnId);
  };

  const loadEligibleUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await coordinatorService.getEligibleCoordinatorUsers();
      const mapped = (data as any[]).map((u: any) => ({
        id: u.id || u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as IUser[];
      setUsers(mapped);
    } catch (e: any) {
      setError('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEligibleUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCoordinators(page, rowsPerPage);
  }, [loadCoordinators, page, rowsPerPage]);

  const handleCreateCoordinator = useCallback(async (payload: { userId: string; maxClassCapacity?: number; specialization?: string[] }) => {
    try {
      await coordinatorService.createCoordinator(payload);
      setSnackbar({ open: true, message: 'Coordinator profile created successfully', severity: 'success' });
      setCreateModalOpen(false);
      loadCoordinators();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to create coordinator';
      setSnackbar({ open: true, message: msg, severity: 'error' });
      throw e;
    }
  }, [loadCoordinators]);

  const handleEditCoordinator = useCallback(async (coordinatorId: string, updateData: { maxClassCapacity?: number; specialization?: string[]; isActive?: boolean }) => {
    try {
      await coordinatorService.updateCoordinator(coordinatorId, updateData);
      setSnackbar({ open: true, message: 'Coordinator profile updated successfully', severity: 'success' });
      setEditModalOpen(false);
      setSelectedCoordinator(null);
      loadCoordinators();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update coordinator';
      setSnackbar({ open: true, message: msg, severity: 'error' });
      throw e;
    }
  }, [loadCoordinators]);

  const handleDeleteCoordinator = useCallback(async (coordinatorId: string) => {
    try {
      setConfirmLoading(true);
      await coordinatorService.deleteCoordinator(coordinatorId);
      setSnackbar({ open: true, message: 'Coordinator profile deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setCoordinatorToDelete(null);
      const nextPage = coordinators.length === 1 && page > 0 ? page - 1 : page;
      await loadCoordinators(nextPage, rowsPerPage);
      setPage(nextPage);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Cannot delete coordinator with active classes';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setConfirmLoading(false);
    }
  }, [loadCoordinators, coordinators.length, page, rowsPerPage]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = coordinators.map((c) => c.id);
      setSelectedCoordinators(allIds);
    } else {
      setSelectedCoordinators([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedCoordinators((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    let success = 0;
    let failed = 0;
    for (const id of selectedCoordinators) {
      try {
        await coordinatorService.deleteCoordinator(id);
        success++;
      } catch {
        failed++;
      }
    }
    setBulkLoading(false);
    setBulkDialogOpen(false);
    setSelectedCoordinators([]);
    await loadCoordinators(page, rowsPerPage);
    setSnackbar({ open: true, message: `Deleted ${success} coordinator(s). ${failed ? failed + ' failed.' : ''}`, severity: failed ? 'info' : 'success' });
  };

  // const totalPages = Math.ceil(total / rowsPerPage) || 1;

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #4A148C 0%, #311B92 100%)',
          color: 'white',
          py: { xs: 4, md: 5 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Coordinators Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
               Oversee coordinator profiles, track active classes, and manage capacity.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/register?role=COORDINATOR')}
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
          >
            Create Coordinator
          </Button>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Tabs 
            value={filters.isActive === 'active' ? 1 : filters.isActive === 'inactive' ? 2 : 0} 
            onChange={(_, v) => {
               const status = v === 1 ? 'active' : v === 2 ? 'inactive' : 'all';
               setFilters(prev => ({ ...prev, isActive: status }));
            }}
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
              '& .Mui-selected': { color: '#fff !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 4 }
            }}
          >
            <Tab label="All Coordinators" />
            <Tab label="Active" />
            <Tab label="Inactive" />
          </Tabs>
        </Box>
        
        {/* Abstract shapes */}
        <Box sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -50,
          left: 100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>

      {error && <Box mb={2}><ErrorAlert error={error} /></Box>}

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                placeholder="Global search by name, email or phone" 
                size="small"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{ 
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }} 
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={() => setFilters({ name: '', email: '', phone: '', specialization: '', isActive: 'all', hasCapacity: 'all', search: '' })}>Reset Filters</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedCoordinators.length > 0 && (
        <Box bgcolor="primary.light" p={2} borderRadius={1} mb={2} display="flex" alignItems="center" justifyContent="space-between">
          <Typography>{selectedCoordinators.length} coordinator(s) selected</Typography>
          <Box display="flex" gap={1}>
            <Button color="error" variant="contained" onClick={() => setBulkDialogOpen(true)}>Bulk Delete</Button>
            <Button variant="outlined" onClick={() => setSelectedCoordinators([])}>Clear Selection</Button>
          </Box>
        </Box>
      )}

      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          width: '100%', 
          overflowX: 'auto',
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main', '& th': { color: 'white', fontWeight: 700 } }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedCoordinators.length > 0 && selectedCoordinators.length < coordinators.length}
                    checked={coordinators.length > 0 && selectedCoordinators.length === coordinators.length}
                    onChange={handleSelectAll}
                    sx={{ color: 'white!important' }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'inherit' }}><TableSortLabel active={sortBy === 'name'} direction={sortBy === 'name' ? sortOrder : 'asc'} onClick={() => handleSort('name')} sx={{ '&.Mui-active': { color: 'inherit!important' }, '& .MuiTableSortLabel-icon': { color: 'inherit!important' }, '&:hover': { color: 'inherit' } }}>Name</TableSortLabel></TableCell>
                <TableCell sx={{ color: 'inherit' }}>Email</TableCell>
                <TableCell sx={{ color: 'inherit' }}>Specialization</TableCell>
                <TableCell align="right" sx={{ color: 'inherit' }}><TableSortLabel active={sortBy === 'activeClassesCount'} direction={sortBy === 'activeClassesCount' ? sortOrder : 'asc'} onClick={() => handleSort('activeClassesCount')} sx={{ '&.Mui-active': { color: 'inherit!important' }, '& .MuiTableSortLabel-icon': { color: 'inherit!important' }, '&:hover': { color: 'inherit' } }}>Active Classes</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ color: 'inherit' }}><TableSortLabel active={sortBy === 'totalClassesHandled'} direction={sortBy === 'totalClassesHandled' ? sortOrder : 'asc'} onClick={() => handleSort('totalClassesHandled')} sx={{ '&.Mui-active': { color: 'inherit!important' }, '& .MuiTableSortLabel-icon': { color: 'inherit!important' }, '&:hover': { color: 'inherit' } }}>Total Classes</TableSortLabel></TableCell>
                <TableCell align="right" sx={{ color: 'inherit' }}>Max Capacity</TableCell>
                <TableCell align="right" sx={{ color: 'inherit' }}>Available</TableCell>
                <TableCell align="right" sx={{ color: 'inherit' }}><TableSortLabel active={sortBy === 'performanceScore'} direction={sortBy === 'performanceScore' ? sortOrder : 'asc'} onClick={() => handleSort('performanceScore')} sx={{ '&.Mui-active': { color: 'inherit!important' }, '& .MuiTableSortLabel-icon': { color: 'inherit!important' }, '&:hover': { color: 'inherit' } }}>Performance</TableSortLabel></TableCell>
                <TableCell sx={{ color: 'inherit' }}><TableSortLabel active={sortBy === 'isActive'} direction={sortBy === 'isActive' ? sortOrder : 'asc'} onClick={() => handleSort('isActive')} sx={{ '&.Mui-active': { color: 'inherit!important' }, '& .MuiTableSortLabel-icon': { color: 'inherit!important' }, '&:hover': { color: 'inherit' } }}>Status</TableSortLabel></TableCell>
                <TableCell sx={{ color: 'inherit' }}>Actions</TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell />
                <TableCell>
                  <TextField size="small" variant="standard" placeholder="Filter Name" value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} InputProps={{ sx: { fontSize: '0.8125rem' } }} />
                </TableCell>
                <TableCell>
                  <TextField size="small" variant="standard" placeholder="Filter Email" value={filters.email} onChange={(e) => handleFilterChange('email', e.target.value)} InputProps={{ sx: { fontSize: '0.8125rem' } }} />
                </TableCell>
                <TableCell>
                  <TextField size="small" variant="standard" placeholder="Filter Spec" value={filters.specialization} onChange={(e) => handleFilterChange('specialization', e.target.value)} InputProps={{ sx: { fontSize: '0.8125rem' } }} />
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell>
                  <Select variant="standard" value={filters.hasCapacity} onChange={(e) => handleFilterChange('hasCapacity', e.target.value)} displayEmpty sx={{ fontSize: '0.8125rem', minWidth: 80 }}>
                    <MenuItem value="all"><em>Any</em></MenuItem>
                    <MenuItem value="yes">Has Cap</MenuItem>
                    <MenuItem value="no">Full</MenuItem>
                  </Select>
                </TableCell>
                <TableCell />
                <TableCell>
                  <Select variant="standard" value={filters.isActive} onChange={(e) => handleFilterChange('isActive', e.target.value)} displayEmpty sx={{ fontSize: '0.8125rem', minWidth: 80 }}>
                    <MenuItem value="all"><em>Any</em></MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 3 }}><LoadingSpinner /></TableCell></TableRow>
              ) : coordinators.length === 0 ? (
                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 3 }}><Typography color="text.secondary">No coordinators found</Typography></TableCell></TableRow>
              ) : (
                coordinators.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedCoordinators.includes(c.id)} onChange={() => handleSelectOne(c.id)} />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: '0.875rem' }}>
                          {(c.user?.name || 'C').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Link component={RouterLink} to={`/coordinator-profile/${c.id || (c as any)._id}`} sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            <Typography variant="body2" fontWeight={500}>{c.user?.name}</Typography>
                          </Link>
                          <Typography variant="caption" color="text.secondary" display="block">{c.user?.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{c.user?.email}</TableCell>
                    <TableCell>
                       <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(c.specialization || []).map(s => <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderRadius: 1 }} />)}
                       </Box>
                    </TableCell>
                    <TableCell align="right">{c.activeClassesCount}</TableCell>
                    <TableCell align="right">{c.totalClassesHandled}</TableCell>
                    <TableCell align="right">{c.maxClassCapacity}</TableCell>
                    <TableCell align="right">
                      <Chip label={c.availableCapacity} color={c.availableCapacity > 0 ? 'success' : 'error'} size="small" variant={c.availableCapacity > 0 ? 'filled' : 'outlined'} />
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={c.performanceScore} color={c.performanceScore > 80 ? 'success' : c.performanceScore > 60 ? 'warning' : 'error'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'success' : 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => { setSelectedCoordinator(c); setEditModalOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => { setCoordinatorToDelete(c); setDeleteDialogOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />


      <CreateCoordinatorModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        users={users}
        usersLoading={usersLoading}
        onCreate={handleCreateCoordinator}
      />

      <EditCoordinatorModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedCoordinator(null); }}
        coordinator={selectedCoordinator}
        onUpdate={handleEditCoordinator}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setCoordinatorToDelete(null); }}
        onConfirm={async () => { if (coordinatorToDelete) { await handleDeleteCoordinator(coordinatorToDelete.id); } }}
        title="Delete Coordinator Profile"
        message={`Are you sure you want to delete ${coordinatorToDelete?.user?.name}'s coordinator profile? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
        loading={confirmLoading}
      />

      <ConfirmDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Coordinators"
        message={`Are you sure you want to delete ${selectedCoordinators.length} coordinator(s)? This action cannot be undone.`}
        confirmText={bulkLoading ? 'Deleting...' : 'Delete'}
        severity="error"
        loading={bulkLoading}
      />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default CoordinatorsManagementPage;
