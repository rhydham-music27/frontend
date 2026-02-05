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
import { PAYMENT_STATUS, PAYMENT_TYPE } from '../../constants';
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
  const [paymentTypeTab, setPaymentTypeTab] = useState<string>(PAYMENT_TYPE.FEES_COLLECTED);
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IPaymentFilters>({ page: 1, limit: 9, paymentType: PAYMENT_TYPE.FEES_COLLECTED });
  const [pagination, setPagination] = useState<{ total: number; pages: number }>({ total: 0, pages: 0 });
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const displayedPayments = useMemo(() => {
    if (!paymentData) return [] as IPayment[];
    // filters.paymentType is already applied in fetch
    return (paymentData.payments || []) as IPayment[];
  }, [paymentData]);

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
    setFilters((prev) => ({ ...prev, page: 1, paymentType: paymentTypeTab }));
  }, [paymentTypeTab]);

  const handleFilterChange = (field: keyof IPaymentFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 9, paymentType: paymentTypeTab });
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

  const handleViewClass = () => {
    navigate('/assigned-classes');
  };

  // Unused metrics derived from displayed payments can be removed if strictly following lint

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Payment Tracking</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>Refresh</Button>
      </Box>

      <Card sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={paymentTypeTab} 
          onChange={(_, v) => setPaymentTypeTab(v)}
          sx={{ px: 2 }}
        >
          <Tab value={PAYMENT_TYPE.FEES_COLLECTED} label="Fees Received" />
          <Tab value={PAYMENT_TYPE.TUTOR_PAYOUT} label="Tutor Payouts" />
        </Tabs>
      </Card>

      {paymentData?.statistics && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title={paymentTypeTab === PAYMENT_TYPE.FEES_COLLECTED ? "Total Fees" : "Total Payouts"}
              value={formatCurrency(paymentTypeTab === PAYMENT_TYPE.FEES_COLLECTED ? paymentData.statistics.totalAmount : paymentData.statistics.totalPayoutAmount)}
              icon={<PaymentsIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="Paid"
              value={formatCurrency(paymentTypeTab === PAYMENT_TYPE.FEES_COLLECTED ? paymentData.statistics.paidAmount : paymentData.statistics.paidPayoutAmount)}
              icon={<CheckCircleIcon color="success" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="Pending"
              value={formatCurrency(paymentTypeTab === PAYMENT_TYPE.FEES_COLLECTED ? paymentData.statistics.pendingAmount : paymentData.statistics.pendingPayoutAmount)}
              icon={<PaymentsIcon color="warning" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {paymentTypeTab === PAYMENT_TYPE.FEES_COLLECTED ? (
              <MetricsCard
                title="Overdue Fees"
                value={formatCurrency(paymentData.statistics.overdueAmount || 0)}
                icon={<WarningIcon color="error" />}
              />
            ) : (
              <MetricsCard
                title="Overdue Count"
                value={paymentData.statistics.overdueCount}
                icon={<WarningIcon color="error" />}
              />
            )}
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 2 }}>
        <Tabs 
          value={filters.status || ''} 
          onChange={(_, v) => handleFilterChange('status', v || undefined)} 
          variant="scrollable" 
          scrollButtons 
          allowScrollButtonsMobile
        >
          <MenuItem value="" sx={{ display: 'none' }} /> 
          <Tab value="" label="All Statuses" />
          <Tab icon={<Badge color="error" badgeContent={filters.status === PAYMENT_STATUS.OVERDUE ? displayedPayments.length : 0}> <WarningIcon /> </Badge>} iconPosition="start" value={PAYMENT_STATUS.OVERDUE} label="Overdue" />
          <Tab icon={<Badge color="warning" badgeContent={filters.status === PAYMENT_STATUS.PENDING ? displayedPayments.length : 0}> <PaymentsIcon /> </Badge>} iconPosition="start" value={PAYMENT_STATUS.PENDING} label="Pending" />
          <Tab icon={<Badge color="success" badgeContent={filters.status === PAYMENT_STATUS.PAID ? displayedPayments.length : 0}> <HistoryIcon /> </Badge>} iconPosition="start" value={PAYMENT_STATUS.PAID} label="History" />
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
                    <PaymentStatusChip status={payment.status} paymentType={payment.paymentType} />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">Class Details</Typography>
                  <Typography variant="body2">
                    {(payment.finalClass as any)?.studentName}
                    {payment.attendanceSheet?.periodLabel && ` (${payment.attendanceSheet.periodLabel})`}
                  </Typography>
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
                  {paymentTypeTab === PAYMENT_TYPE.FEES_COLLECTED && (payment.status === PAYMENT_STATUS.PENDING || payment.status === PAYMENT_STATUS.OVERDUE) && (
                    <Button size="small" variant="contained" startIcon={<SendIcon />} onClick={() => handleSendReminder(payment)} disabled={!(payment.finalClass as any)?.parent}>
                      Send Reminder
                    </Button>
                  )}
                  <Button size="small" variant="outlined" onClick={handleViewClass}>
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
                  {paymentTypeTab === PAYMENT_TYPE.FEES_COLLECTED && 'No overdue payments'}
                  {paymentTypeTab === PAYMENT_TYPE.TUTOR_PAYOUT && 'No overdue payouts'}
                  {filters.status === PAYMENT_STATUS.PENDING && 'No pending payments'}
                  {filters.status === PAYMENT_STATUS.PAID && 'No payment history'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {paymentTypeTab === PAYMENT_TYPE.FEES_COLLECTED ? 'Great! There are no overdue payments at the moment.' : 'Great! All payouts are up to date.'}
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
