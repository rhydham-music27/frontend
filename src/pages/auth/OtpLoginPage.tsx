import React, { useEffect, useState } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LoginIcon from '@mui/icons-material/Login';
import { sendLoginOtp, resendLoginOtp, verifyLoginOtp } from '../../services/authService';
import { setCredentials, setError } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store';
import { toast } from 'sonner';

const OtpLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // errors are shown via toast popups
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [otpErrorOpen, setOtpErrorOpen] = useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState('');

  // Prefill email if passed via query param (e.g. /login-otp?email=someone@example.com)
  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  // Resend timer countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (step === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [resendTimer, step]);

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    try {
      setSending(true);
      await sendLoginOtp(email.trim());
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
      dispatch(setError(null));
      toast.success('OTP sent to your email!');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim() || !canResend) return;
    try {
      setResending(true);
      await resendLoginOtp(email.trim());
      setResendTimer(60);
      setCanResend(false);
      setOtp(''); // Clear previous OTP
      dispatch(setError(null));
      toast.success('OTP resent successfully!');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to resend OTP';
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    try {
      setVerifying(true);
      const resp: any = await verifyLoginOtp(email.trim(), otp.trim());
      const { user, accessToken } = resp.data || {};
      if (!user || !accessToken) {
        throw new Error('Failed to login with OTP');
      }
      // If tutor logs in via OTP, show complete-profile popup on dashboard
      try {
        if (typeof window !== 'undefined' && (user as any)?.role === 'TUTOR') {
          window.localStorage.setItem('ys_tutor_show_complete_profile', 'true');
        }
      } catch {
        // ignore storage errors
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
      const serverMsg = e?.response?.data?.message;
      const status = e?.response?.status;
      const rawMsg = (serverMsg || e?.message || '').toString();
      const msgLower = rawMsg.toLowerCase();

      const looksLikeOtpError =
        status === 400 ||
        status === 401 ||
        msgLower.includes('otp') ||
        msgLower.includes('invalid') ||
        msgLower.includes('expired');

      const friendlyMsg = looksLikeOtpError
        ? 'Wrong OTP entered. Please try again.'
        : 'An unexpected error occurred. Please try again.';

      setOtpErrorMessage(friendlyMsg);
      setOtpErrorOpen(true);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'var(--full-height)',
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
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Dialog
        open={otpErrorOpen}
        onClose={() => setOtpErrorOpen(false)}
        aria-labelledby="otp-error-dialog-title"
      >
        <DialogTitle id="otp-error-dialog-title">OTP Verification Failed</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {otpErrorMessage || 'Invalid OTP. Please try again.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpErrorOpen(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
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
                OTP Login
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
              Enter your email to receive a one-time password.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>

            {step === 'email' && (
              <Box display="flex" flexDirection="column" gap={{ xs: 2.5, sm: 3 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    sx: {
                      borderRadius: '12px',
                    },
                  }}
                />

                <Button
                  onClick={handleSendOtp}
                  variant="contained"
                  fullWidth
                  disabled={sending || !email.trim()}
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
                  InputProps={{
                    sx: {
                      borderRadius: '12px',
                    },
                  }}
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

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={-1}>
                  <Button
                    onClick={() => setStep('email')}
                    variant="text"
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Change email
                  </Button>

                  <Button
                    onClick={handleResendOtp}
                    variant="text"
                    disabled={!canResend || resending}
                    sx={{
                      alignSelf: 'flex-end',
                      color: canResend ? 'primary.main' : 'text.disabled',
                    }}
                  >
                    {resending ? 'Resending...' : canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
                  </Button>
                </Box>
              </Box>
            )}

            <Box mt={{ xs: 2.5, sm: 3 }} textAlign="center">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                Prefer password login?{' '}
                <Button
                  component={Link}
                  to="/login"
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
                  Go to login
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default OtpLoginPage;
