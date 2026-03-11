import React, { useEffect, useState } from 'react';
import { Box, Grid2, Typography, CircularProgress, alpha, useTheme } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
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
      title: 'Tutor Earnings',
      value: `₹${analytics.earnings.total.toLocaleString()}`,
      subValue: `₹${analytics.earnings.thisMonth.toLocaleString()} this month`,
      icon: <TrendingUpIcon />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
      lightBg: alpha('#10b981', 0.1),
    },
    {
      title: 'Sessions This Week',
      value: analytics.sessions.completedThisWeek,
      subValue: `${analytics.sessions.completedThisMonth} this month`,
      icon: <TimelineIcon />,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
      lightBg: alpha('#6366f1', 0.1),
    },
    {
      title: 'Teaching Hours',
      value: analytics.totalTeachingHours,
      subValue: 'Total hours this month',
      icon: <CheckCircleOutlineIcon />,
      color: '#1e293b',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)',
      lightBg: alpha('#1e293b', 0.1),
    },
    {
      title: 'Demo Approval Rate',
      value: `${Number(analytics.demos.approvalRate || 0).toFixed(2)}%`,
      subValue: `${analytics.demos.approved || 0}/${analytics.demos.total || 0} approved`,
      icon: <RemoveCircleOutlineIcon />,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
      lightBg: alpha('#6366f1', 0.1),
    },
  ];

  return (
    <Grid2 container spacing={{ xs: 1.5, sm: 2 }} mb={{ xs: 2, sm: 3 }}>
      {cards.map((card, index) => (
        <Grid2 key={index} size={{ xs: 6, sm: 4, md: 3 }}>
          <Box
            sx={{
              height: '100%',
              borderRadius: 4,
              bgcolor: '#fff',
              border: '1px solid',
              borderColor: alpha(card.color, 0.1),
              p: { xs: 2.25, sm: 2.5 },
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 4px 20px ${alpha(card.color, 0.05)}`,
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              cursor: 'default',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: `0 12px 30px ${alpha(card.color, 0.18)}`,
                borderColor: alpha(card.color, 0.3),
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 5,
                background: card.gradient,
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.25} mb={2}>
              <Box
                sx={{
                  p: 0.8,
                  borderRadius: '10px',
                  bgcolor: card.lightBg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `inset 0 0 0 1px ${alpha(card.color, 0.1)}`,
                }}
              >
                {React.cloneElement(card.icon as React.ReactElement, { sx: { fontSize: { xs: 18, sm: 20 } } })}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: { xs: '0.62rem', sm: '0.72rem' },
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              >
                {card.title}
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                lineHeight: 1,
                letterSpacing: '-0.03em',
                mb: 0.75,
              }}
            >
              {card.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontSize: { xs: '0.62rem', sm: '0.68rem' },
                fontWeight: 600,
                color: card.color,
                opacity: 0.9,
                letterSpacing: '0.01em',
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
