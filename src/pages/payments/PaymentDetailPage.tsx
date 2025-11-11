import { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import PaymentStatusChip from '../../components/payments/PaymentStatusChip';
import PaymentUpdateModal from '../../components/payments/PaymentUpdateModal';
import PaymentHistoryTable from '../../components/payments/PaymentHistoryTable';
import { IAttendance, IPayment } from '../../types';
import { getPaymentById, updatePaymentStatus } from '../../services/paymentService';
import { getAttendanceById } from '../../services/attendanceService';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<IPayment | null>(null);
  const [attendance, setAttendance] = useState<IAttendance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const pRes = await getPaymentById(id);
      setPayment(pRes.data);
      if (pRes.data?.attendance?.id) {
        const aRes = await getAttendanceById(pRes.data.attendance.id);
        setAttendance(aRes.data);
      } else {
        setAttendance(null);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateSubmit = async (payload: { status: string; paymentMethod?: string; transactionId?: string; notes?: string }) => {
    if (!id) return;
    await updatePaymentStatus(id, payload);
    setSnack({ open: true, message: 'Payment updated', severity: 'success' });
    setModalOpen(false);
    await fetchData();
  };

  if (loading) return <LoadingSpinner fullScreen /> as any;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <Typography variant="h4" sx={{ mb: 2 }}>Payment Details</Typography>
      <ErrorAlert error={error} />
      {payment && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Payment Information</Typography>
                  <Button variant="contained" startIcon={<EditIcon />} onClick={() => setModalOpen(true)}>Update Status</Button>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><Typography variant="body2">Amount: {payment.currency} {payment.amount}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2">Status: <PaymentStatusChip status={payment.status} /></Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2">Method: {payment.paymentMethod || '-'}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2">Txn ID: {payment.transactionId || '-'}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2">Payment Date: {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : '-'}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2">Due Date: {new Date(payment.dueDate).toLocaleDateString()}</Typography></Grid>
                  <Grid item xs={12}><Typography variant="body2">Notes: {payment.notes || '-'}</Typography></Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Related Information</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}><Typography variant="body2">Tutor: {payment.tutor?.name}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2">Class: {payment.finalClass?.studentName} • {(payment.finalClass?.subject || []).join(', ')}</Typography></Grid>
                  {attendance && (
                    <>
                      <Grid item xs={12} sm={6}><Typography variant="body2">Session Date: {new Date(attendance.sessionDate).toLocaleDateString()}</Typography></Grid>
                      <Grid item xs={12} sm={6}><Typography variant="body2">Attendance Status: {attendance.status}</Typography></Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Payment History</Typography>
                <PaymentHistoryTable payments={[payment]} showTutor={false} showClass={false} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <PaymentUpdateModal open={modalOpen} onClose={() => setModalOpen(false)} payment={payment} onUpdate={handleUpdateSubmit} />
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
