import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Stack,
  Divider,
  IconButton,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

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

  const [searchQuery, setSearchQuery] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [hasCapacityFilter, setHasCapacityFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useMemo(() => {
    let timer: any;
    return (q: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSearchQuery(q);
      }, 500);
    };
  }, []);

  const loadCoordinators = useCallback(async (p = page, l = rowsPerPage) => {
    setLoading(true);
    try {
      const filters: any = {};
      if (isActiveFilter !== 'all') filters.isActive = isActiveFilter === 'active';
      if (hasCapacityFilter !== 'all') filters.hasCapacity = hasCapacityFilter === 'yes';
      if (searchQuery) filters.search = searchQuery;
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;
      const res = await coordinatorService.getCoordinators(p + 1, l, filters.isActive, filters.hasCapacity, filters.sortBy, filters.sortOrder);
      setCoordinators(res.data as unknown as ICoordinator[]);
      setTotal(res.pagination.total);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load coordinators');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, isActiveFilter, hasCapacityFilter, searchQuery, sortBy, sortOrder]);

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
    loadCoordinators(0, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(0);
    loadCoordinators(0, rowsPerPage);
  }, [isActiveFilter, hasCapacityFilter, searchQuery, sortBy, sortOrder, rowsPerPage]);

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

  const totalPages = Math.ceil(total / rowsPerPage) || 1;

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Coordinators Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)}>Create Coordinator</Button>
      </Box>

      {error && <Box mb={2}><ErrorAlert error={error} /></Box>}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth placeholder="Search by name or email" InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }} onChange={(e) => debouncedSearch(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select label="Status" fullWidth value={isActiveFilter} onChange={(e) => setIsActiveFilter(e.target.value as any)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select label="Capacity" fullWidth value={hasCapacityFilter} onChange={(e) => setHasCapacityFilter(e.target.value as any)}>
                <option value="all">All</option>
                <option value="yes">Has Capacity</option>
                <option value="no">No Capacity</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={() => { setHasCapacityFilter('all'); setIsActiveFilter('all'); setSearchQuery(''); }}>Clear</Button>
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

      {!isXs ? (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedCoordinators.length > 0 && selectedCoordinators.length < coordinators.length}
                      checked={coordinators.length > 0 && selectedCoordinators.length === coordinators.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell align="right">Active Classes</TableCell>
                  <TableCell align="right">Total Classes</TableCell>
                  <TableCell align="right">Max Capacity</TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="right">Performance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center"><CircularProgress size={24} /></TableCell>
                  </TableRow>
                ) : coordinators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">No coordinators found</TableCell>
                  </TableRow>
                ) : (
                  coordinators.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedCoordinators.includes(c.id)} onChange={() => handleSelectOne(c.id)} />
                      </TableCell>
                      <TableCell>{c.user?.name}</TableCell>
                      <TableCell>{c.user?.email}</TableCell>
                      <TableCell>{c.specialization?.join(', ') || '-'}</TableCell>
                      <TableCell align="right">{c.activeClassesCount}</TableCell>
                      <TableCell align="right">{c.totalClassesHandled}</TableCell>
                      <TableCell align="right">{c.maxClassCapacity}</TableCell>
                      <TableCell align="right">
                        <Chip label={c.availableCapacity} color={c.availableCapacity > 0 ? 'success' : 'error'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={c.performanceScore} color={c.performanceScore > 80 ? 'success' : c.performanceScore > 60 ? 'warning' : 'error'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => { setSelectedCoordinator(c); setEditModalOpen(true); }} aria-label="Edit coordinator"><EditIcon /></IconButton>
                        <IconButton onClick={() => { setCoordinatorToDelete(c); setDeleteDialogOpen(true); }} aria-label="Delete coordinator" color="error"><DeleteIcon /></IconButton>
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
            onPageChange={(_e, newPage) => { setPage(newPage); loadCoordinators(newPage, rowsPerPage); }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { const v = parseInt(e.target.value, 10); setRowsPerPage(v); setPage(0); loadCoordinators(0, v); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {loading ? <LoadingSpinner /> : coordinators.length === 0 ? (
            <Typography>No coordinators found</Typography>
          ) : coordinators.map((c) => (
            <Card key={c.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Checkbox checked={selectedCoordinators.includes(c.id)} onChange={() => handleSelectOne(c.id)} />
                    <Typography variant="subtitle1" fontWeight={600}>{c.user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{c.user?.email}</Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton onClick={() => { setSelectedCoordinator(c); setEditModalOpen(true); }}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => { setCoordinatorToDelete(c); setDeleteDialogOpen(true); }}><DeleteIcon /></IconButton>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="body2">Capacity: {c.activeClassesCount}/{c.maxClassCapacity}</Typography></Grid>
                  <Grid item xs={6}><Chip label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'success' : 'default'} size="small" /></Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {(c.specialization || []).map((s) => (
                        <Chip key={s} label={s} size="small" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={6}><Typography variant="body2">Performance: {c.performanceScore}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">Available: {c.availableCapacity}</Typography></Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          <Box display="flex" justifyContent="center" mt={2}>
            <Typography>Page {page + 1} of {totalPages}</Typography>
          </Box>
        </Stack>
      )}

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
