import React, { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { changeStudentPassword } from '../../services/studentAuthService';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const StudentChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const studentId = (user as any)?.studentId || '';

  const validatePasswords = () => {
    if (!currentPassword.trim()) {
      setError('Current password is required');
      return false;
    }
    if (!newPassword.trim()) {
      setError('New password is required');
      return false;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }
    if (!confirmPassword.trim()) {
      setError('Please confirm your new password');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validatePasswords()) {
      return;
    }

    try {
      setLoading(true);
      
      await changeStudentPassword(
        studentId,
        currentPassword.trim(),
        newPassword.trim()
      );

      setSuccess(true);
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to change password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4} textAlign="center">
        <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Change Password
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update your account password for better security
        </Typography>
      </Box>

      {/* Change Password Card */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password changed successfully! You can now use your new password to login.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    sx={{ minWidth: 'auto' }}
                  >
                    {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                ),
              }}
            />

            <TextField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              helperText="Password must be at least 6 characters long"
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    sx={{ minWidth: 'auto' }}
                  >
                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                ),
              }}
            />

            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    sx={{ minWidth: 'auto' }}
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                ),
              }}
            />

            <Box display="flex" gap={2} mt={3}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<LockIcon />}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/student-profile')}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Back Button */}
      <Box mt={3} textAlign="center">
        <Button
          variant="text"
          onClick={() => navigate('/student-profile')}
        >
          ← Back to Profile
        </Button>
      </Box>
    </Container>
  );
};

export default StudentChangePasswordPage;
