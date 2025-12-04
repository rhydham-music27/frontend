import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../hooks/useAuth';
import { IPayment } from '../../types';
import * as paymentService from '../../services/paymentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import PaymentModal from '../../components/payments/PaymentModal';
import { PAYMENT_STATUS } from '../../constants';

const ParentPaymentsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentService.getParentPayments({ status: undefined });
      setPayments(res.data?.payments || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load payments';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handlePaymentSuccess = (updatedPayment: IPayment) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === updatedPayment.id ? { ...p, ...updatedPayment } : p))
    );
    enqueueSnackbar('Payment successful!', { variant: 'success' });
  };

  const handleOpenPaymentModal = (payment: IPayment) => {
    console.log('Opening payment modal for payment:', payment);
    const paymentId = payment.id || (payment as any)._id;
    
    if (!paymentId) {
      console.error('No payment ID found:', payment);
      enqueueSnackbar('Invalid payment ID', { variant: 'error' });
      return;
    }
    
    // Create a normalized payment object with id
    const normalizedPayment = {
      ...payment,
      id: paymentId
    };
    
    console.log('Setting selected payment and opening modal');
    setSelectedPayment(normalizedPayment);
    setIsPaymentModalOpen(true);
    console.log('Modal state after opening - isOpen:', true, 'selectedPayment:', normalizedPayment);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  if (loading && !payments.length) {
    return <LoadingSpinner fullScreen message="Loading payments..." />;
  }

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = payments
    .filter((p) => p.status === PAYMENT_STATUS.PAID)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const overdueAmount = payments
    .filter((p) => p.status === PAYMENT_STATUS.OVERDUE)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payments
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View your payment history and current dues.
      </Typography>

      <Box sx={{ mt: 2 }}>
        <ErrorAlert error={error} onClose={() => setError(null)} />
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Summary cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Total</Typography>
                <PaymentIcon color="primary" />
              </Stack>
              <Typography variant="h5">₹{totalAmount}</Typography>
              <Typography variant="body2" color="text.secondary">
                Across {payments.length} payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Paid
              </Typography>
              <Typography variant="h5">₹{paidAmount}</Typography>
              <Typography variant="body2" color="text.secondary">
                Successfully completed payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overdue
              </Typography>
              <Typography variant="h5" color="error">
                ₹{overdueAmount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please clear overdue amounts as soon as possible
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Payments list */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Payment history</Typography>
                <Chip label={`${payments.length} records`} size="small" />
              </Stack>
              {payments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No payments found yet.
                </Typography>
              ) : (
                <Stack spacing={2} mt={1}>
                  {payments.map((p, index) => {
                    const classInfo = p.finalClass;
                    const className = (classInfo as any)?.className || (classInfo as any)?.name || 'Class';
                    const subjects = classInfo
                      ? Array.isArray(classInfo.subject)
                        ? classInfo.subject.join(', ')
                        : classInfo.subject
                      : undefined;
                    const studentName = (classInfo as any)?.studentName;
                    const tutorName = (classInfo as any)?.tutor?.name;

                    return (
                      <Card key={`payment-${p.id || index}`} variant="outlined">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {className}
                              </Typography>
                              {studentName && (
                                <Typography variant="body2" color="text.secondary">
                                  Student: {studentName}
                                </Typography>
                              )}
                              {subjects && (
                                <Typography variant="body2" color="text.secondary">
                                  Subjects: {subjects}
                                </Typography>
                              )}
                              {tutorName && (
                                <Typography variant="body2" color="text.secondary">
                                  Tutor: {tutorName}
                                </Typography>
                              )}
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2">
                                Fees: <strong>₹{p.amount}</strong>
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                <Chip
                                  label={p.status}
                                  size="small"
                                  color={
                                    p.status === PAYMENT_STATUS.PAID
                                      ? 'success'
                                      : p.status === PAYMENT_STATUS.OVERDUE
                                      ? 'error'
                                      : 'warning'
                                  }
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {p.paymentDate
                                    ? new Date(p.paymentDate).toLocaleDateString()
                                    : p.dueDate
                                    ? `Due ${new Date(p.dueDate).toLocaleDateString()}`
                                    : ''}
                                </Typography>
                                {p.status === PAYMENT_STATUS.OVERDUE && <ErrorOutlineIcon color="error" />}
                              </Stack>
                            </Box>

                            <Box textAlign="right">
                              <Tooltip
                                title={
                                  p.status === PAYMENT_STATUS.PAID
                                    ? 'Payment already completed'
                                    : 'Pay now using Razorpay'
                                }
                              >
                                <span>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={p.status === PAYMENT_STATUS.PAID || isProcessing}
                                    startIcon={
                                      p.status === PAYMENT_STATUS.PAID ? (
                                        <CheckCircleIcon />
                                      ) : null
                                    }
                                    onClick={() => handleOpenPaymentModal(p)}
                                  >
                                    {p.status === PAYMENT_STATUS.PAID ? 'Paid' : 'Pay Now'}
                                  </Button>
                                </span>
                              </Tooltip>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {selectedPayment && selectedPayment.id && (
        <PaymentModal
          key={selectedPayment.id} // Add key to force re-render
          open={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          payment={selectedPayment}
          onPaymentSuccess={handlePaymentSuccess}
          user={{
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          }}
        />
      )}
    </Box>
  );
};

export default ParentPaymentsPage;
