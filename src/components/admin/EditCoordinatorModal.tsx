import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Alert,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { ICoordinator } from '../../types';

interface EditCoordinatorModalProps {
  open: boolean;
  onClose: () => void;
  coordinator: ICoordinator | null;
  onUpdate: (
    coordinatorId: string,
    updateData: { maxClassCapacity?: number; specialization?: string[]; isActive?: boolean }
  ) => Promise<void>;
}

interface FormValues {
  maxClassCapacity?: number;
  specialization?: string[];
  isActive: boolean;
}

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    maxClassCapacity: yup.number().optional().min(1).max(100),
    specialization: yup.array(yup.string().required()).optional(),
    isActive: yup.boolean().required(),
  }) as yup.ObjectSchema<FormValues>;

const COMMON_SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Languages'];

const EditCoordinatorModal: React.FC<EditCoordinatorModalProps> = ({ open, onClose, coordinator, onUpdate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: { maxClassCapacity: 10, specialization: [], isActive: true },
  });

  const activeCount = coordinator?.activeClassesCount || 0;
  const currentCapacity = watch('maxClassCapacity');
  const capacityWarning = useMemo(() => {
    if (typeof currentCapacity === 'number' && currentCapacity < activeCount) {
      return `Cannot set capacity below current active classes (${activeCount}).`;
    }
    return '';
  }, [currentCapacity, activeCount]);

  useEffect(() => {
    reset({
      maxClassCapacity: coordinator?.maxClassCapacity,
      specialization: coordinator?.specialization,
      isActive: coordinator?.isActive,
    });
  }, [coordinator, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!coordinator?.id) return;
    if (values.maxClassCapacity! < activeCount) {
      setError(`Capacity cannot be less than active classes (${activeCount}).`);
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await onUpdate(coordinator.id, values);
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update coordinator';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Coordinator Profile</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {coordinator && (
            <Alert severity="info" sx={{ mb: 1 }}>
              {coordinator.user?.name} • {coordinator.user?.email} • {coordinator.activeClassesCount}/{coordinator.maxClassCapacity} classes
            </Alert>
          )}
          {error && <ErrorAlert error={error} />}
          {capacityWarning && <Alert severity="warning">{capacityWarning}</Alert>}
          <TextField
            label="Max Class Capacity"
            type="number"
            inputProps={{ min: 1, max: 100 }}
            fullWidth
            {...register('maxClassCapacity')}
            error={!!errors.maxClassCapacity}
            helperText={errors.maxClassCapacity?.message}
          />
          <Controller
            name="specialization"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                freeSolo
                options={COMMON_SUBJECTS}
                value={field.value || []}
                onChange={(_e, val) => field.onChange(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Specialization"
                    placeholder="Add subjects"
                  />
                )}
              />
            )}
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

export default EditCoordinatorModal;
