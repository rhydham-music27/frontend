import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  CircularProgress,
  Button,
  Tooltip,
  Stack,
  Avatar,
  alpha,
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { getMyDemos } from '../../services/demoService';
import { IDemoHistory, PaginatedResponse } from '../../types';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import { DEMO_STATUS } from '../../constants';

const CompletedLeadsTable: React.FC = () => {
  const [demos, setDemos] = useState<IDemoHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp: PaginatedResponse<IDemoHistory[]> = await getMyDemos(1, 100);
      setDemos(resp.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusSx = (status: string) => {
    switch (status) {
      case DEMO_STATUS.SCHEDULED:
        return { bgcolor: alpha('#3b82f6', 0.1), color: '#2563eb', fontWeight: 700 };
      case DEMO_STATUS.COMPLETED:
        return { bgcolor: alpha('#f59e0b', 0.1), color: '#d97706', fontWeight: 700 };
      case DEMO_STATUS.APPROVED:
        return { bgcolor: alpha('#10b981', 0.1), color: '#059669', fontWeight: 700 };
      case DEMO_STATUS.REJECTED:
        return { bgcolor: alpha('#ef4444', 0.1), color: '#dc2626', fontWeight: 700 };
      default:
        return { bgcolor: alpha('#64748b', 0.1), color: '#475569', fontWeight: 700 };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={8} flexDirection="column" gap={2}>
        <CircularProgress size={36} sx={{ color: '#a855f7' }} />
        <Typography variant="caption" color="text.secondary">Loading demos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <ErrorAlert error={error} />
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          sx={{
            mt: 2,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            color: '#a855f7',
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (demos.length === 0) {
    return (
      <EmptyState
        title="No Demo History"
        description="You have not completed any demos yet."
      />
    );
  }

  return (
    <Box>
      {/* Header bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.88rem' }}>
            Demo Sessions
          </Typography>
          <Chip
            label={`${demos.length} total`}
            size="small"
            sx={{
              bgcolor: alpha('#a855f7', 0.08),
              color: '#7c3aed',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 22,
            }}
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
          onClick={fetchData}
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderColor: alpha('#a855f7', 0.25),
            color: '#a855f7',
            '&:hover': { borderColor: '#a855f7', bgcolor: alpha('#a855f7', 0.04) },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* ─── Mobile Card View ──────────────────────── */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Stack spacing={1.5}>
          {demos.map((demo) => {
            const lead = demo.classLead;
            const address = [lead?.address, lead?.area, lead?.city].filter(Boolean).join(', ');
            const subjects = Array.isArray(lead?.subject) ? lead?.subject.join(', ') : lead?.subject;

            return (
              <Box
                key={demo.id}
                sx={{
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: alpha('#a855f7', 0.1),
                  bgcolor: '#fff',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    height: 3,
                    background: `linear-gradient(90deg, #a855f7, ${alpha('#a855f7', 0.3)})`,
                  },
                }}
              >
                <Box sx={{ p: 2 }}>
                  {/* Student + Status */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: '#a855f7',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        {lead?.studentName?.charAt(0) || 'S'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                          {lead?.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {lead?.parentName}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={demo.status}
                      size="small"
                      sx={{ ...getStatusSx(demo.status), fontSize: '0.58rem', height: 20 }}
                    />
                  </Box>

                  {/* Info grid */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 1,
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: alpha('#a855f7', 0.03),
                      border: '1px solid',
                      borderColor: alpha('#a855f7', 0.06),
                      mb: 1.5,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <SchoolIcon sx={{ fontSize: 13, color: '#a855f7' }} />
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                        {subjects || '-'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <EventIcon sx={{ fontSize: 13, color: '#a855f7' }} />
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                        {formatDate(demo.demoDate)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AccessTimeIcon sx={{ fontSize: 13, color: '#a855f7' }} />
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                        {demo.demoTime || '-'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <MoneyIcon sx={{ fontSize: 13, color: '#10b981' }} />
                      <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.68rem', color: '#059669' }}>
                        ₹{lead?.tutorFees || 0}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Bottom Row */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap={0.5}>
                      <Chip
                        label={`Grade ${lead?.grade}`}
                        size="small"
                        sx={{ height: 20, fontSize: '0.58rem', fontWeight: 600, bgcolor: alpha('#6366f1', 0.06), color: '#4f46e5' }}
                      />
                      <Chip
                        label={lead?.mode || '-'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.58rem',
                          fontWeight: 600,
                          bgcolor: lead?.mode === 'ONLINE' ? alpha('#3b82f6', 0.08) : alpha('#10b981', 0.08),
                          color: lead?.mode === 'ONLINE' ? '#2563eb' : '#059669',
                        }}
                      />
                    </Box>
                    {(demo.feedback || demo.rejectionReason || demo.notes) && (
                      <Tooltip title={
                        <Box sx={{ p: 1 }}>
                          {demo.notes && <Typography variant="caption" display="block"><strong>Notes:</strong> {demo.notes}</Typography>}
                          {demo.feedback && <Typography variant="caption" display="block"><strong>Feedback:</strong> {demo.feedback}</Typography>}
                          {demo.rejectionReason && <Typography variant="caption" display="block" color="error.light"><strong>Reason:</strong> {demo.rejectionReason}</Typography>}
                        </Box>
                      }>
                        <Box display="flex" alignItems="center" gap={0.25} sx={{ cursor: 'pointer', color: '#a855f7' }}>
                          <InfoIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>Details</Typography>
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* ─── Desktop Table View ────────────────────── */}
      <Card
        elevation={0}
        sx={{
          display: { xs: 'none', sm: 'block' },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.100',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <TableContainer
          sx={{
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: 4 },
          }}
        >
          <Table sx={{ minWidth: 750 }} aria-label="demo history table">
            <TableHead>
              <TableRow>
                {['Student Details', 'Class Info', 'Demo Details', 'Location', 'Financials', 'Status & Feedback'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderBottom: '2px solid',
                      borderColor: alpha('#a855f7', 0.08),
                      py: 1.75,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {demos.map((demo) => {
                const lead = demo.classLead;
                const address = [lead?.address, lead?.area, lead?.city].filter(Boolean).join(', ');
                const subjects = Array.isArray(lead?.subject) ? lead?.subject.join(', ') : lead?.subject;

                return (
                  <TableRow
                    key={demo.id}
                    sx={{
                      transition: 'background 0.15s',
                      '&:hover': { bgcolor: alpha('#a855f7', 0.02) },
                      '& td': { borderBottom: '1px solid', borderColor: alpha('#a855f7', 0.04), py: 2 },
                      '&:last-child td': { border: 0 },
                    }}
                  >
                    {/* Student Details */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: '#a855f7',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                          }}
                        >
                          {lead?.studentName?.charAt(0) || 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                            {lead?.studentName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {lead?.parentName} {lead?.parentPhone ? `(${lead.parentPhone})` : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Class Info */}
                    <TableCell>
                      <Stack spacing={0.75}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <SchoolIcon sx={{ fontSize: 14, color: '#a855f7' }} />
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>
                            {subjects}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          <Chip
                            label={`Grade ${lead?.grade}`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              bgcolor: alpha('#6366f1', 0.06),
                              color: '#4f46e5',
                            }}
                          />
                          <Chip
                            label={lead?.board}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              bgcolor: alpha('#64748b', 0.06),
                              color: '#475569',
                            }}
                          />
                          <Chip
                            label={lead?.mode}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              bgcolor: lead?.mode === 'ONLINE' ? alpha('#3b82f6', 0.08) : alpha('#10b981', 0.08),
                              color: lead?.mode === 'ONLINE' ? '#2563eb' : '#059669',
                            }}
                          />
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Demo Details */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <EventIcon sx={{ fontSize: 14, color: '#a855f7' }} />
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>
                            {formatDate(demo.demoDate)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: '#a855f7' }} />
                          <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                            {demo.demoTime}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <Box display="flex" alignItems="flex-start" gap={0.75} maxWidth={200}>
                        <LocationOnIcon sx={{ fontSize: 14, color: '#a855f7', mt: 0.25 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.78rem', whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                          {address || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Financials */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>Payout:</Typography>
                          <Typography variant="body2" fontWeight={800} sx={{ fontSize: '0.88rem', color: '#059669' }}>
                            ₹{lead?.tutorFees || 0}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                          {lead?.classesPerMonth} cls/mo • {lead?.classDurationHours}h
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Status & Feedback */}
                    <TableCell>
                      <Stack spacing={1}>
                        <Chip
                          label={demo.status}
                          size="small"
                          sx={{ ...getStatusSx(demo.status), fontSize: '0.65rem', height: 22, width: 'fit-content' }}
                        />
                        {(demo.feedback || demo.rejectionReason || demo.notes) && (
                          <Tooltip title={
                            <Box sx={{ p: 1 }}>
                              {demo.notes && <Typography variant="caption" display="block"><strong>Notes:</strong> {demo.notes}</Typography>}
                              {demo.feedback && <Typography variant="caption" display="block"><strong>Feedback:</strong> {demo.feedback}</Typography>}
                              {demo.rejectionReason && <Typography variant="caption" display="block" color="error.light"><strong>Reason:</strong> {demo.rejectionReason}</Typography>}
                            </Box>
                          }>
                            <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer', color: '#a855f7' }}>
                              <InfoIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 600, textDecoration: 'underline' }}>View Details</Typography>
                            </Box>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default CompletedLeadsTable;
