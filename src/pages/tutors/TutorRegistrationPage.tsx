import { useState, useEffect } from 'react';
import { TutorLeadNavbar } from '@/components/tutors/TutorLeadNavbar';
import { TutorLeadForm } from '@/components/tutors/TutorLeadForm';
import type { TutorLeadFormData } from '@/types/tutorLead';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { tutorLeadAPI } from '@/api/client';
import { tutorLeadRegistrationSchema } from '@/schemas/applicationschema';
import generateTeacherId from '@/utils/generateTeacherId';
import { Box, Container, Typography, alpha, useTheme, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { getMyProfileForEdit, updateMyProfile } from '@/services/tutorService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const TutorLeadRegistration = () => {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<TutorLeadFormData | null>(null);
  const [errorPopupOpen, setErrorPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'edit' ? 'edit' : 'create';

  // ... (useEffect for edit mode remains same) ...
  useEffect(() => {
    if (mode === 'edit') {
      const fetchProfileData = async () => {
        setLoading(true);
        try {
          const resp = await getMyProfileForEdit();
          const data = resp.data || resp;
          setInitialData(data as TutorLeadFormData);
        } catch (error: any) {
          console.error('Failed to fetch profile data:', error);
          toast.error('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      };
      fetchProfileData();
    }
  }, [mode]);

  const handleSubmit = async (data: TutorLeadFormData) => {
    setSubmitting(true);
    try {
      if (mode === 'edit') {
        // Update existing profile
        await updateMyProfile(data);
        toast.success('Profile updated successfully!');
        navigate('/');
      } else {
        // Create new tutor lead
        const payload = tutorLeadRegistrationSchema.parse(data);
        const generatedTeacherId = generateTeacherId(data.gender as string, data.city as string);
        const toSend = { ...payload, teacherId: generatedTeacherId };

        const resp = await tutorLeadAPI.create(toSend);
        const returnedTeacherId = resp?.teacherId || generatedTeacherId;

        toast.success(`Registration successful! Your Teacher ID: ${returnedTeacherId}`);
        navigate(`/login?email=${encodeURIComponent(data.email)}&teacherId=${encodeURIComponent(returnedTeacherId)}`);
      }
    } catch (error: any) {
      console.error('Operation failed:', error);
      // const msg = error.response?.data?.message || error.message || 'Registration failed';
      // If axios error, try to extract message. api client might put it in a specific place or throw it.
      // Based on client.ts, the interceptor throws the original error BUT might show toast.
      // We want to capture the text for the popup.
      let msg = 'Registration failed. Please try again.';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      
      setErrorMessage(msg);
      setErrorPopupOpen(true);
      // Note: toast.error might still fire from client.ts interceptor. 
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'edit' && loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size={48} message="Loading your profile..." />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f8fafc',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <TutorLeadNavbar />
      
      {/* Premium Background Blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 31, 84, 0.05) 0%, rgba(0, 31, 84, 0) 70%)',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 31, 84, 0.03) 0%, rgba(0, 31, 84, 0) 70%)',
          zIndex: 0
        }}
      />

      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: { xs: 12, md: 16 }, 
          pb: { xs: 8, md: 10 },
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
          color: 'white',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box textAlign="center">
              <Typography 
                variant="overline" 
                sx={{ 
                  color: alpha('#fff', 0.8), 
                  fontWeight: 700, 
                  letterSpacing: '0.2em',
                  mb: 1,
                  display: 'block'
                }}
              >
                {mode === 'edit' ? 'Complete Your Profile' : 'Become a Teacher Partner'}
              </Typography>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight={800} 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {mode === 'edit' ? 'Update Your Information' : 'Shape the Future with Your Shikshak'}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  maxWidth: '700px', 
                  mx: 'auto', 
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                {mode === 'edit' 
                  ? 'Fill in the remaining details to complete your profile and start receiving class opportunities.'
                  : 'Join India\'s most trusted network of expert home tutors. Shared your passion for teaching and earn rewards while making a difference.'}
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Form Section */}
      <Container maxWidth="md" sx={{ mt: -6, pb: 8, position: 'relative', zIndex: 10 }}>
        <TutorLeadForm
          onSubmit={handleSubmit}
          isLoading={submitting}
          initialData={initialData || undefined}
          mode={mode}
        />
        
        {mode === 'create' && (
          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Box 
                component="span" 
                onClick={() => navigate('/login')}
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign In
              </Box>
            </Typography>
          </Box>
        )}
      </Container>
      
      {/* Error Popup Dialog */}
      <Dialog
        open={errorPopupOpen}
        onClose={() => setErrorPopupOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: 'error.main', fontWeight: 600 }}>
          {"Registration Error"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: 'text.primary' }}>
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorPopupOpen(false)} autoFocus variant="contained" color="primary">
            Okay, Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TutorLeadRegistration;