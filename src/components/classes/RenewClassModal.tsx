import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import ConfirmDialog from '../common/ConfirmDialog';

interface RenewClassModalProps {
  open: boolean;
  onClose: () => void;
  onRenew: (payload: { monthlyFee: number; sessionsPerMonth: number }) => void;
  isAdmin?: boolean;
  initialMonthlyFee?: number;
  initialSessionsPerMonth?: number;
}

const RenewClassModal: React.FC<RenewClassModalProps> = ({ 
  open, 
  onClose, 
  onRenew, 
  isAdmin = false,
  initialMonthlyFee,
  initialSessionsPerMonth
}) => {
  const [monthlyFee, setMonthlyFee] = useState<string>(initialMonthlyFee?.toString() || '');
  const [sessionsPerMonth, setSessionsPerMonth] = useState<string>(initialSessionsPerMonth?.toString() || '');
  const [error, setError] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync state if initial props change
  React.useEffect(() => {
    if (initialMonthlyFee !== undefined && initialMonthlyFee !== null) setMonthlyFee(initialMonthlyFee.toString());
    if (initialSessionsPerMonth !== undefined && initialSessionsPerMonth !== null) setSessionsPerMonth(initialSessionsPerMonth.toString());
  }, [initialMonthlyFee, initialSessionsPerMonth]);

  const handleRenew = () => {
    const fee = parseFloat(monthlyFee);
    const sessions = parseInt(sessionsPerMonth, 10);
    
    if (isNaN(fee) || isNaN(sessions) || fee <= 0 || sessions <= 0) {
      setError('Please enter valid values.');
      return;
    }

    setError('');
    setShowConfirm(true);
  };

  const handleFinalRenew = () => {
    setShowConfirm(false);
    onRenew({
      monthlyFee: Number(monthlyFee),
      sessionsPerMonth: Number(sessionsPerMonth),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Renew Class</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {isAdmin ? (
            <>
              <TextField
                label="Monthly Fee"
                type="number"
                value={monthlyFee}
                onChange={e => setMonthlyFee(e.target.value)}
                fullWidth
              />
              <TextField
                label="Sessions Per Month"
                type="number"
                value={sessionsPerMonth}
                onChange={e => setSessionsPerMonth(e.target.value)}
                fullWidth
              />
            </>
          ) : (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">Monthly Fee:</Typography>
              <Typography variant="h6" gutterBottom>₹{monthlyFee}</Typography>
              
              <Typography variant="body2" color="text.secondary">Sessions Per Month:</Typography>
              <Typography variant="h6">{sessionsPerMonth}</Typography>
              
              <Typography variant="caption" color="warning.main" sx={{ mt: 2, display: 'block' }}>
                Note: Fee and session updates are restricted to Administrators.
              </Typography>
            </Box>
          )}
          {error && <Box color="error.main">{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleRenew} variant="contained" color="primary">Confirm Renewal</Button>
      </DialogActions>
      <ConfirmDialog
        open={showConfirm}
        title="Confirm Renewal"
        message="Are you sure you want to renew this class for the next cycle? This will generate new payment records."
        onConfirm={handleFinalRenew}
        onClose={() => setShowConfirm(false)}
        confirmText="Yes, Renew"
        severity="info"
      />
    </Dialog>
  );
};

export default RenewClassModal;

