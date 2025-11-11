import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, RadioGroup, Radio, FormControlLabel, FormControl, FormLabel, Box, Typography, Alert, Divider, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { ITutor } from '../../types';
import { VERIFICATION_STATUS } from '../../constants';

interface Props {
  open: boolean;
  onClose: () => void;
  tutor: ITutor | null;
  onSubmit: (payload: { status: string; verificationNotes?: string }) => Promise<any> | void;
}

const schema = yup.object({
  status: yup.string().oneOf([VERIFICATION_STATUS.VERIFIED, VERIFICATION_STATUS.REJECTED]).required('Decision required'),
  verificationNotes: yup.string().when('status', (status: any, sch: any) => (status === VERIFICATION_STATUS.REJECTED ? sch.required('Reason is required').min(10).max(1000) : sch.optional())),
});

type FormValues = { status: string; verificationNotes?: string };

export default function VerificationModal({ open, onClose, tutor, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: { status: VERIFICATION_STATUS.VERIFIED, verificationNotes: '' },
  });

  const status = watch('status');

  const onSubmitHandler = async (values: FormValues) => {
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(values);
      reset();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update verification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Tutor Verification Review</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>Review all documents before making a decision.</Alert>
        {tutor && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>{tutor.user.name}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><Typography variant="body2">Email: {tutor.user.email}</Typography></Grid>
              <Grid item xs={12} md={4}><Typography variant="body2">Phone: {tutor.user.phone || '-'}</Typography></Grid>
              <Grid item xs={12} md={4}><Typography variant="body2">Experience: {tutor.experienceHours} hrs</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2">Subjects: {(tutor.subjects || []).join(', ')}</Typography></Grid>
            </Grid>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />
        <Box>
          <FormControl>
            <FormLabel>Decision</FormLabel>
            <RadioGroup row {...register('status')}>
              <FormControlLabel value={VERIFICATION_STATUS.VERIFIED} control={<Radio color="success" />} label="Approve Verification" />
              <FormControlLabel value={VERIFICATION_STATUS.REJECTED} control={<Radio color="error" />} label="Reject Verification" />
            </RadioGroup>
          </FormControl>
          {status === VERIFICATION_STATUS.REJECTED ? (
            <TextField label="Rejection Reason" {...register('verificationNotes')} error={!!errors.verificationNotes} helperText={errors.verificationNotes?.message} fullWidth multiline rows={4} sx={{ mt: 2 }} placeholder="Provide detailed reason for rejection..." />
          ) : (
            <TextField label="Verification Notes (Optional)" {...register('verificationNotes')} fullWidth multiline rows={2} sx={{ mt: 2 }} />
          )}
          <ErrorAlert error={error} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmitHandler)} variant="contained" color={status === VERIFICATION_STATUS.VERIFIED ? 'success' : 'error'} disabled={submitting}>
          {submitting ? <LoadingSpinner size={20} /> : status === VERIFICATION_STATUS.VERIFIED ? 'Approve Tutor' : 'Reject Tutor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
