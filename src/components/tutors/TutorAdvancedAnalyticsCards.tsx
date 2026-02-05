import React, { useEffect, useState } from 'react';
import { Box, Grid2, Card, CardContent, Typography, CircularProgress, useTheme } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { getTutorAdvancedAnalytics } from '../../services/tutorService';
import { ITutorAdvancedAnalytics } from '../../types';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

const TutorAdvancedAnalyticsCards: React.FC = () => {
  const theme = useTheme();
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ITutorAdvancedAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const tutorId = (user as any).id || (user as any)._id;
        const res = await getTutorAdvancedAnalytics(tutorId);
        setAnalytics(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error || !analytics) return null;

  const cards = [
    {
      title: 'Sessions This Week',
      value: analytics.sessions.completedThisWeek,
      subValue: `${analytics.sessions.completedThisMonth} this month`,
      icon: <TimelineIcon />,
      color: theme.palette.primary.main,
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
    },
    {
      title: 'Earnings This Week',
      value: `₹${analytics.earnings.thisWeek.toLocaleString()}`,
      subValue: `₹${analytics.earnings.thisMonth.toLocaleString()} this month`,
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
    {
      title: 'New Classes (Month)',
      value: analytics.newClassesCount,
      subValue: 'Growth this month',
      icon: <GroupAddIcon />,
      color: theme.palette.warning.main,
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    },
    {
      title: 'Demo Approval Rate',
      value: `${analytics.demos.approvalRate}%`,
      subValue: `${analytics.demos.approved}/${analytics.demos.total} approved`,
      icon: <CheckCircleOutlineIcon />,
      color: theme.palette.secondary.main,
      gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    },
  ];

  return (
    <Grid2 container spacing={{ xs: 2.5, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
      {cards.map((card, index) => (
        <Grid2 key={index} size={{ xs: 6, sm: 6, lg: 3 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: 'grey.100',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
                borderColor: 'primary.light',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(0,0,0,0.02)',
                borderRadius: '50%',
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: '12px',
                    background: card.gradient,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 16px -4px ${card.color}40`,
                  }}
                >
                  {React.cloneElement(card.icon as React.ReactElement, { sx: { fontSize: { xs: 20, sm: 24 } } })}
                </Box>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600} 
                gutterBottom 
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {card.title}
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight={800} 
                color="text.primary"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' } }}
              >
                {card.value}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  mt: 1, 
                  display: 'block',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  fontWeight: 500
                }}
              >
                {card.subValue}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  );
};

export default TutorAdvancedAnalyticsCards;
