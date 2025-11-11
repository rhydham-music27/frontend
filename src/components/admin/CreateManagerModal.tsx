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
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { IUser } from '../../types';

interface CreateManagerModalProps {
  open: boolean;
  onClose: () => void;
  users: IUser[];
  usersLoading: boolean;
  onCreate: (payload: { userId: string; department?: string }) => Promise<void>;
}

interface FormValues {
  userId: string;
  department?: string;
}

const schema = yup.object({
  userId: yup.string().required('User is required'),
  department: yup.string().optional().min(2, 'Too short').max(100, 'Too long'),
});

const CreateManagerModal: React.FC<CreateManagerModalProps> = ({ open, onClose, users, usersLoading, onCreate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { userId: '', department: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      setError(null);
      await onCreate(values);
      reset();
      setSelectedUser(null);
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to create manager';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Manager Profile</DialogTitle>
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
            label="Department"
            placeholder="e.g., Operations, Sales"
            fullWidth
            {...register('department')}
            error={!!errors.department}
            helperText={errors.department?.message || "Optional: Specify the manager's department"}
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

export default CreateManagerModal;
