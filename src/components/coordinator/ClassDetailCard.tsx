import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, LinearProgress, Divider, Button, Tooltip, TextField, Collapse, IconButton, alpha, useTheme, Avatar } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { IFinalClass } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { getOptionLabel } from '../../utils/subjectUtils';

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
  const theme = useTheme();
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case FINAL_CLASS_STATUS.ACTIVE:
        return theme.palette.success.main;
      case FINAL_CLASS_STATUS.COMPLETED:
        return theme.palette.info.main;
      case FINAL_CLASS_STATUS.PAUSED:
        return theme.palette.warning.main;
      case FINAL_CLASS_STATUS.CANCELLED:
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const monthlyTotalSessions =
    (finalClass as any)?.metrics?.totalSessionsThisMonth ??
    (finalClass as any)?.classLead?.classesPerMonth ??
    (finalClass as any)?.classesPerMonth ??
    finalClass.totalSessions ??
    0;

  const completedForMonth = Math.min(
    Number((finalClass as any)?.metrics?.completedSessionsThisMonth ?? finalClass.completedSessions ?? 0),
    Number(monthlyTotalSessions || 0) || Number((finalClass as any)?.metrics?.completedSessionsThisMonth ?? finalClass.completedSessions ?? 0)
  );

  const progress = monthlyTotalSessions > 0
    ? Math.round((completedForMonth / monthlyTotalSessions) * 100)
    : 0;

  const progressColor = progress >= 80 ? 'success' : progress >= 40 ? 'primary' : 'warning';

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

  const statusColor = getStatusColor(finalClass.status);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.08),
        background: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha(statusColor, 0.3),
          boxShadow: `0 12px 24px -10px ${alpha(statusColor, 0.2)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6px',
          height: '100%',
          bgcolor: statusColor,
          opacity: 0.8
        }
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {finalClass.studentName}
              </Typography>
              <Chip
                label={finalClass.status}
                sx={{ 
                  height: 22, 
                  fontSize: '0.65rem', 
                  fontWeight: 800,
                  bgcolor: alpha(statusColor, 0.1),
                  color: statusColor,
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, opacity: 0.8 }}>
              <SchoolIcon sx={{ fontSize: 16 }} />
              {getOptionLabel(finalClass.grade)} • {getOptionLabel(finalClass.board)} • {getOptionLabel(finalClass.mode)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 120 }}>
            {finalClass.subject?.slice(0, 2).map((s) => (
              <Chip 
                key={getOptionLabel(s)} 
                label={getOptionLabel(s)} 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.65rem', 
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  color: 'primary.main',
                  borderRadius: '4px'
                }} 
              />
            ))}
            {finalClass.subject && finalClass.subject.length > 2 && (
              <Chip 
                label={`+${finalClass.subject.length - 2}`} 
                size="small" 
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, borderRadius: '4px' }} 
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3, opacity: 0.5 }} />

        {/* Progress Section */}
        <Box mb={3.5}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={1}>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cycle Progress
              </Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary" display="block">
                {completedForMonth} / {monthlyTotalSessions} <Typography component="span" variant="caption" color="text.secondary">Sessions</Typography>
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={900} color={`${progressColor}.main`} sx={{ lineHeight: 1 }}>
              {progress}<Typography component="span" variant="caption" fontWeight={700} sx={{ ml: 0.2 }}>%</Typography>
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={progressColor as any}
            sx={{ 
              height: 10, 
              borderRadius: 5, 
              bgcolor: alpha(theme.palette.divider, 0.05),
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
              '& .MuiLinearProgress-bar': { borderRadius: 5 }
            }}
          />
        </Box>

        {/* Details Grid */}
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', width: 36, height: 36 }}>
                <PersonIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ lineHeight: 1 }}>
                  Tutor
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {finalClass.tutor?.name || 'Waiting Assignment'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.08), color: 'secondary.main', width: 36, height: 36 }}>
                <AccessTimeIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ lineHeight: 1 }}>
                  Schedule
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {days} • {time}
                </Typography>
              </Box>
            </Box>
          </Grid>
          {typeof finalClass.ratePerSession === 'number' && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main', width: 36, height: 36 }}>
                  <CurrencyRupeeIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ lineHeight: 1 }}>
                    Session Rate
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {'\u20B9'}{finalClass.ratePerSession} <Typography component="span" variant="caption" color="text.secondary">/ session</Typography>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Alerts Section */}
        {(finalClass.metrics?.pendingAttendanceCount || finalClass.metrics?.overduePaymentsCount) ? (
          <Box display="flex" gap={1} mt={3}>
            {finalClass.metrics?.pendingAttendanceCount ? (
              <Chip 
                icon={<WarningIcon sx={{ fontSize: '14px !important' }} />} 
                label={`${finalClass.metrics.pendingAttendanceCount} Pending Attendance`} 
                size="small" 
                sx={{ 
                  bgcolor: alpha(theme.palette.warning.main, 0.1), 
                  color: 'warning.dark', 
                  fontWeight: 700,
                  fontSize: '0.65rem'
                }} 
              />
            ) : null}
             {finalClass.metrics?.overduePaymentsCount ? (
              <Chip 
                icon={<WarningIcon sx={{ fontSize: '14px !important' }} />} 
                label={`${finalClass.metrics.overduePaymentsCount} Overdue Payments`} 
                size="small" 
                sx={{ 
                  bgcolor: alpha(theme.palette.error.main, 0.1), 
                  color: 'error.dark', 
                  fontWeight: 700,
                  fontSize: '0.65rem'
                }} 
              />
            ) : null}
          </Box>
        ) : null}

        {/* History Section */}
        {finalClass.tutorHistory && finalClass.tutorHistory.length > 0 && (
          <Box mt={3} pt={2.5} borderTop={`1px dashed ${theme.palette.divider}`}>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between" 
              sx={{ cursor: 'pointer', '&:hover opacity': 0.8 }} 
              onClick={() => setShowHistory(!showHistory)}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <HistoryIcon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tutor History ({finalClass.tutorHistory.length})
                </Typography>
              </Box>
              <IconButton size="small" sx={{ p: 0, color: 'text.secondary' }}>
                {showHistory ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Box>
            <Collapse in={showHistory}>
              <Box mt={2} pl={2} borderLeft={`2px solid ${alpha(theme.palette.primary.main, 0.2)}`}>
                {finalClass.tutorHistory.map((h, i) => (
                  <Box key={i} mb={1.5} sx={{ position: 'relative' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>{h.tutor?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      {new Date(h.startDate).toLocaleDateString()} — {new Date(h.endDate).toLocaleDateString()}
                    </Typography>
                    {h.reason && (
                      <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5, color: 'text.secondary', fontSize: '0.7rem' }}>
                        "{h.reason}"
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0, mt: 'auto', display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="small"
          onClick={() => onViewDetails?.(finalClass.id)}
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            borderRadius: '12px', 
            textTransform: 'none', 
            fontWeight: 700,
            py: 1,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none', bgcolor: 'primary.dark' }
          }}
        >
          View Details
        </Button>
        {onGenerateAdvancePayment && (
           <Tooltip title="Generate Advance Payment">
            <IconButton 
              size="small" 
              onClick={() => onGenerateAdvancePayment(finalClass.id)}
              sx={{ 
                borderRadius: '12px', 
                bgcolor: alpha(theme.palette.success.main, 0.1), 
                color: 'success.main',
                width: 40,
                height: 40,
                '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
              }}
            >
              <CurrencyRupeeIcon fontSize="small" />
            </IconButton>
           </Tooltip>
        )}
      </Box>
    </Card>
  );
};

export default ClassDetailCard;
