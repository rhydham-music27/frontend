import React, { useMemo } from 'react';
import { Box, Typography, Grid, alpha } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { IFinalClass } from '../../types';

interface TutorClassesStatsBoxProps {
  classes: IFinalClass[];
  newClassLeads?: number;
}

export const TutorClassesStatsBox: React.FC<TutorClassesStatsBoxProps> = ({
  classes,
  newClassLeads = 0,
}) => {
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let completedThisWeek = 0;
    let completedThisMonth = 0;
    let remainingThisWeek = 0;
    let remainingThisMonth = 0;

    classes.forEach((cls) => {
      const completed = cls.completedSessions || 0;
      const total = cls.totalSessions || 0;
      const remaining = Math.max(total - completed, 0);

      const daysSinceStart = cls.startDate
        ? Math.floor((now.getTime() - new Date(cls.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const avgSessionsPerDay = daysSinceStart > 0 ? completed / daysSinceStart : 0;

      const daysRemainingInWeek = 7 - now.getDay();
      const estimatedRemainingThisWeek = Math.ceil(avgSessionsPerDay * daysRemainingInWeek);
      remainingThisWeek += Math.min(estimatedRemainingThisWeek, remaining);

      remainingThisMonth += remaining;

      const estimatedCompletedThisWeek = Math.floor(avgSessionsPerDay * (now.getDay() + 1));
      completedThisWeek += Math.min(estimatedCompletedThisWeek, completed);

      completedThisMonth += completed;
    });

    const activeClasses = classes.filter((c) => c.status === 'ACTIVE').length;
    const totalAssignedClasses = classes.length;

    return {
      activeClasses,
      totalAssignedClasses,
      completedThisWeek,
      completedThisMonth,
      remainingThisWeek,
      remainingThisMonth,
    };
  }, [classes]);

  const cards = [
    {
      title: 'Classes',
      icon: <SchoolIcon />,
      color: '#6366f1',
      rows: [
        { label: 'Active Classes', value: stats.activeClasses },
        { label: 'Total Assigned', value: stats.totalAssignedClasses },
      ],
      badge: `${Math.round((stats.activeClasses / Math.max(stats.totalAssignedClasses, 1)) * 100)}% Active`,
    },
    {
      title: 'Completed',
      icon: <CheckCircleIcon />,
      color: '#10b981',
      rows: [
        { label: 'This Week', value: stats.completedThisWeek },
        { label: 'This Month', value: stats.completedThisMonth },
      ],
      badge: 'Completed Sessions',
    },
    {
      title: 'Remaining',
      icon: <TrendingUpIcon />,
      color: '#f59e0b',
      rows: [
        { label: 'This Week', value: stats.remainingThisWeek },
        { label: 'This Month', value: stats.remainingThisMonth },
      ],
      badge: 'Remaining Sessions',
    },
    {
      title: 'New Leads',
      icon: <AssignmentIcon />,
      color: '#8b5cf6',
      rows: [
        { label: 'Awaiting Response', value: newClassLeads },
      ],
      badge: 'Class Leads',
      centerValue: true,
    },
  ];

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2 }} mb={3}>
      {cards.map((card, idx) => (
        <Grid item xs={6} sm={6} md={3} key={idx}>
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
                boxShadow: `0 8px 24px ${alpha(card.color, 0.12)}`,
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
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1.25} mb={2}>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 2,
                  bgcolor: alpha(card.color, 0.08),
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.cloneElement(card.icon as React.ReactElement, { sx: { fontSize: 18 } })}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.01em' }}>
                {card.title}
              </Typography>
            </Box>

            {/* Values */}
            <Box mb={1.5}>
              {card.centerValue ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={1}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: card.color, fontSize: { xs: '1.5rem', sm: '1.8rem' } }}>
                    {card.rows[0].value}
                  </Typography>
                </Box>
              ) : (
                card.rows.map((row, i) => (
                  <Box key={i}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={0.5}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        {row.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: card.color, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
                        {row.value}
                      </Typography>
                    </Box>
                    {i < card.rows.length - 1 && (
                      <Box sx={{ height: 1, bgcolor: alpha(card.color, 0.06), my: 0.25 }} />
                    )}
                  </Box>
                ))
              )}
            </Box>

            {/* Badge */}
            <Box
              sx={{
                py: 0.5,
                px: 1.5,
                borderRadius: 2,
                bgcolor: alpha(card.color, 0.06),
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: card.color, fontSize: '0.68rem', letterSpacing: '0.02em' }}>
                {card.badge}
              </Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default TutorClassesStatsBox;
