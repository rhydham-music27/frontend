import React, { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LoginIcon from '@mui/icons-material/Login';
import { studentLogin, changeStudentPassword } from '../../services/studentAuthService';
import { setCredentials, setError } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store';
import ErrorAlert from '../../components/common/ErrorAlert';

const StudentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'login' | 'changePassword'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!studentId.trim() || !password.trim()) {
      setLocalError('Student ID and password are required');
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);

      const result = await studentLogin({ studentId: studentId.trim(), password: password.trim() });

      if (result.requiresPasswordChange) {
        setStep('changePassword');
      } else {
        // Debug logging
        console.log('Student login result:', result);
        console.log('Token being stored:', result.accessToken);

        // Store student credentials (you might want to create a separate student auth slice)
        dispatch(setCredentials({
          user: {
            ...result.student,
            gender: result.student.gender as any,
            role: 'STUDENT',
            email: '', // Students don't have email
            acceptedTerms: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          token: result.accessToken // Use actual JWT token
        }));

        // Debug after dispatch
        console.log('After dispatch - Token in localStorage:', localStorage.getItem('token'));
        console.log('After dispatch - User in localStorage:', localStorage.getItem('user'));

        dispatch(setError(null));
        navigate('/student-dashboard');
      }
    } catch (e: any) {
      const backendError = e?.response?.data;
      let msg: string;
      if (backendError?.error && backendError?.message && backendError.error !== backendError.message) {
        msg = `${backendError.error}: ${backendError.message}`;
      } else if (backendError?.error) {
        msg = backendError.error;
      } else if (backendError?.message) {
        msg = backendError.message;
      } else {
        msg = e?.message || 'Failed to login';
      }
      setLocalError(msg);
      dispatch(setError(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setLocalError('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);

      await changeStudentPassword(
        studentId.trim(),
        currentPassword.trim(),
        newPassword.trim()
      );

      // After successful password change, login with new password
      const result = await studentLogin({ studentId: studentId.trim(), password: newPassword.trim() });

      dispatch(setCredentials({
        user: {
          ...result.student,
          gender: result.student.gender as any,
          role: 'STUDENT',
          email: '', // Students don't have email
          acceptedTerms: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        token: result.accessToken // Use actual JWT token
      }));
      dispatch(setError(null));
      navigate('/student-dashboard');
    } catch (e: any) {
      const backendError = e?.response?.data;
      let msg: string;
      if (backendError?.error && backendError?.message && backendError.error !== backendError.message) {
        msg = `${backendError.error}: ${backendError.message}`;
      } else if (backendError?.error) {
        msg = backendError.error;
      } else if (backendError?.message) {
        msg = backendError.message;
      } else {
        msg = e?.message || 'Failed to change password';
      }
      setLocalError(msg);
      dispatch(setError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #001F54 0%, #4589FF 50%, #295dde 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/bg.png')",
          backgroundSize: '50% 50%',
          backgroundPosition: 'top left',
          opacity: 0.1,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box className="animate-scale-in" textAlign="center" mb={{ xs: 3, sm: 4 }}>
          <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            mb={{ xs: 1.5, sm: 2 }}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: { xs: '16px', sm: '20px' },
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box
              component="img"
              src="/1.jpg"
              alt="logo"
              sx={{
                height: { xs: 48, sm: 56 },
                width: { xs: 48, sm: 56 },
                borderRadius: '50%',
                mr: { xs: 1.5, sm: 2 },
                border: '3px solid rgba(255, 255, 255, 0.3)',
              }}
            />
            <Box textAlign="left">
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  color: 'white',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
                  lineHeight: 1.2,
                }}
              >
                Your Shikshak
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                }}
              >
                Student Login
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card
          elevation={0}
          className="animate-slide-in-up"
          sx={{
            borderRadius: { xs: '20px', sm: '24px' },
            boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: '#001F54',
              p: { xs: 2.5, sm: 3 },
              textAlign: 'center',
            }}
          >
            <LoginIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'white', mb: { xs: 0.75, sm: 1 } }} />
            <Typography
              variant="h5"
              color="white"
              fontWeight={700}
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              {step === 'login' ? 'Student Login' : 'Change Password'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mt: 0.5,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              }}
            >
              {step === 'login'
                ? 'Use your student ID and password to login'
                : 'You must change your password on first login'
              }
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <ErrorAlert error={error} />

            {step === 'login' && (
              <Box display="flex" flexDirection="column" gap={{ xs: 2.5, sm: 3 }}>
                <TextField
                  label="Student ID"
                  fullWidth
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />

                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />

                <Button
                  onClick={handleLogin}
                  variant="contained"
                  fullWidth
                  disabled={loading || !studentId.trim() || !password.trim()}
                  sx={{
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 600,
                    borderRadius: { xs: '10px', sm: '12px' },
                    background: 'linear-gradient(135deg, #0F62FE 0%, #4589FF 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0043CE 0%, #0F62FE 100%)',
                    },
                  }}
                >
                  {loading ? 'Logging in…' : 'Login'}
                </Button>
              </Box>
            )}

            {step === 'changePassword' && (
              <Box display="flex" flexDirection="column" gap={{ xs: 2.5, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Welcome <strong>{studentId}</strong>! For security, please change your password.
                </Typography>

                <TextField
                  label="Current Password"
                  type="password"
                  fullWidth
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />

                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />

                <Button
                  onClick={handleChangePassword}
                  variant="contained"
                  fullWidth
                  disabled={loading || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                  sx={{
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 600,
                    borderRadius: { xs: '10px', sm: '12px' },
                    background: 'linear-gradient(135deg, #0F62FE 0%, #4589FF 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0043CE 0%, #0F62FE 100%)',
                    },
                  }}
                >
                  {loading ? 'Changing Password…' : 'Change Password & Login'}
                </Button>
              </Box>
            )}

            <Box mt={{ xs: 2.5, sm: 3 }} textAlign="center">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                Are you a parent?{' '}
                <Button
                  component={Link}
                  to="/parent-login"
                  sx={{
                    p: 0,
                    minWidth: 0,
                    fontSize: 'inherit',
                    textTransform: 'none',
                    color: (theme) => theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Parent Login
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box >
  );
};

export default StudentLoginPage;
