import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Chip, Stack, Divider, IconButton, Tooltip, Alert, CardContent, Grid, Button } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CampaignIcon from '@mui/icons-material/Campaign';
import { StyledCard } from '../common/StyledCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import { getAnnouncements, expressInterest } from '../../services/announcementService';
import { IAnnouncement } from '../../types';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

const ClassLeadsFeedCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnnouncements({ isActive: true, page: 1, limit: 50 });
      const items = (res && (res as any).data) ? (res as any).data as IAnnouncement[] : [];
      setAnnouncements(items || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load class opportunities.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    return () => {};
  }, []);

  const filteredAnnouncements = useMemo(
    () => announcements.filter(a => !ignoredIds.has((a as any).id || (a as any)._id)),
    [announcements, ignoredIds]
  );

  const hasExpressedInterest = (a: IAnnouncement) => {
    const uid = (user as any)?._id || (user as any)?.id;
    if (!uid) return false;
    const list = (a as any).interestedTutors || [];
    return Array.isArray(list) && list.some((t: any) => t?.id === uid || t?._id === uid || t?.tutorId === uid);
  };

  const handleExpressInterest = async (announcementId: string) => {
    setActionLoading(prev => ({ ...prev, [announcementId]: true }));
    setActionError(prev => ({ ...prev, [announcementId]: '' }));
    try {
      const res = await expressInterest(announcementId);
      const updated = (res as any)?.data as IAnnouncement;
      if (updated) {
        setAnnouncements(prev => prev.map(a => (((a as any).id || (a as any)._id) === ((updated as any).id || (updated as any)._id)) ? updated : a));
      }
      setSuccessMessage('Interest expressed successfully! The manager will review your profile.');
      window.setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to express interest. Please try again.';
      const display = /already expressed interest/i.test(String(msg)) ? 'You have already expressed interest for this lead.' : msg;
      setActionError(prev => ({ ...prev, [announcementId]: display }));
    } finally {
      setActionLoading(prev => ({ ...prev, [announcementId]: false }));
    }
  };

  const handleIgnore = (announcementId: string) => {
    setIgnoredIds(prev => {
      const next = new Set(prev);
      next.add(announcementId);
      return next;
    });
  };

  if (loading) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" justifyContent="center" py={4} aria-busy>
            <LoadingSpinner message="Loading class opportunities..." />
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (error && filteredAnnouncements.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          <ErrorAlert error={error} />
          <Box mt={1.5} display="flex" justifyContent="center">
            <Button variant="outlined" onClick={fetchAnnouncements}>Retry</Button>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (!loading && filteredAnnouncements.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          <EmptyState 
            icon={<CampaignIcon color="primary" />} 
            title="No Active Class Leads" 
            description="There are no new class opportunities at the moment. Check back later!" 
          />
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <CampaignIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>Class Opportunities</Typography>
          </Box>
          <Chip label={`${filteredAnnouncements.length} available`} size="small" color="primary" variant="outlined" />
        </Box>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }} role="status">
            {successMessage}
          </Alert>
        )}

        <Box sx={{ maxHeight: 600, overflow: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 }, '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.06)' } }}>
          {filteredAnnouncements.map((a) => {
            const id = ((a as any).id || (a as any)._id) as string;
            const interested = hasExpressedInterest(a);
            const postedAt = (a as any)?.createdAt || (a as any)?.postedAt;
            const postedStr = postedAt ? new Date(postedAt).toLocaleDateString() : '';
            const cl = (a as any).classLead || {};
            const subjects = Array.isArray(cl?.subject) ? cl.subject.join(', ') : (cl?.subject || '');

            return (
              <Box key={id} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, p: 2.5, mb: 2, position: 'relative', transition: 'all 0.3s ease', '&:hover': { backgroundColor: 'grey.50', borderColor: 'primary.light', transform: 'translateX(4px)' } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Stack spacing={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" aria-label="Student" />
                      <Typography variant="h6" fontWeight={600} sx={{ wordBreak: 'break-word' }}>{cl?.studentName || 'Student'}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{postedStr ? `Posted on ${postedStr}` : ''}</Typography>
                  </Stack>
                  <Tooltip title="Ignore this lead">
                    <IconButton size="small" onClick={() => handleIgnore(id)} aria-label="Ignore lead">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SchoolIcon fontSize="small" color="action" aria-label="Grade" />
                      <Typography variant="body2">{cl?.grade || '-'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MenuBookIcon fontSize="small" color="action" aria-label="Subject" />
                      <Typography variant="body2">{subjects}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">{cl?.board || ''}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip 
                      label={cl?.mode || ''} 
                      size="small" 
                      color={cl?.mode === 'ONLINE' ? 'info' : cl?.mode === 'OFFLINE' ? 'success' : 'secondary'} 
                    />
                  </Grid>
                  {cl?.location && (
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOnIcon fontSize="small" color="action" aria-label="Location" />
                        <Typography variant="body2">{cl?.location}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {cl?.timing && (
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon fontSize="small" color="action" aria-label="Timing" />
                        <Typography variant="body2">{cl?.timing}</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {!!(a as any)?.interestCount && (a as any).interestCount > 0 && (
                  <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                    <Typography variant="caption" color="text.secondary">{(a as any).interestCount} tutor(s) interested</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2} flexWrap="wrap">
                  {interested ? (
                    <Chip label="Already Interested" color="success" icon={<ThumbUpIcon />} />
                  ) : (
                    <>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<ThumbUpIcon />} 
                        onClick={() => handleExpressInterest(id)} 
                        disabled={!!actionLoading[id]}
                      >
                        {actionLoading[id] ? 'Expressing...' : 'Express Interest'}
                      </Button>
                      <Button variant="outlined" color="inherit" onClick={() => handleIgnore(id)}>Ignore</Button>
                    </>
                  )}
                </Box>
                {actionError[id] && (
                  <Alert severity="error" sx={{ mt: 1 }}>{actionError[id]}</Alert>
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(ClassLeadsFeedCard);
