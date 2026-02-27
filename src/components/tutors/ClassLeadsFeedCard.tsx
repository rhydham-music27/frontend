import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Chip, Stack, Divider, IconButton, Tooltip, Alert, CardContent, Button, Card, alpha } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CampaignIcon from '@mui/icons-material/Campaign';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import { getTutorAvailableAnnouncements, expressInterest } from '../../services/announcementService';
import tutorService from '../../services/tutorService';
import { IAnnouncement, INotification, ITutor } from '../../types';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import useNotifications from '../../hooks/useNotifications';

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

    const leadSubjects: string[] = Array.isArray(cl.subject)
      ? (cl.subject as string[])
      : cl.subject
        ? [String(cl.subject)]
        : [];
    const tutorSubjects: string[] = Array.isArray((tutor as any).subjects)
      ? ((tutor as any).subjects as string[])
      : [];
    const preferredSubjects: string[] = Array.isArray((tutor as any).settings?.preferredSubjects)
      ? ((tutor as any).settings.preferredSubjects as string[])
      : [];

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
          <Box display="flex" justifyContent="center" py={4} aria-busy>
            <LoadingSpinner message="Loading class opportunities..." />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && filteredAnnouncements.length === 0) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <ErrorAlert error={error} />
          <Box mt={1.5} display="flex" justifyContent="center">
            <Button variant="outlined" onClick={fetchAnnouncements} sx={{ borderRadius: 2, textTransform: 'none' }}>Retry</Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!loading && filteredAnnouncements.length === 0) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <EmptyState
            icon={<CampaignIcon color="primary" />}
            title="No Active Class Leads"
            description="There are no new class opportunities at the moment. Check back later!"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 2,
                bgcolor: alpha('#3b82f6', 0.08),
                display: 'flex',
              }}
            >
              <CampaignIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              Class Opportunities
            </Typography>
          </Box>
          <Chip
            label={`${filteredAnnouncements.length} available`}
            size="small"
            sx={{
              bgcolor: alpha('#3b82f6', 0.08),
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 26,
            }}
          />
        </Box>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2, borderRadius: 2 }} role="status">
            {successMessage}
          </Alert>
        )}

        <Box
          sx={{
            maxHeight: 600,
            overflow: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
          }}
        >
          {filteredAnnouncements.map((item) => {
            const a = item.announcement as IAnnouncement;
            const matchPercentage = item.matchPercentage as number;
            const id = (((a as any).id || (a as any)._id) as string);
            const interested = hasExpressedInterest(a);
            const postedAt = (a as any)?.createdAt || (a as any)?.postedAt;
            const postedStr = postedAt ? new Date(postedAt).toLocaleDateString() : '';
            const cl = (a as any).classLead || {};
            const subjects = Array.isArray(cl?.subject) ? cl.subject.join(', ') : (cl?.subject || '');

            const isHighlighted = Boolean(matchPercentage >= 80);

            const grade = cl?.grade || '-';
            const board = cl?.board || '-';
            const mode = cl?.mode || '-';
            const studentType = (cl as any)?.studentType || 'SINGLE';
            const numberOfStudents = (cl as any)?.numberOfStudents || 1;
            const studentDetails = (cl as any)?.studentDetails || [];
            const location = (cl as any)?.location || '';
            const city = (cl as any)?.city || '';
            const area = (cl as any)?.area || '';
            const scheduleLine = cl?.timing || '-';
            const classesPerMonth = (cl as any)?.classesPerMonth;
            const genderPref = (cl as any)?.preferredTutorGender || '-';
            const qualifications = String((cl as any)?.qualifications || '').trim();
            const requirementItems = qualifications
              ? qualifications.split(/[,•\n]/).map((s) => s.trim()).filter(Boolean)
              : [];

            const getStudentDisplay = () => {
              if (studentType === 'GROUP') {
                const studentNames = studentDetails.map((s: any) => s.name).filter(Boolean).join(', ');
                return {
                  type: 'GROUP',
                  label: `Group (${numberOfStudents} students)`,
                  names: studentNames || `${numberOfStudents} students`,
                  icon: <GroupIcon fontSize="small" />,
                };
              } else {
                const studentName = cl?.studentName || 'Student';
                return {
                  type: 'SINGLE',
                  label: 'Single Student',
                  names: studentName,
                  icon: <PersonIcon fontSize="small" />,
                };
              }
            };

            const studentDisplay = getStudentDisplay();

            const getTutorFeesDisplay = () => {
              if (studentType === 'GROUP') {
                const totalTutorFees = studentDetails.reduce((sum: number, student: any) => {
                  return sum + (student.tutorFees || 0);
                }, 0);
                return {
                  amount: totalTutorFees,
                  label: `Total Tutor Fees: ₹${totalTutorFees.toLocaleString()}`,
                  perStudent: studentDetails.length > 1 ? `₹${Math.round(totalTutorFees / studentDetails.length).toLocaleString()} per student` : null
                };
              } else {
                const tutorFees = (cl as any)?.tutorFees || 0;
                return {
                  amount: tutorFees,
                  label: `Tutor Fees: ₹${tutorFees.toLocaleString()}`,
                  perStudent: null
                };
              }
            };

            const tutorFeesDisplay = getTutorFeesDisplay();

            const matchColor = matchPercentage >= 80 ? '#10b981' : matchPercentage >= 50 ? '#3b82f6' : '#94a3b8';

            return (
              <Box
                key={id}
                sx={{
                  border: '1px solid',
                  borderColor: isHighlighted ? alpha('#10b981', 0.3) : alpha('#3b82f6', 0.1),
                  borderRadius: 2.5,
                  p: 2.5,
                  mb: 2,
                  position: 'relative',
                  bgcolor: isHighlighted ? alpha('#10b981', 0.03) : alpha('#3b82f6', 0.01),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isHighlighted ? alpha('#10b981', 0.06) : alpha('#3b82f6', 0.04),
                    borderColor: isHighlighted ? alpha('#10b981', 0.4) : alpha('#3b82f6', 0.2),
                  },
                }}
              >
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Stack spacing={0.5}>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <SchoolIcon sx={{ fontSize: 18, color: '#3b82f6' }} aria-label="Class" />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ wordBreak: 'break-word', fontSize: '0.92rem' }}>
                        {`Class ${grade} - ${subjects || '-'}`}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={0.75} flexWrap="wrap" mt={0.5}>
                      <Chip
                        icon={studentDisplay.icon}
                        label={studentDisplay.label}
                        size="small"
                        sx={{
                          bgcolor: studentDisplay.type === 'GROUP' ? alpha('#8b5cf6', 0.08) : alpha('#3b82f6', 0.08),
                          color: studentDisplay.type === 'GROUP' ? '#7c3aed' : '#2563eb',
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          height: 24,
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                      <Chip
                        label={`${matchPercentage}% match`}
                        size="small"
                        sx={{
                          bgcolor: alpha(matchColor, 0.1),
                          color: matchColor,
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 24,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.5 }}>
                      {`${board} • ${mode}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                      {studentDisplay.names}
                    </Typography>
                    {postedStr && (
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                        {`Posted ${postedStr}`}
                      </Typography>
                    )}
                  </Stack>
                  <Tooltip title="Ignore this lead">
                    <IconButton
                      size="small"
                      onClick={() => handleIgnore(id)}
                      aria-label="Ignore lead"
                      sx={{
                        bgcolor: alpha('#ef4444', 0.06),
                        '&:hover': { bgcolor: alpha('#ef4444', 0.12) },
                        width: 28,
                        height: 28,
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Details */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha('#f8fafc', 0.8),
                    border: '1px solid',
                    borderColor: 'grey.50',
                    mb: 2,
                  }}
                >
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOnIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                        {location || area || city || '-'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                        {scheduleLine}
                        {classesPerMonth != null && ` (${classesPerMonth}/month)`}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AttachMoneyIcon sx={{ fontSize: 15, color: '#10b981' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#059669' }}>
                        {tutorFeesDisplay.label}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                        {`Preferred: ${genderPref}`}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {requirementItems.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="caption" fontWeight={700} display="block" mb={0.75} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>
                      Parent Requirements
                    </Typography>
                    <Stack spacing={0.25} pl={0.5}>
                      {requirementItems.map((req, idx) => (
                        <Typography key={idx} variant="body2" sx={{ fontSize: '0.8rem', position: 'relative', pl: 1.5, '&::before': { content: '"•"', position: 'absolute', left: 0, color: 'text.disabled' } }}>
                          {req}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}

                {!!(a as any)?.interestCount && (a as any).interestCount > 0 && (
                  <Typography variant="caption" color="text.disabled" display="block" mb={1.5} sx={{ fontSize: '0.68rem' }}>
                    {(a as any).interestCount} tutor(s) interested
                  </Typography>
                )}

                <Divider sx={{ mb: 2, borderColor: alpha('#3b82f6', 0.06) }} />

                {/* Actions */}
                <Box display="flex" gap={1.5} flexWrap="wrap">
                  {interested ? (
                    <Button
                      variant="outlined"
                      startIcon={<ThumbUpIcon sx={{ fontSize: 16 }} />}
                      disabled
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        borderColor: alpha('#10b981', 0.3),
                        color: '#10b981',
                      }}
                    >
                      Already Expressed
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<ThumbUpIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleExpressInterest(id)}
                        disabled={!!actionLoading[id]}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          bgcolor: '#3b82f6',
                          '&:hover': { bgcolor: '#2563eb' },
                          px: 2.5,
                        }}
                      >
                        {actionLoading[id] ? 'Expressing...' : 'Express Interest'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleIgnore(id)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          color: 'text.secondary',
                          borderColor: 'grey.200',
                          '&:hover': { borderColor: 'grey.400' },
                        }}
                      >
                        Ignore
                      </Button>
                    </>
                  )}
                </Box>
                {actionError[id] && (
                  <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, fontSize: '0.78rem' }}>{actionError[id]}</Alert>
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
