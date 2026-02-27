import React, { useEffect, useState } from 'react';
import { Box, Grid2, Typography, CircularProgress, alpha, useTheme } from '@mui/material';
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
      color: '#6366f1',
      lightBg: alpha('#6366f1', 0.08),
    },
    {
      title: 'Earnings This Week',
      value: `₹${analytics.earnings.thisWeek.toLocaleString()}`,
      subValue: `₹${analytics.earnings.thisMonth.toLocaleString()} this month`,
      icon: <TrendingUpIcon />,
      color: '#10b981',
      lightBg: alpha('#10b981', 0.08),
    },
    {
      title: 'New Classes (Month)',
      value: analytics.newClassesCount,
      subValue: 'Growth this month',
      icon: <GroupAddIcon />,
      color: '#f59e0b',
      lightBg: alpha('#f59e0b', 0.08),
    },
    {
      title: 'Demo Approval Rate',
      value: `${analytics.demos.approvalRate}%`,
      subValue: `${analytics.demos.approved}/${analytics.demos.total} approved`,
      icon: <CheckCircleOutlineIcon />,
      color: '#ec4899',
      lightBg: alpha('#ec4899', 0.08),
    },
  ];

  return (
    <Grid2 container spacing={{ xs: 1.5, sm: 2 }} mb={{ xs: 2, sm: 3 }}>
      {cards.map((card, index) => (
        <Grid2 key={index} size={{ xs: 6, sm: 6, md: 3 }}>
          <Box
            sx={{
              height: '100%',
              borderRadius: 3,
              bgcolor: '#fff',
              border: '1px solid',
              borderColor: alpha(card.color, 0.12),
              p: { xs: 2, sm: 2.5 },
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha(card.color, 0.15)}`,
                borderColor: alpha(card.color, 0.25),
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${card.color}, ${alpha(card.color, 0.4)})`,
                borderRadius: '12px 12px 0 0',
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 2,
                  bgcolor: card.lightBg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.cloneElement(card.icon as React.ReactElement, { sx: { fontSize: { xs: 18, sm: 20 } } })}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: { xs: '0.68rem', sm: '0.78rem' },
                  lineHeight: 1.2,
                  letterSpacing: '0.01em',
                }}
              >
                {card.title}
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.7rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {card.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: 0.75,
                display: 'block',
                fontSize: { xs: '0.6rem', sm: '0.68rem' },
                fontWeight: 500,
                color: alpha(card.color, 0.8),
              }}
            >
              {card.subValue}
            </Typography>
          </Box>
        </Grid2>
      ))}
    </Grid2>
  );
};

export default TutorAdvancedAnalyticsCards;
