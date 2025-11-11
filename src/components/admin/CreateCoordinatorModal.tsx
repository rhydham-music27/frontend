import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { IUser } from '../../types';

interface CreateCoordinatorModalProps {
  open: boolean;
  onClose: () => void;
  users: IUser[];
  usersLoading: boolean;
  onCreate: (payload: { userId: string; maxClassCapacity?: number; specialization?: string[] }) => Promise<void>;
}

interface FormValues {
  userId: string;
  maxClassCapacity: number;
  specialization?: string[];
}

const schema = yup.object({
  userId: yup.string().required('User is required'),
  maxClassCapacity: yup.number().required().min(1).max(100),
  specialization: yup.array(yup.string().required()).optional(),
});

const COMMON_SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Languages'];

const CreateCoordinatorModal: React.FC<CreateCoordinatorModalProps> = ({ open, onClose, users, usersLoading, onCreate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const { register, handleSubmit, setValue, control, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { userId: '', maxClassCapacity: 10, specialization: [] },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setSubmitting(true);
      setError(null);
      await onCreate(values);
      reset();
      setSelectedUser(null);
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to create coordinator';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Coordinator Profile</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {error && <ErrorAlert error={error} />}
          <Autocomplete
            options={users}
            loading={usersLoading}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={selectedUser}
            onChange={(_e, val) => {
              setSelectedUser(val);
              setValue('userId', val?.id || '', { shouldValidate: true });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select User"
                placeholder="Search by name/email"
                error={!!errors.userId}
                helperText={errors.userId?.message}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {usersLoading ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            label="Max Class Capacity"
            type="number"
            inputProps={{ min: 1, max: 100 }}
            fullWidth
            defaultValue={10}
            {...register('maxClassCapacity')}
            error={!!errors.maxClassCapacity}
            helperText={errors.maxClassCapacity?.message || 'Maximum number of classes this coordinator can handle'}
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
                    placeholder="Add subjects (optional)"
                    helperText="Subjects the coordinator specializes in"
                  />
                )}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={submitting}>
          {submitting ? <LoadingSpinner size={18} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCoordinatorModal;
