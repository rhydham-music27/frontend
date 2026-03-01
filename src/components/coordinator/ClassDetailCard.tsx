import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, LinearProgress, Divider, Button, Tooltip, TextField, Collapse, IconButton } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { IFinalClass } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

interface ClassDetailCardProps {
  finalClass: IFinalClass;
  onViewDetails?: (classId: string) => void;
  onUpdate?: () => void;
  showActions?: boolean;
  onChangeTestsPerMonth?: (classId: string, value: number) => void;
  onGenerateAdvancePayment?: (classId: string) => Promise<void>;
}

const ClassDetailCard: React.FC<ClassDetailCardProps> = ({
  finalClass,
  onViewDetails,
  showActions = true,
  onChangeTestsPerMonth,
  onGenerateAdvancePayment
}) => {
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);

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

  const monthlyTotalSessions =
    (finalClass as any)?.classLead?.classesPerMonth ??
    (finalClass as any)?.classesPerMonth ??
    finalClass.totalSessions ??
    0;

  const completedForMonth = Math.min(
    Number(finalClass.completedSessions || 0),
    Number(monthlyTotalSessions || 0) || Number(finalClass.completedSessions || 0)
  );

  const progress = monthlyTotalSessions > 0
    ? Math.round((completedForMonth / monthlyTotalSessions) * 100)
    : 0;

  const progressColor: 'primary' | 'secondary' | 'inherit' = progress >= 50 ? 'primary' : 'secondary';

  const days = finalClass.schedule?.daysOfWeek?.join(', ') || '';
  const time = finalClass.schedule?.timeSlot || '';

  const [localTestsPerMonth, setLocalTestsPerMonth] = React.useState<number>(
    typeof finalClass.testPerMonth === 'number' ? finalClass.testPerMonth : 1
  );

  React.useEffect(() => {
    if (typeof finalClass.testPerMonth === 'number') {
      setLocalTestsPerMonth(finalClass.testPerMonth);
    }
  }, [finalClass.testPerMonth]);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {finalClass.studentName}
              </Typography>
              <Chip
                label={finalClass.status}
                color={getStatusColor(finalClass.status) as any}
                size="small"
                variant={finalClass.status === FINAL_CLASS_STATUS.ACTIVE ? 'filled' : 'outlined'}
                sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SchoolIcon sx={{ fontSize: 16, opacity: 0.7 }} />
              {finalClass.grade} â€¢ {finalClass.board} â€¢ {finalClass.mode}
            </Typography>
          </Box>
          <Box textAlign="right">
            {finalClass.subject?.length ? (
              <Box display="flex" gap={0.5} justifyContent="flex-end" flexWrap="wrap" maxWidth={150}>
                {finalClass.subject.slice(0, 2).map(s => (
                  <Chip key={s} label={s} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'action.hover' }} />
                ))}
                {finalClass.subject.length > 2 && <Chip label={`+${finalClass.subject.length - 2}`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
              </Box>
            ) : null}
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">SESSION PROGRESS</Typography>
                <Typography variant="caption" fontWeight={700} color={progressColor}>{progress}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, progress))}
                color={progressColor as any}
                sx={{ height: 6, borderRadius: 3, bgcolor: 'action.selected' }}
              />
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {completedForMonth} / {monthlyTotalSessions} sessions completed
              </Typography>
            </Box>

            <Box display="flex" gap={1}>
              {finalClass.metrics?.pendingAttendanceCount ? (
                <Tooltip title="Pending attendance">
                  <Chip icon={<WarningIcon />} color="warning" size="small" label={`${finalClass.metrics.pendingAttendanceCount} Pending`} variant="outlined" />
                </Tooltip>
              ) : null}
              {finalClass.metrics?.overduePaymentsCount ? (
                <Tooltip title="Overdue payments">
                  <Chip icon={<WarningIcon />} color="error" size="small" label={`${finalClass.metrics.overduePaymentsCount} Overdue`} variant="outlined" />
                </Tooltip>
              ) : null}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Box display="flex" gap={1.5} alignItems="center">
                <PersonIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary" lineHeight={1}>Tutor</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={500}>{finalClass.tutor?.name || 'Unassigned'}</Typography>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" gap={1.5} alignItems="center">
                <AccessTimeIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary" lineHeight={1}>Schedule</Typography>
                  <Typography variant="body2" fontWeight={500}>{days} â€¢ {time}</Typography>
                </Box>
              </Box>
              {typeof finalClass.ratePerSession === 'number' && (
                <Box display="flex" gap={1.5} alignItems="center">
                  <Typography variant="body2" color="action.active" fontWeight={700} sx={{ width: 20, textAlign: 'center' }}>â‚¹</Typography>
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary" lineHeight={1}>Rate</Typography>
                    <Typography variant="body2" fontWeight={500}>{finalClass.ratePerSession}/session</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {finalClass.tutorHistory && finalClass.tutorHistory.length > 0 && (
          <Box mt={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ cursor: 'pointer' }} onClick={() => setShowHistory(!showHistory)}>
              <Box display="flex" alignItems="center" gap={1}>
                <HistoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">TUTOR HISTORY ({finalClass.tutorHistory.length})</Typography>
              </Box>
              <IconButton size="small" sx={{ p: 0 }}>
                {showHistory ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Box>
            <Collapse in={showHistory}>
              <Box mt={1} pl={3} borderLeft="2px solid" borderColor="divider">
                {finalClass.tutorHistory.map((h, i) => (
                  <Box key={i} mb={1}>
                    <Typography variant="body2" fontWeight={500}>{h.tutor?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()}
                    </Typography>
                    {h.reason && <Typography variant="caption" sx={{ fontStyle: 'italic' }}>Reason: {h.reason}</Typography>}
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

        {typeof finalClass.testPerMonth === 'number' && onChangeTestsPerMonth && (
          <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" sx={{ minWidth: 100 }}>Tests/Month:</Typography>
              <TextField
                type="number"
                variant="standard"
                size="small"
                inputProps={{ min: 0, style: { textAlign: 'center' } }}
                sx={{ width: 60 }}
                value={localTestsPerMonth}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isNaN(value) && value >= 0) setLocalTestsPerMonth(value);
                }}
              />
              <Button
                size="small"
                disabled={localTestsPerMonth === (finalClass.testPerMonth ?? 1)}
                onClick={() => onChangeTestsPerMonth(finalClass.id, localTestsPerMonth)}
                sx={{ textTransform: 'none' }}
              >
                Save
              </Button>
            </Box>
          </Box>
        )}

        {showActions && (
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            {onGenerateAdvancePayment && (
              <Button
                variant="contained"
                size="small"
                onClick={() => onGenerateAdvancePayment(finalClass.id)}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'primary.main', color: 'white' }}
              >
                Advance Payment
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={() => onViewDetails?.(finalClass.id)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Details
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassDetailCard;
