import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Chip, Stack, Divider, IconButton, Tooltip, Alert, CardContent, Button, Card, alpha, CircularProgress } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CampaignIcon from '@mui/icons-material/Campaign';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import { getTutorAvailableAnnouncements, expressInterest } from '../../services/announcementService';
import tutorService from '../../services/tutorService';
import { IAnnouncement, INotification, ITutor } from '../../types';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import useNotifications from '../../hooks/useNotifications';

import { getSubjectList, getOptionLabel, getLeafSubjectList } from '../../utils/subjectUtils';

const ClassLeadsFeedCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const { notifications, deleteNotif } = useNotifications({ page: 1, limit: 50, enabled: true });
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());
  const [tutorProfile, setTutorProfile] = useState<ITutor | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTutorAvailableAnnouncements({ isActive: true, page: 1, limit: 50 });
      const items = (res && (res as any).data) ? (res as any).data as IAnnouncement[] : [];
      setAnnouncements(items || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load class opportunities.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorProfile = async () => {
    try {
      const res = await tutorService.getMyProfile();
      setTutorProfile((res as any)?.data || null);
    } catch (e) {
      setTutorProfile(null);
    }
  };

  useEffect(() => {
    const uid = (user as any)?._id || (user as any)?.id;
    if (!uid) return;
    fetchTutorProfile();
    fetchAnnouncements();
    return () => { };
  }, [user]);

  const hasExpressedInterest = (a: IAnnouncement) => {
    const uid = (user as any)?._id || (user as any)?.id;
    if (!uid) return false;
    const list = (a as any).interestedTutors || [];
    return (
      Array.isArray(list) &&
      list.some((t: any) => {
        const tutor = t?.tutor || t;
        const tid = tutor?.id || tutor?._id || t?.tutorId;
        return Boolean(tid && tid === uid);
      })
    );
  };

  const computeMatchPercentage = (cl: any, tutor: ITutor | null): number => {
    if (!cl || !tutor) return 0;

    const leadSubjects = getSubjectList(cl.subject);
    const tutorSubjects = getSubjectList((tutor as any).subjects);
    const preferredSubjects = getSubjectList((tutor as any).settings?.preferredSubjects);

    const tutorAllSubjects = new Set<string>([...tutorSubjects, ...preferredSubjects].filter(Boolean));
    const subjectApplicable = leadSubjects.length > 0 && tutorAllSubjects.size > 0;
    const subjectMatch = subjectApplicable
      ? leadSubjects.some((s) => tutorAllSubjects.has(String(s)))
      : false;

    const leadMode: string | undefined = cl.mode ? String(cl.mode) : undefined;
    const tutorPreferredMode: string | undefined = (tutor as any).preferredMode || (tutor as any).settings?.teachingModePreference;
    const modeApplicable = !!(leadMode && tutorPreferredMode);
    const modeMatch = modeApplicable ? leadMode === tutorPreferredMode : false;

    const leadCity: string = (cl as any).city || '';
    const leadArea: string = (cl as any).area || '';
    const leadLocation: string = (cl as any).location || '';

    const tutorPreferredCities: string[] = Array.isArray((tutor as any).preferredCities)
      ? ((tutor as any).preferredCities as string[])
      : [];
    const tutorPreferredLocations: string[] = Array.isArray((tutor as any).preferredLocations)
      ? ((tutor as any).preferredLocations as string[])
      : Array.isArray((tutor as any).settings?.preferredLocations)
        ? ((tutor as any).settings.preferredLocations as string[])
        : [];

    const cityApplicable = !!(leadCity && tutorPreferredCities.length);
    const cityMatch = cityApplicable ? tutorPreferredCities.includes(leadCity) : false;

    const areaApplicable = !!((leadArea || leadLocation) && tutorPreferredLocations.length);
    const areaMatch = areaApplicable
      ? tutorPreferredLocations.some((loc) => !!loc && (loc === leadArea || loc === leadLocation))
      : false;

    const subjectWeight = 0.4;
    const modeWeight = 0.2;
    const cityWeight = 0.2;
    const areaWeight = 0.2;

    let totalWeight = 0;
    let score = 0;

    if (subjectApplicable) {
      totalWeight += subjectWeight;
      if (subjectMatch) score += subjectWeight;
    }
    if (modeApplicable) {
      totalWeight += modeWeight;
      if (modeMatch) score += modeWeight;
    }
    if (cityApplicable) {
      totalWeight += cityWeight;
      if (cityMatch) score += cityWeight;
    }
    if (areaApplicable) {
      totalWeight += areaWeight;
      if (areaMatch) score += areaWeight;
    }

    if (totalWeight === 0) {
      return 100;
    }

    const normalized = (score / totalWeight) * 100;
    return Math.round(Math.max(0, Math.min(100, normalized)));
  };

  const filteredAnnouncements = useMemo(
    () => {
      const enriched = announcements
        .filter((a) => {
          const aid = (a as any).id || (a as any)._id;
          if (!aid) return false;
          if (ignoredIds.has(aid)) return false;
          return true;
        })
        .map((a) => {
          const cl = (a as any).classLead || {};
          const matchPercentage = computeMatchPercentage(cl, tutorProfile);
          return { announcement: a, matchPercentage };
        });

      enriched.sort((x, y) => {
        const aInterested = hasExpressedInterest(x.announcement) ? 1 : 0;
        const bInterested = hasExpressedInterest(y.announcement) ? 1 : 0;

        if (x.matchPercentage !== y.matchPercentage) {
          return y.matchPercentage - x.matchPercentage;
        }

        return aInterested - bInterested;
      });

      return enriched;
    },
    [announcements, ignoredIds, tutorProfile, user]
  );

  const handleExpressInterest = async (announcementId: string) => {
    setActionLoading(prev => ({ ...prev, [announcementId]: true }));
    setActionError(prev => ({ ...prev, [announcementId]: '' }));
    try {
      const res = await expressInterest(announcementId);
      const updated = (res as any)?.data as IAnnouncement;
      if (updated) {
        setAnnouncements(prev => prev.map(a => (((a as any).id || (a as any)._id) === ((updated as any).id || (updated as any)._id)) ? updated : a));
        const updatedId = ((updated as any).id || (updated as any)._id) as string;
        if (updatedId && Array.isArray(notifications) && notifications.length > 0) {
          const toRemove = (notifications as INotification[]).filter((n: any) => {
            const rel = n.relatedAnnouncement as any;
            if (!rel) return false;
            const relId = rel.id || rel._id;
            return relId && relId === updatedId;
          });
          for (const n of toRemove) {
            await deleteNotif(n.id);
          }
        }
      }
      setSuccessMessage('Interest expressed successfully! The manager will review your profile.');
      window.setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to express interest. Please try again.';
      const already = /already expressed interest/i.test(String(msg));
      const display = already ? 'You have already expressed interest for this lead.' : msg;
      setActionError(prev => ({ ...prev, [announcementId]: display }));
      if (already) {
        setIgnoredIds(prev => {
          const next = new Set(prev);
          next.add(announcementId);
          return next;
        });
      }
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
            <CircularProgress size={32} thickness={5} sx={{ color: '#3b82f6' }} />
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
              SCANNING OPPORTUNITIES...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && filteredAnnouncements.length === 0) {
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
              onClick={fetchAnnouncements} 
              sx={{ alignSelf: 'center', fontWeight: 800, color: '#3b82f6', textTransform: 'none' }}
            >
              Try Again
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!loading && filteredAnnouncements.length === 0) {
    return (
      <Card sx={cardSx}>
        <CardContent sx={{ py: 8 }}>
          <Box textAlign="center">
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 1.5,
                bgcolor: alpha('#3b82f6', 0.06),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                transform: 'rotate(5deg)',
              }}
            >
              <CampaignIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, letterSpacing: '-0.02em' }}>
              Quiet Horizon
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, maxWidth: 280, mx: 'auto' }}>
              We'll notify you as soon as a new class lead matches your expertise. Keep your profile updated!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
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
                bgcolor: alpha('#3b82f6', 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
              }}
            >
              <CampaignIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
                Class Opportunities
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.02em' }}>
                LIVE MARKETPLACE FEED
              </Typography>
            </Box>
          </Box>
        </Box>

        {successMessage && (
          <Alert 
            severity="success" 
            onClose={() => setSuccessMessage(null)} 
            sx={{ 
              mb: 3, 
              borderRadius: 1.5, 
              fontWeight: 600,
              bgcolor: alpha('#10b981', 0.1),
              color: '#059669',
              border: 'none',
              '& .MuiAlert-icon': { color: '#059669' }
            }}
          >
            {successMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            maxHeight: { xs: 320, sm: 800 },
            overflowY: 'auto',
            mx: -1,
            px: 1,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' },
          }}
        >
          {filteredAnnouncements.map((item) => {
            const a = item.announcement as IAnnouncement;
            const matchPercentage = item.matchPercentage as number;
            const id = (((a as any).id || (a as any)._id) as string);
            const interested = hasExpressedInterest(a);
            const cl = (a as any).classLead || {};
            const subjects = getLeafSubjectList(cl?.subject || cl?.subjects || cl?.subjectList).join(', ');
            const isHighlighted = Boolean(matchPercentage >= 80);
            const matchColor = matchPercentage >= 80 ? '#10b981' : matchPercentage >= 50 ? '#3b82f6' : '#64748b';

            return (
              <Box
                key={id}
                sx={{
                  borderRadius: 2,
                  p: 2.5,
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: isHighlighted ? alpha('#10b981', 0.02) : '#ffffff',
                  border: '1px solid',
                  borderColor: isHighlighted ? alpha('#10b981', 0.15) : alpha('#e2e8f0', 0.6),
                  boxShadow: isHighlighted ? `0 8px 24px ${alpha('#10b981', 0.05)}` : '0 2px 8px rgba(15, 23, 42, 0.02)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isHighlighted ? `0 16px 32px ${alpha('#10b981', 0.1)}` : '0 12px 24px rgba(15, 23, 42, 0.06)',
                    borderColor: isHighlighted ? alpha('#10b981', 0.3) : alpha('#3b82f6', 0.2),
                  },
                }}
              >
                {/* Match Indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: alpha(matchColor, 0.08),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${alpha(matchColor, 0.1)}`,
                  }}
                >
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: matchColor }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: matchColor, letterSpacing: '0.04em' }}>
                    {matchPercentage}% MATCH
                  </Typography>
                </Box>

                <Box mb={2.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', mb: 1.5, lineHeight: 1.3 }}>
                    {subjects}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip 
                      label={getOptionLabel(cl?.mode)} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        borderColor: alpha('#3b82f6', 0.2), 
                        color: '#2563eb', 
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        height: 24,
                        textTransform: 'uppercase',
                        bgcolor: alpha('#3b82f6', 0.04)
                      }} 
                    />
                  </Box>
                </Box>

                  <Box 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                      gap: 2.5, 
                      mb: 2.5, 
                    p: 2.5, 
                      borderRadius: 1.5, 
                      bgcolor: alpha('#f8fafc', 0.8),
                      border: '1px solid #f1f5f9' 
                    }}
                  >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 0.5 }}>GRADE & BOARD</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                      {getOptionLabel(cl?.grade)} • {getOptionLabel(cl?.board)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 0.5 }}>LOCATION</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                      {getOptionLabel(cl?.location || cl?.area || cl?.city) || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 0.5 }}>TIMING</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                      {cl?.timing || 'As agreed'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 0.5 }}>STUDENT</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                      {cl?.studentName || (cl?.studentType === 'GROUP' ? `Group of ${cl?.numberOfStudents}` : 'Single Student')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 0.5 }}>EXPECTED FEES</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#10b981', fontSize: '0.85rem' }}>
                      {'\u20B9'}{cl?.tutorFees?.toLocaleString() || 'N/A'} <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>/mo</span>
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1.5}>
                  {interested ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled
                      sx={{
                        borderRadius: 1.5,
                        py: 1.25,
                        textTransform: 'none',
                        fontWeight: 800,
                        borderColor: alpha('#10b981', 0.2),
                        color: '#10b981',
                        bgcolor: alpha('#10b981', 0.04),
                        '&.Mui-disabled': { color: '#059669', opacity: 1 }
                      }}
                    >
                      Interest Shared
                    </Button>
                  ) : (
                    <>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleExpressInterest(id)}
                        disabled={!!actionLoading[id]}
                        sx={{
                          borderRadius: 1.5,
                          py: 1.25,
                          textTransform: 'none',
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                          }
                        }}
                      >
                        {actionLoading[id] ? <CircularProgress size={20} color="inherit" /> : 'Express Interest'}
                      </Button>
                      <IconButton
                        onClick={() => handleIgnore(id)}
                        sx={{
                          borderRadius: 1.5,
                          width: 48,
                          height: 48,
                          bgcolor: alpha('#ef4444', 0.05),
                          color: '#ef4444',
                          border: '1px solid',
                          borderColor: alpha('#ef4444', 0.1),
                          '&:hover': { bgcolor: alpha('#ef4444', 0.1) },
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
                {actionError[id] && (
                  <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, mt: 1.5, display: 'block', textAlign: 'center' }}>
                    {actionError[id]}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(ClassLeadsFeedCard);

