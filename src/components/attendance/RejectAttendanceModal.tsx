import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { IAttendance } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  attendance: IAttendance | null;
  onReject: (reason: string) => Promise<any> | void;
}

const schema = yup.object({
  rejectionReason: yup.string().required('Reason is required').min(5).max(500),
});

type FormValues = {
  rejectionReason: string;
};

export default function RejectAttendanceModal({ open, onClose, attendance, onReject }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { rejectionReason: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      setError(null);
      await onReject(values.rejectionReason);
      reset();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to reject attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reject Attendance</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>The tutor will be notified about this rejection.</Alert>
        {attendance && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Session: {new Date(attendance.sessionDate).toLocaleDateString()} • {attendance.finalClass.studentName} • {attendance.tutor.name}
          </Typography>
        )}
        <TextField
          label="Rejection Reason"
          {...register('rejectionReason')}
          error={!!errors.rejectionReason}
          helperText={errors.rejectionReason?.message}
          multiline
          rows={4}
          fullWidth
          placeholder="Please provide a detailed reason for rejection..."
        />
        <ErrorAlert error={error} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" color="error" disabled={submitting}>
          {submitting ? <LoadingSpinner size={20} /> : 'Reject Attendance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
