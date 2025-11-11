import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CloseIcon from '@mui/icons-material/Close';
import { scheduleTest } from '../../services/testService';
import { IFinalClass, IScheduleTestFormData } from '../../types';

interface ScheduleTestModalProps {
  open: boolean;
  onClose: () => void;
  finalClass: IFinalClass;
  onSuccess?: () => void;
}

const todayStr = () => new Date().toISOString().split('T')[0];

const ScheduleTestModal: React.FC<ScheduleTestModalProps> = ({ open, onClose, finalClass, onSuccess }) => {
  const [testDate, setTestDate] = useState<string>('');
  const [testTime, setTestTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const resetState = () => {
    setTestDate('');
    setTestTime('');
    setNotes('');
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!testDate || !testTime) {
      setError('Please select both test date and time.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const payload: IScheduleTestFormData = {
        finalClassId: finalClass.id,
        testDate,
        testTime,
        notes: notes || undefined,
      };

      await scheduleTest(payload);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 2000);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to schedule test';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Schedule Test
        <IconButton aria-label="Close" onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Schedule a test session to assess student progress. The coordinator will be notified.
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Class: {finalClass.studentName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Subject: {Array.isArray(finalClass.subject) ? finalClass.subject.join(', ') : finalClass.subject}
            {' '}• Grade: {finalClass.grade}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coordinator: {finalClass.coordinator?.name}
          </Typography>
        </Box>

        <TextField
          type="date"
          label="Test Date"
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: todayStr() }}
          value={testDate}
          onChange={(e) => { setTestDate(e.target.value); setError(null); }}
          sx={{ mb: 2 }}
        />

        <TextField
          type="text"
          label="Test Time"
          required
          fullWidth
          placeholder="e.g., 4:00 PM - 5:00 PM"
          helperText="Specify the time slot for the test"
          value={testTime}
          onChange={(e) => { setTestTime(e.target.value); setError(null); }}
          sx={{ mb: 2 }}
        />

        <TextField
          multiline
          rows={3}
          label="Additional Notes (Optional)"
          fullWidth
          placeholder="Any special instructions or topics to focus on"
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setError(null); }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Test scheduled successfully!
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !testDate || !testTime}
          startIcon={loading ? <CircularProgress size={18} /> : <EventIcon />}
        >
          {loading ? 'Scheduling...' : 'Schedule Test'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleTestModal;
