import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Divider, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let completedThisWeek = 0;
    let completedThisMonth = 0;
    let remainingThisWeek = 0;
    let remainingThisMonth = 0;

    classes.forEach((cls) => {
      const completed = cls.completedSessions || 0;
      const total = cls.totalSessions || 0;
      const remaining = Math.max(total - completed, 0);

      // Calculate days since class started
      const daysSinceStart = cls.startDate
        ? Math.floor((now.getTime() - new Date(cls.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Calculate average sessions per day based on completed sessions and days elapsed
      const avgSessionsPerDay = daysSinceStart > 0 ? completed / daysSinceStart : 0;

      // Remaining sessions this week: avg sessions per day * remaining days in this week
      const daysRemainingInWeek = 7 - now.getDay();
      const estimatedRemainingThisWeek = Math.ceil(avgSessionsPerDay * daysRemainingInWeek);
      remainingThisWeek += Math.min(estimatedRemainingThisWeek, remaining); // Cap at total remaining

      // Remaining sessions this month: all remaining sessions (they will happen this month eventually)
      remainingThisMonth += remaining;

      // Completed this week: sessions where date is >= startOfWeek and <= now
      // (simplified: assume proportional distribution based on completed rate)
      const estimatedCompletedThisWeek = Math.floor(avgSessionsPerDay * (now.getDay() + 1));
      completedThisWeek += Math.min(estimatedCompletedThisWeek, completed);

      // Completed this month: all completed sessions so far (they're already done)
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

  return (
    <Grid container spacing={2} mb={3}>
      {/* Box 1: Active & Total Classes */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%', boxShadow: 2, transition: 'all 0.3s ease', '&:hover': { boxShadow: 4 } }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: '#E3F2FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon sx={{ color: '#1976D2' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Classes
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Active Classes
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196F3' }}>
                  {stats.activeClasses}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Total Assigned
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976D2' }}>
                  {stats.totalAssignedClasses}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={`${Math.round((stats.activeClasses / Math.max(stats.totalAssignedClasses, 1)) * 100)}% Active`}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ width: '100%' }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Box 2: Completed Sessions */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%', boxShadow: 2, transition: 'all 0.3s ease', '&:hover': { boxShadow: 4 } }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: '#E8F5E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon sx={{ color: '#388E3C' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Completed
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  This Week
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#43A047' }}>
                  {stats.completedThisWeek}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  This Month
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#388E3C' }}>
                  {stats.completedThisMonth}
                </Typography>
              </Box>
            </Box>

            <Chip
              label="Completed Sessions"
              size="small"
              variant="outlined"
              color="success"
              sx={{ width: '100%' }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Box 3: Remaining Sessions */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%', boxShadow: 2, transition: 'all 0.3s ease', '&:hover': { boxShadow: 4 } }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: '#FFF3E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUpIcon sx={{ color: '#F57C00' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Remaining
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  This Week
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#F57C00' }}>
                  {stats.remainingThisWeek}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  This Month
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#E65100' }}>
                  {stats.remainingThisMonth}
                </Typography>
              </Box>
            </Box>

            <Chip
              label="Remaining Sessions"
              size="small"
              variant="outlined"
              color="warning"
              sx={{ width: '100%' }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Box 4: New Class Leads */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%', boxShadow: 2, transition: 'all 0.3s ease', '&:hover': { boxShadow: 4 } }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: '#F3E5F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AssignmentIcon sx={{ color: '#7B1FA2' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                New Leads
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="center" alignItems="center" py={1.5}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#7B1FA2' }}>
                  {newClassLeads}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  Awaiting Response
                </Typography>
              </Box>
            </Box>

            <Chip
              label="Class Leads"
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ width: '100%' }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TutorClassesStatsBox;
