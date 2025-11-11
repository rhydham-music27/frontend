import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PaymentIcon from '@mui/icons-material/Payment';
import { IPayment } from '../../types';
import { sendPaymentReminder } from '../../services/paymentService';
import LoadingSpinner from '../common/LoadingSpinner';
import PaymentStatusChip from '../payments/PaymentStatusChip';
import { format, differenceInDays } from 'date-fns';

interface PaymentReminderModalProps {
  open: boolean;
  onClose: () => void;
  payment: IPayment | null;
  onSuccess: () => void;
}

const formatCurrency = (amount: number): string => `₹${(amount || 0).toLocaleString('en-IN')}`;
const formatDate = (date?: Date): string => (date ? format(new Date(date), 'dd MMM yyyy') : '-');
const getDaysOverdue = (dueDate?: Date): number => (dueDate ? differenceInDays(new Date(), new Date(dueDate)) : 0);

const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({ open, onClose, payment, onSuccess }) => {
  const [reminderMessage, setReminderMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomMessage, setUseCustomMessage] = useState<boolean>(false);

  const defaultMessage = useMemo(() => {
    if (!payment) return '';
    const status = payment.status;
    const cls: any = payment.finalClass as any;
    const dueText = payment.dueDate ? formatDate(payment.dueDate) : 'soon';
    return `Your payment of INR ${payment.amount} for ${cls?.studentName || 'your child'}'s class is ${
      status === 'OVERDUE' ? 'overdue' : 'due'
    } on ${dueText}. Please make the payment at your earliest convenience.`;
  }, [payment]);

  const handleSendReminder = async () => {
    if (!payment) return;
    if (!(payment.finalClass as any)?.parent) {
      setError('Parent information not available');
      return;
    }
    if (useCustomMessage && (reminderMessage.trim().length < 10 || reminderMessage.trim().length > 500)) {
      setError('Custom message must be 10-500 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await sendPaymentReminder(payment.id, useCustomMessage ? reminderMessage.trim() : undefined);
      if (res?.success) {
        onSuccess();
        handleClose();
      } else {
        setError(res?.message || 'Failed to send payment reminder');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send payment reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReminderMessage('');
    setUseCustomMessage(false);
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setReminderMessage('');
      setUseCustomMessage(false);
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PaymentIcon />
          <Typography variant="h6">Send Payment Reminder</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {!payment ? (
          <Alert severity="info">No payment selected</Alert>
        ) : (
          <Box>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Payment Details
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="body2">Student: {(payment.finalClass as any)?.studentName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    {(payment.finalClass as any)?.subject?.join(', ')} - Grade {(payment.finalClass as any)?.grade}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="body2">{formatCurrency(payment.amount)}</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <PaymentStatusChip status={payment.status} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Due Date</Typography>
                  <Typography variant="body2">{formatDate(payment.dueDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tutor</Typography>
                  <Typography variant="body2" align="right">{(payment.tutor as any)?.name}</Typography>
                </Grid>
              </Grid>
              {payment.status === 'OVERDUE' && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Overdue by {getDaysOverdue(payment.dueDate)} days
                </Alert>
              )}
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Parent Details
            </Typography>
            {(payment.finalClass as any)?.parent ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Name: {(payment.finalClass as any)?.parent?.name}</Typography>
                <Typography variant="body2">Email: {(payment.finalClass as any)?.parent?.email}</Typography>
                <Typography variant="body2">Phone: {(payment.finalClass as any)?.parent?.phone}</Typography>
              </Box>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>Parent information not available</Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2">Reminder Message</Typography>
            <Box display="flex" gap={1} sx={{ mt: 1, mb: 1 }}>
              <Button variant={!useCustomMessage ? 'contained' : 'outlined'} onClick={() => setUseCustomMessage(false)}>
                Use Default Message
              </Button>
              <Button variant={useCustomMessage ? 'contained' : 'outlined'} onClick={() => setUseCustomMessage(true)}>
                Custom Message
              </Button>
            </Box>

            {!useCustomMessage ? (
              <Alert severity="info" icon={false} sx={{ mt: 1 }}>
                <Typography variant="body2">{defaultMessage}</Typography>
                <Typography variant="caption" color="text.secondary">This message will be sent to the parent</Typography>
              </Alert>
            ) : (
              <Box>
                <TextField
                  label="Custom Reminder Message"
                  multiline
                  rows={4}
                  fullWidth
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Enter a personalized reminder message for the parent..."
                  helperText="Minimum 10 characters, maximum 500 characters"
                />
                <Box display="flex" justifyContent="flex-end">
                  <Typography variant="caption">{reminderMessage.length}/500</Typography>
                </Box>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={handleSendReminder}
          disabled={
            loading || !payment || !(payment.finalClass as any)?.parent || (useCustomMessage && reminderMessage.trim().length < 10)
          }
        >
          {loading ? <LoadingSpinner size={20} /> : 'Send Reminder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentReminderModal;
