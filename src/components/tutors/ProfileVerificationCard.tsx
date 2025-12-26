import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Badge,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import { StyledCard } from '@/components/common/StyledCard';
import DocumentUploadForm from '@/components/tutors/DocumentUploadForm';
import DocumentViewer from '@/components/tutors/DocumentViewer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import { getMyProfile, uploadDocument } from '@/services/tutorService';
import { ITutor } from '@/types';
import { VERIFICATION_STATUS } from '@/constants';

const ProfileVerificationCard: React.FC = () => {
  const [tutorProfile, setTutorProfile] = useState<ITutor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const fetchTutorProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyProfile();
      const data = (response as any)?.data ?? response;
      setTutorProfile(data as ITutor);
    } catch (e: any) {
      setError(e?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDocumentUpload = async (tutorId: string, documentType: string, file: File) => {
    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      await uploadDocument(tutorId, documentType, file);
      setUploadSuccess(true);
      await fetchTutorProfile();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (e: any) {
      setUploadError(e?.message || 'Upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  if (loading && !tutorProfile) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <LoadingSpinner size={40} message="Loading profile..." />
      </Box>
    );
  }

  if (error && !tutorProfile) {
    return <ErrorAlert error={error} />;
  }

  if (!loading && !tutorProfile) {
    return (
      <StyledCard>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Tutor profile not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your profile could not be located. Please contact the administrator.
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <PersonIcon fontSize="small" aria-label="profile-information" />
          <Typography variant="h6" fontWeight={600}>
            Profile Information
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EmailIcon aria-label="email" />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={tutorProfile!.user.email} />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} sm={6}>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PhoneIcon aria-label="phone" />
                </ListItemIcon>
                <ListItemText primary="Phone" secondary={tutorProfile!.user.phone || 'Not provided'} />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} sm={6}>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <WorkHistoryIcon aria-label="experience" />
                </ListItemIcon>
                <ListItemText primary="Experience" secondary={`${tutorProfile!.experienceHours} hours`} />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} sm={6}>
            <List disablePadding>
              <ListItem disableGutters alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <SchoolIcon aria-label="subjects" />
                </ListItemIcon>
                <ListItemText
                  primary="Subjects"
                  secondary={
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {(tutorProfile!.subjects || []).map((sub: string, idx: number) => (
                        <Chip key={idx} size="small" variant="outlined" color="primary" label={sub} />
                      ))}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            </List>
          </Grid>
          {tutorProfile!.qualifications && tutorProfile!.qualifications.length > 0 && (
            <Grid item xs={12} sm={6}>
              <List disablePadding>
                <ListItem disableGutters alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    <SchoolIcon aria-label="qualifications" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Qualifications"
                    secondary={
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {tutorProfile!.qualifications.map((q: string, idx: number) => (
                          <Chip key={idx} size="small" variant="outlined" color="primary" label={q} />
                        ))}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </List>
            </Grid>
          )}
          {tutorProfile!.preferredMode && (
            <Grid item xs={12} sm={6}>
              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <WorkHistoryIcon aria-label="preferred-mode" />
                  </ListItemIcon>
                  <ListItemText primary="Preferred Mode" secondary={tutorProfile!.preferredMode} />
                </ListItem>
              </List>
            </Grid>
          )}
          {tutorProfile!.preferredLocations && tutorProfile!.preferredLocations.length > 0 && (
            <Grid item xs={12} sm={6}>
              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <WorkHistoryIcon aria-label="preferred-locations" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Preferred Locations"
                    secondary={tutorProfile!.preferredLocations.join(', ')}
                  />
                </ListItem>
              </List>
            </Grid>
          )}
        </Grid>

        {(tutorProfile as any).verificationStatus === VERIFICATION_STATUS.REJECTED && (
          <Box mt={3}>
            <Alert severity="error">
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Verification rejected  please re-upload documents
                </Typography>
                <Typography variant="body2">
                  {(tutorProfile as any).verificationNotes ||
                    'Your verification was rejected. Please review the feedback from our team and upload the corrected documents below to resubmit for verification.'}
                </Typography>
              </Box>
            </Alert>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Classes Assigned
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {(tutorProfile as any).classesAssigned ?? 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Demos Taken
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {(tutorProfile as any).demosTaken ?? 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Demos Approved
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {(tutorProfile as any).demosApproved ?? 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Approval Ratio
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {`${Math.round(Math.max(0, Math.min(100, (tutorProfile as any).approvalRatio ?? 0)))}%`}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box mt={3}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Teaching Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Tier
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {(tutorProfile as any).tier || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Overall Rating
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {`${(tutorProfile as any).ratings?.toFixed?.(1) ?? (tutorProfile as any).ratings ?? 0}/5`}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Classes Completed
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {(tutorProfile as any).classesCompleted ?? 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Interests Received
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {(tutorProfile as any).interestCount ?? 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Accordion expanded={expandedAccordion === 'documents'} onChange={handleAccordionChange('documents')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="documents-content" id="documents-header">
            <Box display="flex" alignItems="center" gap={1}>
              <DescriptionIcon aria-label="documents-and-verification" />
              <Typography variant="h6" fontWeight={600}>
                Documents & Verification
              </Typography>
              <Badge color="primary" badgeContent={tutorProfile!.documents?.length || 0} />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Upload required documents like ID proof, address proof, and qualification certificates. Ensure they are clear and legible.
            </Typography>
            {tutorProfile!.documents && tutorProfile!.documents.length > 0 && (
              <Box>
                <DocumentViewer
                  documents={tutorProfile!.documents as any}
                  canDelete={false}
                  onView={(doc: any) => window.open(doc.url, '_blank', 'noopener')}
                />
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Upload New Document
            </Typography>
            <DocumentUploadForm
              tutorId={(tutorProfile as any).id}
              onUploadSuccess={handleDocumentUpload}
              loading={uploadLoading}
              error={uploadError || undefined}
            />
            {uploadSuccess && (
              <Alert sx={{ mt: 2 }} severity="success">
                Document uploaded successfully!
              </Alert>
            )}
          </AccordionDetails>
        </Accordion>

        {Boolean((tutorProfile as any).verificationNotes) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={600}>
              Verification Notes
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mt: 1 }}>
              <Typography variant="body2">
                {(tutorProfile as any).verificationNotes}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default ProfileVerificationCard;
