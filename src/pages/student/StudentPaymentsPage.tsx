import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { IPayment } from '../../types';
import { getStudentPayments } from '../../services/studentService';
import * as paymentService from '../../services/paymentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import PaymentModal from '../../components/payments/PaymentModal';
import { PAYMENT_STATUS } from '../../constants';

const StudentPaymentsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector(selectCurrentUser);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudentPayments({ page: 1, limit: 50 });
      setPayments(res.data || []);
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

  const handlePaymentSuccess = async (updated: IPayment) => {
    try {
      // Mark payment as PAID in backend
      const paymentId = updated.id || (updated as any)._id;
      if (paymentId) {
        await paymentService.updatePaymentStatus(paymentId, {
          status: PAYMENT_STATUS.PAID,
          paymentMethod: updated.paymentMethod || 'ONLINE',
          transactionId: updated.transactionId,
          notes: updated.notes,
        });
      }
      setPayments((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      enqueueSnackbar('Payment successful!', { variant: 'success' });
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to update payment status', { variant: 'error' });
    }
  };

  const handleOpenPaymentModal = (payment: IPayment) => {
    const paymentId = payment.id || (payment as any)._id;
    if (!paymentId) {
      enqueueSnackbar('Invalid payment ID', { variant: 'error' });
      return;
    }
    const normalizedPayment = { ...payment, id: paymentId } as IPayment;
    setSelectedPayment(normalizedPayment);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  if (loading && !payments.length) {
    return <LoadingSpinner fullScreen message="Loading payments..." /> as any;
  }

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = payments
    .filter((p) => p.status === PAYMENT_STATUS.PAID)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const overdueAmount = payments
    .filter((p) => p.status === PAYMENT_STATUS.OVERDUE)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Payments
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View and pay your class fees.
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
                    const classInfo = p.finalClass as any;
                    const className = classInfo?.className || classInfo?.name || 'Class';
                    const subjects = classInfo
                      ? Array.isArray(classInfo.subject)
                        ? classInfo.subject.join(', ')
                        : classInfo.subject
                      : undefined;
                    const tutorName = classInfo?.tutor?.name;

                    return (
                      <Card key={`payment-${p.id || index}`} variant="outlined">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {className}
                              </Typography>
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
                              <Typography variant="body2" sx={{ mt: 1 }}>
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
                              <Button
                                variant="contained"
                                color="primary"
                                disabled={p.status === PAYMENT_STATUS.PAID}
                                startIcon={p.status === PAYMENT_STATUS.PAID ? <CheckCircleIcon /> : undefined}
                                onClick={() => handleOpenPaymentModal(p)}
                              >
                                {p.status === PAYMENT_STATUS.PAID ? 'Paid' : 'Pay Now'}
                              </Button>
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
          key={selectedPayment.id}
          open={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          payment={selectedPayment}
          onPaymentSuccess={handlePaymentSuccess}
          user={{
            name: user?.name,
            email: user?.email,
            contact: (user as any)?.phone,
          }}
        />
      )}
    </Container>
  );
};

export default StudentPaymentsPage;
