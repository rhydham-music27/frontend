import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';

interface RenewClassModalProps {
  open: boolean;
  onClose: () => void;
  onRenew: (payload: { monthlyFee: number; sessionsPerMonth: number }) => void;
}

const RenewClassModal: React.FC<RenewClassModalProps> = ({ open, onClose, onRenew }) => {
  const [monthlyFee, setMonthlyFee] = useState('');
  const [sessionsPerMonth, setSessionsPerMonth] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRenew = () => {
    const fee = parseFloat(monthlyFee);
    const sessions = parseInt(sessionsPerMonth, 10);
    if (isNaN(fee) || isNaN(sessions) || fee <= 0 || sessions <= 0) {
      setError('Please enter valid values.');
      return;
    }
    setError(null);
    onRenew({ monthlyFee: fee, sessionsPerMonth: sessions });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Renew Class</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
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
          {error && <Box color="error.main">{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleRenew} variant="contained">Renew</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenewClassModal;
