import React from 'react';
import { Card, CardContent, CardActions, Typography, Box, Grid, Chip, LinearProgress, Divider, Button, Tooltip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { IFinalClass } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';

interface ClassDetailCardProps {
  finalClass: IFinalClass;
  onViewDetails?: (classId: string) => void;
  showActions?: boolean;
}

const ClassDetailCard: React.FC<ClassDetailCardProps> = ({ finalClass, onViewDetails, showActions = true }) => {
  const formatDate = (date?: Date) => (date ? new Date(date).toLocaleDateString() : '');

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case FINAL_CLASS_STATUS.ACTIVE:
        return 'success';
      case FINAL_CLASS_STATUS.COMPLETED:
        return 'info';
      case FINAL_CLASS_STATUS.PAUSED:
        return 'warning';
      case FINAL_CLASS_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const progress = typeof finalClass.progressPercentage === 'number'
    ? finalClass.progressPercentage
    : finalClass.totalSessions > 0
      ? Math.round((finalClass.completedSessions / finalClass.totalSessions) * 100)
      : 0;

  const progressColor: 'primary' | 'secondary' | 'inherit' = progress >= 50 ? 'primary' : 'secondary';

  const days = finalClass.schedule?.daysOfWeek?.join(', ') || '';
  const time = finalClass.schedule?.timeSlot || '';

  return (
    <Card elevation={2} sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" noWrap title={finalClass.studentName}>
              {finalClass.studentName}
            </Typography>
          </Box>
          <Chip label={finalClass.status} color={getStatusColor(finalClass.status) as any} size="small" />
        </Box>

        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Chip size="small" label={`Grade: ${finalClass.grade}`} />
          <Chip size="small" label={`Board: ${finalClass.board}`} />
          <Chip size="small" label={`Mode: ${finalClass.mode}`} />
          {finalClass.subject?.length ? (
            <Chip size="small" label={`Subjects: ${finalClass.subject.join(', ')}`} />
          ) : null}
        </Box>

        <Box mb={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                Session Progress: {finalClass.completedSessions} / {finalClass.totalSessions} ({progress}%)
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {finalClass.metrics?.pendingAttendanceCount ? (
                <Tooltip title="Pending attendance approvals">
                  <Chip icon={<WarningIcon />} color="warning" size="small" label={finalClass.metrics.pendingAttendanceCount} />
                </Tooltip>
              ) : null}
              {finalClass.metrics?.overduePaymentsCount ? (
                <Tooltip title="Overdue payments">
                  <Chip icon={<WarningIcon />} color="error" size="small" label={finalClass.metrics.overduePaymentsCount} />
                </Tooltip>
              ) : null}
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, progress))} color={progressColor as any} sx={{ height: 8, borderRadius: 1 }} />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">{`Start: ${formatDate(finalClass.startDate)}`}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">{`End: ${finalClass.endDate ? formatDate(finalClass.endDate) : 'Ongoing'}`}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">{`${days}${days && time ? ' • ' : ''}${time}`}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2">{`Tutor: ${finalClass.tutor?.name || '-'}`}</Typography>
            </Box>
            {finalClass.parent?.name ? (
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">{`Parent: ${finalClass.parent?.name}`}</Typography>
              </Box>
            ) : null}
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          {finalClass.location && (finalClass.mode === 'OFFLINE' || finalClass.mode === 'HYBRID') ? (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">{`Location: ${finalClass.location}`}</Typography>
            </Grid>
          ) : null}
          {typeof finalClass.ratePerSession === 'number' ? (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">{`₹${finalClass.ratePerSession}/session`}</Typography>
            </Grid>
          ) : null}
        </Grid>
      </CardContent>
      {showActions ? (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button variant="outlined" size="small" startIcon={<CheckCircleIcon />} onClick={() => onViewDetails?.(finalClass.id)}>
            View Details
          </Button>
          <Button variant="outlined" size="small" startIcon={<AccessTimeIcon />} disabled>
            View Schedule
          </Button>
        </CardActions>
      ) : null}
    </Card>
  );
};

export default ClassDetailCard;
