import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { PAYMENT_TYPE } from '../../constants';
import { getTutors } from '../../services/tutorService';
import { getPaymentFilters } from '../../services/paymentService';
import { ITutor } from '../../types';

interface CreatePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({ open, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState<{ _id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ _id: string; label: string }[]>([]);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tutor: '',
    finalClass: '',
    amount: '',
    paymentType: PAYMENT_TYPE.MISCELLANEOUS,
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  const fetchInitialData = async () => {
    setTutorLoading(true);
    try {
      const [tutorRes, filterRes] = await Promise.all([
        getTutors({ limit: 100 }),
        getPaymentFilters(),
      ]);
      setTutors(tutorRes.data.map((t: any) => ({ _id: t.user?._id || t.user, name: t.user?.name || 'Unknown' })));
      setClasses(filterRes.data.classes);
    } catch (e) {
      console.error('Failed to fetch initial data', e);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTutorChange = (_: any, newValue: { _id: string; name: string } | null) => {
    setFormData((prev) => ({ ...prev, tutor: newValue?._id || '' }));
  };

  const handleClassChange = (_: any, newValue: { _id: string; label: string } | null) => {
    setFormData((prev) => ({ ...prev, finalClass: newValue?._id || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.paymentType || !formData.dueDate || !formData.notes) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        ...formData,
        tutor: formData.tutor || undefined,
        finalClass: formData.finalClass || undefined,
        amount: Number(formData.amount),
      });
      onClose();
      // Reset form
      setFormData({
        tutor: '',
        finalClass: '',
        amount: '',
        paymentType: PAYMENT_TYPE.MISCELLANEOUS,
        dueDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Create New Payment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create a manual payment entry for fees, payouts, or miscellaneous records.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Autocomplete
              options={tutors}
              getOptionLabel={(option) => option.name}
              loading={tutorLoading}
              onChange={handleTutorChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tutor (Optional)"
                  placeholder="Select Tutor"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {tutorLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Autocomplete
              options={classes}
              getOptionLabel={(option) => option.label}
              onChange={handleClassChange}
              renderInput={(params) => <TextField {...params} label="Class (Optional)" placeholder="Select Class" />}
            />

            <TextField
              select
              label="Payment Type *"
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              required
              fullWidth
            >
              {Object.entries(PAYMENT_TYPE).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {value.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Amount (INR) *"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Due Date *"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Notes *"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              required
              multiline
              rows={3}
              fullWidth
              placeholder="e.g., Monthly bonus, deduction, or description"
              helperText="Mandatory for miscellaneous payments"
            />

            <Divider sx={{ my: 1 }} />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Payment'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default CreatePaymentModal;
