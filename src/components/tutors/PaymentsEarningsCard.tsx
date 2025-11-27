import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Tooltip, Divider, Grid, CardContent, Alert, Chip } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { StyledCard } from '../common/StyledCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import MetricsCard from '../dashboard/MetricsCard';
import PaymentStatusChip from '../payments/PaymentStatusChip';
import { getPaymentsByTutor, downloadPaymentReceipt } from '../../services/paymentService';
import { IPayment } from '../../types';
import { PAYMENT_STATUS } from '../../constants';

const PaymentsEarningsCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [payments, setPayments] = useState<IPayment[]>([]);
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
      const tutorId = (user as any)?.id || (user as any)?._id;
      if (!tutorId) {
        setPayments([]);
        return;
      }
      const { data } = await getPaymentsByTutor(tutorId);
      setPayments(data.payments || []);
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
  }, [user]);

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

  if (error && payments.length === 0) {
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

  const paidPayments = payments.filter((p) => p.status === PAYMENT_STATUS.PAID);
  const pendingPayments = payments.filter((p) => p.status === PAYMENT_STATUS.PENDING);
  const overduePayments = payments.filter((p) => p.status === PAYMENT_STATUS.OVERDUE);

  const paidCount = paidPayments.length;
  const pendingCount = pendingPayments.length;
  const overdueCount = overduePayments.length;

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Earnings-style aggregates inspired by YS trial Earnings component
  const getPaymentDate = (p: IPayment) => {
    // Prefer paymentDate, then dueDate, then createdAt
    const raw = (p.paymentDate as any) || (p.dueDate as any) || (p.createdAt as any);
    return raw ? new Date(raw) : new Date();
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthPaid = paidPayments.filter((p) => {
    const d = getPaymentDate(p);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const lastMonthPaid = paidPayments.filter((p) => {
    const d = getPaymentDate(p);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const thisMonthTotal = thisMonthPaid.reduce((sum, p) => sum + (p.amount || 0), 0);
  const lastMonthTotal = lastMonthPaid.reduce((sum, p) => sum + (p.amount || 0), 0);
  const percentageChange = lastMonthTotal > 0
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
    : 0;

  // Last 6 months trend for paid earnings
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthPayments = paidPayments.filter((p) => {
      const pd = getPaymentDate(p);
      return pd.getMonth() === month && pd.getFullYear() === year;
    });
    const amount = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return {
      monthLabel: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      amount,
    };
  }).reverse();

  const maxTrendAmount = last6Months.length
    ? Math.max(...last6Months.map((m) => m.amount)) || 0
    : 0;

  // Class-wise earnings from paid payments
  const classWiseMap = new Map<string, { name: string; amount: number; count: number }>();
  paidPayments.forEach((p) => {
    const cls = p.finalClass;
    if (!cls) return;
    const id = (cls as any).id || (cls as any)._id || (cls as any).studentName;
    const key = String(id);
    const labelParts: string[] = [];
    if (Array.isArray(cls.subject) ? cls.subject.length : cls.subject) {
      const subj = Array.isArray(cls.subject) ? cls.subject.join(', ') : String(cls.subject);
      labelParts.push(subj);
    }
    if (cls.studentName) labelParts.push(cls.studentName);
    const name = labelParts.join(' - ') || 'Class';
    const existing = classWiseMap.get(key) || { name, amount: 0, count: 0 };
    existing.amount += p.amount || 0;
    existing.count += 1;
    classWiseMap.set(key, existing);
  });
  const classWiseEarnings = Array.from(classWiseMap.values()).sort((a, b) => b.amount - a.amount);

  const totalEarned = paidAmount;
  const avgPerClass = classWiseEarnings.length
    ? Math.round(totalEarned / classWiseEarnings.length)
    : 0;
  const avgPerPayment = paidPayments.length
    ? Math.round(totalEarned / paidPayments.length)
    : 0;
  const projectedThisMonth = thisMonthTotal + pendingAmount;

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
              title="Total Earned"
              value={formatCurrency(totalEarned, 'INR')}
              subtitle={`${paidPayments.length} paid payment(s)`}
              icon={<CheckCircleIcon color="success" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="This Month"
              value={formatCurrency(thisMonthTotal, 'INR')}
              subtitle={`${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}% vs last month`}
              icon={<TrendingUpIcon color={percentageChange >= 0 ? 'primary' : 'error'} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="Pending"
              value={formatCurrency(pendingAmount, 'INR')}
              subtitle={`${pendingCount} payment(s) pending`}
              icon={<PendingActionsIcon color="warning" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricsCard
              title="Overdue"
              value={formatCurrency(calculateOverdueAmount(), 'INR')}
              subtitle={`${overdueCount} overdue`}
              icon={<WarningIcon color="error" />}
            />
          </Grid>
        </Grid>

        {/* Earnings Trend + Class-wise Earnings */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                borderRadius: 3,
                p: 2.5,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <BarChartIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Earnings Trend (Last 6 Months)
                </Typography>
              </Box>

              {last6Months.map((m, idx) => (
                <Box key={idx} mb={1.5}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight={500}>{m.monthLabel}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(m.amount, 'INR')}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 16,
                      borderRadius: 999,
                      bgcolor: 'grey.200',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        borderRadius: 999,
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: 1,
                        transition: 'width 0.4s ease',
                        width:
                          maxTrendAmount > 0
                            ? `${Math.max((m.amount / maxTrendAmount) * 100, 4).toFixed(0)}%`
                            : '0%',
                      }}
                    >
                      {m.amount > 0 && (
                        <Typography variant="caption" sx={{ color: 'common.white', fontWeight: 600 }}>
                          {maxTrendAmount > 0
                            ? `${Math.round((m.amount / maxTrendAmount) * 100)}%`
                            : ''}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={{
                borderRadius: 3,
                p: 2.5,
                border: '3px solid',
                borderColor: 'primary.main',
                height: '100%',
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Class-wise Earnings
              </Typography>
              {classWiseEarnings.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No paid earnings yet. Once payments are received, class-wise earnings will appear here.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 260, overflow: 'auto', pr: 1 }}>
                  {classWiseEarnings.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ mb: 0.5 }}
                        noWrap
                      >
                        {item.name}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {item.count} payment{item.count > 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          {formatCurrency(item.amount, 'INR')}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
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

        {/* Earnings Summary */}
        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            borderRadius: 3,
            p: 2.5,
            bgcolor: 'grey.900',
            color: 'common.white',
            mt: 1,
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2}>
            Earnings Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  bgcolor: 'white',
                  color: 'grey.900',
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Average per Class
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatCurrency(avgPerClass, 'INR')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  bgcolor: 'white',
                  color: 'grey.900',
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Average per Payment
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatCurrency(avgPerPayment, 'INR')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  bgcolor: 'white',
                  color: 'grey.900',
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Projected This Month
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatCurrency(projectedThisMonth, 'INR')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(PaymentsEarningsCard);
