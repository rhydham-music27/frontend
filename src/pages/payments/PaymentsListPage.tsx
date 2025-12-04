import { useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, TextField, MenuItem, Button, Stack, Divider, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import PaymentStatusChip from '../../components/payments/PaymentStatusChip';
import PaymentUpdateModal from '../../components/payments/PaymentUpdateModal';
import usePayments from '../../hooks/usePayments';
import { IPayment } from '../../types';
import { PAYMENT_STATUS } from '../../constants';

export default function PaymentsListPage() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [filters, setFilters] = useState<{ status?: string; tutorId?: string; finalClassId?: string; fromDate?: string; toDate?: string; page: number; limit: number }>({ page: 1, limit: 10 });
  const { payments, loading, error, pagination, refetch, updateStatus, statistics, fetchStatistics } = usePayments(filters);
  const [selected, setSelected] = useState<IPayment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchStatistics({ fromDate: filters.fromDate, toDate: filters.toDate, tutorId: filters.tutorId });
  }, [filters.fromDate, filters.toDate, filters.tutorId]);

  const handleUpdateClick = (p: IPayment) => { setSelected(p); setModalOpen(true); };
  const handleUpdateSubmit = async (payload: { status: string; paymentMethod?: string; transactionId?: string; notes?: string }) => {
    if (!selected) return;
    await updateStatus(selected.id, payload);
    setSnack({ open: true, message: 'Payment updated', severity: 'success' });
    setModalOpen(false);
    setSelected(null);
  };

  const derivedStats = useMemo(() => {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p: IPayment | any) => sum + (p.amount || 0), 0);
    const paidAmount = payments
      .filter((p: IPayment | any) => String(p.status) === PAYMENT_STATUS.PAID)
      .reduce((sum, p: IPayment | any) => sum + (p.amount || 0), 0);
    const pendingAmount = payments
      .filter((p: IPayment | any) => String(p.status) === PAYMENT_STATUS.PENDING)
      .reduce((sum, p: IPayment | any) => sum + (p.amount || 0), 0);
    const overdueAmount = payments
      .filter((p: IPayment | any) => String(p.status) === PAYMENT_STATUS.OVERDUE)
      .reduce((sum, p: IPayment | any) => sum + (p.amount || 0), 0);

    return { totalPayments, totalAmount, paidAmount, pendingAmount, overdueAmount };
  }, [payments]);

  // Precompute display-friendly fields for the desktop DataGrid
  const tableRows = useMemo(() => {
    return payments.map((p: IPayment | any) => {
      const fc = p.finalClass || {};
      const name = fc.className || fc.studentName || '-';
      const subject = Array.isArray(fc.subject)
        ? fc.subject.join(', ')
        : (fc.subject || '');
      const classLabel = subject ? `${name} • ${subject}` : name;

      const dateRaw = p.paymentDate || p.dueDate || p.createdAt;
      const dateLabel = dateRaw ? new Date(dateRaw).toLocaleDateString() : '-';

      const tutorLabel = p.tutor?.name || p.tutorName || p.tutorEmail || '-';
      const amountLabel = typeof p.amount === 'number' ? `${p.currency || 'INR'} ${p.amount}` : '-';

      const dueRaw = p.dueDate;
      const dueLabel = dueRaw ? new Date(dueRaw).toLocaleDateString() : '-';

      return {
        ...p,
        dateDisplay: dateLabel,
        tutorDisplay: tutorLabel,
        classDisplay: classLabel,
        amountDisplay: amountLabel,
        dueDisplay: dueLabel,
      };
    });
  }, [payments]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'dateDisplay',
      headerName: 'Date',
      width: 140,
    },
    {
      field: 'tutorDisplay',
      headerName: 'Tutor',
      width: 180,
    },
    {
      field: 'classDisplay',
      headerName: 'Class',
      width: 220,
    },
    {
      field: 'amountDisplay',
      headerName: 'Amount',
      width: 140,
    },
    { field: 'status', headerName: 'Status', width: 140, renderCell: (p: any) => <PaymentStatusChip status={p?.value} /> },
    { field: 'paymentMethod', headerName: 'Method', width: 140 },
    { field: 'transactionId', headerName: 'Txn ID', width: 160 },
    {
      field: 'dueDisplay',
      headerName: 'Due',
      width: 140,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (p: any) => (
        <Button size="small" variant="outlined" onClick={() => p?.row && handleUpdateClick(p.row)}>Edit</Button>
      ),
    },
  ], []);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Payment Management</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={2}>
          <Card><CardContent>
            <Typography variant="subtitle2" color="text.secondary">Total Payments</Typography>
            <Typography variant="h6">{statistics?.totalPayments ?? derivedStats.totalPayments ?? '-'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card><CardContent>
            <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
            <Typography variant="h6">{statistics?.totalAmount ?? derivedStats.totalAmount ?? '-'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card><CardContent>
            <Typography variant="subtitle2" color="text.secondary">Paid</Typography>
            <Typography variant="h6" color="success.main">{statistics?.paidAmount ?? derivedStats.paidAmount ?? '-'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card><CardContent>
            <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
            <Typography variant="h6" color="warning.main">{statistics?.pendingAmount ?? derivedStats.pendingAmount ?? '-'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card><CardContent>
            <Typography variant="subtitle2" color="text.secondary">Overdue</Typography>
            <Typography variant="h6" color="error.main">{statistics?.overdueAmount ?? derivedStats.overdueAmount ?? '-'}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField select label="Status" size="small" value={filters.status || ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))} sx={{ minWidth: 180 }}>
          <MenuItem value="">All</MenuItem>
          {Object.values(PAYMENT_STATUS).map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        <TextField type="date" label="From" size="small" InputLabelProps={{ shrink: true }} value={filters.fromDate || ''} onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value || undefined, page: 1 }))} />
        <TextField type="date" label="To" size="small" InputLabelProps={{ shrink: true }} value={filters.toDate || ''} onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value || undefined, page: 1 }))} />
        <Button onClick={() => setFilters({ page: 1, limit: 10 })}>Clear Filters</Button>
      </Card>

      <Card sx={{ p: 2 }}>
        {loading ? (
          <LoadingSpinner />
        ) : isXs ? (
          <Stack spacing={1.25}>
            {payments.map((p: IPayment | any) => (
              <Card key={(p as any).id || (p as any)._id} variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600}>{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</Typography>
                    <Chip size="small" label={p.status} color={p.status === 'PAID' ? 'success' : p.status === 'OVERDUE' ? 'error' : 'default'} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>{p.currency} {p.amount}</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Tutor</Typography><div>{p.tutor?.name || '-'}</div></Grid>
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Class</Typography><div>{p.finalClass?.studentName} • {(p.finalClass?.subject || []).join(', ')}</div></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Method</Typography><div>{p.paymentMethod || '-'}</div></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Txn ID</Typography><div>{p.transactionId || '-'}</div></Grid>
                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Due</Typography><div>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '-'}</div></Grid>
                  </Grid>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => handleUpdateClick(p)}>Edit</Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <DataGrid
            rows={tableRows}
            columns={columns}
            getRowId={(r: any) => r.id || r._id}
            paginationMode="server"
            rowCount={pagination.total}
            pageSizeOptions={[filters.limit]}
            initialState={{ pagination: { paginationModel: { pageSize: filters.limit, page: filters.page - 1 } } }}
            onPaginationModelChange={(m: any) => setFilters((prev) => ({ ...prev, page: (m.page || 0) + 1 }))}
            disableRowSelectionOnClick
            autoHeight
            sx={{ border: 'none' }}
          />
        )}
        <ErrorAlert error={error} />
      </Card>

      <PaymentUpdateModal open={modalOpen} onClose={() => setModalOpen(false)} payment={selected} onUpdate={handleUpdateSubmit} />
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
