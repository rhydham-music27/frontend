import React, { useEffect, useState, useMemo } from 'react';
import { Container, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Autocomplete, Chip } from '@mui/material';
import ProfileVerificationCard from '../../components/tutors/ProfileVerificationCard';
import MUIProfileCard from '../../components/tutors/MUIProfileCard';
import { getMyProfile, updateTutorProfile } from '../../services/tutorService';
import type { ITutor } from '../../types';
import { useOptions } from '@/hooks/useOptions';

const areasByCity: Record<string, string[]> = {
  Bhopal: [
    'Arera Colony',
    'MP Nagar',
    'Kolar Road',
    'Hoshangabad Road',
    'Berasia Road',
    'Ayodhya Bypass',
    'Bairagarh',
    'Katara Hills',
    'Shahpura',
    'Jahangirabad',
    'Govindpura',
    'Ashoka Garden',
    'Bawadiya Kalan',
    'Raisen Road',
  ],
};

const TutorProfilePage: React.FC = () => {
  const [tutorProfile, setTutorProfile] = useState<ITutor | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedExtracurriculars, setSelectedExtracurriculars] = useState<string[]>([]);
  const [qualificationsInput, setQualificationsInput] = useState('');
  const [preferredAreas, setPreferredAreas] = useState<string[]>([]);
  const [experienceInput, setExperienceInput] = useState('');
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  const { options: subjectOptions } = useOptions('SUBJECT');
  const subjectLabels = useMemo(() => subjectOptions.map((o) => o.label), [subjectOptions]);

  const { options: extracurricularOptions } = useOptions('EXTRACURRICULAR');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const resp = await getMyProfile();
        const data: any = (resp as any)?.data ?? resp;
        const tutor = (data as ITutor) || null;
        setTutorProfile(tutor);

        if (tutor) {
          const hasSubjects = Array.isArray(tutor.subjects) && tutor.subjects.length > 0;
          const hasQualifications =
            Array.isArray(tutor.qualifications) && tutor.qualifications.length > 0;
          const hasLocations =
            Array.isArray(tutor.preferredLocations) && tutor.preferredLocations.length > 0;
          const hasExtracurriculars =
            Array.isArray((tutor as any).extracurricularActivities) &&
            (tutor as any).extracurricularActivities.length > 0;

          const isIncomplete =
            !hasSubjects || !hasQualifications || !hasLocations || !hasExtracurriculars;
          if (isIncomplete) {
            openCompleteModal();
          }
        }
      } catch {
        // ignore errors here; ProfileVerificationCard already handles its own loading/error state
      }
    };

    loadProfile();
  }, []);

  const openCompleteModal = () => {
    if (tutorProfile) {
      setSelectedSubjects(tutorProfile.subjects || []);
      setQualificationsInput((tutorProfile.qualifications || []).join(', '));
      const rawCity =
        ((tutorProfile as any).city as string) ||
        ((tutorProfile as any).user?.city as string) ||
        'Bhopal';
      const city = (rawCity || 'Bhopal').trim() || 'Bhopal';
      const currentAreas = (tutorProfile.preferredLocations || []).filter(
        (area) => area && area !== city
      );
      setPreferredAreas(currentAreas);
      setExperienceInput(((tutorProfile as any).experience as string) || '');
      const extracurricular = ((tutorProfile as any).extracurricularActivities as string[]) || [];
      setSelectedExtracurriculars(extracurricular);
      const areas = areasByCity[city] || areasByCity.Bhopal || [];
      setAvailableAreas(areas);
    }
    setCompleteModalOpen(true);
  };

  const handleSaveCompleteProfile = async () => {
    if (!tutorProfile) {
      setCompleteModalOpen(false);
      return;
    }

    const subjects = selectedSubjects;
    const qualifications = qualificationsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const rawCity =
      ((tutorProfile as any).city as string) ||
      ((tutorProfile as any).user?.city as string) ||
      'Bhopal';
    const city = (rawCity || 'Bhopal').trim() || 'Bhopal';
    const preferredLocations = preferredAreas.filter((area) => area && area !== city);
    const experience = experienceInput.trim() || undefined;
    const extracurricularActivities = selectedExtracurriculars;

    try {
      setSaving(true);
      await updateTutorProfile(tutorProfile.id, {
        subjects,
        qualifications,
        preferredLocations,
        experience,
        extracurricularActivities,
      } as any);

      // Refresh local copy so future opens reflect latest data
      const resp = await getMyProfile();
      const data: any = (resp as any)?.data ?? resp;
      setTutorProfile((data as ITutor) || null);

      setCompleteModalOpen(false);
    } catch {
      // In case of error, keep modal open so user can retry or adjust
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={{ xs: 3, sm: 4 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 2 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            My Profile
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            View and manage your tutor profile, documents, and verification status.
          </Typography>
        </Box>
        {(() => {
          if (!tutorProfile) return null;
          const hasSubjects = Array.isArray(tutorProfile.subjects) && tutorProfile.subjects.length > 0;
          const hasQualifications =
            Array.isArray(tutorProfile.qualifications) && tutorProfile.qualifications.length > 0;
          const hasLocations =
            Array.isArray(tutorProfile.preferredLocations) &&
            tutorProfile.preferredLocations.length > 0;
          const isIncomplete = !hasSubjects || !hasQualifications || !hasLocations;
          if (!isIncomplete) return null;
          return (
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={openCompleteModal}
              >
                Complete Profile
              </Button>
            </Box>
          );
        })()}
      </Box>

      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          px: { xs: 1.5, sm: 0 },
        }}
      >
        <Box
          sx={{
            maxWidth: '100%',
          }}
        >
          <MUIProfileCard />
        </Box>
      </Box>

      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          px: { xs: 1.5, sm: 0 },
        }}
      >
        <Box sx={{ maxWidth: 960, mx: 'auto' }}>
          <ProfileVerificationCard />
        </Box>
      </Box>
      <Dialog
        open={completeModalOpen}
        onClose={() => !saving && setCompleteModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Complete your tutor profile</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fill these details so our team can match you with the right classes.
          </Typography>
          <TextField
            label="Experience"
            value={experienceInput}
            onChange={(e) => setExperienceInput(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="e.g., 2 years, Fresher"
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={subjectLabels}
            value={selectedSubjects}
            onChange={(_, value) => setSelectedSubjects(value)}
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Subjects you can teach"
                placeholder="Select one or more subjects"
                margin="normal"
                fullWidth
              />
            )}
          />
          <TextField
            label="Your qualifications"
            value={qualificationsInput}
            onChange={(e) => setQualificationsInput(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="e.g., B.Sc, M.Sc, B.Ed"
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={extracurricularOptions.map((opt) => opt.value)}
            value={selectedExtracurriculars}
            onChange={(_, value) => setSelectedExtracurriculars(value)}
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Extracurricular activities you can teach/coach"
                placeholder="Select one or more activities"
                margin="normal"
                fullWidth
              />
            )}
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={availableAreas}
            value={preferredAreas}
            onChange={(_, value) => setPreferredAreas(value)}
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Preferred Areas for Offline Classes"
                placeholder="Preferred Areas for Offline Classes"
                margin="normal"
                fullWidth
              />
            )}
          />
          {/* Subjects and locations are now selected via dropdowns, so no comma instruction needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCompleteProfile}
            color="primary"
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save & Continue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TutorProfilePage;
