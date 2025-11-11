import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, TextField, Button, Grid, Autocomplete, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Paper, Chip, Stack, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { createCoordinator, getEligibleCoordinatorUsers, getCoordinators } from '../../services/coordinatorService';
import { IUser } from '../../types';

const CoordinatorsPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [users, setUsers] = useState<IUser[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [maxClassCapacity, setMaxClassCapacity] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const loadCoordinators = async (p = 0, l = 10) => {
    setTableLoading(true);
    try {
      const res = await getCoordinators(p + 1, l);
      setRows(res.data as any[]);
      setTotal(res.pagination.total);
    } catch (e) {
      // silent
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const { data } = await getEligibleCoordinatorUsers();
        // Ensure each has id field; backend returns _id implicitly, but our select likely maps to id via toJSON. Fallback mapping if needed.
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
        setError('Failed to load users');
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
    loadCoordinators(page, rowsPerPage);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // refresh list
      loadCoordinators(page, rowsPerPage);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to create coordinator';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Coordinators</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create Coordinator Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select a user with role COORDINATOR to create their coordinator profile.
          </Typography>
          {error && <ErrorAlert error={error} />}
          <Box component="form" onSubmit={onSubmit}>
            <Grid container spacing={2}>
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
                      placeholder="Search by name/email"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      required
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Class Capacity"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={maxClassCapacity}
                  onChange={(e) => setMaxClassCapacity(Number(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Coordinator'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Existing Coordinators
        </Typography>
        {isXs ? (
          <Stack spacing={1.25}>
            {tableLoading ? (
              <Typography align="center" color="text.secondary">Loading...</Typography>
            ) : rows.length === 0 ? (
              <Typography align="center" color="text.secondary">No coordinators found</Typography>
            ) : (
              rows.map((c: any) => (
                <Card key={c.id || c._id} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>{c.user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{c.user?.email}</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Active</Typography>
                        <div>{c.activeClassesCount ?? 0}</div>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Total</Typography>
                        <div>{c.totalClassesHandled ?? 0}</div>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 1 }} />
                    <Chip size="small" label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'success' : 'default'} />
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        ) : (
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Active Classes</TableCell>
                    <TableCell align="right">Total Classes</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center"><CircularProgress size={22} /></TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No coordinators found</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((c: any) => (
                      <TableRow key={c.id || c._id} hover>
                        <TableCell>{c.user?.name}</TableCell>
                        <TableCell>{c.user?.email}</TableCell>
                        <TableCell align="right">{c.activeClassesCount ?? 0}</TableCell>
                        <TableCell align="right">{c.totalClassesHandled ?? 0}</TableCell>
                        <TableCell>
                          <Chip size="small" label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'success' : 'default'} />
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
              onRowsPerPageChange={(e) => { const newSize = parseInt(e.target.value, 10); setRowsPerPage(newSize); setPage(0); loadCoordinators(0, newSize); }}
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default CoordinatorsPage;
