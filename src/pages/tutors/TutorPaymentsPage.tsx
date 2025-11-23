import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import PaymentsEarningsCard from '../../components/tutors/PaymentsEarningsCard';

const TutorPaymentsPage: React.FC = () => {
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
            My Payments
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            View all your class payments, earnings, and payment history.
          </Typography>
        </Box>
      </Box>

      <Box mb={{ xs: 3, sm: 4 }}>
        <PaymentsEarningsCard />
      </Box>
    </Container>
  );
};

export default TutorPaymentsPage;
