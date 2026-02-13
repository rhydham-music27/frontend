import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import CompletedLeadsTable from '../../components/tutors/CompletedLeadsTable';

const TutorLeadsPage: React.FC = () => {
  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={{ xs: 2, sm: 3, md: 4 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 1.5, sm: 2 }}
        px={{ xs: 2, sm: 0 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
          >
            My Demos History
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
          >
            View details and status of all your assigned demo sessions.
          </Typography>
        </Box>
      </Box>

      <CompletedLeadsTable />
    </Container>
  );
};

export default TutorLeadsPage;

