import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Chip, alpha, CircularProgress, Avatar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Button, Divider,
} from '@mui/material';
import ActivityIcon from '@mui/icons-material/LocalActivity';
import VideocamIcon from '@mui/icons-material/Videocam';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import RefreshIcon from '@mui/icons-material/Refresh';
import CampaignIcon from '@mui/icons-material/Campaign';
import { getMyDemos } from '../../services/demoService';
import { getMyExpressedInterests } from '../../services/announcementService';
import { IDemoHistory } from '../../types';
import EmptyState from '../../components/common/EmptyState';
import { DEMO_STATUS } from '../../constants';

const TutorLeadsPage: React.FC = () => {
  const [demos, setDemos] = useState<IDemoHistory[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loadingDemos, setLoadingDemos] = useState(true);
  const [loadingInterests, setLoadingInterests] = useState(true);

  const fetchDemos = useCallback(async () => {
    setLoadingDemos(true);
    try {
      const resp = await getMyDemos(1, 100);
      setDemos((resp as any).data || []);
    } catch { /* silently fail */ } finally {
      setLoadingDemos(false);
    }
  }, []);

  const fetchInterests = useCallback(async () => {
    setLoadingInterests(true);
    try {
      const resp = await getMyExpressedInterests();
      setInterests(resp.data || []);
    } catch { /* silently fail */ } finally {
      setLoadingInterests(false);
    }
  }, []);

  useEffect(() => {
    fetchDemos();
    fetchInterests();
  }, [fetchDemos, fetchInterests]);

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusSx = (status: string) => {
    switch (status) {
      case DEMO_STATUS.SCHEDULED: return { bgcolor: alpha('#3b82f6', 0.1), color: '#2563eb', fontWeight: 700 };
      case DEMO_STATUS.COMPLETED: return { bgcolor: alpha('#f59e0b', 0.1), color: '#d97706', fontWeight: 700 };
      case DEMO_STATUS.APPROVED: return { bgcolor: alpha('#10b981', 0.1), color: '#059669', fontWeight: 700 };
      case DEMO_STATUS.REJECTED: return { bgcolor: alpha('#ef4444', 0.1), color: '#dc2626', fontWeight: 700 };
      default: return { bgcolor: alpha('#64748b', 0.1), color: '#475569', fontWeight: 700 };
    }
  };

  return (
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 0 }, pb: { xs: 10, sm: 3 } }}>

      {/* ─── Header ─────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 3, sm: 4 },
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          p: { xs: 2.5, sm: 3.5 },
          mb: { xs: 2.5, sm: 4 },
          overflow: 'hidden',
          '&::before': {
            content: '""', position: 'absolute', top: '-50%', right: '-20%',
            width: '50%', height: '200%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box position="relative" zIndex={1} display="flex" alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' }, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              My Activity
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.88rem' }, maxWidth: 500 }}>
              Track all your assigned demo sessions and class interest expressions.
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, p: 1.25, borderRadius: 2.5, bgcolor: alpha('#fff', 0.08), backdropFilter: 'blur(8px)', border: `1px solid ${alpha('#fff', 0.1)}` }}>
            <ActivityIcon sx={{ fontSize: 22, color: alpha('#fff', 0.7) }} />
          </Box>
        </Box>
      </Box>

      {/* ─── KPI Cards ──────────────────────────────── */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: alpha('#a855f7', 0.15), background: `linear-gradient(135deg, ${alpha('#a855f7', 0.06)} 0%, ${alpha('#7c3aed', 0.03)} 100%)` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: alpha('#a855f7', 0.12) }}>
                  <VideocamIcon sx={{ fontSize: 26, color: '#a855f7' }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                    Total Demos Assigned
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#7c3aed', lineHeight: 1.2, mt: 0.25 }}>
                    {loadingDemos ? <CircularProgress size={22} sx={{ color: '#a855f7' }} /> : demos.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: alpha('#10b981', 0.15), background: `linear-gradient(135deg, ${alpha('#10b981', 0.06)} 0%, ${alpha('#059669', 0.03)} 100%)` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: alpha('#10b981', 0.12) }}>
                  <FavoriteIcon sx={{ fontSize: 26, color: '#10b981' }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                    Total Interest Expressed
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#059669', lineHeight: 1.2, mt: 0.25 }}>
                    {loadingInterests ? <CircularProgress size={22} sx={{ color: '#10b981' }} /> : interests.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Section 1: Demo Sessions ───────────────── */}
      <Box mb={5}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha('#a855f7', 0.1) }}>
              <VideocamIcon sx={{ fontSize: 18, color: '#a855f7' }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
              Demo Sessions
            </Typography>
            <Chip label={`${demos.length} total`} size="small" sx={{ bgcolor: alpha('#a855f7', 0.08), color: '#7c3aed', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon sx={{ fontSize: 14 }} />} onClick={fetchDemos} size="small"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', borderColor: alpha('#a855f7', 0.25), color: '#a855f7', '&:hover': { borderColor: '#a855f7', bgcolor: alpha('#a855f7', 0.04) } }}>
            Refresh
          </Button>
        </Box>

        {loadingDemos ? (
          <Box display="flex" justifyContent="center" p={5}><CircularProgress sx={{ color: '#a855f7' }} /></Box>
        ) : demos.length === 0 ? (
          <EmptyState title="No Demos Yet" description="You have no demo sessions assigned yet." />
        ) : (
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', overflow: 'hidden' }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    {['Student', 'Subjects / Grade', 'Demo Date & Time', 'Location', 'Fees'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.68rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid', borderColor: alpha('#a855f7', 0.08), py: 1.5, whiteSpace: 'nowrap' }}>
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
                      <TableRow key={demo.id} sx={{ '&:hover': { bgcolor: alpha('#a855f7', 0.02) }, '& td': { borderBottom: '1px solid', borderColor: alpha('#a855f7', 0.04), py: 1.75 }, '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#a855f7', fontSize: '0.8rem', fontWeight: 700 }}>
                              {lead?.studentName?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>{lead?.studentName}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>{lead?.parentName}</Typography>
                              {demo.status === DEMO_STATUS.REJECTED && (
                                <Chip label="Rejected" size="small" sx={{ ...getStatusSx(demo.status), fontSize: '0.62rem', height: 18, mt: 0.5 }} />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                            <SchoolIcon sx={{ fontSize: 13, color: '#a855f7' }} />
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{subjects}</Typography>
                          </Box>
                          <Box display="flex" gap={0.5}>
                            <Chip label={`Grade ${lead?.grade}`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha('#6366f1', 0.06), color: '#4f46e5' }} />
                            <Chip label={lead?.mode} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: lead?.mode === 'ONLINE' ? alpha('#3b82f6', 0.08) : alpha('#10b981', 0.08), color: lead?.mode === 'ONLINE' ? '#2563eb' : '#059669' }} />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
                            <EventIcon sx={{ fontSize: 13, color: '#a855f7' }} />
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{formatDate(demo.demoDate)}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.75}>
                            <AccessTimeIcon sx={{ fontSize: 13, color: '#a855f7' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.76rem' }}>{demo.demoTime || '-'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="flex-start" gap={0.5} maxWidth={180}>
                            <LocationOnIcon sx={{ fontSize: 13, color: '#a855f7', mt: 0.2 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{address || '-'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <MoneyIcon sx={{ fontSize: 13, color: '#10b981' }} />
                            <Typography variant="body2" fontWeight={800} sx={{ color: '#059669', fontSize: '0.88rem' }}>₹{lead?.tutorFees || 0}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{lead?.classesPerMonth} cls/mo</Typography>
                        </TableCell>
                        <TableCell>
                          {(demo.feedback || demo.rejectionReason || demo.notes) && (
                            <Tooltip title={
                              <Box sx={{ p: 0.5 }}>
                                {demo.notes && <Typography variant="caption" display="block"><strong>Notes:</strong> {demo.notes}</Typography>}
                                {demo.feedback && <Typography variant="caption" display="block"><strong>Feedback:</strong> {demo.feedback}</Typography>}
                                {demo.rejectionReason && <Typography variant="caption" display="block" color="error.light"><strong>Reason:</strong> {demo.rejectionReason}</Typography>}
                              </Box>
                            }>
                              <Box display="flex" alignItems="center" gap={0.25} sx={{ cursor: 'pointer', color: '#a855f7', width: 'fit-content' }}>
                                <InfoIcon sx={{ fontSize: 13 }} />
                                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 600, textDecoration: 'underline' }}>Details</Typography>
                              </Box>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* ─── Section 2: Interest Expressed ─────────── */}
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha('#10b981', 0.1) }}>
              <CampaignIcon sx={{ fontSize: 18, color: '#10b981' }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
              Interest Expressed in Classes
            </Typography>
            <Chip label={`${interests.length} leads`} size="small" sx={{ bgcolor: alpha('#10b981', 0.08), color: '#059669', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon sx={{ fontSize: 14 }} />} onClick={fetchInterests} size="small"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', borderColor: alpha('#10b981', 0.25), color: '#10b981', '&:hover': { borderColor: '#10b981', bgcolor: alpha('#10b981', 0.04) } }}>
            Refresh
          </Button>
        </Box>

        {loadingInterests ? (
          <Box display="flex" justifyContent="center" p={5}><CircularProgress sx={{ color: '#10b981' }} /></Box>
        ) : interests.length === 0 ? (
          <EmptyState title="No Interests Yet" description="You haven't expressed interest in any class announcements yet." />
        ) : (
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', overflow: 'hidden' }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    {['Student / Lead', 'Subjects', 'Grade & Board', 'Mode', 'Location'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.68rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid', borderColor: alpha('#10b981', 0.08), py: 1.5, whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {interests.map((ann: any) => {
                    const lead = ann.classLead || ann.lead || ann;
                    const subjects = Array.isArray(lead?.subject) ? lead.subject.join(', ') : (lead?.subject || '-');
                    return (
                      <TableRow key={ann._id || ann.id} sx={{ '&:hover': { bgcolor: alpha('#10b981', 0.02) }, '& td': { borderBottom: '1px solid', borderColor: alpha('#10b981', 0.04), py: 1.75 }, '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981', fontSize: '0.78rem', fontWeight: 700 }}>
                              {(lead?.studentName || 'L').charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>{lead?.studentName || 'Unknown Student'}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>{lead?.parentName || ''}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{subjects}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            <Chip label={`Grade ${lead?.grade || '-'}`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha('#6366f1', 0.06), color: '#4f46e5' }} />
                            {lead?.board && <Chip label={lead.board} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha('#64748b', 0.06), color: '#475569' }} />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={lead?.mode || '-'} size="small" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: lead?.mode === 'ONLINE' ? alpha('#3b82f6', 0.08) : alpha('#10b981', 0.08), color: lead?.mode === 'ONLINE' ? '#2563eb' : '#059669' }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {[lead?.area, lead?.city].filter(Boolean).join(', ') || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>
    </Container >
  );
};

export default TutorLeadsPage;
