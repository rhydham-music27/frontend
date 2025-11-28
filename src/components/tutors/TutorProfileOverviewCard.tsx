import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Grid2,
  Typography,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { blue, green, orange } from '@mui/material/colors';
import { ITutor } from '../../types';
import { getMyProfile, uploadDocument } from '../../services/tutorService';

const TutorProfileOverviewCard: React.FC = () => {
  const [tutor, setTutor] = useState<ITutor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
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

  if (error || !tutor) return null;

  const { user } = tutor;
  const rating = tutor.ratings ?? 0;
  const totalHours = (tutor as any).experienceHours ?? 0;
  const tierLabel = tutor.tier || 'N/A';

  const profilePhotoDoc = (tutor.documents || []).find((d) => d.documentType === 'PROFILE_PHOTO');
  const profileImageUrl = profilePhotoDoc?.documentUrl;

  const initials = (user?.name || '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleOpenAvatarModal = () => {
    setUploadError(null);
    setSelectedFile(null);
    setAvatarModalOpen(true);
  };

  const handleCloseAvatarModal = () => {
    if (uploadingAvatar) return;
    setAvatarModalOpen(false);
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) setUploadError(null);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      setUploadError('Please select an image file to upload.');
      return;
    }
    try {
      setUploadingAvatar(true);
      setUploadError(null);
      const res = await uploadDocument((tutor as any).id, 'PROFILE_PHOTO', selectedFile);
      setTutor(res.data);
      setAvatarModalOpen(false);
      setSelectedFile(null);
    } catch (e: any) {
      setUploadError(e?.response?.data?.message || e?.message || 'Failed to upload profile image.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <Box mb={{ xs: 3, sm: 4 }}>
      <Card sx={{ mb: { xs: 2.5, sm: 3 }, borderRadius: { xs: 4, sm: 3, md: 3 }, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'center' }} gap={{ xs: 2, md: 3 }}>
            <Box position="relative" sx={{ overflow: 'visible', flexShrink: 0 }}>
              <Box onClick={handleOpenAvatarModal} sx={{ width: { xs: 120, sm: 140, md: 160 }, height: { xs: 120, sm: 140, md: 160 }, borderRadius: { xs: '20px', sm: '16px', md: '12px' }, overflow: 'hidden', boxShadow: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: blue[500] }}>
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Typography variant="h3" sx={{ color: 'white' }}>{initials || (user?.name || 'T')[0]}</Typography>
                )}
              </Box>

              <Box sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: green[500], borderRadius: '8px', px: 1, py: 0.375, boxShadow: 3 }}>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>Active</Typography>
              </Box>
            </Box>

            <Box flex={1} minWidth={0} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</Typography>
              <Typography sx={{ opacity: 0.85, mb: 1 }}>{(tutor as any).qualifications?.join?.(', ') || 'Tutor'}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>Tutor ID:</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 600 }}>{tutor.teacherId || user?.email}</Typography>
              </Box>
            </Box>

            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row', md: 'column' }} gap={1}>
              <Card sx={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', color: 'common.white', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'common.white' }}>{rating.toFixed(1)}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)' }}>Rating • Tier {tierLabel}</Typography>
                </CardContent>
              </Card>

              <Card sx={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', color: 'common.white', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'common.white' }}>{totalHours}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)' }}>Total Class Hours</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Personal Details" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body2" fontWeight={500}>{user?.name}</Typography>
                </Box>
                {user?.phone && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="body2" fontWeight={500}>{user.phone}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Typography variant="body2" fontWeight={500}>{user?.role}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Teaching Profile" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {(tutor as any).subjects?.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Subjects</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.75}>{(tutor as any).subjects.map((s: string) => (<Chip key={s} label={s} size="small" />))}</Box>
                  </Box>
                )}

                {(tutor as any).preferredLocations && (tutor as any).preferredLocations.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Preferred Locations</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.75}>{(tutor as any).preferredLocations.map((l: string) => (<Chip key={l} label={l} size="small" />))}</Box>
                  </Box>
                )}

                {(tutor as any).preferredMode && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Teaching Mode</Typography>
                    <Typography variant="body2" fontWeight={500}>{(tutor as any).preferredMode}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      <Box mt={3}>
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Card>
              <CardHeader title="Experience & Performance" />
              <CardContent>
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Class Hours</Typography>
                      <Typography variant="subtitle1" fontWeight={700}>{totalHours}</Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Classes Assigned</Typography>
                      <Typography variant="subtitle1" fontWeight={700}>{(tutor as any).classesAssigned}</Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Classes Completed</Typography>
                      <Typography variant="subtitle1" fontWeight={700}>{(tutor as any).classesCompleted}</Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Demos Taken</Typography>
                      <Typography variant="subtitle1" fontWeight={700}>{(tutor as any).demosTaken}</Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Demo Approval Ratio</Typography>
                      <Typography variant="subtitle1" fontWeight={700}>{(tutor as any).approvalRatio}%</Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Ratings</Typography>
                      <Typography variant="subtitle1" fontWeight={700}>{(tutor as any).totalRatings}</Typography>
                    </Box>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 4 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Interest Count</Typography>
                      <Typography variant="subtitle1" fontWeight={700}>{(tutor as any).interestCount}</Typography>
                    </Box>
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 5 }}>
            <Card>
              <CardHeader title="Documents" />
              <CardContent>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {tutor.documents && tutor.documents.length > 0 ? (
                    tutor.documents.map((doc: any) => (
                      <Chip key={`${doc.documentType}-${doc.documentUrl}`} label={doc.documentType} size="small" sx={{ bgcolor: doc.verifiedAt ? 'success.light' : orange[50], color: doc.verifiedAt ? 'success.dark' : orange[800] }} />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No documents uploaded yet.</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Box>

      {avatarModalOpen && (
        <Dialog open={avatarModalOpen} onClose={handleCloseAvatarModal} fullWidth maxWidth="xs">
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={1}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: blue[500] }} src={profileImageUrl}>{initials || (user?.name || 'T')[0]}</Avatar>

              <Box sx={{ width: '100%', borderRadius: 2, border: '1px dashed', borderColor: 'divider', px: 2, py: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Select an image to upload</Typography>
                <Button variant="outlined" component="label">Choose File<input hidden type="file" accept="image/*" onChange={handleAvatarFileChange} /></Button>
              </Box>

              {uploadError && <Typography color="error">{uploadError}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAvatarModal} disabled={uploadingAvatar}>Cancel</Button>
            <Button variant="contained" onClick={handleUploadAvatar} disabled={uploadingAvatar}>{uploadingAvatar ? 'Uploading...' : 'Save'}</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default TutorProfileOverviewCard;
