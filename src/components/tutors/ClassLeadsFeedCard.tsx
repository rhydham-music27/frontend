import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Chip, Stack, Divider, IconButton, Tooltip, Alert, CardContent, Button } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CampaignIcon from '@mui/icons-material/Campaign';
import { StyledCard } from '../common/StyledCard';
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
      // fail silently for highlighting; core functionality should still work
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

    // Weights add up to 1.0; only include criteria that are applicable so
    // missing tutor preferences do not unfairly reduce the score.
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
      // No applicable preferences: treat as neutral 100% so opportunities are not penalized.
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

      // Sort by: highest match first, then ones without interest first.
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
          {filteredAnnouncements.map((item) => {
            const a = item.announcement as IAnnouncement;
            const matchPercentage = item.matchPercentage as number;
            const id = (((a as any).id || (a as any)._id) as string);
            const interested = hasExpressedInterest(a);
            const postedAt = (a as any)?.createdAt || (a as any)?.postedAt;
            const postedStr = postedAt ? new Date(postedAt).toLocaleDateString() : '';
            const cl = (a as any).classLead || {};
            const subjects = Array.isArray(cl?.subject) ? cl.subject.join(', ') : (cl?.subject || '');

            // Highlight logic: offline classes where city, preferred area and at least one subject match tutor profile
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

            // Get student display information
            const getStudentDisplay = () => {
              if (studentType === 'GROUP') {
                const studentNames = studentDetails.map((s: any) => s.name).filter(Boolean).join(', ');
                return {
                  type: 'GROUP',
                  label: `Group (${numberOfStudents} students)`,
                  names: studentNames || `${numberOfStudents} students`,
                  icon: <GroupIcon fontSize="small" />
                };
              } else {
                const studentName = cl?.studentName || 'Student';
                return {
                  type: 'SINGLE',
                  label: 'Single Student',
                  names: studentName,
                  icon: <PersonIcon fontSize="small" />
                };
              }
            };

            const studentDisplay = getStudentDisplay();

            // Calculate tutor fees
            const getTutorFeesDisplay = () => {
              if (studentType === 'GROUP') {
                // Sum up tutor fees from all students in the group
                const totalTutorFees = studentDetails.reduce((sum: number, student: any) => {
                  return sum + (student.tutorFees || 0);
                }, 0);
                return {
                  amount: totalTutorFees,
                  label: `Total Tutor Fees: ₹${totalTutorFees.toLocaleString()}`,
                  perStudent: studentDetails.length > 1 ? `₹${Math.round(totalTutorFees / studentDetails.length).toLocaleString()} per student` : null
                };
              } else {
                // Single student tutor fees
                const tutorFees = (cl as any)?.tutorFees || 0;
                return {
                  amount: tutorFees,
                  label: `Tutor Fees: ₹${tutorFees.toLocaleString()}`,
                  perStudent: null
                };
              }
            };

            const tutorFeesDisplay = getTutorFeesDisplay();

            return (
              <Box
                key={id}
                sx={{
                  border: '1px solid',
                  borderColor: isHighlighted ? 'primary.main' : 'grey.200',
                  borderWidth: isHighlighted ? 2 : 1,
                  borderRadius: 3,
                  p: 2.5,
                  mb: 2,
                  position: 'relative',
                  backgroundColor: isHighlighted ? 'rgba(25,118,210,0.04)' : 'inherit',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: isHighlighted ? 'rgba(25,118,210,0.08)' : 'grey.50',
                    borderColor: 'primary.light',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Stack spacing={0.75}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SchoolIcon fontSize="small" color="action" aria-label="Class" />
                      <Typography variant="subtitle1" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                        {`Class ${grade} - ${subjects || '-'}`}
                      </Typography>
                      <Chip
                        icon={studentDisplay.icon}
                        label={studentDisplay.label}
                        size="small"
                        color={studentDisplay.type === 'GROUP' ? 'secondary' : 'primary'}
                        variant="outlined"
                        sx={{ ml: 1, fontWeight: 500 }}
                      />
                      <Chip
                        label={`${matchPercentage}% match`}
                        color={matchPercentage >= 80 ? 'success' : matchPercentage >= 50 ? 'primary' : 'default'}
                        size="small"
                        sx={{ ml: 1, fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {`${board} | ${mode}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {studentDisplay.names}
                    </Typography>
                    {postedStr && (
                      <Typography variant="caption" color="text.secondary">
                        {`Posted on ${postedStr}`}
                      </Typography>
                    )}
                  </Stack>
                  <Tooltip title="Ignore this lead">
                    <IconButton size="small" onClick={() => handleIgnore(id)} aria-label="Ignore lead">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Stack spacing={1.25} mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {location || area || city || '-'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {scheduleLine}
                      {classesPerMonth != null && ` (${classesPerMonth} classes/month)`}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AttachMoneyIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {tutorFeesDisplay.label}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {`Preferred Tutor: ${genderPref}`}
                    </Typography>
                  </Box>
                </Stack>

                {requirementItems.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Parent Requirements:
                    </Typography>
                    <Stack spacing={0.5} pl={2}>
                      {requirementItems.map((req, idx) => (
                        <Typography key={idx} variant="body2" sx={{ position: 'relative' }}>
                          {`• ${req}`}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}

                {!!(a as any)?.interestCount && (a as any).interestCount > 0 && (
                  <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                    <Typography variant="caption" color="text.secondary">{(a as any).interestCount} tutor(s) interested</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2} flexWrap="wrap">
                  {interested ? (
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<ThumbUpIcon />}
                      disabled
                    >
                      Already Expressed
                    </Button>
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
