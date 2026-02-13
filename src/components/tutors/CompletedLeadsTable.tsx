import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
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
  Stack
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
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
        // Fetching with a large limit to get all history for now
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case DEMO_STATUS.SCHEDULED: return 'info';
      case DEMO_STATUS.COMPLETED: return 'warning';
      case DEMO_STATUS.APPROVED: return 'success';
      case DEMO_STATUS.REJECTED: return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <ErrorAlert error={error} />
        <Button startIcon={<RefreshIcon />} onClick={fetchData} sx={{ mt: 2 }}>Retry</Button>
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
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <Table sx={{ minWidth: 650 }} aria-label="demo history table">
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Student Details</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Class Info</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Demo Details</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Financials</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status & Feedback</TableCell>
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
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'grey.50' } }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>{lead?.studentName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lead?.parentName} {lead?.parentPhone ? `(${lead.parentPhone})` : ''}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2"><strong>Sub:</strong> {subjects}</Typography>
                    <Typography variant="body2"><strong>Grade:</strong> {lead?.grade}</Typography>
                    <Typography variant="body2"><strong>Board:</strong> {lead?.board}</Typography>
                    <Chip 
                        label={lead?.mode} 
                        size="small" 
                        variant="outlined" 
                        color={lead?.mode === 'ONLINE' ? 'info' : 'default'} 
                        sx={{ width: 'fit-content' }}
                    />
                  </Stack>
                </TableCell>

                <TableCell>
                   <Stack spacing={0.5}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EventIcon fontSize="inherit" color="action" />
                        <Typography variant="body2">{formatDate(demo.demoDate)}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon fontSize="inherit" color="action" />
                        <Typography variant="body2">{demo.demoTime}</Typography>
                      </Box>
                   </Stack>
                </TableCell>

                <TableCell>
                  <Box display="flex" alignItems="flex-start" gap={0.5} maxWidth={200}>
                    <LocationOnIcon fontSize="inherit" color="action" sx={{ mt: 0.5 }} />
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {address || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.5}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="caption" color="text.secondary">Payout:</Typography>
                        <MoneyIcon fontSize="inherit" color="success" />
                        <Typography variant="body2" fontWeight={600}>₹{lead?.tutorFees || 0}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {lead?.classesPerMonth} cls/mo • {lead?.classDurationHours}h
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack spacing={1}>
                    <Chip 
                        label={demo.status} 
                        color={getStatusColor(demo.status) as any} 
                        size="small" 
                        sx={{ fontWeight: 600, width: 'fit-content' }} 
                    />
                    
                    {(demo.feedback || demo.rejectionReason || demo.notes) && (
                        <Tooltip title={
                            <Box sx={{ p: 1 }}>
                                {demo.notes && <Typography variant="caption" display="block"><strong>Notes:</strong> {demo.notes}</Typography>}
                                {demo.feedback && <Typography variant="caption" display="block"><strong>Feedback:</strong> {demo.feedback}</Typography>}
                                {demo.rejectionReason && <Typography variant="caption" display="block" color="error.light"><strong>Reason:</strong> {demo.rejectionReason}</Typography>}
                            </Box>
                        }>
                            <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer', color: 'primary.main' }}>
                                <InfoIcon fontSize="inherit" />
                                <Typography variant="caption" sx={{ textDecoration: 'underline' }}>View Details</Typography>
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
  );
};

export default CompletedLeadsTable;
