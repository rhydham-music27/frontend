import React, { useEffect } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, Link as MLink, alpha } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoginIcon from '@mui/icons-material/Login';

interface LoginFormValues {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().required('Email is required').email('Enter a valid email'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
});

const LoginPage: React.FC = () => {
  const { login, loading, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({ resolver: yupResolver(schema), defaultValues: { email: '', password: '' } });

  useEffect(() => {
    const id = searchParams.get('email');
    if (id) {
      reset({ email: id, password: '' });
    }
  }, [searchParams, reset]);

  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
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
                Empowering Tutors, Enabling Futures
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
              Welcome Back
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                mt: 0.5,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              }}
            >
              Sign in to continue to your dashboard
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <ErrorAlert error={error} onClose={clearError} />
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={{ xs: 2.5, sm: 3 }}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email')}
                InputProps={{
                  sx: {
                    borderRadius: '12px',
                  },
                }}
              />
              
              <TextField
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password')}
                InputProps={{
                  sx: {
                    borderRadius: '12px',
                  },
                }}
              />

              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                disabled={loading}
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
                {loading ? <LoadingSpinner size={24} /> : 'Sign In'}
              </Button>
            </Box>

            <Box mt={{ xs: 2.5, sm: 3 }} textAlign="center">
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                Don't have an account?{' '}
                <MLink 
                  component={Link} 
                  to="/register" 
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create Account
                </MLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            textAlign: 'center',
            mt: 3,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          © 2024 Your Shikshak. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;