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
import CreateManagerModal from '../../components/admin/CreateManagerModal';
import EditManagerModal from '../../components/admin/EditManagerModal';
import managerService from '../../services/managerService';
import { IManager, IUser } from '../../types';

const ManagersManagementPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [managers, setManagers] = useState<IManager[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedManager, setSelectedManager] = useState<IManager | null>(null);
  const [managerToDelete, setManagerToDelete] = useState<IManager | null>(null);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);

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
  const [departmentFilter, setDepartmentFilter] = useState('');
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

  const loadManagers = useCallback(async (p = page, l = rowsPerPage) => {
    setLoading(true);
    try {
      const filters: any = {};
      if (isActiveFilter !== 'all') filters.isActive = isActiveFilter === 'active';
      if (departmentFilter) filters.department = departmentFilter;
      if (searchQuery) filters.search = searchQuery;
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;
      const res = await managerService.getAllManagers(p + 1, l, filters.isActive, filters.department, filters.sortBy, filters.sortOrder);
      setManagers(res.data as unknown as IManager[]);
      setTotal(res.pagination.total);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load managers');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, isActiveFilter, departmentFilter, searchQuery, sortBy, sortOrder]);

  const loadEligibleUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await managerService.getEligibleManagerUsers();
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
    loadManagers(0, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(0);
    loadManagers(0, rowsPerPage);
  }, [isActiveFilter, departmentFilter, searchQuery, sortBy, sortOrder, rowsPerPage]);

  const handleCreateManager = useCallback(async (payload: { userId: string; department?: string }) => {
    try {
      await managerService.createManagerProfile(payload);
      setSnackbar({ open: true, message: 'Manager profile created successfully', severity: 'success' });
      setCreateModalOpen(false);
      loadManagers();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to create manager';
      setSnackbar({ open: true, message: msg, severity: 'error' });
      throw e;
    }
  }, [loadManagers]);

  const handleEditManager = useCallback(async (managerId: string, updateData: { department?: string; isActive?: boolean }) => {
    try {
      await managerService.updateManagerProfile(managerId, updateData);
      setSnackbar({ open: true, message: 'Manager profile updated successfully', severity: 'success' });
      setEditModalOpen(false);
      setSelectedManager(null);
      loadManagers();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update manager';
      setSnackbar({ open: true, message: msg, severity: 'error' });
      throw e;
    }
  }, [loadManagers]);

  const handleDeleteManager = useCallback(async (managerId: string) => {
    try {
      setConfirmLoading(true);
      await managerService.deleteManagerProfile(managerId);
      setSnackbar({ open: true, message: 'Manager profile deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setManagerToDelete(null);
      const nextPage = managers.length === 1 && page > 0 ? page - 1 : page;
      await loadManagers(nextPage, rowsPerPage);
      setPage(nextPage);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Cannot delete manager with existing records';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setConfirmLoading(false);
    }
  }, [loadManagers, managers.length, page, rowsPerPage]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = managers.map((m) => m.id);
      setSelectedManagers(allIds);
    } else {
      setSelectedManagers([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedManagers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    let success = 0;
    let failed = 0;
    for (const id of selectedManagers) {
      try {
        await managerService.deleteManagerProfile(id);
        success++;
      } catch {
        failed++;
      }
    }
    setBulkLoading(false);
    setBulkDialogOpen(false);
    setSelectedManagers([]);
    await loadManagers(page, rowsPerPage);
    setSnackbar({ open: true, message: `Deleted ${success} manager(s). ${failed ? failed + ' failed.' : ''}`, severity: failed ? 'info' : 'success' });
  };

  const totalPages = Math.ceil(total / rowsPerPage) || 1;

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Managers Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)}>Create Manager</Button>
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
              <TextField label="Department" fullWidth value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={() => { setDepartmentFilter(''); setIsActiveFilter('all'); setSearchQuery(''); }}>Clear</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedManagers.length > 0 && (
        <Box bgcolor="primary.light" p={2} borderRadius={1} mb={2} display="flex" alignItems="center" justifyContent="space-between">
          <Typography>{selectedManagers.length} manager(s) selected</Typography>
          <Box display="flex" gap={1}>
            <Button color="error" variant="contained" onClick={() => setBulkDialogOpen(true)}>Bulk Delete</Button>
            <Button variant="outlined" onClick={() => setSelectedManagers([])}>Clear Selection</Button>
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
                      indeterminate={selectedManagers.length > 0 && selectedManagers.length < managers.length}
                      checked={managers.length > 0 && selectedManagers.length === managers.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Leads Created</TableCell>
                  <TableCell align="right">Classes Converted</TableCell>
                  <TableCell align="right">Revenue Generated</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center"><CircularProgress size={24} /></TableCell>
                  </TableRow>
                ) : managers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">No managers found</TableCell>
                  </TableRow>
                ) : (
                  managers.map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedManagers.includes(m.id)} onChange={() => handleSelectOne(m.id)} />
                      </TableCell>
                      <TableCell>{m.user?.name}</TableCell>
                      <TableCell>{m.user?.email}</TableCell>
                      <TableCell>{m.department || '-'}</TableCell>
                      <TableCell align="right">{m.classLeadsCreated}</TableCell>
                      <TableCell align="right">{m.classesConverted}</TableCell>
                      <TableCell align="right">₹{Number(m.revenueGenerated || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={m.isActive ? 'Active' : 'Inactive'} color={m.isActive ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => { setSelectedManager(m); setEditModalOpen(true); }} aria-label="Edit manager"><EditIcon /></IconButton>
                        <IconButton onClick={() => { setManagerToDelete(m); setDeleteDialogOpen(true); }} aria-label="Delete manager" color="error"><DeleteIcon /></IconButton>
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
            onPageChange={(_e, newPage) => { setPage(newPage); loadManagers(newPage, rowsPerPage); }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { const v = parseInt(e.target.value, 10); setRowsPerPage(v); setPage(0); loadManagers(0, v); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {loading ? <LoadingSpinner /> : managers.length === 0 ? (
            <Typography>No managers found</Typography>
          ) : managers.map((m) => (
            <Card key={m.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Checkbox checked={selectedManagers.includes(m.id)} onChange={() => handleSelectOne(m.id)} />
                    <Typography variant="subtitle1" fontWeight={600}>{m.user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{m.user?.email}</Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton onClick={() => { setSelectedManager(m); setEditModalOpen(true); }}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => { setManagerToDelete(m); setDeleteDialogOpen(true); }}><DeleteIcon /></IconButton>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="body2">Department: {m.department || '-'}</Typography></Grid>
                  <Grid item xs={6}><Chip label={m.isActive ? 'Active' : 'Inactive'} color={m.isActive ? 'success' : 'default'} size="small" /></Grid>
                  <Grid item xs={4}><Typography variant="body2">Leads: {m.classLeadsCreated}</Typography></Grid>
                  <Grid item xs={4}><Typography variant="body2">Converted: {m.classesConverted}</Typography></Grid>
                  <Grid item xs={4}><Typography variant="body2">Revenue: ₹{Number(m.revenueGenerated || 0).toLocaleString()}</Typography></Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          <Box display="flex" justifyContent="center" mt={2}>
            <Typography>Page {page + 1} of {totalPages}</Typography>
          </Box>
        </Stack>
      )}

      <CreateManagerModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        users={users}
        usersLoading={usersLoading}
        onCreate={handleCreateManager}
      />

      <EditManagerModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedManager(null); }}
        manager={selectedManager}
        onUpdate={handleEditManager}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setManagerToDelete(null); }}
        onConfirm={async () => { if (managerToDelete) { await handleDeleteManager(managerToDelete.id); } }}
        title="Delete Manager Profile"
        message={`Are you sure you want to delete ${managerToDelete?.user?.name}'s manager profile? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
        loading={confirmLoading}
      />

      <ConfirmDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Managers"
        message={`Are you sure you want to delete ${selectedManagers.length} manager(s)? This action cannot be undone.`}
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

export default ManagersManagementPage;
