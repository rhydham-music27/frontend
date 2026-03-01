import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, CircularProgress } from '@mui/material';
import { ITutor } from '../../types';
import tutorService from '../../services/tutorService';
import ErrorAlert from '../../components/common/ErrorAlert';
import PublicTutorProfileCard from '../../components/tutors/PublicTutorProfileCard';
import TutorLeadNavbar from '../../components/tutors/TutorLeadNavbar';

const TutorPublicProfilePage: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const [tutor, setTutor] = useState<ITutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorAndReviews = async () => {
      if (!teacherId) {
        setError('Tutor not found');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await tutorService.getPublicTutorProfile(teacherId);
        setTutor(res.data);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Failed to load tutor profile.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorAndReviews();
  }, [teacherId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={32} />
        </Box>
      </Container>
    );
  }

  if (error || !tutor) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 50%, #EFF6FF 100%)',
        }}
      >
        <Container maxWidth="sm">
          <ErrorAlert error={error || 'Tutor not found'} />
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #F9FAFB 40%, #ECFDF5 100%)',
      }}
    >
      <TutorLeadNavbar />
      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
        <PublicTutorProfileCard tutor={tutor} />
      </Container>
    </Box>
  );
}

export default TutorPublicProfilePage;
