import React from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, Link as MLink, Grid2, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { USER_ROLES } from '../../constants';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role: string;
}

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Minimum 2 characters'),
  email: yup.string().required('Email is required').email('Enter a valid email'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
  phone: yup.string().optional(),
  role: yup.string().oneOf(Object.values(USER_ROLES) as string[], 'Invalid role').required('Role is required'),
});

const RegisterPage: React.FC = () => {
  const { register: registerUser, loading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async ({ confirmPassword, ...data }: RegisterFormValues) => {
    await registerUser(data.name, data.email, data.password, data.phone, data.role);
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
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
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
                Join our educational platform
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
            <PersonAddIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'white', mb: { xs: 0.75, sm: 1 } }} />
            <Typography 
              variant="h5" 
              color="white" 
              fontWeight={700}
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Create Account
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                mt: 0.5,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              }}
            >
              Get started with Your Shikshak today
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <ErrorAlert error={error} onClose={clearError} />
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid2 container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                <Grid2 size={{ xs: 12 }}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    {...register('name')}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                    }}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register('email')}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                    }}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Phone (optional)"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    {...register('phone')}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                    }}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Role"
                    select
                    fullWidth
                    error={!!errors.role}
                    helperText={errors.role?.message}
                    defaultValue={USER_ROLES.MANAGER}
                    {...register('role')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  >
                    {Object.values(USER_ROLES).map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    {...register('password')}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                    }}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                    }}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    disabled={loading}
                    sx={{
                      py: { xs: 1.25, sm: 1.5 },
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                      fontWeight: 600,
                      borderRadius: { xs: '10px', sm: '12px' },
                      background: 'linear-gradient(135deg, #8A3FFC 0%, #A56EFF 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6929C4 0%, #8A3FFC 100%)',
                      },
                    }}
                  >
                    {loading ? <LoadingSpinner size={24} /> : 'Create Account'}
                  </Button>
                </Grid2>
              </Grid2>
            </Box>

            <Box mt={{ xs: 2.5, sm: 3 }} textAlign="center">
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                Already have an account?{' '}
                <MLink 
                  component={Link} 
                  to="/login" 
                  sx={{ 
                    color: 'secondary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign In
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

export default RegisterPage;