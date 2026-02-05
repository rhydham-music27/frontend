import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { IPayment } from '../../types';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../../constants';

interface Props {
  open: boolean;
  onClose: () => void;
  payment: IPayment | null;
  onUpdate: (payload: { status: string; paymentMethod?: string; transactionId?: string; notes?: string }) => Promise<any> | void;
}

const schema = yup.object({
  status: yup.string().oneOf(Object.values(PAYMENT_STATUS) as string[]).required(),
  paymentMethod: yup.string().when('status', (status: any, sch: any) => (status === PAYMENT_STATUS.PAID ? sch.required('Payment method is required') : sch.optional())),
  transactionId: yup.string().optional().min(3).max(100),
  notes: yup.string().optional().max(500),
});

type FormValues = {
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
};

export default function PaymentUpdateModal({ open, onClose, payment, onUpdate }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      status: payment?.status || PAYMENT_STATUS.PENDING,
      paymentMethod: payment?.paymentMethod,
      transactionId: payment?.transactionId,
      notes: payment?.notes,
    },
  });

  React.useEffect(() => {
    if (payment) {
      reset({
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        notes: payment.notes,
      });
    }
  }, [payment, reset]);

  const status = watch('status');

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      setError(null);
      await onUpdate(values);
      reset();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Payment Status</DialogTitle>
      <DialogContent>
        {payment && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {payment.tutor?.name || 'General Payment'} • {payment.currency} {payment.amount} • Current: {payment.status}
          </Alert>
        )}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField select label="Payment Status" {...register('status')} error={!!errors.status} helperText={errors.status?.message} fullWidth>
            {Object.values(PAYMENT_STATUS).map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          {status === PAYMENT_STATUS.PAID && (
            <TextField select label="Payment Method" {...register('paymentMethod')} error={!!errors.paymentMethod} helperText={errors.paymentMethod?.message} fullWidth>
              {Object.values(PAYMENT_METHOD).map((m) => (
                <MenuItem key={m} value={m}>{m.replace(/_/g, ' ')}</MenuItem>
              ))}
            </TextField>
          )}
          <TextField label="Transaction ID" {...register('transactionId')} error={!!errors.transactionId} helperText={errors.transactionId?.message} fullWidth />
          <TextField label="Notes" {...register('notes')} error={!!errors.notes} helperText={errors.notes?.message} fullWidth multiline rows={3} />
          <ErrorAlert error={error} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={submitting}>
          {submitting ? <LoadingSpinner size={20} /> : 'Update Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
