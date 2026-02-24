import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link as MLink,
  MenuItem,
  InputAdornment,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkIcon from '@mui/icons-material/Work';
import { USER_ROLES } from '../../constants';
import { useOptions } from '@/hooks/useOptions';
// Grid component is used from @mui/material

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  city?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  role: string;
  permissions?: {
    canViewSiteLeads?: boolean;
    canVerifyTutors?: boolean;
    canCreateLeads?: boolean;
  };
}

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Minimum 2 characters'),
  email: yup.string().required('Email is required').email('Enter a valid email'),
  password: yup.string().required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
  phone: yup.string().optional(),
  city: yup
    .string()
    .transform((v) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined))
    .optional(),
  gender: yup
    .mixed<'MALE' | 'FEMALE' | 'OTHER'>()
    .oneOf(['MALE', 'FEMALE', 'OTHER'] as const)
    .transform((v) => (v ? v : undefined))
    .optional(),
  role: yup.string().oneOf(Object.values(USER_ROLES) as string[], 'Invalid role').required('Role is required'),
  permissions: yup.object({
    canViewSiteLeads: yup.boolean().optional(),
    canVerifyTutors: yup.boolean().optional(),
    canCreateLeads: yup.boolean().optional(),
  }).optional(),
});

const RegisterPage: React.FC = () => {
  const { register: registerUser, loading, error, isAuthenticated, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  const [isRegisteredSuccessfully, setIsRegisteredSuccessfully] = useState(false);

  const { options: cityOptions } = useOptions('CITY');

  // Detect if there's a specific role requested (e.g. from Admin Manager page)
  const queryRole = searchParams.get('role')?.toUpperCase();
  const isRoleLocked = !!queryRole && (Object.values(USER_ROLES) as string[]).includes(queryRole);
  const initialRole = isRoleLocked ? queryRole : USER_ROLES.TUTOR; // Default to Tutor for public registration

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      role: initialRole,
      permissions: {
        canViewSiteLeads: true,
        canVerifyTutors: true,
        canCreateLeads: true,
      },
    }
  });

  const onSubmit = async ({ confirmPassword, ...data }: RegisterFormValues) => {
    try {
      clearError(); // Clear any previous errors

      // Clean up permissions if role is not MANAGER
      const submitData = { ...data };
      if (data.role !== USER_ROLES.MANAGER) {
        delete submitData.permissions;
      }

      // If user is already authenticated (Admin), skip auto-login for new user
      const success = await registerUser(
        submitData.name,
        submitData.email,
        submitData.password,
        submitData.phone,
        submitData.city,
        submitData.gender,
        submitData.role,
        isAuthenticated,
        submitData.permissions
      );

      // Only set success if registration succeeded
      if (success) {
        setIsRegisteredSuccessfully(true);
      }
    } catch (e) {
      // Error handled by hook state 'error'
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
        background: 'linear-gradient(135deg, #4A148C 0%, #311B92 100%)', // Admin Purple Theme
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Abstract Background Shapes */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        animation: 'pulse 15s infinite ease-in-out',
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
        animation: 'pulse 10s infinite ease-in-out reverse',
      }} />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" mb={4}>
          {/* Logo / Brand Area */}
          <Box
            display="inline-flex"
            alignItems="center"
            gap={2}
            sx={{
              p: 1.5,
              pr: 3,
              borderRadius: 10,
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
          >
            <Box
              component="img"
              src="/1.jpg"
              alt="Logo"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid white'
              }}
            />
            <Typography variant="h5" fontWeight={700} color="white" sx={{ letterSpacing: 0.5 }}>
              Your Shikshak
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color="white" mt={3}>
            {isRoleLocked ? `Register ${queryRole.charAt(0) + queryRole.slice(1).toLowerCase()}` : 'Register New Member'}
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)" mt={1}>
            Create accounts for Managers, Tutors, Parents, or other Admins.
          </Typography>
        </Box>

        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'visible' // To allow potential popouts if needed, but verify borders
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>

            {isRegisteredSuccessfully ? (
              <Box textAlign="center" py={4}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Account Created Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                  A confirmation email has been sent to the registered email address.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setIsRegisteredSuccessfully(false)}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Register Another Member
                </Button>
              </Box>
            ) : (
              <>
                <Box display="flex" alignItems="center" gap={2} mb={4} sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    <PersonAddIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Account Details</Typography>
                    <Typography variant="body2" color="text.secondary">Enter the new member's information.</Typography>
                  </Box>
                </Box>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Name"
                        placeholder="e.g. Rahul Sharma"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        {...register('name')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Email Address"
                        placeholder="email@example.com"
                        type="email"
                        fullWidth
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        {...register('email')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Phone Number"
                        placeholder="+91..."
                        fullWidth
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        {...register('phone')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        label="City"
                        fullWidth
                        error={!!errors.city}
                        helperText={errors.city?.message}
                        {...register('city')}
                      >
                        {cityOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.label}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        label="Gender"
                        fullWidth
                        error={!!errors.gender}
                        helperText={errors.gender?.message as any}
                        {...register('gender')}
                      >
                        <MenuItem value="MALE">Male</MenuItem>
                        <MenuItem value="FEMALE">Female</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Role"
                        fullWidth
                        disabled={isRoleLocked}
                        error={!!errors.role}
                        helperText={errors.role?.message || (isRoleLocked ? `Role is locked to ${queryRole}` : '')}
                        {...register('role')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        {Object.values(USER_ROLES).map((role) => (
                          <MenuItem key={role} value={role}>
                            {role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        {...register('password')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Manager Permissions Section */}
                    <ManagerPermissionsSection register={register} errors={errors} />

                    <Grid item xs={12}>
                      <Box mt={2}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={loading}
                          size="large"
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: '1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 8px 20px rgba(74, 20, 140, 0.3)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 24px rgba(74, 20, 140, 0.4)',
                            },
                          }}
                        >
                          {loading ? <LoadingSpinner size={24} /> : 'Create Member Account'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}

            <Box mt={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Need to sign in instead?{' '}
                <MLink component={Link} to="/login" fontWeight={600} underline="hover">
                  Go to Login
                </MLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Error Dialog */}
      <Dialog open={!!error} onClose={clearError} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Registration Error
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 2, color: '#333' }}>
            {error}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearError} variant="contained" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper component for Manager Permissions
interface ManagerPermissionsSectionProps {
  register: any;
  errors: any;
}

const ManagerPermissionsSection: React.FC<ManagerPermissionsSectionProps> = ({ register }) => {
  const [selectedRole, setSelectedRole] = React.useState<string>('');

  React.useEffect(() => {
    // Watch for role changes using a simple workaround
    const subscription = setInterval(() => {
      const roleInput = document.querySelector<HTMLInputElement>('input[name="role"]');
      if (roleInput && roleInput.value !== selectedRole) {
        setSelectedRole(roleInput.value);
      }
    }, 100);
    return () => clearInterval(subscription);
  }, [selectedRole]);

  if (selectedRole !== USER_ROLES.MANAGER) return null;

  return (
    <Grid item xs={12}>
      <Box
        sx={{
          p: 3,
          bgcolor: 'primary.light',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.main'
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} gutterBottom color="primary.dark">
          Manager Permissions
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Select which actions this manager can perform:
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked
                {...register('permissions.canViewSiteLeads')}
              />
            }
            label="Can view and update leads created by admin"
          />
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked
                {...register('permissions.canVerifyTutors')}
              />
            }
            label="Can verify tutors"
          />
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked
                {...register('permissions.canCreateLeads')}
              />
            }
            label="Can create their own leads"
          />
        </FormGroup>
      </Box>
    </Grid>
  );
};

export default RegisterPage;