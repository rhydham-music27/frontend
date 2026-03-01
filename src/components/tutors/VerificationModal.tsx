import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, RadioGroup, Radio, FormControlLabel, FormControl, FormLabel, Box, Typography, Alert, Divider, Grid, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  onSubmit: (payload: { status: string; verificationNotes?: string; whatsappCommunityJoined?: boolean }) => Promise<any> | void;
}

const schema = yup.object({
  status: yup.string().oneOf([VERIFICATION_STATUS.VERIFIED, VERIFICATION_STATUS.REJECTED]).required('Decision required'),
  verificationNotes: yup.string().when('status', (status: any, sch: any) => (status === VERIFICATION_STATUS.REJECTED ? sch.required('Reason is required').min(10).max(1000) : sch.optional())),
});

type FormValues = { status: string; verificationNotes?: string; whatsappCommunityJoined: boolean };

export default function VerificationModal({ open, onClose, tutor, onSubmit }: Props) {
  const theme = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: { status: VERIFICATION_STATUS.VERIFIED, verificationNotes: '', whatsappCommunityJoined: false },
  });

  const isOfflineTutor = tutor?.preferredMode === 'OFFLINE';

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
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Contact Info</Typography>
                <Typography variant="body2"><strong>Email:</strong> {tutor.user.email}</Typography>
                <Typography variant="body2"><strong>Phone:</strong> {tutor.user.phone || '-'}</Typography>
                <Typography variant="body2"><strong>City:</strong> {tutor.user.city || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Professional Info</Typography>
                <Typography variant="body2"><strong>Experience:</strong> {tutor.yearsOfExperience ? `${tutor.yearsOfExperience} years` : `${tutor.experienceHours} teaching hours`}</Typography>
                <Typography variant="body2"><strong>Qualifications:</strong> {(tutor.qualifications || []).join(', ')}</Typography>
                <Typography variant="body2"><strong>Mode:</strong> {tutor.preferredMode}</Typography>
                <Typography variant="body2"><strong>Verification Fee:</strong>
                  <Box component="span" sx={{ ml: 1, px: 1, py: 0.5, borderRadius: 1, bgcolor: tutor.verificationFeeStatus === 'PAID' ? 'success.light' : tutor.verificationFeeStatus === 'DEDUCT_FROM_FIRST_MONTH' ? 'warning.light' : 'error.light', color: 'black', fontSize: '0.75rem', fontWeight: 600 }}>
                    {tutor.verificationFeeStatus?.replace(/_/g, ' ') || 'PENDING'}
                  </Box>
                </Typography>
                {tutor.verificationFeePaymentProof && (
                  <Box mt={0.5}>
                    <a href={tutor.verificationFeePaymentProof} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', textDecoration: 'underline', color: 'blue' }}>View Payment Proof</a>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Subjects & Skills</Typography>
                <Typography variant="body2" mt={0.5}><strong>Subjects:</strong> {(tutor.subject || []).join(', ')}</Typography>
                <Typography variant="body2"><strong>Skills:</strong> {(tutor.skills || []).join(', ')}</Typography>
                <Typography variant="body2"><strong>Languages:</strong> {(tutor.languagesKnown || []).join(', ')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Addresses</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block">Residential</Typography>
                    <Typography variant="body2">{tutor.residentialAddress || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block">Permanent</Typography>
                    <Typography variant="body2">{tutor.permanentAddress || 'Not provided'}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
                <Typography variant="body2" color="text.primary" sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>{tutor.bio || 'No bio provided.'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Documents</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {tutor.documents?.map((doc, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      size="small"
                      href={doc.documentUrl}
                      target="_blank"
                      color={doc.verifiedAt ? 'success' : 'primary'}
                    >
                      {doc.documentType} {doc.verifiedAt && '✓'}
                    </Button>
                  ))}
                  {(!tutor.documents || tutor.documents.length === 0) && <Typography variant="caption">No documents uploaded.</Typography>}
                </Box>
              </Grid>
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
          {status === VERIFICATION_STATUS.VERIFIED && isOfflineTutor && (
            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2) }}>
              <Typography variant="subtitle2" color="success.main" fontWeight={700} gutterBottom>
                Offline Tutor Check
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Please confirm if this teacher has joined our official WhatsApp community for offline classes.
              </Typography>
              <FormControlLabel
                control={<Radio {...register('whatsappCommunityJoined')} value={true} checked={watch('whatsappCommunityJoined') === true} onClick={() => reset({ ...watch(), whatsappCommunityJoined: !watch('whatsappCommunityJoined') })} color="success" />}
                label="Teacher joined WhatsApp Community"
              />
              {errors.whatsappCommunityJoined && (
                <Typography color="error" variant="caption" sx={{ display: 'block' }}>
                  Community membership is required for offline tutors.
                </Typography>
              )}
            </Box>
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
