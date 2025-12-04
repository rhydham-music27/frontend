import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Divider,
} from '@mui/material';
import { Payment as PaymentIcon, CheckCircle, ErrorOutline } from '@mui/icons-material';
import { IPayment } from '../../types';
import { processPayment } from '../../services/mockPaymentService';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  payment: IPayment;
  onPaymentSuccess: (updatedPayment: IPayment) => void;
  user: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  payment,
  onPaymentSuccess,
  user,
}) => {
  console.log('PaymentModal rendered with props:', {
    open,
    payment,
    hasUser: !!user,
    userEmail: user?.email
  });
  
  useEffect(() => {
    console.log('PaymentModal mounted/updated with payment ID:', payment?.id);
    return () => {
      console.log('PaymentModal unmounting');
    };
  }, [payment?.id]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    // Reset state when modal opens/closes
    if (open) {
      setPaymentStatus('idle');
      setError(null);
    }
  }, [open]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      await processPayment(
        payment.amount || 0,
        payment.currency || 'INR',
        user,
        async (updatedPayment) => {
          // On successful payment
          setPaymentStatus('success');
          onPaymentSuccess(updatedPayment);
          // Close after a delay
          setTimeout(onClose, 2000);
        },
        (error) => {
          setPaymentStatus('failed');
          setError(error.message || 'Payment failed. Please try again.');
        },
        () => {
          // On modal dismiss
          setPaymentStatus('idle');
        },
        payment.id // Pass the payment ID to processPayment
      );
    } catch (err) {
      setPaymentStatus('failed');
      setError('Failed to process payment. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Processing Payment...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your payment.
            </Typography>
          </Box>
        );
      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ color: 'success.main', fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Your payment of ₹{payment.amount?.toLocaleString()} has been received.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transaction ID: {payment.transactionId || 'N/A'}
            </Typography>
          </Box>
        );
      case 'failed':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ErrorOutline sx={{ color: 'error.main', fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Payment Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {error || 'There was an error processing your payment.'}
            </Typography>
          </Box>
        );
      default:
        return (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Amount to Pay:</Typography>
                <Typography fontWeight="bold">₹{payment.amount?.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>For:</Typography>
                <Typography textAlign="right">
                  {payment.finalClass?.studentName || 'Tutoring Services'}
                </Typography>
              </Box>
              {payment.finalClass?.subject && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Subject:</Typography>
                  <Typography>
                    {Array.isArray(payment.finalClass.subject)
                      ? payment.finalClass.subject.join(', ')
                      : payment.finalClass.subject}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You will be redirected to a secure payment page to complete your transaction.
              </Typography>
            </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </>
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaymentIcon color="primary" />
        {paymentStatus === 'success'
          ? 'Payment Successful'
          : paymentStatus === 'failed'
          ? 'Payment Failed'
          : 'Complete Payment'}
      </DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        {paymentStatus === 'idle' && (
          <>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Processing...' : `Pay ₹${payment.amount?.toLocaleString()}`}
            </Button>
          </>
        )}
        {paymentStatus === 'failed' && (
          <Button variant="contained" onClick={handlePayment} fullWidth>
            Try Again
          </Button>
        )}
        {(paymentStatus === 'success' || paymentStatus === 'failed') && (
          <Button onClick={onClose} variant="outlined" fullWidth>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
