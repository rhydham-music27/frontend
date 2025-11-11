import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, Divider, Grid, CardContent, Alert, Chip } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { StyledCard } from '../common/StyledCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import MetricsCard from '../dashboard/MetricsCard';
import PaymentStatusChip from '../payments/PaymentStatusChip';
import { getMyPaymentSummary, downloadPaymentReceipt } from '../../services/paymentService';
import { IPayment, IPaymentStatistics } from '../../types';
import { PAYMENT_STATUS } from '../../constants';

const PaymentsEarningsCard: React.FC = () => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [statistics, setStatistics] = useState<IPaymentStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState<Record<string, boolean>>({});
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount || 0);
    } catch {
      return `${currency} ${amount ?? 0}`;
    }
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateOverdueAmount = () => {
    return payments
      .filter((p) => p.status === PAYMENT_STATUS.OVERDUE)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getRecentPayments = () => {
    return [...payments]
      .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
      .slice(0, 10);
  };

  const fetchPaymentSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getMyPaymentSummary();
      setPayments(data.payments || []);
      setStatistics(data.statistics || { totalAmount: 0, paidAmount: 0, pendingAmount: 0 });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load payment summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    setDownloadingReceipt((prev) => ({ ...prev, [paymentId]: true }));
    setDownloadError(null);
    try {
      await downloadPaymentReceipt(paymentId);
    } catch (e: any) {
      setDownloadError(e?.response?.data?.message || 'Failed to download receipt');
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setDownloadingReceipt((prev) => ({ ...prev, [paymentId]: false }));
    }
  };

  useEffect(() => {
    fetchPaymentSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={6} aria-busy>
            <LoadingSpinner message="Loading payment summary..." />
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (error && !statistics) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <ErrorAlert error={error} />
            <Box>
              <Button variant="outlined" onClick={fetchPaymentSummary}>Retry</Button>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (!loading && payments.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          <EmptyState
            icon={<AccountBalanceWalletIcon color="primary" />}
            title="No Payment Records"
            description={"You don't have any payment records yet. Payments will appear here once your attendance is approved and processed."}
          />
        </CardContent>
      </StyledCard>
    );
  }

  const paidCount = payments.filter((p) => p.status === PAYMENT_STATUS.PAID).length;
  const pendingCount = payments.filter((p) => p.status === PAYMENT_STATUS.PENDING).length;
  const overdueCount = payments.filter((p) => p.status === PAYMENT_STATUS.OVERDUE).length;

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>Payments & Earnings</Typography>
          </Box>
          <Chip size="small" color="primary" variant="outlined" label={`${payments.length} payment(s)`} />
        </Box>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="Total Earnings"
              value={formatCurrency(statistics?.totalAmount || 0, 'INR')}
              subtitle={`${payments.length} payments`}
              icon={<TrendingUpIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="Paid"
              value={formatCurrency(statistics?.paidAmount || 0, 'INR')}
              subtitle="Received payments"
              icon={<CheckCircleIcon color="success" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="Pending"
              value={formatCurrency(statistics?.pendingAmount || 0, 'INR')}
              subtitle="Awaiting payment"
              icon={<PendingActionsIcon color="warning" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="Overdue"
              value={formatCurrency(calculateOverdueAmount(), 'INR')}
              subtitle="Payment overdue"
              icon={<WarningIcon color="error" />}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={600}>Payment Status Breakdown</Typography>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip icon={<CheckCircleIcon />} label={`Paid: ${paidCount}`} color="success" />
          <Chip icon={<PendingActionsIcon />} label={`Pending: ${pendingCount}`} color="warning" />
          <Chip icon={<WarningIcon />} label={`Overdue: ${overdueCount}`} color="error" />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <ReceiptIcon fontSize="small" />
          <Typography variant="h6" fontWeight={600}>Recent Payments</Typography>
        </Box>

        {downloadError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDownloadError(null)}>
            {downloadError}
          </Alert>
        )}

        <Box
          sx={{
            maxHeight: 500,
            overflow: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 },
            '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.06)' },
          }}
        >
          {getRecentPayments().map((payment) => (
            <Box
              key={payment.id || (payment as any)._id}
              sx={{
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 3,
                p: 2.5,
                mb: 2,
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: 'grey.50', borderColor: 'primary.light', transform: 'translateX(4px)' },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PaymentsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(payment.amount, payment.currency || 'INR')}
                  </Typography>
                </Box>
                <PaymentStatusChip status={payment.status as any} />
              </Box>

              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">Class: {payment.finalClass?.studentName || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {Array.isArray(payment.finalClass?.subject) ? payment.finalClass?.subject?.join(', ') : (payment.finalClass?.subject as any) || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Grade {payment.finalClass?.grade || '-'} • {payment.finalClass?.board || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Due: {formatDate(payment.dueDate as any)}
                  </Typography>
                </Grid>
                {payment.paymentDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Paid on: {formatDate(payment.paymentDate as any)}
                    </Typography>
                  </Grid>
                )}
                {payment.attendance?.sessionDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Session: {formatDate(payment.attendance?.sessionDate as any)}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                  {payment.paymentMethod && (
                    <Typography variant="caption" color="text.secondary">Method: {payment.paymentMethod}</Typography>
                  )}
                  {payment.transactionId && (
                    <Typography variant="caption" color="text.secondary">Txn: {payment.transactionId}</Typography>
                  )}
                </Box>
                {payment.status === PAYMENT_STATUS.PAID && (
                  <Tooltip title="Download payment receipt as PDF">
                    <span>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadReceipt((payment.id as any) || (payment as any)._id)}
                        disabled={!!downloadingReceipt[(payment.id as any) || (payment as any)._id]}
                      >
                        {downloadingReceipt[(payment.id as any) || (payment as any)._id] ? 'Downloading...' : 'Download Receipt'}
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Box>

              {payment.notes && (
                <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 2, mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Notes:</Typography>
                  <Typography variant="body2">{payment.notes}</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {payments.length > 10 && (
          <Box textAlign="center" mt={2}>
            <Typography
              variant="body2"
              sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}
            >
              View All Payments ({payments.length})
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(PaymentsEarningsCard);
