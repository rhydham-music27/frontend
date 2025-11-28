import { useState } from 'react';
import { TutorLeadNavbar } from '@/components/tutors/TutorLeadNavbar';
import { TutorLeadForm } from '@/components/tutors/TutorLeadForm';
import type { TutorLeadFormData } from '@/types/tutorLead';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { tutorLeadAPI } from '@/api/client';
import { tutorLeadRegistrationSchema } from '@/schemas/applicationschema';
import generateTeacherId from '@/utils/generateTeacherId';
import { Box, Container, Typography, Paper } from '@mui/material';

export interface TutorLeadPageProps {
  onSubmit?: (data: TutorLeadFormData) => void | Promise<void>;
  isLoading?: boolean;
}

const TutorLeadRegistration = ({ onSubmit, isLoading }: TutorLeadPageProps) => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: TutorLeadFormData) => {
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // parse and validate form data
        const payload = tutorLeadRegistrationSchema.parse(data);

        // generate a teacherId on the frontend using gender and city
        const generatedTeacherId = generateTeacherId(data.gender as string, data.city as string);
        // attach to payload - backend may or may not persist this field depending on server implementation
        const toSend = { ...payload, teacherId: generatedTeacherId };

        const resp = await tutorLeadAPI.create(toSend);

        // prefer backend-returned id if provided, otherwise fall back to our generated id
        const returnedTeacherId = resp?.teacherId || generatedTeacherId;

        toast.success(`Registration successful! Your Teacher ID: ${returnedTeacherId}`);
        // navigate to login with email; include teacherId as query param for convenience
        navigate(`/login?email=${encodeURIComponent(data.email)}&teacherId=${encodeURIComponent(returnedTeacherId)}`);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TutorLeadNavbar />
      <Container maxWidth="md" sx={{ py: 8, pt: 12 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" fontWeight={700} color="primary" gutterBottom>
              Your Shikshak Home Tutor Registration Form
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join our network of expert tutors and start teaching today
            </Typography>
          </Box>

          <TutorLeadForm
            onSubmit={handleSubmit}
            isLoading={submitting || isLoading}
          />
        </Paper>
      </Container>
    </Box>
  );
};
export default TutorLeadRegistration;