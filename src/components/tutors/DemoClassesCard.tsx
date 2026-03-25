import React, { useCallback, useEffect, useState } from 'react';
import { getSubjectList, getOptionLabel, getLeafSubjectList } from '../../utils/subjectUtils';
import { Box, Typography, Chip, CardContent, Grid, Divider, Stack, Button, Card, alpha, CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
import DescriptionIcon from '@mui/icons-material/Description';
import TimerIcon from '@mui/icons-material/Timer';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { getMyDemos, updateDemoStatus } from '../../services/demoService';
import { IDemoHistory, PaginatedResponse } from '../../types';
import { DEMO_STATUS } from '../../constants';
import { useErrorDialog } from '../../hooks/useErrorDialog';
import ErrorDialog from '../common/ErrorDialog';
import DemoAttendanceModal from './DemoAttendanceModal';

const DemoClassesCard: React.FC = () => {
  const [demos, setDemos] = useState<IDemoHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number }>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [updatingDemoId, setUpdatingDemoId] = useState<string | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<IDemoHistory | null>(null);
  const { error: dialogError, showError, clearError, handleError } = useErrorDialog();

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusChipProps = (status?: string): { color: any; label: string } => {
    switch (status) {
      case DEMO_STATUS.SCHEDULED:
        return { color: 'info', label: 'Scheduled' } as any;
      case DEMO_STATUS.COMPLETED:
        return { color: 'warning', label: 'Completed' } as any;
      case DEMO_STATUS.APPROVED:
        return { color: 'success', label: 'Approved' } as any;
      case DEMO_STATUS.REJECTED:
        return { color: 'error', label: 'Rejected' } as any;
      default:
        return { color: 'default', label: status || 'Unknown' } as any;
    }
  };

  const fetchDemos = useCallback(async (page?: number) => {
    try {
      setLoading(true);
      setError(null);

      const requested = page ?? 1;
      const safeRequestedPage = Math.max(1, requested);

      const resp: PaginatedResponse<IDemoHistory[]> = await getMyDemos(safeRequestedPage, pagination.limit);
      const { data, pagination: p } = resp as any;

      const pages = p?.pages || 1;
      const safePageFromApi = Math.min(Math.max(p?.page || 1, 1), pages);

      setDemos(Array.isArray(data) ? data : []);
      setPagination({ page: safePageFromApi, limit: p.limit, total: p.total, pages });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load demo sessions.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchDemos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleMarkCompletedClick = (demo: IDemoHistory) => {
    setSelectedDemo(demo);
    setShowAttendanceModal(true);
  };

  const handleAttendanceSubmit = async (data: {
    attendanceStatus: 'PRESENT' | 'ABSENT';
    topicCovered: string;
    duration: string;
    feedback: string;
  }) => {
    // Correctly extract identifiers (handle both _id and id from backend)
    const demoId = (selectedDemo as any)?._id || selectedDemo?.id;
    const leadId = (selectedDemo?.classLead as any)?._id || selectedDemo?.classLead?.id;

    if (!selectedDemo || !leadId) {
      console.warn('[DemoClassesCard] Cannot submit: Missing leadId', { selectedDemo });
      return;
    }

    try {
      setUpdatingDemoId(demoId);
      await updateDemoStatus(
        leadId,
        DEMO_STATUS.COMPLETED,
        data.feedback,
        undefined,
        undefined,
        data.attendanceStatus,
        data.topicCovered,
        data.duration
      );
      await fetchDemos(pagination.page);
      setShowAttendanceModal(false);
    } catch (e: any) {
      handleError(e);
      throw e; // Re-throw to keep modal open in DemoAttendanceModal
    } finally {
      setUpdatingDemoId(null);
    }
  };

  const onNext = () => {
    if (pagination.page < pagination.pages) {
      fetchDemos(pagination.page + 1);
    }
  };

  const onPrev = () => {
    if (pagination.page > 1) {
      fetchDemos(pagination.page - 1);
    }
  };

  const cardSx = {
    borderRadius: 2,
    bgcolor: '#ffffff',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
    border: 'none',
    transition: 'all 0.3s ease',
  };

  if (loading) {
    return (
      <Card sx={cardSx}>
        <CardContent sx={{ py: 6 }}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
            <CircularProgress size={32} thickness={5} sx={{ color: '#8b5cf6' }} />
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
              SYNCING DEMO SESSIONS...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && demos.length === 0) {
    return (
      <Card sx={cardSx}>
        <CardContent sx={{ py: 4 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={2} sx={{ bgcolor: alpha('#ef4444', 0.05), p: 2, borderRadius: 2 }}>
              <ErrorOutlineIcon sx={{ color: '#ef4444' }} />
              <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                {error}
              </Typography>
            </Box>
            <Button 
              variant="text" 
              onClick={() => fetchDemos()} 
              sx={{ alignSelf: 'center', fontWeight: 800, color: '#8b5cf6', textTransform: 'none' }}
            >
              Try Again
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!loading && demos.length === 0) {
    return null;
  }

  const activeDemos = demos.filter((demo) => demo.status === DEMO_STATUS.SCHEDULED);

  if (!loading && activeDemos.length === 0) {
    return null;
  }

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: alpha('#8b5cf6', 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
                Trial & Demo Sessions
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.02em' }}>
                UPCOMING STUDENT ORIENTATIONS
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              bgcolor: alpha('#8b5cf6', 0.1),
              color: '#7c3aed',
              fontWeight: 900,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
            }}
          >
            {activeDemos.length} SCHEDULED
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxHeight: 600,
            overflowY: 'auto',
            mx: -1,
            px: 1,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#e2e8f0', borderRadius: '4px' },
          }}
        >
          {activeDemos.map((demo, index) => {
            const demoId = (demo as any)._id || demo.id;
            const studentName = demo.classLead?.studentName || '-';
            const studentGender = demo.classLead?.studentGender || '-';
            const leadIdStr = demo.classLead?.leadId || '-';
            const subject = getLeafSubjectList(demo.classLead?.subject).join(', ') || '-';
            const grade = getOptionLabel(demo.classLead?.grade) || '-';
            const board = getOptionLabel(demo.classLead?.board) || '-';
            const mode = getOptionLabel(demo.classLead?.mode) || '-';
            const address = getOptionLabel(demo.classLead?.address) || '-';
            const area = getOptionLabel(demo.classLead?.area) || '-';
            const city = getOptionLabel(demo.classLead?.city) || '-';
            const timing = demo.classLead?.timing || '-';
            const tutorFees = demo.classLead?.tutorFees || 0;
            const classesPerMonth = demo.classLead?.classesPerMonth || '-';
            const classDurationHours = demo.classLead?.classDurationHours || '-';
            const leadNotes = demo.classLead?.notes || '';
            const demoNotes = demo.notes || '';
            const statusProps = getStatusChipProps(demo.status);

            return (
              <Box
                key={demoId || index}
                sx={{
                  borderRadius: 2,
                  p: 2.5,
                  position: 'relative',
                  bgcolor: '#ffffff',
                  border: '1px solid',
                  borderColor: alpha('#e2e8f0', 0.6),
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: alpha('#8b5cf6', 0.2),
                    boxShadow: '0 12px 24px rgba(139, 92, 246, 0.06)',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', mb: 0.5 }}>
                      {studentName} {studentGender !== '-' && <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem' }}>({studentGender})</span>}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', display: 'block' }}>
                      ID: {leadIdStr} • GRADE {grade}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
                      BOARD: {board}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      bgcolor: alpha(statusProps.color === 'info' ? '#3b82f6' : '#10b981', 0.08),
                      color: statusProps.color === 'info' ? '#3b82f6' : '#10b981',
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {statusProps.label}
                  </Box>
                </Box>

                <Grid container spacing={2.5} mb={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha('#f8fafc', 0.8), border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase' }}>Session Details</Typography>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EventIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>{formatDate(demo.demoDate)} @ {demo.demoTime || '-'}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <MenuBookIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>{subject} ({board})</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha('#f8fafc', 0.8), border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase' }}>Parent Info & Schedule</Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>{demo.classLead?.parentName} • {demo.classLead?.parentPhone}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem' }}>Req Timing: {timing}</Typography>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha('#10b981', 0.04), border: '1px solid', borderColor: alpha('#10b981', 0.1) }}>
                      <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase' }}>Financials & Frequency</Typography>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PaymentsIcon sx={{ fontSize: 16, color: '#10b981' }} />
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                            {'\u20B9'}{tutorFees.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>/ MONTHLY</span>
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <TimerIcon sx={{ fontSize: 16, color: '#10b981' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>{classesPerMonth} Classes/mo • {classDurationHours} hr/session</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>

                  {demoNotes && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha('#3b82f6', 0.04), border: '1px solid', borderColor: alpha('#3b82f6', 0.1) }}>
                        <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase' }}>Special Instructions</Typography>
                        <Box display="flex" gap={1}>
                          <DescriptionIcon sx={{ fontSize: 16, color: '#3b82f6', mt: 0.2 }} />
                          <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.5 }}>
                            Demo Note: {demoNotes}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {mode !== 'ONLINE' && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha('#f8fafc', 0.8), border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase' }}>Address</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>{address}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>{area}, {city}</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" gap={1}>
                    <Chip 
                      label={mode} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha('#64748b', 0.08), 
                        color: '#475569', 
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 24
                      }} 
                    />
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    onClick={() => handleMarkCompletedClick(demo)}
                    disabled={updatingDemoId === demoId}
                    sx={{
                      borderRadius: 1.5,
                      py: 1,
                      px: 3,
                      textTransform: 'none',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                      }
                    }}
                  >
                    {updatingDemoId === demoId ? <CircularProgress size={18} color="inherit" /> : 'Mark Completed'}
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>

        {pagination.pages > 1 && (
          <Box display="flex" justifyContent="center" alignItems="center" mt={4} gap={3}>
            <Button
              variant="text"
              disabled={pagination.page <= 1}
              onClick={onPrev}
              sx={{ fontWeight: 800, color: '#64748b' }}
            >
              PREVIOUS
            </Button>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '0.1em' }}>
              {pagination.page} / {pagination.pages}
            </Typography>
            <Button
              variant="text"
              disabled={pagination.page >= pagination.pages}
              onClick={onNext}
              sx={{ fontWeight: 800, color: '#64748b' }}
            >
              NEXT
            </Button>
          </Box>
        )}
      </CardContent>
      <ErrorDialog
        open={showError}
        onClose={clearError}
        error={dialogError}
        title="Session Update Alert"
      />
      <DemoAttendanceModal
        open={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        onSubmit={handleAttendanceSubmit}
        demo={selectedDemo}
      />
    </Card>

  );
};

export default React.memo(DemoClassesCard);

