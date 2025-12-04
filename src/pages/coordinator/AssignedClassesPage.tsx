import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Card, TextField, MenuItem, Button, Grid, Pagination, CircularProgress, Stack, Badge, IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useNavigate } from 'react-router-dom';
import ClassDetailCard from '../../components/coordinator/ClassDetailCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { getAssignedClasses } from '../../services/coordinatorService';
import api from '../../services/api';
import { IFinalClass } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';

const AssignedClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status?: string; subject?: string; grade?: string; page: number; limit: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }>({ page: 1, limit: 9 });
  const [pagination, setPagination] = useState<{ total: number; pages: number }>({ total: 0, pages: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count += 1;
    if (filters.subject) count += 1;
    if (filters.grade) count += 1;
    return count;
  }, [filters]);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAssignedClasses(filters.page, filters.limit, filters.status, filters.subject, filters.grade, filters.sortBy, filters.sortOrder);
      // expecting res to be PaginatedResponse<IFinalClass[]>
      const data = (res as any).data as IFinalClass[];
      const pag = (res as any).pagination || { total: data?.length || 0, pages: Math.ceil((data?.length || 0) / filters.limit) };
      setClasses(Array.isArray(data) ? data : []);
      setPagination({ total: pag.total || 0, pages: pag.pages || 0 });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to load assigned classes';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleStatusChange = (status: string) => setFilters((f) => ({ ...f, status: status || undefined, page: 1 }));
  const handleSubjectChange = (subject: string) => setFilters((f) => ({ ...f, subject: subject || undefined, page: 1 }));
  const handleGradeChange = (grade: string) => setFilters((f) => ({ ...f, grade: grade || undefined, page: 1 }));
  const handleClearFilters = () => setFilters({ page: 1, limit: 9 });
  const handlePageChange = (_: any, page: number) => setFilters((f) => ({ ...f, page }));
  const handleRefresh = () => fetchClasses();
  const handleViewDetails = (classId: string) => navigate(`/classes/${classId}`);
  const handleGenerateAdvancePayment = async (classId: string) => {
    try {
      setError(null);
      await api.post(`/api/payments/class/${classId}/advance`);
      setSnackbar({ open: true, message: 'Advance payment created successfully', severity: 'success' });
      // Optionally refresh classes to update any payment metrics
      fetchClasses();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to create advance payment';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };
  const handleToggleView = () => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'));

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">My Assigned Classes</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton aria-label="refresh" onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <IconButton aria-label="toggle-view" onClick={handleToggleView}>
            {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
          </IconButton>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              size="small"
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={FINAL_CLASS_STATUS.ACTIVE}>Active</MenuItem>
              <MenuItem value={FINAL_CLASS_STATUS.COMPLETED}>Completed</MenuItem>
              <MenuItem value={FINAL_CLASS_STATUS.PAUSED}>Paused</MenuItem>
              <MenuItem value={FINAL_CLASS_STATUS.CANCELLED}>Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Subject"
              placeholder="Filter by subject"
              size="small"
              value={filters.subject || ''}
              onChange={(e) => handleSubjectChange(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Grade"
              placeholder="Filter by grade"
              size="small"
              value={filters.grade || ''}
              onChange={(e) => handleGradeChange(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} display="flex" alignItems="center" justifyContent="flex-end">
            <Badge color="primary" badgeContent={activeFilterCount} invisible={activeFilterCount === 0}>
              <Button variant="outlined" startIcon={<FilterListIcon />} onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Badge>
          </Grid>
        </Grid>
      </Card>

      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {classes.length} of {pagination.total} classes
        </Typography>
        {loading && classes.length > 0 ? <CircularProgress size={18} /> : null}
      </Box>

      {error ? <ErrorAlert error={error} onClose={() => setError(null)} /> : null}

      {loading && classes.length === 0 ? (
        <LoadingSpinner />
      ) : classes.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">No classes found</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Try adjusting your filters or check back later</Typography>
          {activeFilterCount > 0 ? (
            <Button variant="outlined" onClick={handleClearFilters} startIcon={<FilterListIcon />}>Clear Filters</Button>
          ) : null}
        </Box>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={2} mt={1}>
              {classes.map((cls) => (
                <Grid item xs={12} sm={6} md={4} key={cls.id}>
                  <ClassDetailCard
                    finalClass={cls}
                    onViewDetails={handleViewDetails}
                    onGenerateAdvancePayment={handleGenerateAdvancePayment}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box mt={1}>
              {classes.map((cls) => (
                <ClassDetailCard
                  key={cls.id}
                  finalClass={cls}
                  onViewDetails={handleViewDetails}
                  onGenerateAdvancePayment={handleGenerateAdvancePayment}
                />
              ))}
            </Box>
          )}

          {pagination.pages > 1 ? (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination color="primary" count={pagination.pages} page={filters.page} onChange={handlePageChange} size="large" />
            </Box>
          ) : null}
        </>
      )}

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default AssignedClassesPage;
