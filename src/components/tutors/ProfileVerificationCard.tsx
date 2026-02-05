import React, { useEffect, useState } from 'react';
import { Box, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ITutor } from '../../types';
import { getTutorById, getMyProfile } from '../../services/tutorService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { Card } from '@mui/material';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  border: '1px solid',
  borderColor: theme.palette.divider,
}));



interface ProfileVerificationCardProps {
  tutorId?: string;
}

const ProfileVerificationCard: React.FC<ProfileVerificationCardProps> = ({ tutorId }) => {
  const [tutorProfile, setTutorProfile] = useState<ITutor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const fetchTutorProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = tutorId ? await getTutorById(tutorId) : await getMyProfile();
      const data = (response as any)?.data ?? response;
      setTutorProfile(data as ITutor);
    } catch (e: any) {
      setError(e?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId]);



  if (loading && !tutorProfile) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <LoadingSpinner size={40} message="Loading profile..." />
      </Box>
    );
  }

  if (error && !tutorProfile) {
    return <ErrorAlert error={error} />;
  }

  if (!loading && !tutorProfile) {
    return (
      <StyledCard>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Tutor profile not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your profile could not be located. Please contact the administrator.
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  return (
  <>
  </>
  );
};

export default ProfileVerificationCard;
