import React, { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LoginIcon from '@mui/icons-material/Login';
import { sendLoginOtp, verifyLoginOtp, parentLoginLookup } from '../../services/authService';
import { setCredentials, setError } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store';
import ErrorAlert from '../../components/common/ErrorAlert';

const ParentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }

    try {
      setSending(true);
      setLocalError(null);

      await sendLoginOtp(email.trim());
      setStep('otp');
      dispatch(setError(null));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to send OTP';
      setLocalError(msg);
      dispatch(setError(msg));
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    try {
      setVerifying(true);
      setLocalError(null);
      const resp: any = await verifyLoginOtp(email.trim(), otp.trim());
      const { user, accessToken } = resp.data || {};
      if (!user || !accessToken) {
        throw new Error('Failed to login with OTP');
      }

      if (user.role !== 'PARENT') {
        throw new Error('Only parents can login from this page');
      }
      dispatch(setCredentials({
        user: {
          ...user,
          gender: user.gender as any,
          acceptedTerms: (user as any).acceptedTerms ?? true,
          createdAt: (user as any).createdAt ? new Date((user as any).createdAt) : new Date(),
          updatedAt: (user as any).updatedAt ? new Date((user as any).updatedAt) : new Date()
        },
        token: accessToken
      }));
      dispatch(setError(null));
      navigate('/');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to verify OTP';
      setLocalError(msg);
      dispatch(setError(msg));
    } finally {
      setVerifying(false);
    }
  };

  const canSend = !!email.trim();

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
                Parent Login (OTP)
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
              Login with OTP
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mt: 0.5,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              }}
            >
              Use your registered email to receive a one-time password.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <ErrorAlert error={error} />

            {step === 'identifier' && (
              <Box display="flex" flexDirection="column" gap={{ xs: 2.5, sm: 3 }}>
                <TextField
                  label="Parent Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />

                <Button
                  onClick={handleSendOtp}
                  variant="contained"
                  fullWidth
                  disabled={sending || !canSend}
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
                  {sending ? 'Sending OTP…' : 'Send OTP'}
                </Button>
              </Box>
            )}

            {step === 'otp' && (
              <Box display="flex" flexDirection="column" gap={{ xs: 2.5, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OTP has been sent to <strong>{email}</strong>. Please enter it below.
                </Typography>

                <TextField
                  label="Enter OTP"
                  fullWidth
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />

                <Button
                  onClick={handleVerifyOtp}
                  variant="contained"
                  fullWidth
                  disabled={verifying || !otp.trim()}
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
                  {verifying ? 'Verifying…' : 'Verify OTP'}
                </Button>

                <Button
                  onClick={handleSendOtp}
                  variant="outlined"
                  fullWidth
                  disabled={sending}
                  sx={{
                    py: { xs: 1, sm: 1.25 },
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    borderRadius: { xs: '10px', sm: '12px' },
                  }}
                >
                  {sending ? 'Resending OTP…' : 'Resend OTP'}
                </Button>

                <Button onClick={() => { setStep('identifier'); setOtp(''); }} variant="text" sx={{ mt: -1, alignSelf: 'flex-start' }}>
                  Change email
                </Button>
              </Box>
            )}

            <Box mt={{ xs: 2.5, sm: 3 }} textAlign="center">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                Are you a student?{' '}
                <Button
                  component={Link}
                  to="/student-login"
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
                  Student Login
                </Button>
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mt: 1 }}
              >
                Are you a staff member?{' '}
                <Button
                  component={Link}
                  to="/login-otp"
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
                  Staff OTP Login
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ParentLoginPage;
