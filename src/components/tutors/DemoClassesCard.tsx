import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Chip, CardContent, Grid, Divider, Stack, Button, Card, alpha } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

  const cardSx = {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'grey.100',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s',
    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  };

  if (loading) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" justifyContent="center" py={6} aria-busy>
            <LoadingSpinner message="Loading demo sessions..." />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && demos.length === 0) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <ErrorAlert error={error} />
            <Box display="flex" justifyContent="center">
              <Button variant="outlined" onClick={() => fetchDemos()} sx={{ borderRadius: 2, textTransform: 'none' }}>
                Retry
              </Button>
            </Box>
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

  const onPrev = () => {
    if (pagination.page > 1) fetchDemos(pagination.page - 1);
  };

  const onNext = () => {
    if (pagination.page < pagination.pages) fetchDemos(pagination.page + 1);
  };

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
    if (!selectedDemo) return;

    const leadAny: any = selectedDemo.classLead as any;
    const leadId: string | undefined = (selectedDemo.classLead as any)?.id || leadAny?._id;

    if (!leadId) {
      setError('Unable to identify the demo lead. Please contact support.');
      return;
    }

    try {
      setUpdatingDemoId(selectedDemo.id);
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
      setSelectedDemo(null);
    } catch (e: any) {
      handleError(e);
    } finally {
      setUpdatingDemoId(null);
    }
  };

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {error && demos.length > 0 && (
          <Box mb={2}>
            <ErrorAlert error={error} />
          </Box>
        )}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 2,
                bgcolor: alpha('#8b5cf6', 0.08),
                display: 'flex',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 20, color: '#8b5cf6' }} aria-label="demo-sessions" />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              My Demo Sessions
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${activeDemos.length} active`}
            sx={{
              bgcolor: alpha('#8b5cf6', 0.08),
              color: '#7c3aed',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 26,
            }}
          />
        </Box>

        <Box
          sx={{
            maxHeight: 400,
            overflow: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
          }}
        >
          {activeDemos.map((demo, index) => {
            const studentName = demo.classLead?.studentName || '-';
            const subjectVal: any = (demo.classLead as any)?.subject;
            const subject = Array.isArray(subjectVal) ? subjectVal.join(', ') : subjectVal || '-';
            const grade = demo.classLead?.grade || '-';
            const board = demo.classLead?.board || '-';
            const mode = demo.classLead?.mode || '-';
            const statusProps = getStatusChipProps(demo.status);
            return (
              <Box
                key={demo.id || index}
                sx={{
                  border: '1px solid',
                  borderColor: alpha('#8b5cf6', 0.12),
                  borderRadius: 2.5,
                  p: 2.5,
                  mb: 2,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  bgcolor: alpha('#8b5cf6', 0.02),
                  '&:hover': {
                    borderColor: alpha('#8b5cf6', 0.25),
                    bgcolor: alpha('#8b5cf6', 0.04),
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Stack spacing={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" sx={{ color: '#8b5cf6' }} aria-label="student" />
                      <Typography variant="subtitle1" fontWeight={700} sx={{ wordBreak: 'break-word', fontSize: '0.95rem' }}>
                        {studentName}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip size="small" color={statusProps.color} label={statusProps.label} sx={{ fontWeight: 600, fontSize: '0.7rem' }} aria-label={`status-${statusProps.label}`} />
                </Box>

                <Grid container spacing={1.5} mb={2}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha('#6366f1', 0.04) }}>
                      <Box display="flex" alignItems="center" gap={0.75} mb={0.25}>
                        <EventIcon sx={{ fontSize: 14, color: 'text.disabled' }} aria-label="demo-date" />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Date</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>{formatDate(demo.demoDate)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha('#6366f1', 0.04) }}>
                      <Box display="flex" alignItems="center" gap={0.75} mb={0.25}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} aria-label="demo-time" />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Time</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>{demo.demoTime || '-'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha('#6366f1', 0.04) }}>
                      <Box display="flex" alignItems="center" gap={0.75} mb={0.25}>
                        <MenuBookIcon sx={{ fontSize: 14, color: 'text.disabled' }} aria-label="subject" />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Subject</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>{subject}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha('#6366f1', 0.04) }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.25}>Grade & Board</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>{grade} • {board}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Chip
                    size="small"
                    label={mode}
                    sx={{
                      bgcolor: mode === 'ONLINE' ? alpha('#3b82f6', 0.08) : mode === 'OFFLINE' ? alpha('#10b981', 0.08) : alpha('#8b5cf6', 0.08),
                      color: mode === 'ONLINE' ? '#2563eb' : mode === 'OFFLINE' ? '#059669' : '#7c3aed',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                    aria-label="mode"
                  />
                </Box>

                {(demo.notes || demo.feedback || demo.rejectionReason) && (
                  <>
                    <Divider sx={{ my: 1.5, borderColor: alpha('#8b5cf6', 0.08) }} />
                    {demo.notes && (
                      <Box sx={{ bgcolor: alpha('#6366f1', 0.04), p: 1.5, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Notes</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', mt: 0.25 }}>{demo.notes}</Typography>
                      </Box>
                    )}
                    {demo.feedback && (
                      <Box sx={{ bgcolor: alpha('#6366f1', 0.04), p: 1.5, borderRadius: 2, mt: demo.notes ? 1 : 0 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Feedback</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', mt: 0.25 }}>{demo.feedback}</Typography>
                      </Box>
                    )}
                    {demo.rejectionReason && (
                      <Box sx={{ bgcolor: alpha('#ef4444', 0.04), p: 1.5, borderRadius: 2, mt: (demo.notes || demo.feedback) ? 1 : 0 }}>
                        <Typography variant="caption" color="error.main" fontWeight={600}>Rejection Reason</Typography>
                        <Typography variant="body2" color="error.main" sx={{ fontSize: '0.82rem', mt: 0.25 }}>{demo.rejectionReason}</Typography>
                      </Box>
                    )}
                  </>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={1.5} sx={{ borderTop: '1px solid', borderColor: alpha('#8b5cf6', 0.08) }}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                    Assigned {formatDate(demo.assignedAt)}
                  </Typography>
                  {demo.completedAt && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                      Completed {formatDate(demo.completedAt)}
                    </Typography>
                  )}
                </Box>

                {demo.status === DEMO_STATUS.SCHEDULED && (
                  <Box display="flex" justifyContent="flex-end" mt={1.5}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleMarkCompletedClick(demo)}
                      disabled={updatingDemoId === demo.id}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        bgcolor: '#10b981',
                        '&:hover': { bgcolor: '#059669' },
                        px: 2.5,
                      }}
                    >
                      Mark Completed
                    </Button>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {pagination.pages > 1 && (
          <Box display="flex" justifyContent="center" alignItems="center" mt={3} gap={2}>
            <Button
              size="small"
              variant="outlined"
              disabled={pagination.page <= 1}
              onClick={onPrev}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
              {pagination.page} / {pagination.pages}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              disabled={pagination.page >= pagination.pages}
              onClick={onNext}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Next
            </Button>
          </Box>
        )}
      </CardContent>
      <ErrorDialog
        open={showError}
        onClose={clearError}
        error={dialogError}
        title="Demo Update Error"
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
