import React, { useState } from 'react';
import { Container, Box, Typography, Grid2 } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import ProfileVerificationCard from '../../components/tutors/ProfileVerificationCard';
import ClassLeadsFeedCard from '../../components/tutors/ClassLeadsFeedCard';
import DemoClassesCard from '../../components/tutors/DemoClassesCard';
import MyClassesCard from '../../components/tutors/MyClassesCard';
import PaymentsEarningsCard from '../../components/tutors/PaymentsEarningsCard';
import FeedbackPerformanceCard from '../../components/tutors/FeedbackPerformanceCard';
import NotificationsCenterCard from '../../components/tutors/NotificationsCenterCard';

const TutorDashboardPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [loading] = useState(false);
  const [error] = useState<any>(null);

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
            Tutor Dashboard
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            Welcome back, {user?.name || 'Tutor'}! Track your classes, demos, and performance.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <DashboardIcon fontSize="small" />
        </Box>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner size={48} message="Loading dashboard..." />
        </Box>
      )}

      {error && <ErrorAlert error={error} />}

      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Quick Overview
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12, lg: 8 }}>
            <ProfileVerificationCard />
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 4 }}>
            <Box 
              sx={{ 
                border: '1px solid #E2E8F0', 
                borderRadius: 2, 
                p: { xs: 2, sm: 2.5, md: 3 },
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
                Quick Stats - Coming Soon
              </Typography>
              <Typography color="text.secondary" variant="body2">
                A snapshot of your performance and notifications will appear here.
              </Typography>
            </Box>
          </Grid2>
        </Grid2>
      </Box>

      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          My Activity
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12, md: 8 }}>
            <ClassLeadsFeedCard />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <DemoClassesCard />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <MyClassesCard />
          </Grid2>
        </Grid2>
      </Box>

      <Box mt={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Financial Overview & Performance
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12, lg: 8 }}>
            <PaymentsEarningsCard />
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 4 }}>
            <FeedbackPerformanceCard />
          </Grid2>
        </Grid2>
      </Box>

      <Box mt={{ xs: 3, sm: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Notifications & Updates
        </Typography>
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          <Grid2 size={{ xs: 12 }}>
            <NotificationsCenterCard />
          </Grid2>
        </Grid2>
      </Box>
    </Container>
  );
};

export default TutorDashboardPage;