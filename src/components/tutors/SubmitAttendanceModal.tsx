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
  MenuItem,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { createAttendance } from '../../services/attendanceService';
import { STUDENT_ATTENDANCE_STATUS } from '../../constants';
import { IFinalClass } from '../../types';

interface SubmitAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  finalClass: IFinalClass;
  onSuccess?: () => void;
}

const todayStr = () => new Date().toISOString().split('T')[0];

const SubmitAttendanceModal: React.FC<SubmitAttendanceModalProps> = ({ open, onClose, finalClass, onSuccess }) => {
  const [sessionDate, setSessionDate] = useState<string>(todayStr());
  const [sessionNumber, setSessionNumber] = useState<number | string>('');
  const [notes, setNotes] = useState<string>('');
  const [studentAttendanceStatus, setStudentAttendanceStatus] = useState<string>(
    STUDENT_ATTENDANCE_STATUS.PRESENT
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const resetState = () => {
    setSessionDate(todayStr());
    setSessionNumber('');
    setNotes('');
    setStudentAttendanceStatus(STUDENT_ATTENDANCE_STATUS.PRESENT);
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!sessionDate) {
      setError('Please select a session date.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const payload = {
        finalClassId: finalClass.id,
        sessionDate,
        sessionNumber: sessionNumber ? Number(sessionNumber) : undefined,
        notes: notes || undefined,
        studentAttendanceStatus,
      };

      await createAttendance(payload);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 2000);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to submit attendance';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Submit Attendance
        <IconButton aria-label="Close" onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Submit attendance for this class session. The coordinator will review and approve it.
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Class: {finalClass.studentName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Subject: {Array.isArray(finalClass.subject) ? finalClass.subject.join(', ') : finalClass.subject}
            {' '}• Grade: {finalClass.grade}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Progress: {finalClass.completedSessions}/{finalClass.totalSessions} sessions completed
          </Typography>
        </Box>

        <TextField
          type="date"
          label="Session Date"
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: todayStr() }}
          value={sessionDate}
          onChange={(e) => { setSessionDate(e.target.value); setError(null); }}
          sx={{ mb: 2 }}
        />

        <TextField
          type="number"
          label="Session Number (Optional)"
          fullWidth
          placeholder="e.g., 5"
          helperText="Leave empty to auto-calculate"
          value={sessionNumber}
          onChange={(e) => { setSessionNumber(e.target.value); setError(null); }}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          label="Student Attendance Status"
          required
          fullWidth
          value={studentAttendanceStatus}
          onChange={(e) => { setStudentAttendanceStatus(e.target.value); setError(null); }}
          helperText="Mark whether the student attended this session"
          sx={{ mb: 2 }}
        >
          <MenuItem value={STUDENT_ATTENDANCE_STATUS.PRESENT}>Present</MenuItem>
          <MenuItem value={STUDENT_ATTENDANCE_STATUS.ABSENT}>Absent</MenuItem>
          <MenuItem value={STUDENT_ATTENDANCE_STATUS.LATE}>Late</MenuItem>
        </TextField>

        <TextField
          multiline
          rows={3}
          label="Notes (Optional)"
          fullWidth
          placeholder="Any additional information about this session"
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
            Attendance submitted successfully!
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
          disabled={loading || !sessionDate}
          startIcon={loading ? <CircularProgress size={18} /> : <CheckCircleIcon />}
        >
          {loading ? 'Submitting...' : 'Submit Attendance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitAttendanceModal;
