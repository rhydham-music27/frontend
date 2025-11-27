// TutorProfileOverviewCard.tsx
// MUI-based profile overview for tutors, mirroring the YS trial Profile structure

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Avatar, Grid2, Typography, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { blue, green, orange, grey } from '@mui/material/colors';
import { ITutor } from '../../types';
import { getMyProfile, uploadDocument } from '../../services/tutorService';

const TutorProfileOverviewCard: React.FC = () => {
  const [tutor, setTutor] = useState<ITutor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  useEffect(() => {
    console.log("avatarModalOpen initialized to: ", avatarModalOpen);
  }, []);

  const setAvatarModalOpenWithLog = (newValue: boolean) => {
    console.log("avatarModalOpen changed to: ", newValue);
    setAvatarModalOpen(newValue);
  };
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMyProfile();
        setTutor(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load tutor profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading && !tutor) {
    return (
      <Box mb={{ xs: 3, sm: 4 }} display="flex" justifyContent="center">
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error || !tutor) {
    return null;
  }

  const { user } = tutor;

  const tierLabel = tutor.tier || 'N/A';
  const rating = tutor.ratings ?? 0;
  const totalHours = tutor.experienceHours ?? 0;

  const profilePhotoDoc = (tutor.documents || []).find((doc) => doc.documentType === 'PROFILE_PHOTO');
  const profileImageUrl = profilePhotoDoc?.documentUrl;

  const initials = (user.name || '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleOpenAvatarModal = (event: React.MouseEvent) => {
    // Check if the click originated from the avatar itself or a child element
    if (event.currentTarget.contains(event.target as Node)) {
      setUploadError(null);
      setSelectedFile(null);
      setAvatarModalOpen(true);
    }
  };

  const handleCloseAvatarModal = () => {
    if (uploadingAvatar) return;
    setAvatarModalOpen(false);
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setUploadError(null);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      setUploadError('Please select an image file to upload.');
      return;
    }

    try {
      setUploadingAvatar(true);
      setUploadError(null);
      const response = await uploadDocument(tutor.id, 'PROFILE_PHOTO', selectedFile);
      setTutor(response.data);
      setAvatarModalOpen(false);
      setSelectedFile(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to upload profile image.';
      setUploadError(msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <Box mb={{ xs: 3, sm: 4 }}>
      {/* Header-style profile summary, inspired by YS trial Profile header */}
      <Card
        sx={{
          mb: { xs: 2.5, sm: 3 },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        <CardContent>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} gap={3}>
            <Box position="relative">
              <Box
                onClick={handleOpenAvatarModal}
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.2), theme.shadows[5]',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: blue[500],
                }}
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Typography variant="h4" sx={{ color: 'white' }}>
                    {initials || (user.name || 'T')[0]}
                  </Typography>
                )}

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: -8,
                    bgcolor: green[500],
                    borderRadius: '8px',
                    px: 0.75,
                    py: 0.25,
                    boxShadow: 'theme.shadows[4]',
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', fontWeight: 700 }}>
                    Active
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box flex={1} minWidth={0}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  mb: 0.5,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 1 }}>
                {tutor.qualifications?.join(', ') || 'Tutor'}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.7, mr: 0.75 }}>
                  Email:
                </Typography>
                <Typography variant="caption" fontWeight={600} noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" flexDirection={{ xs: 'row', sm: 'row', md: 'column' }} gap={1.5}>
              <Card
                sx={{
                  minWidth: 120,
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  color: 'common.white',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <CardContent sx={{ py: 1.25, px: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {rating.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Rating • Tier {tierLabel}
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  minWidth: 120,
                  background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                  color: 'common.white',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <CardContent sx={{ py: 1.25, px: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {totalHours}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Total Class Hours
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detail sections mimicking YS trial Profile layout conceptually */}
      <Grid2 container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardHeader title="Personal Details" sx={{ pb: 0.5 }} />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {user.name}
                  </Typography>
                </Box>
                {user.phone && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {user.phone}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {user.role}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardHeader title="Teaching Profile" sx={{ pb: 0.5 }} />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {tutor.subjects?.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Subjects
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {tutor.subjects.map((subject) => (
                        <Chip key={subject} size="small" label={subject} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {tutor.preferredLocations && tutor.preferredLocations.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Preferred Locations
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {tutor.preferredLocations.map((location) => (
                        <Chip
                          key={location}
                          size="small"
                          label={location}
                          sx={{ bgcolor: grey[100] }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {tutor.preferredMode && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Teaching Mode
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {tutor.preferredMode}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      <Box mt={{ xs: 2.5, sm: 3 }}>
        <Grid2 container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader title="Experience & Performance" sx={{ pb: 0.5 }} />
              <CardContent>
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Class Hours
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {totalHours}
                      </Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box
                     
                    >
                      <Typography variant="caption" color="text.secondary">
                        Classes Assigned
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {tutor.classesAssigned}
                      </Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Classes Completed
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} >
                        {tutor.classesCompleted}
                      </Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Demos Taken
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {tutor.demosTaken}
                      </Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Demo Approval Ratio
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {tutor.approvalRatio}%
                      </Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Ratings
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {tutor.totalRatings}
                      </Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Interest Count
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {tutor.interestCount}
                      </Typography>
                    </Box>
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 5 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader title="Documents" sx={{ pb: 0.5 }} />
              <CardContent>
                <Box display="flex" flexWrap="wrap" gap={1.25}>
                  {tutor.documents && tutor.documents.length > 0 ? (
                    tutor.documents.map((doc) => (
                      <Chip
                        key={`${doc.documentType}-${doc.documentUrl}`}
                        label={doc.documentType}
                        size="small"
                        sx={{
                          bgcolor: doc.verifiedAt ? 'success.light' : orange[50],
                          color: doc.verifiedAt ? 'success.dark' : orange[800],
                          borderRadius: 1.5,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No documents uploaded yet.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Box>

      {avatarModalOpen && (
        <Dialog open={avatarModalOpen} onClose={handleCloseAvatarModal} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 700 }}>Update Profile Picture</DialogTitle>
          <DialogContent sx={{ pt: 0 }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2.5}
              mt={1}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  boxShadow: 3,
                  bgcolor: blue[500],
                }}
                src={profileImageUrl}
              >
                {initials || (user.name || 'T')[0]}
              </Avatar>

              <Box
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                  px: 2,
                  py: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Select an image to upload
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  JPG, PNG up to 5MB. Your picture helps coordinators and parents recognise you.
                </Typography>
                <Button variant="outlined" component="label" size="small">
                  Choose File
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                  />
                </Button>
              </Box>

              {uploadError && (
                <Typography variant="body2" color="error" align="center">
                  {uploadError}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button onClick={handleCloseAvatarModal} disabled={uploadingAvatar} variant="text">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUploadAvatar}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? 'Uploading...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default TutorProfileOverviewCard;
