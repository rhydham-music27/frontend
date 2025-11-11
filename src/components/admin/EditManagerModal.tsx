import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { IManager } from '../../types';

interface EditManagerModalProps {
  open: boolean;
  onClose: () => void;
  manager: IManager | null;
  onUpdate: (managerId: string, updateData: { department?: string; isActive?: boolean }) => Promise<void>;
}

interface FormValues {
  department?: string;
  isActive: boolean;
}

const schema = yup.object({
  department: yup.string().optional().min(2, 'Too short').max(100, 'Too long'),
  isActive: yup.boolean().required(),
});

const EditManagerModal: React.FC<EditManagerModalProps> = ({ open, onClose, manager, onUpdate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { department: '', isActive: true },
  });

  useEffect(() => {
    reset({
      department: manager?.department || '',
      isActive: manager?.isActive ?? true,
    });
  }, [manager, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!manager?.id) return;
    try {
      setSubmitting(true);
      setError(null);
      await onUpdate(manager.id, values);
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update manager';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Manager Profile</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {manager && (
            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <strong>{manager.user?.name}</strong>
              <div style={{ color: 'rgba(0,0,0,0.6)' }}>{manager.user?.email}</div>
            </Box>
          )}
          {error && <ErrorAlert error={error} />}
          <TextField
            label="Department"
            fullWidth
            {...register('department')}
            error={!!errors.department}
            helperText={errors.department?.message || 'Optional'}
          />
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Status"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={!!errors.isActive}
                helperText={errors.isActive?.message}
              >
                <MenuItem value={true as any}>Active</MenuItem>
                <MenuItem value={false as any}>Inactive</MenuItem>
              </TextField>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={submitting}>
          {submitting ? <LoadingSpinner size={18} /> : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditManagerModal;
