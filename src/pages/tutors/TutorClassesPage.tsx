import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import MyClassesCard from '../../components/tutors/MyClassesCard';

const TutorClassesPage: React.FC = () => {
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
            My Classes
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            View your assigned classes, track progress, and manage attendance.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <ClassIcon fontSize="small" />
        </Box>
      </Box>

      <MyClassesCard />
    </Container>
  );
};

export default TutorClassesPage;
