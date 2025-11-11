import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Grid,
  Tabs,
  Tab,
  Chip,
  Stack,
  Divider,
  IconButton,
  Checkbox,
  Tooltip,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PaymentUpdateModal from '../../components/payments/PaymentUpdateModal';
import ClassLeadStatusChip from '../../components/classLeads/ClassLeadStatusChip';
import PaymentStatusChip from '../../components/payments/PaymentStatusChip';
import AttendanceStatusChip from '../../components/attendance/AttendanceStatusChip';

import { getClassLeads, deleteClassLead } from '../../services/leadService';
import { getPayments, deletePayment } from '../../services/paymentService';
import { getAttendances, deleteAttendance } from '../../services/attendanceService';
import { getTutors, deleteTutorProfile } from '../../services/tutorService';

import {
  IClassLead,
  IPayment,
  IAttendance,
  ITutor,
  IFinalClass,
  PaginatedResponse,
} from '../../types';
import {
  CLASS_LEAD_STATUS,
  PAYMENT_STATUS,
  ATTENDANCE_STATUS,
  VERIFICATION_STATUS,
} from '../../constants';


type EntityType = 'ClassLead' | 'Payment' | 'Attendance' | 'Tutor' | 'FinalClass';

type Filters = Record<string, any>;

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

function formatDate(value: any): string {
  if (!value) return '';
  const v: any = (value?.toDate && typeof value.toDate === 'function') ? value.toDate() : value;
  const d = typeof v === 'string' ? new Date(v) : v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

function formatSubjects(subjects: any): string[] {
  if (!subjects) return [];
  if (Array.isArray(subjects)) return subjects.map(String);
  if (typeof subjects === 'string') return subjects.split(',').map(s => s.trim()).filter(Boolean);
  if (typeof subjects === 'object') {
    if (Array.isArray(subjects?.names)) return subjects.names.map(String);
    return Object.values(subjects).map(String);
  }
  return [];
}

const DataManagementPage: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [entityType, setEntityType] = useState<EntityType>('ClassLead');
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [filters, setFilters] = useState<Filters>({});

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [bulkUpdateModalOpen, setBulkUpdateModalOpen] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const bulkDeleteRecords = async (_entity: EntityType, _payload: { ids: string[] }) => {
    throw new Error('Bulk delete is not available yet');
  };

  const bulkUpdatePayments = async (_filter: any, _updateData: any) => {
    throw new Error('Bulk payment update is not available yet');
  };

  const ENTITY_CONFIG: Record<string, any> = useMemo(() => ({
    ClassLead: {
      label: 'Class Leads',
      service: { list: getClassLeads, delete: deleteClassLead },
      bulkDeleteSupported: true,
      bulkUpdateSupported: false,
      filters: ['status', 'search'],
    },
    Payment: {
      label: 'Payments',
      service: { list: getPayments, delete: deletePayment },
      bulkDeleteSupported: true,
      bulkUpdateSupported: true,
      filters: ['status', 'tutorId', 'finalClassId', 'fromDate', 'toDate'],
    },
    Attendance: {
      label: 'Attendance Records',
      service: { list: getAttendances, delete: deleteAttendance },
      bulkDeleteSupported: true,
      bulkUpdateSupported: false,
      filters: ['status', 'finalClassId', 'fromDate', 'toDate'],
    },
    Tutor: {
      label: 'Tutors',
      service: { list: getTutors, delete: deleteTutorProfile },
      bulkDeleteSupported: false,
      bulkUpdateSupported: false,
      filters: ['verificationStatus', 'isAvailable'],
    },
    FinalClass: {
      label: 'Final Classes',
      service: { list: null, delete: null },
      bulkDeleteSupported: false,
      bulkUpdateSupported: false,
      filters: ['status', 'coordinatorId', 'tutorId'],
    },
  }), []);

  const classLeadColumns: GridColDef[] = useMemo(() => [
    { field: 'studentName', headerName: 'Student', width: 180, valueGetter: (p: GridValueGetterParams) => (p as any).row?.studentName || (p as any).row?.student?.name },
    { field: 'grade', headerName: 'Grade', width: 100 },
    { field: 'subject', headerName: 'Subjects', width: 200, renderCell: (p: GridRenderCellParams) => (
      <Stack direction="row" spacing={0.5} sx={{ overflow: 'hidden' }}>
        {formatSubjects((p as any).row?.subject).slice(0, 3).map((s, i) => (
          <Chip key={`${(p as any).id}-sub-${i}`} size="small" label={s} />
        ))}
      </Stack>
    ) },
    { field: 'board', headerName: 'Board', width: 120, valueGetter: (p: GridValueGetterParams) => (p as any).row?.board || (p as any).row?.student?.board },
    { field: 'mode', headerName: 'Mode', width: 100 },
    { field: 'status', headerName: 'Status', width: 150, renderCell: (p: GridRenderCellParams) => <ClassLeadStatusChip status={(p as any).value} /> },
    { field: 'createdAt', headerName: 'Created', width: 140, valueGetter: (p: GridValueGetterParams) => formatDate((p as any).row?.createdAt) },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false, filterable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit"><span><IconButton size="small"><EditIcon fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Delete"><span><IconButton size="small" onClick={() => handleDeleteSingle(String((p as any).row?.id || (p as any).row?._id))}><DeleteIcon fontSize="small" /></IconButton></span></Tooltip>
        </Stack>
      )
    },
  ], []);

  const paymentColumns: GridColDef[] = useMemo(() => [
    { field: 'paymentDate', headerName: 'Date', width: 140, valueGetter: (p: GridValueGetterParams) => formatDate((p as any).row?.paymentDate) },
    { field: 'tutor', headerName: 'Tutor', width: 180, valueGetter: (p: GridValueGetterParams) => (p as any).row?.tutor?.name || (p as any).row?.tutorName },
    { field: 'finalClass', headerName: 'Class', width: 220, valueGetter: (p: GridValueGetterParams) => `${(p as any).row?.student?.name || (p as any).row?.studentName || ''} • ${formatSubjects((p as any).row?.subject).join('/')}` },
    { field: 'amount', headerName: 'Amount', width: 140, valueGetter: (p: GridValueGetterParams) => (p as any).row?.currency ? `${(p as any).row.currency} ${(p as any).row.amount}` : (p as any).row?.amount },
    { field: 'status', headerName: 'Status', width: 140, renderCell: (p: GridRenderCellParams) => <PaymentStatusChip status={(p as any).value} /> },
    { field: 'paymentMethod', headerName: 'Method', width: 140 },
    { field: 'dueDate', headerName: 'Due', width: 140, valueGetter: (p: GridValueGetterParams) => formatDate((p as any).row?.dueDate) },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false, filterable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit"><span><IconButton size="small"><EditIcon fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Delete"><span><IconButton size="small" onClick={() => handleDeleteSingle(String((p as any).row?.id || (p as any).row?._id))}><DeleteIcon fontSize="small" /></IconButton></span></Tooltip>
        </Stack>
      )
    },
  ], []);

  const attendanceColumns: GridColDef[] = useMemo(() => [
    { field: 'sessionDate', headerName: 'Date', width: 140, valueGetter: (p: GridValueGetterParams) => formatDate((p as any).row?.sessionDate) },
    { field: 'finalClass', headerName: 'Class', width: 220, valueGetter: (p: GridValueGetterParams) => `${(p as any).row?.student?.name || ''} • ${formatSubjects((p as any).row?.subject).join('/')}` },
    { field: 'tutor', headerName: 'Tutor', width: 180, valueGetter: (p: GridValueGetterParams) => (p as any).row?.tutor?.name },
    { field: 'status', headerName: 'Status', width: 150, renderCell: (p: GridRenderCellParams) => <AttendanceStatusChip status={(p as any).value} /> },
    { field: 'submittedBy', headerName: 'Submitted By', width: 180, valueGetter: (p: GridValueGetterParams) => (p as any).row?.submittedBy?.name },
    { field: 'submittedAt', headerName: 'Submitted At', width: 140, valueGetter: (p: GridValueGetterParams) => formatDate((p as any).row?.submittedAt) },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false, filterable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit"><span><IconButton size="small"><EditIcon fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Delete"><span><IconButton size="small" onClick={() => handleDeleteSingle(String((p as any).row?.id || (p as any).row?._id))}><DeleteIcon fontSize="small" /></IconButton></span></Tooltip>
        </Stack>
      )
    },
  ], []);

  const tutorColumns: GridColDef[] = useMemo(() => [
    { field: 'name', headerName: 'Name', width: 180, valueGetter: (p: GridValueGetterParams) => (p as any).row?.user?.name || (p as any).row?.name },
    { field: 'email', headerName: 'Email', width: 200, valueGetter: (p: GridValueGetterParams) => (p as any).row?.user?.email || (p as any).row?.email },
    { field: 'subjects', headerName: 'Subjects', width: 200, renderCell: (p: GridRenderCellParams) => (
      <Stack direction="row" spacing={0.5} sx={{ overflow: 'hidden' }}>
        {formatSubjects((p as any).row?.subjects).slice(0, 3).map((s, i) => (
          <Chip key={`${(p as any).id}-t-sub-${i}`} size="small" label={s} />
        ))}
      </Stack>
    ) },
    { field: 'experienceHours', headerName: 'Hours', width: 120 },
    { field: 'verificationStatus', headerName: 'Verification', width: 150, renderCell: (p: GridRenderCellParams) => <Chip size="small" color={(p as any).value === 'VERIFIED' ? 'success' as any : (p as any).value === 'REJECTED' ? 'error' as any : 'warning' as any} label={(p as any).value} /> },
    { field: 'classesAssigned', headerName: 'Classes', width: 120, valueGetter: (p: GridValueGetterParams) => (p as any).row?.classesAssigned ?? (p as any).row?.classesCount },
    { field: 'ratings', headerName: 'Ratings', width: 100, valueGetter: (p: GridValueGetterParams) => (p as any).row?.ratings ?? (p as any).row?.rating },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false, filterable: false,
      renderCell: () => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit"><span><IconButton size="small"><EditIcon fontSize="small" /></IconButton></span></Tooltip>
        </Stack>
      )
    },
  ], []);

  const finalClassColumns: GridColDef[] = useMemo(() => [
    { field: 'studentName', headerName: 'Student', width: 180 },
    { field: 'tutor', headerName: 'Tutor', width: 180, valueGetter: (p: GridValueGetterParams) => (p as any).row?.tutor?.name },
    { field: 'coordinator', headerName: 'Coordinator', width: 180, valueGetter: (p: GridValueGetterParams) => (p as any).row?.coordinator?.name },
    { field: 'subject', headerName: 'Subject', width: 200, renderCell: (p: GridRenderCellParams) => (
      <Stack direction="row" spacing={0.5} sx={{ overflow: 'hidden' }}>
        {formatSubjects((p as any).row?.subject).slice(0, 3).map((s, i) => (
          <Chip key={`${(p as any).id}-fc-sub-${i}`} size="small" label={s} />
        ))}
      </Stack>
    ) },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p: GridRenderCellParams) => <Chip size="small" label={(p as any).value} /> },
    { field: 'startDate', headerName: 'Start', width: 140, valueGetter: (p: GridValueGetterParams) => formatDate((p as any).row?.startDate) },
    { field: 'sessions', headerName: 'Sessions', width: 120, valueGetter: (p: GridValueGetterParams) => `${(p as any).row?.completedSessions ?? 0}/${(p as any).row?.totalSessions ?? 0}` },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false, filterable: false,
      renderCell: () => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View"><span><IconButton size="small"><EditIcon fontSize="small" /></IconButton></span></Tooltip>
        </Stack>
      )
    },
  ], []);

  const currentColumns: GridColDef[] = useMemo(() => {
    switch (entityType) {
      case 'ClassLead':
        return classLeadColumns;
      case 'Payment':
        return paymentColumns;
      case 'Attendance':
        return attendanceColumns;
      case 'Tutor':
        return tutorColumns;
      case 'FinalClass':
        return finalClassColumns;
      default:
        return [];
    }
  }, [entityType, classLeadColumns, paymentColumns, attendanceColumns, tutorColumns, finalClassColumns]);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = ENTITY_CONFIG[entityType];
      if (!cfg?.service?.list) {
        setEntities([]);
        setTotal(0);
        return;
      }
      const res: PaginatedResponse<any> = await cfg.service.list(page, limit, filters);
      setEntities((res as any)?.data || (res as any)?.items || []);
      setTotal((res as any)?.total || (res as any)?.count || 0);
    } catch (e: any) {
      const msg = e?.response?.status === 404 ? "Records not found" :
        e?.response?.status === 403 ? "You don't have permission to perform this action" :
        e?.response?.status === 400 ? "Invalid request. Please check your input." :
        e?.message || 'Server error. Please try again later.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [ENTITY_CONFIG, entityType, page, limit, filters]);

  useEffect(() => {
    setFilters({});
    setPage(1);
    setSelectedIds([]);
  }, [entityType]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleEntityTypeChange = useCallback((_: any, value: any) => {
    if (value) setEntityType(value as EntityType);
  }, []);

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEntities();
    setRefreshing(false);
    setSnackbar({ open: true, message: 'Refreshed', severity: 'success' });
  }, [fetchEntities]);

  const handleSelectionChange = useCallback((selectionModel: GridRowSelectionModel) => {
    setSelectedIds(selectionModel as string[]);
  }, []);

  const handleSelectAll = useCallback(() => {
    const visibleIds = entities.map((e) => String(e.id || e._id));
    if (selectedIds.length === visibleIds.length) setSelectedIds([]);
    else setSelectedIds(visibleIds);
  }, [entities, selectedIds]);

  const handleDeleteSingle = useCallback((id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      setLoading(true);
      const cfg = ENTITY_CONFIG[entityType];
      if (deleteTargetId) {
        if (!cfg?.service?.delete) throw new Error('Delete not supported');
        await cfg.service.delete(deleteTargetId);
        setSnackbar({ open: true, message: 'Record deleted', severity: 'success' });
        setDeleteTargetId(null);
      } else {
        if (!cfg?.bulkDeleteSupported) throw new Error('Bulk delete not supported');
        if (!selectedIds.length) throw new Error('No records selected');
        await bulkDeleteRecords(entityType, { ids: selectedIds });
        setSnackbar({ open: true, message: 'Bulk delete completed', severity: 'success' });
        setSelectedIds([]);
      }
      await fetchEntities();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.message || 'Failed to delete', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  }, [ENTITY_CONFIG, entityType, deleteTargetId, selectedIds, fetchEntities]);

  const handleBulkDelete = useCallback(() => {
    if (!selectedIds.length) {
      setSnackbar({ open: true, message: 'Select at least one record', severity: 'warning' });
      return;
    }
    const cfg = ENTITY_CONFIG[entityType];
    if (!cfg?.bulkDeleteSupported) {
      setSnackbar({ open: true, message: 'Bulk delete not supported for this entity', severity: 'warning' });
      return;
    }
    setDeleteTargetId(null);
    setDeleteDialogOpen(true);
  }, [selectedIds, ENTITY_CONFIG, entityType]);

  const handleBulkUpdatePayments = useCallback(() => {
    if (entityType !== 'Payment') return;
    if (!selectedIds.length) {
      setSnackbar({ open: true, message: 'Select at least one record', severity: 'warning' });
      return;
    }
    setBulkUpdateModalOpen(true);
  }, [entityType, selectedIds]);

  const handleBulkPaymentUpdate = useCallback(async (updateData: any) => {
    try {
      setLoading(true);
      await bulkUpdatePayments({ ids: selectedIds }, updateData);
      setSnackbar({ open: true, message: 'Payments updated', severity: 'success' });
      setSelectedIds([]);
      await fetchEntities();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.message || 'Failed to update payments', severity: 'error' });
    } finally {
      setLoading(false);
      setBulkUpdateModalOpen(false);
    }
  }, [selectedIds, fetchEntities]);

  const renderFilters = () => {
    const cfg = ENTITY_CONFIG[entityType];
    const fs: string[] = cfg?.filters || [];
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {fs.includes('status') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Status"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <MenuItem value="">All</MenuItem>
                  {(entityType === 'ClassLead' ? Object.values(CLASS_LEAD_STATUS)
                    : entityType === 'Payment' ? Object.values(PAYMENT_STATUS)
                    : entityType === 'Attendance' ? Object.values(ATTENDANCE_STATUS)
                    : []).map((s: any) => (
                      <MenuItem key={String(s)} value={String(s)}>{String(s)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            {fs.includes('search') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  placeholder="Search..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                />
              </Grid>
            )}
            {fs.includes('tutorId') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tutor ID"
                  value={filters.tutorId || ''}
                  onChange={(e) => handleFilterChange('tutorId', e.target.value || undefined)}
                />
              </Grid>
            )}
            {fs.includes('finalClassId') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Final Class ID"
                  value={filters.finalClassId || ''}
                  onChange={(e) => handleFilterChange('finalClassId', e.target.value || undefined)}
                />
              </Grid>
            )}
            {fs.includes('fromDate') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From"
                  InputLabelProps={{ shrink: true }}
                  value={filters.fromDate || ''}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value || undefined)}
                />
              </Grid>
            )}
            {fs.includes('toDate') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To"
                  InputLabelProps={{ shrink: true }}
                  value={filters.toDate || ''}
                  onChange={(e) => handleFilterChange('toDate', e.target.value || undefined)}
                />
              </Grid>
            )}
            {fs.includes('verificationStatus') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Verification"
                  value={filters.verificationStatus || ''}
                  onChange={(e) => handleFilterChange('verificationStatus', e.target.value || undefined)}
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.values(VERIFICATION_STATUS).map((s: any) => (
                    <MenuItem key={String(s)} value={String(s)}>{String(s)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            {fs.includes('isAvailable') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Availability"
                  value={typeof filters.isAvailable === 'boolean' ? String(filters.isAvailable) : ''}
                  onChange={(e) => handleFilterChange('isAvailable', e.target.value === '' ? undefined : e.target.value === 'true')}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Available</MenuItem>
                  <MenuItem value="false">Unavailable</MenuItem>
                </TextField>
              </Grid>
            )}
            {fs.includes('coordinatorId') && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Coordinator ID"
                  value={filters.coordinatorId || ''}
                  onChange={(e) => handleFilterChange('coordinatorId', e.target.value || undefined)}
                />
              </Grid>
            )}
            {fs.includes('tutorId') && !ENTITY_CONFIG[entityType] && null}

            <Grid item xs={12} md="auto">
              <Stack direction="row" spacing={1} alignItems="center">
                <Button startIcon={<FilterListIcon />} variant="outlined" onClick={handleClearFilters}>Clear</Button>
                <Chip label={`Active filters: ${Object.keys(filters).filter(k => filters[k] !== undefined && filters[k] !== '' ).length}`} />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const selectionSupported = ENTITY_CONFIG[entityType]?.bulkDeleteSupported || ENTITY_CONFIG[entityType]?.bulkUpdateSupported;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {error && (
        <Box mb={2}>
          <ErrorAlert error={error} onClose={() => setError(null)} />
        </Box>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Data Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">{new Date().toLocaleTimeString()}</Typography>
        </Stack>
      </Box>

      <Tabs value={entityType} onChange={handleEntityTypeChange} sx={{ mb: 1 }}>
        <Tab label={ENTITY_CONFIG.ClassLead.label} value="ClassLead" />
        <Tab label={ENTITY_CONFIG.Payment.label} value="Payment" />
        <Tab label={ENTITY_CONFIG.Attendance.label} value="Attendance" />
        <Tab label={ENTITY_CONFIG.Tutor.label} value="Tutor" />
        <Tab label={ENTITY_CONFIG.FinalClass.label} value="FinalClass" />
      </Tabs>
      <Divider sx={{ mb: 2 }} />

      {entityType === 'FinalClass' && !ENTITY_CONFIG.FinalClass.service.list && (
        <Alert severity="info" sx={{ mb: 2 }}>Final Classes support coming soon</Alert>
      )}

      {renderFilters()}

      {!!selectedIds.length && (
        <Alert severity="info" sx={{ mb: 2 }}
          action={(
            <Stack direction="row" spacing={1}>
              {entityType === 'Payment' && ENTITY_CONFIG[entityType]?.bulkUpdateSupported && (
                <Button size="small" variant="contained" onClick={handleBulkUpdatePayments}>Bulk Update Status</Button>
              )}
              {ENTITY_CONFIG[entityType]?.bulkDeleteSupported && (
                <Button size="small" color="error" variant="contained" onClick={handleBulkDelete}>Bulk Delete</Button>
              )}
              <Button size="small" variant="outlined" onClick={() => setSelectedIds([])}>Clear Selection</Button>
            </Stack>
          )}
        >
          {selectedIds.length} item(s) selected
        </Alert>
      )}

      {!isXs ? (
        <Card sx={{ p: 2 }}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <DataGrid
              rows={entities}
              columns={currentColumns}
              getRowId={(r) => r.id || r._id}
              checkboxSelection={!!selectionSupported}
              onRowSelectionModelChange={handleSelectionChange}
              rowSelectionModel={selectedIds}
              paginationMode="server"
              rowCount={total}
              paginationModel={{ page: page - 1, pageSize: limit }}
              onPaginationModelChange={(model) => {
                setPage(model.page + 1);
                setLimit(model.pageSize);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              autoHeight
              sx={{ border: 'none' }}
            />
          )}
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {loading ? (
            <LoadingSpinner />
          ) : entities.length === 0 ? (
            <Typography>No records found</Typography>
          ) : (
            entities.map((item) => {
              const id = String(item.id || item._id);
              const checked = selectedIds.includes(id);
              return (
                <Card key={id}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">
                          {entityType === 'ClassLead' && (item.studentName || item?.student?.name)}
                          {entityType === 'Payment' && `${formatDate(item.paymentDate)} • ${item.currency ? item.currency + ' ' : ''}${item.amount}`}
                          {entityType === 'Attendance' && `${formatDate(item.sessionDate)}`}
                          {entityType === 'Tutor' && (item?.user?.name || item.name)}
                          {entityType === 'FinalClass' && (item.studentName)}
                        </Typography>
                        {!!selectionSupported && (
                          <Checkbox checked={checked} onChange={() => {
                            setSelectedIds(prev => checked ? prev.filter(x => x !== id) : [...prev, id]);
                          }} />
                        )}
                      </Stack>
                      {entityType === 'ClassLead' && (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {formatSubjects(item.subject).slice(0, 3).map((s, i) => <Chip key={`m-cl-${id}-${i}`} size="small" label={s} />)}
                          <ClassLeadStatusChip status={item.status} />
                        </Stack>
                      )}
                      {entityType === 'Payment' && (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body2">{item?.tutor?.name}</Typography>
                          <PaymentStatusChip status={item.status} />
                        </Stack>
                      )}
                      {entityType === 'Attendance' && (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body2">{item?.tutor?.name}</Typography>
                          <AttendanceStatusChip status={item.status} />
                        </Stack>
                      )}
                      {entityType === 'Tutor' && (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {formatSubjects(item.subjects).slice(0, 3).map((s, i) => <Chip key={`m-tu-${id}-${i}`} size="small" label={s} />)}
                          <Chip size="small" label={item.verificationStatus} />
                        </Stack>
                      )}
                      <Stack direction="row" spacing={1}>
                        <Button size="small" startIcon={<EditIcon fontSize="small" />}>Edit</Button>
                        {(entityType === 'ClassLead' || entityType === 'Payment' || entityType === 'Attendance') && (
                          <Button size="small" color="error" startIcon={<DeleteIcon fontSize="small" />} onClick={() => handleDeleteSingle(id)}>Delete</Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Records"
        message={selectedIds.length > 1 && !deleteTargetId ? `Are you sure you want to delete ${selectedIds.length} records? This action cannot be undone.` : `Are you sure you want to delete this record? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
        loading={loading}
      />

      {entityType === 'Payment' && (
        <PaymentUpdateModal
          open={bulkUpdateModalOpen}
          onClose={() => setBulkUpdateModalOpen(false)}
          payment={null}
          onUpdate={handleBulkPaymentUpdate}
        />
      )}

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default DataManagementPage;
