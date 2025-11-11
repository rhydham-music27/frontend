import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Chip, CardContent, Grid, Divider, Stack, Button } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { StyledCard } from '../common/StyledCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import { getMyDemos } from '../../services/demoService';
import { IDemoHistory, PaginatedResponse } from '../../types';
import { DEMO_STATUS } from '../../constants';

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
      const targetPage = page ?? pagination.page;
      const resp: PaginatedResponse<IDemoHistory[]> = await getMyDemos(targetPage, pagination.limit);
      const { data, pagination: p } = resp as any;
      setDemos(Array.isArray(data) ? data : []);
      setPagination({ page: p.page, limit: p.limit, total: p.total, pages: p.pages });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load demo sessions.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchDemos();
  }, [fetchDemos]);

  if (loading) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" justifyContent="center" py={6} aria-busy>
            <LoadingSpinner message="Loading demo sessions..." />
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (error && demos.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <ErrorAlert error={error} />
            <Box display="flex" justifyContent="center">
              <Button variant="outlined" onClick={() => fetchDemos()}>
                Retry
              </Button>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (!loading && demos.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          <EmptyState 
            icon={<AssignmentIcon aria-label="no-demos" color="primary" />} 
            title="No Demo Sessions" 
            description="You don't have any assigned demo sessions yet. Check the Class Opportunities section for new leads!" 
          />
        </CardContent>
      </StyledCard>
    );
  }

  const onPrev = () => {
    if (pagination.page > 1) fetchDemos(pagination.page - 1);
  };

  const onNext = () => {
    if (pagination.page < pagination.pages) fetchDemos(pagination.page + 1);
  };

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <AssignmentIcon sx={{ color: 'primary.main' }} aria-label="demo-sessions" />
            <Typography variant="h6" fontWeight={600}>My Demo Sessions</Typography>
          </Box>
          <Chip size="small" color="primary" variant="outlined" label={`${pagination.total} demo(s)`} />
        </Box>

        <Box 
          sx={{
            maxHeight: 500,
            overflow: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 },
            '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.06)' },
          }}
        >
          {demos.map((demo) => {
            const studentName = demo.classLead?.studentName || '-';
            const subjectVal: any = (demo.classLead as any)?.subject;
            const subject = Array.isArray(subjectVal) ? subjectVal.join(', ') : subjectVal || '-';
            const grade = demo.classLead?.grade || '-';
            const board = demo.classLead?.board || '-';
            const mode = demo.classLead?.mode || '-';
            const statusProps = getStatusChipProps(demo.status);
            return (
              <Box
                key={demo.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 3,
                  p: 2.5,
                  mb: 2,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'grey.50',
                    borderColor: 'primary.light',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Stack spacing={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" aria-label="student" />
                      <Typography variant="h6" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                        {studentName}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip size="small" color={statusProps.color} label={statusProps.label} aria-label={`status-${statusProps.label}`} />
                </Box>

                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EventIcon fontSize="small" color="action" aria-label="demo-date" />
                      <Typography>{formatDate(demo.demoDate)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon fontSize="small" color="action" aria-label="demo-time" />
                      <Typography>{demo.demoTime || '-'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MenuBookIcon fontSize="small" color="action" aria-label="subject" />
                      <Typography>{subject}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography>Grade: {grade}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography>Board: {board}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip 
                      size="small" 
                      label={mode}
                      color={mode === 'ONLINE' ? 'info' : mode === 'OFFLINE' ? 'success' : mode === 'HYBRID' ? 'secondary' : 'default'}
                      aria-label="mode"
                    />
                  </Grid>
                </Grid>

                {(demo.notes || demo.feedback || demo.rejectionReason) && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    {demo.notes && (
                      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Notes:</Typography>
                        <Typography variant="body2">{demo.notes}</Typography>
                      </Box>
                    )}
                    {demo.feedback && (
                      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mt: demo.notes ? 1.5 : 0 }}>
                        <Typography variant="caption" color="text.secondary">Feedback:</Typography>
                        <Typography variant="body2">{demo.feedback}</Typography>
                      </Box>
                    )}
                    {demo.rejectionReason && (
                      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mt: (demo.notes || demo.feedback) ? 1.5 : 0 }}>
                        <Typography variant="caption" color="error.main">Rejection Reason:</Typography>
                        <Typography variant="body2" color="error.main">{demo.rejectionReason}</Typography>
                      </Box>
                    )}
                  </>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={2} sx={{ borderTop: '1px solid', borderColor: 'grey.100' }}>
                  <Typography variant="caption" color="text.secondary">
                    Assigned on {formatDate(demo.assignedAt)}
                  </Typography>
                  {demo.completedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Completed on {formatDate(demo.completedAt)}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {pagination.pages > 1 && (
          <Box display="flex" justifyContent="center" mt={3} gap={2}>
            <Button size="small" variant="outlined" disabled={pagination.page <= 1} onClick={onPrev}>
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
              Page {pagination.page} of {pagination.pages}
            </Typography>
            <Button size="small" variant="outlined" disabled={pagination.page >= pagination.pages} onClick={onNext}>
              Next
            </Button>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(DemoClassesCard);
