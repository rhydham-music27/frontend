import React, { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Pagination,
  Chip,
  Paper,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getPaymentSummary as fetchPaymentSummary } from '../../services/coordinatorService';
import paymentService from '../../services/paymentService'; // Ensure this service has updatePaymentStatus
import { IPayment, IPaymentFilters } from '../../types';
import { PAYMENT_STATUS, PAYMENT_TYPE } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { format } from 'date-fns';

const formatCurrency = (amount: number): string => `₹${(amount || 0).toLocaleString('en-IN')}`;
const formatDate = (date?: Date | string): string => (date ? format(new Date(date), 'dd MMM yyyy') : '-');

const getPaymentStatusLabel = (status: string, paymentType: string): string => {
  if (paymentType === PAYMENT_TYPE.FEES_COLLECTED) {
    if (status === PAYMENT_STATUS.PAID) return 'Paid by Parents';
  }
  return status;
};

const PaymentTrackingPage: React.FC = () => {
  const [paymentTypeTab, setPaymentTypeTab] = useState<string>(PAYMENT_TYPE.FEES_COLLECTED);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IPaymentFilters>({
    page: 1,
    limit: 10,
    paymentType: PAYMENT_TYPE.FEES_COLLECTED,
    status: PAYMENT_STATUS.PENDING // Default to Pending as per requirement
  });
  const [pagination, setPagination] = useState<{ total: number; pages: number }>({ total: 0, pages: 0 });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPaymentSummary({ ...filters });
      const data = (res as any).data || [];
      // const statistics = (res as any).statistics;
      setPayments(data);
      const total = (res as any)?.pagination?.total || 0;
      const limit = filters.limit || 10;
      setPagination({ total, pages: Math.max(1, Math.ceil(total / limit)) });
    } catch (err) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setPaymentTypeTab(newValue);
    setFilters(prev => ({ ...prev, paymentType: newValue, page: 1 }));
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const handleOpenProofModal = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setPaymentProofFile(null);
    setProofPreview(null);
    setProofModalOpen(true);
  };

  const handleCloseProofModal = () => {
    setProofModalOpen(false);
    setSelectedPaymentId(null);
    setPaymentProofFile(null);
    setProofPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentId) return;

    // For FEES_COLLECTED (Payments from Parents), proof might be optional or required depending on policy
    // For TUTOR_PAYOUT (Payments to Tutors), proof usually confirms the transfer

    // if (!paymentProofFile && paymentTypeTab === PAYMENT_TYPE.TUTOR_PAYOUT) {
    //   alert("Please upload a payment screenshot.");
    //   return;
    // }

    setProcessingId(selectedPaymentId);
    try {
      await paymentService.updatePaymentStatus(selectedPaymentId, {
        status: PAYMENT_STATUS.PAID,
        notes: 'Marked by Coordinator',
        paymentProof: paymentProofFile || undefined
      });
      setSnackbar({ open: true, message: 'Payment status updated successfully', severity: 'success' });
      fetchPayments();
      handleCloseProofModal();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to update status', severity: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Payment Tracking</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={paymentTypeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value={PAYMENT_TYPE.FEES_COLLECTED} label="Pending Fees (From Parents)" />
          <Tab value={PAYMENT_TYPE.TUTOR_PAYOUT} label="Pending Payouts (To Tutors)" />
        </Tabs>

        {/* Simple Status Filter Toggles if needed, but user specifically asked for "pending payments" */}
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Button
            variant={filters.status === PAYMENT_STATUS.PENDING ? "contained" : "outlined"}
            size="small"
            onClick={() => setFilters(prev => ({ ...prev, status: PAYMENT_STATUS.PENDING, page: 1 }))}
          >
            Pending Only
          </Button>
          <Button
            variant={filters.status === '' ? "contained" : "outlined"}
            size="small"
            onClick={() => setFilters(prev => ({ ...prev, status: '', page: 1 }))}
          >
            Show All
          </Button>
        </Box>
      </Paper>

      {error && (
        <Box sx={{ mb: 2 }}>
          <ErrorAlert error={error} />
        </Box>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell><strong>Class / Student</strong></TableCell>
                  <TableCell><strong>Tutor</strong></TableCell>
                  <TableCell><strong>Period</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell><strong>Due Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No payments found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {(payment.finalClass as any)?.studentName || 'Unknown Student'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {(payment.finalClass as any)?.className || 'No Class Name'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {(payment.tutor as any)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {(payment.attendanceSheet as any)?.periodLabel || '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPaymentStatusLabel(payment.status, paymentTypeTab)}
                          color={payment.status === PAYMENT_STATUS.PAID ? 'success' : payment.status === PAYMENT_STATUS.PENDING ? 'warning' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {payment.status === PAYMENT_STATUS.PENDING || payment.status === PAYMENT_STATUS.OVERDUE ? (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            disabled={processingId === payment.id}
                            onClick={() => handleOpenProofModal(payment.id)}
                          >
                            {paymentTypeTab === PAYMENT_TYPE.FEES_COLLECTED ? 'Received' : 'Paid'}
                          </Button>
                        ) : (
                          <Typography variant="caption" color="success.main" display="flex" alignItems="center" justifyContent="center">
                            <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} /> Completed
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={pagination.pages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Payment Proof Modal */}
      {proofModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1300
        }}>
          <Paper sx={{ p: 4, width: 400, maxWidth: '90%' }}>
            <Typography variant="h6" mb={2}>
              Confirm Payment
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={3}>
              Please upload a screenshot of the payment receipt/transaction to confirm.
            </Typography>

            <Box mb={3} textAlign="center" border="1px dashed #ccc" borderRadius={2} p={2}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="raised-button-file">
                <Button variant="outlined" component="span" fullWidth>
                  Upload Screenshot
                </Button>
              </label>
              {paymentProofFile && (
                <Typography variant="caption" display="block" mt={1}>
                  Selected: {paymentProofFile.name}
                </Typography>
              )}
            </Box>

            {proofPreview && (
              <Box mb={3} textAlign="center">
                <img src={proofPreview} alt="Proof Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} />
              </Box>
            )}

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={handleCloseProofModal} disabled={!!processingId}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmPayment}
                disabled={!!processingId}
              >
                {processingId ? 'Processing...' : 'Confirm & Mark Paid'}
              </Button>
            </Box>
          </Paper>
        </div>
      )}

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default PaymentTrackingPage;
