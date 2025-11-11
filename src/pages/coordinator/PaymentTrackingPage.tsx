import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  MenuItem,
  Button,
  Pagination,
  Divider,
  Badge,
  Alert,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import PaymentsIcon from '@mui/icons-material/Payments';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { getPaymentSummary as fetchPaymentSummary, getAssignedClasses as fetchAssignedClassesApi } from '../../services/coordinatorService';
import { IPayment, IFinalClass, IPaymentFilters, ICoordinatorPaymentSummary } from '../../types';
import { PAYMENT_STATUS } from '../../constants';
import PaymentStatusChip from '../../components/payments/PaymentStatusChip';
import PaymentReminderModal from '../../components/coordinator/PaymentReminderModal';
import MetricsCard from '../../components/dashboard/MetricsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { format, differenceInDays } from 'date-fns';

const formatCurrency = (amount: number): string => `₹${(amount || 0).toLocaleString('en-IN')}`;
const formatDate = (date?: Date): string => (date ? format(new Date(date), 'dd MMM yyyy') : '-');

const PaymentTrackingPage: React.FC = () => {
  const [view, setView] = useState<'overdue' | 'upcoming' | 'history'>('overdue');
  const [paymentData, setPaymentData] = useState<ICoordinatorPaymentSummary | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IPaymentFilters>({ page: 1, limit: 9 });
  const [pagination, setPagination] = useState<{ total: number; pages: number }>({ total: 0, pages: 0 });
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const displayedPayments = useMemo(() => {
    if (!paymentData) return [] as IPayment[];
    const categorized = paymentData.categorized || { overdue: [], upcoming: [], paid: [] } as any;
    switch (view) {
      case 'overdue':
        return categorized.overdue || [];
      case 'upcoming':
        return categorized.upcoming || [];
      case 'history':
        return categorized.paid || [];
      default:
        return [];
    }
  }, [paymentData, view]);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetchAssignedClassesApi(1, 100);
      const list = (res?.data || []) as any[];
      setAssignedClasses(list.filter((c: any) => (c?.status || '') !== 'CANCELLED'));
    } catch {
      setError('Failed to load assigned classes');
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPaymentSummary({ ...filters });
      const data = res.data as unknown as ICoordinatorPaymentSummary;
      setPaymentData(data);
      const total = (res as any)?.pagination?.total || data.total || 0;
      const limit = filters.limit || 9;
      setPagination({ total, pages: Math.max(1, Math.ceil(total / limit)) });
    } catch {
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (view === 'history') {
      setFilters((prev) => ({ ...prev, status: PAYMENT_STATUS.PAID, page: 1 }));
    } else {
      setFilters((prev) => ({ ...prev, status: PAYMENT_STATUS.PENDING, page: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleFilterChange = (field: keyof IPaymentFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 9, status: view === 'history' ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING });
  };

  const handlePageChange = (_: any, page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    setSnackbar({ open: true, message: 'Refreshing payment data...', severity: 'info' });
    fetchPayments();
    fetchClasses();
  };

  const handleSendReminder = (payment: IPayment) => {
    const hasParent = !!(payment.finalClass as any)?.parent;
    if (!hasParent) {
      setSnackbar({ open: true, message: 'Parent information not available', severity: 'error' });
      return;
    }
    setSelectedPayment(payment);
    setReminderModalOpen(true);
  };

  const handleReminderSuccess = () => {
    setSnackbar({ open: true, message: 'Payment reminder sent successfully', severity: 'success' });
    setReminderModalOpen(false);
    setSelectedPayment(null);
  };

  const handleViewClass = (classId: string) => {
    navigate('/assigned-classes');
  };

  const overdueCount = paymentData?.statistics?.overdueCount || 0;
  const upcomingCount = paymentData?.statistics?.upcomingCount || 0;
  const paidCount = paymentData?.statistics?.paidCount || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Payment Tracking</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>Refresh</Button>
      </Box>

      {paymentData?.statistics && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box onClick={() => setView('overdue')} sx={{ cursor: 'pointer' }}>
              <MetricsCard
                title="Overdue Payments"
                value={overdueCount}
                icon={<WarningIcon color="error" />}
                subtitle={`Overdue: ${formatCurrency(paymentData.statistics.overdueAmount || 0)}`}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box onClick={() => setView('upcoming')} sx={{ cursor: 'pointer' }}>
              <MetricsCard
                title="Upcoming Payments"
                value={upcomingCount}
                icon={<PaymentsIcon color="warning" />}
                subtitle={`Pending: ${formatCurrency(paymentData.statistics.pendingAmount || 0)}`}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box onClick={() => setView('history')} sx={{ cursor: 'pointer' }}>
              <MetricsCard
                title="Paid Payments"
                value={paidCount}
                icon={<CheckCircleIcon color="success" />}
                subtitle={`Paid: ${formatCurrency(paymentData.statistics.paidAmount || 0)}`}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="Total Amount"
              value={formatCurrency(paymentData.statistics.totalAmount || 0)}
              icon={<PaymentsIcon color="primary" />}
            />
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 2 }}>
        <Tabs value={view} onChange={(_, v) => setView(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
          <Tab icon={<Badge color="error" badgeContent={overdueCount}> <WarningIcon /> </Badge>} iconPosition="start" value="overdue" label="Overdue Payments" />
          <Tab icon={<Badge color="warning" badgeContent={upcomingCount}> <PaymentsIcon /> </Badge>} iconPosition="start" value="upcoming" label="Upcoming Payments" />
          <Tab icon={<Badge color="success" badgeContent={paidCount}> <HistoryIcon /> </Badge>} iconPosition="start" value="history" label="Payment History" />
        </Tabs>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Class"
              value={filters.classId || ''}
              onChange={(e) => handleFilterChange('classId', e.target.value || undefined)}
            >
              <MenuItem value="">All Classes</MenuItem>
              {assignedClasses.map((cls: any) => (
                <MenuItem key={cls.id || cls._id} value={cls.id || cls._id}>
                  {cls.studentName} - {(cls.subject || []).join(', ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              fullWidth
              label="From Date"
              InputLabelProps={{ shrink: true }}
              value={filters.fromDate || ''}
              onChange={(e) => handleFilterChange('fromDate', e.target.value || undefined)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              fullWidth
              label="To Date"
              InputLabelProps={{ shrink: true }}
              value={filters.toDate || ''}
              onChange={(e) => handleFilterChange('toDate', e.target.value || undefined)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} display="flex" alignItems="center" gap={1}>
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {error && <ErrorAlert error={error} />}

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Showing {displayedPayments.length} payments
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <LoadingSpinner />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayedPayments.map((payment) => (
            <Grid key={payment.id} item xs={12} sm={6} md={4}>
              <Card sx={{ transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <PaymentsIcon />
                      <Typography variant="h6">{formatCurrency(payment.amount)}</Typography>
                    </Box>
                    <PaymentStatusChip status={payment.status} />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">Class Details</Typography>
                  <Typography variant="body2">{(payment.finalClass as any)?.studentName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(payment.finalClass as any)?.subject?.join(', ')} - Grade {(payment.finalClass as any)?.grade}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">Payment Details</Typography>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Due Date</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">{formatDate(payment.dueDate)}</Typography>
                    </Grid>
                    {payment.paymentDate && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Paid On</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" align="right">{formatDate(payment.paymentDate)}</Typography>
                        </Grid>
                      </>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Tutor</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">{(payment.tutor as any)?.name}</Typography>
                    </Grid>
                  </Grid>

                  {payment.status === PAYMENT_STATUS.OVERDUE && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      Overdue by {differenceInDays(new Date(), new Date(payment.dueDate))} days
                    </Alert>
                  )}
                  {payment.status === PAYMENT_STATUS.PENDING && payment.dueDate && differenceInDays(new Date(payment.dueDate), new Date()) <= 3 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Due in {Math.max(0, differenceInDays(new Date(payment.dueDate), new Date()))} days
                    </Alert>
                  )}
                  {payment.notes && (
                    <Box sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 1, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">Notes</Typography>
                      <Typography variant="body2">{payment.notes}</Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  {(payment.status === PAYMENT_STATUS.PENDING || payment.status === PAYMENT_STATUS.OVERDUE) && (
                    <Button size="small" variant="contained" startIcon={<SendIcon />} onClick={() => handleSendReminder(payment)} disabled={!(payment.finalClass as any)?.parent}>
                      Send Reminder
                    </Button>
                  )}
                  <Button size="small" variant="outlined" onClick={() => handleViewClass((payment.finalClass as any)?.id)}>
                    View Class
                  </Button>
                  {payment.status === PAYMENT_STATUS.PAID && (
                    <Chip color="success" size="small" label={`Paid on ${formatDate(payment.paymentDate)}`} />
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}

          {displayedPayments.length === 0 && !loading && (
            <Grid item xs={12}>
              <Box textAlign="center" py={6}>
                <Typography variant="h6" color="text.secondary">
                  {view === 'overdue' && 'No overdue payments'}
                  {view === 'upcoming' && 'No upcoming payments'}
                  {view === 'history' && 'No payment history'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {view === 'overdue' && 'Great! There are no overdue payments at the moment.'}
                  {view === 'upcoming' && 'No payments are due in the next few days.'}
                  {view === 'history' && 'No paid payments found for the selected filters.'}
                </Typography>
                {(filters.classId || filters.fromDate || filters.toDate) && (
                  <Button sx={{ mt: 2 }} variant="outlined" onClick={handleClearFilters}>Clear Filters</Button>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {pagination.pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={pagination.pages} page={filters.page} onChange={handlePageChange} color="primary" size="large" />
        </Box>
      )}

      <PaymentReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        payment={selectedPayment}
        onSuccess={handleReminderSuccess}
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

export default PaymentTrackingPage;
