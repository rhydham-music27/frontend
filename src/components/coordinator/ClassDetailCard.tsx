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
import TutorSelectionModal from '../common/TutorSelectionModal';
import finalClassService from '../../services/finalClassService';

interface ClassDetailCardProps {
  finalClass: IFinalClass;
  onViewDetails?: (classId: string) => void;
  onGenerateAdvancePayment?: (classId: string) => void;
  onUpdate?: () => void;
  showActions?: boolean;
  onChangeTestsPerMonth?: (classId: string, value: number) => void;
}

const ClassDetailCard: React.FC<ClassDetailCardProps> = ({ 
  finalClass, 
  onViewDetails, 
  onGenerateAdvancePayment, 
  onUpdate,
  showActions = true, 
  onChangeTestsPerMonth 
}) => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const [tutorModalOpen, setTutorModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const [localTestsPerMonth, setLocalTestsPerMonth] = React.useState<number>(
    typeof finalClass.testPerMonth === 'number' ? finalClass.testPerMonth : 1
  );

  React.useEffect(() => {
    if (typeof finalClass.testPerMonth === 'number') {
      setLocalTestsPerMonth(finalClass.testPerMonth);
    }
  }, [finalClass.testPerMonth]);

  const handleChangeTutor = async (newTutorId: string, tutorName: string) => {
    const reason = window.prompt(`Reason for changing tutor to ${tutorName}:`);
    if (reason === null) return;

    try {
      setLoading(true);
      await finalClassService.changeTutor(finalClass.id, newTutorId, reason);
      setTutorModalOpen(false);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to change tutor:', err);
      alert('Failed to change tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleTutorLeaving = async () => {
    if (!window.confirm('Are you sure you want to mark the current tutor as LEFT? This will allow you to repost the class as a lead.')) {
      return;
    }

    const reason = window.prompt('Reason for tutor leaving:');
    if (reason === null) return;

    try {
      setLoading(true);
      await finalClassService.recordTutorLeaving(finalClass.id, reason);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to record tutor leaving:', err);
      alert('Failed to record tutor leaving');
    } finally {
      setLoading(false);
    }
  };

  const handleRepostAsLead = async () => {
    if (!window.confirm('Are you sure you want to repost this class as a new lead opportunity?')) {
      return;
    }

    try {
      setLoading(true);
      await finalClassService.repostAsLead(finalClass.id);
      alert('Class successfully reposted as a new lead!');
    } catch (err) {
      console.error('Failed to repost lead:', err);
      alert('Failed to repost lead');
    } finally {
      setLoading(false);
    }
  };

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
              {finalClass.grade} • {finalClass.board} • {finalClass.mode}
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
                {finalClass.completedSessions} / {finalClass.totalSessions} sessions completed
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
                    {isManagerOrAdmin && finalClass.status === FINAL_CLASS_STATUS.ACTIVE && (
                      <Button size="small" variant="text" sx={{ p: 0, minWidth: 'auto', fontSize: '0.625rem' }} onClick={() => setTutorModalOpen(true)}>
                        Change
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box display="flex" gap={1.5} alignItems="center">
                <AccessTimeIcon color="action" fontSize="small" />
                 <Box>
                  <Typography variant="caption" display="block" color="text.secondary" lineHeight={1}>Schedule</Typography>
                  <Typography variant="body2" fontWeight={500}>{days} • {time}</Typography>
                </Box>
              </Box>
               {typeof finalClass.ratePerSession === 'number' && (
                <Box display="flex" gap={1.5} alignItems="center">
                  <Typography variant="body2" color="action.active" fontWeight={700} sx={{ width: 20, textAlign: 'center' }}>₹</Typography>
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
            {isManagerOrAdmin && finalClass.status === FINAL_CLASS_STATUS.ACTIVE && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  onClick={handleTutorLeaving}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                  disabled={loading}
                >
                  Tutor Left
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="info"
                  onClick={handleRepostAsLead}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                  disabled={loading}
                >
                  Repost as Lead
                </Button>
              </>
            )}
             <Button
              variant="outlined"
              size="small"
              onClick={() => onViewDetails?.(finalClass.id)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Details
            </Button>
            <Button
              variant="contained"
              size="small"
              disableElevation
              onClick={() => onGenerateAdvancePayment?.(finalClass.id)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Generate Advance
            </Button>
          </Box>
        )}
      </CardContent>
      
      <TutorSelectionModal
        open={tutorModalOpen}
        onClose={() => setTutorModalOpen(false)}
        onSelect={handleChangeTutor}
        excludeTutorId={finalClass.tutor?.id}
      />
    </Card>
  );
};

export default ClassDetailCard;
