import React, { useEffect, useState } from 'react';
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

  const getClassDateBounds = () => {
    const anyClass: any = finalClass as any;
    const start: Date | null = anyClass.startDate ? new Date(anyClass.startDate) : null;
    const end: Date | null = anyClass.endDate ? new Date(anyClass.endDate) : null;
    return { start, end };
  };

  const isDateOnClassSchedule = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;

    const { start, end } = getClassDateBounds();
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);

    if (start) {
      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      if (day < s) return false;
    }
    if (end) {
      const e = new Date(end);
      e.setHours(0, 0, 0, 0);
      if (day > e) return false;
    }

    const sched: any = (finalClass as any).schedule || {};
    const daysOfWeek: string[] = Array.isArray(sched.daysOfWeek) ? sched.daysOfWeek : [];
    if (!daysOfWeek.length) return false;

    // Map JS getDay (0=Sun..6=Sat) to our DAYS_ORDER (MONDAY..SUNDAY) index: (day+6)%7
    const weekdayIndex = (day.getDay() + 6) % 7;
    const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const weekdayName = DAYS_ORDER[weekdayIndex];
    return daysOfWeek.includes(weekdayName);
  };

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

    if (!isDateOnClassSchedule(testDate)) {
      setError('Selected date does not have a scheduled session for this class. Please choose a day when this class is on your timetable.');
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

  const { start, end } = getClassDateBounds();
  const today = todayStr();
  const minBase = start ? new Date(start) : new Date();
  const effectiveMin = new Date(Math.max(minBase.getTime(), new Date(today).getTime()));
  const minDateStr = effectiveMin.toISOString().split('T')[0];
  const maxDateStr = end ? new Date(end).toISOString().split('T')[0] : undefined;

  const dateInputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    min: minDateStr,
    ...(maxDateStr ? { max: maxDateStr } : {}),
  };

  const sched: any = (finalClass as any).schedule || {};
  const daysOfWeek: string[] = Array.isArray(sched.daysOfWeek) ? sched.daysOfWeek : [];
  const weekdayLabelMap: Record<string, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
  };
  const readableDays = daysOfWeek
    .map((d) => weekdayLabelMap[d] || d.charAt(0) + d.slice(1).toLowerCase())
    .join(', ');

  useEffect(() => {
    // When the modal opens, default the test time to the class's regular timeSlot (if defined)
    if (!open) return;
    const schedAny: any = (finalClass as any).schedule || {};
    const timeSlot: string | undefined = schedAny.timeSlot;
    if (timeSlot) {
      setTestTime(timeSlot);
    } else {
      setTestTime('');
    }
  }, [open, finalClass]);

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
          inputProps={dateInputProps}
          value={testDate}
          onChange={(e) => {
            setTestDate(e.target.value);
            setError(null);
          }}
          helperText={readableDays ? `You can only choose dates on: ${readableDays}` : undefined}
          sx={{ mb: 2 }}
        />

        <TextField
          type="text"
          label="Test Time"
          required
          fullWidth
          placeholder="Class session time"
          helperText="Test time is fixed to the regular class time and cannot be changed"
          value={testTime}
          onChange={() => { /* time is fixed to class schedule */ }}
          InputProps={{ readOnly: true }}
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
