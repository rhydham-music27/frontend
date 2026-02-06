import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { selectCurrentUser, updateUser } from '../../store/slices/authSlice';
import { getMyProfile } from '../../services/managerService';
import { ManagerVerificationForm } from '../../components/manager/ManagerVerificationForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { IManager } from '../../types';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const ManagerVerificationPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [managerProfile, setManagerProfile] = useState<IManager | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const resp = await getMyProfile();
        if (resp.data) {
          setManagerProfile(resp.data);
          
          // If already verified, redirect to dashboard
          if (resp.data.verificationStatus === 'VERIFIED') {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Failed to fetch manager profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleVerificationComplete = (updatedManager: IManager) => {
    // Update local state or redirect
    if (user) {
        dispatch(updateUser({
            verificationStatus: updatedManager.verificationStatus as any
        }));
    }
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size={48} message="Loading verification status..." />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f8fafc',
        pt: { xs: 8, md: 12 },
        pb: 8
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box 
              sx={{ 
                display: 'inline-flex', 
                p: 2, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                mb: 2
              }}
            >
              <VerifiedUserIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Verify Your Account
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
              Complete your profile verification to access the full manager dashboard and features.
            </Typography>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, md: 6 }, 
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ mb: 6 }}>
              <Stepper activeStep={1} alternativeLabel>
                <Step completed>
                  <StepLabel>Account Created</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Identity Verification</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Complete Profile</StepLabel>
                </Step>
              </Stepper>
            </Box>

            <ManagerVerificationForm 
              onComplete={handleVerificationComplete}
              initialData={managerProfile || undefined}
            />
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ManagerVerificationPage;
