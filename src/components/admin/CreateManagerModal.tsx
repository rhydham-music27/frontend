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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
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
  onCreate: (payload: {
    userId: string;
    permissions: {
      canViewSiteLeads?: boolean;
      canVerifyTutors?: boolean;
      canCreateLeads?: boolean;
      canManagePayments?: boolean;
    };
  }) => Promise<void>;
}

interface FormValues {
  userId: string;
  permissions: {
    canViewSiteLeads: boolean;
    canVerifyTutors: boolean;
    canCreateLeads: boolean;
    canManagePayments: boolean;
  };
}

const schema = yup.object({
  userId: yup.string().required('User is required'),
  permissions: yup.object({
    canViewSiteLeads: yup.boolean().required(),
    canVerifyTutors: yup.boolean().required(),
    canCreateLeads: yup.boolean().required(),
    canManagePayments: yup.boolean().required(),
  }),
});

const CreateManagerModal: React.FC<CreateManagerModalProps> = ({ open, onClose, users, usersLoading, onCreate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const { handleSubmit, setValue, formState: { errors }, reset, control } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      userId: '',
      permissions: {
        canViewSiteLeads: true,
        canVerifyTutors: true,
        canCreateLeads: true,
        canManagePayments: true,
      },
    },
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

          <Box mt={1}>
            <Typography variant="subtitle2" gutterBottom>
              Permissions
            </Typography>
            <FormGroup>
              <Controller
                name="permissions.canViewSiteLeads"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Can view/check leads from site"
                  />
                )}
              />
              <Controller
                name="permissions.canVerifyTutors"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Can verify tutors"
                  />
                )}
              />
              <Controller
                name="permissions.canCreateLeads"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Can create leads themselves"
                  />
                )}
              />
              <Controller
                name="permissions.canManagePayments"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Can check and validate payments"
                  />
                )}
              />
            </FormGroup>
          </Box>
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
