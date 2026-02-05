import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../../services/api';

interface ChangePasswordOtpModalProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordOtpModal: React.FC<ChangePasswordOtpModalProps> = ({ open, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Send OTP, 2: Verify & Change
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Resend timer countdown
  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, step]);

  const resetState = () => {
    setStep(1);
    setLoading(false);
    setResending(false);
    setError(null);
    setSuccess(null);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setCanResend(false);
    setResendTimer(60);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/auth/change-password-otp/send');
      setStep(2);
      setResendTimer(60);
      setCanResend(false);
      setSuccess('OTP sent successfully to your registered email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setResending(true);
    setError(null);
    try {
      await api.post('/api/auth/change-password-otp/resend');
      setResendTimer(60);
      setCanResend(false);
      setOtp(''); // Clear previous OTP
      setSuccess('OTP resent successfully to your registered email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/api/auth/change-password-otp/verify', { otp, newPassword });
      setSuccess('Password changed successfully!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password. Invalid OTP or weak password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <LockResetIcon color="primary" />
          Change Password
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {step === 1 ? (
          <Box textAlign="center" py={3}>
            <Typography variant="body1" paragraph>
              To protect your account, we will verify your identity via a One-Time Password (OTP) sent to your registered email address.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "Send OTP" to proceed.
            </Typography>
          </Box>
        ) : (
          <Box component="form" noValidate autoComplete="off" py={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter the OTP sent to your email and your new password.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              autoFocus
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="At least 8 characters"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={newPassword !== confirmPassword && confirmPassword !== ''}
              helperText={newPassword !== confirmPassword && confirmPassword !== '' ? "Passwords don't match" : ""}
            />

            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button
                onClick={handleResendOtp}
                variant="text"
                size="small"
                disabled={!canResend || resending}
                sx={{
                  color: canResend ? 'primary.main' : 'text.disabled',
                }}
              >
                {resending ? 'Resending...' : canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {step === 1 ? (
          <Button variant="contained" onClick={handleSendOtp} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Send OTP'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleChangePassword} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordOtpModal;
