import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import ProfileVerificationCard from '../../components/tutors/ProfileVerificationCard';
import MUIProfileCard from '../../components/tutors/MUIProfileCard';

const TutorProfilePage: React.FC = () => {
  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={{ xs: 3, sm: 4 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 2 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            My Profile
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            View and manage your tutor profile, documents, and verification status.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          px: { xs: 1.5, sm: 0 },
        }}
      >
        <Box
          sx={{
            maxWidth: '100%',
          }}
        >
          <MUIProfileCard />
        </Box>
      </Box>

      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          px: { xs: 1.5, sm: 0 },
        }}
      >
        <Box sx={{ maxWidth: 960, mx: 'auto' }}>
          <ProfileVerificationCard />
        </Box>
      </Box>
    </Container>
  );
};

export default TutorProfilePage;
