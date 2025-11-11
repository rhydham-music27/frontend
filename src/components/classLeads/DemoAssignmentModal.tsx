import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Alert } from '@mui/material';
import { IClassLead, ITutorComparison } from '../../types';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import demoService from '../../services/demoService';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

type FormData = { demoDate: string; demoTime: string; notes?: string };

const schema = yup.object({
  demoDate: yup.string().required(),
  demoTime: yup.string().required(),
  notes: yup.string().max(500).optional(),
});

export default function DemoAssignmentModal({ open, onClose, classLead, selectedTutor, onSuccess }: { open: boolean; onClose: () => void; classLead: IClassLead; selectedTutor: ITutorComparison; onSuccess: () => void; }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: yupResolver(schema as any) });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await demoService.assignDemo(classLead.id, selectedTutor.user.id, data.demoDate, data.demoTime, data.notes);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to assign demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Demo</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Alert severity="info">Assigning demo to {selectedTutor?.user?.name}</Alert>
          <Typography variant="body2">Experience: {selectedTutor.experienceHours} hrs • Approval: {selectedTutor.approvalRatio}%</Typography>
          <TextField label="Demo Date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('demoDate')} error={!!errors.demoDate} helperText={errors.demoDate?.message} />
          <TextField label="Demo Time" type="time" fullWidth InputLabelProps={{ shrink: true }} {...register('demoTime')} error={!!errors.demoTime} helperText={errors.demoTime?.message} />
          <TextField label="Notes" multiline rows={3} fullWidth {...register('notes')} error={!!errors.notes} helperText={errors.notes?.message} />
          <ErrorAlert error={error} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Assign Demo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
