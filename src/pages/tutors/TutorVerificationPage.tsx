import { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, Button, Divider, Tabs, Tab, Dialog, DialogContent } from '@mui/material';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import VerificationStatusChip from '../../components/tutors/VerificationStatusChip';
import DocumentViewer from '../../components/tutors/DocumentViewer';
import VerificationModal from '../../components/tutors/VerificationModal';
import useTutors from '../../hooks/useTutors';
import { ITutor, IDocument } from '../../types';
import { getPendingVerifications, updateVerificationStatus } from '../../services/tutorService';
import { VERIFICATION_STATUS } from '../../constants';

export default function TutorVerificationPage() {
  const [tab, setTab] = useState(0);
  const [pending, setPending] = useState<ITutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<ITutor | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const { tutors, loading: loadingTutors, error: tutorsError, pagination, refetch } = useTutors({ page: 1, limit: 10 });

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPendingVerifications();
      setPending(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch pending verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleViewDoc = (doc: IDocument) => {
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  const handleReview = (t: ITutor) => {
    setSelectedTutor(t);
    setVerifyOpen(true);
  };

  const handleVerifySubmit = async (payload: { status: string; verificationNotes?: string }) => {
    if (!selectedTutor) return;
    await updateVerificationStatus(selectedTutor.id, payload.status, payload.verificationNotes);
    setSnack({ open: true, message: 'Verification updated', severity: 'success' });
    setVerifyOpen(false);
    setSelectedTutor(null);
    await fetchPending();
    await refetch();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Tutor Verification Management</Typography>
      <Card sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Pending Verifications (${pending.length})`} />
          <Tab label="All Tutors" />
        </Tabs>
      </Card>

      {tab === 0 && (
        <Box>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorAlert error={error} />
          ) : (
            <Grid container spacing={3}>
              {pending.map((t) => (
                <Grid item xs={12} md={6} lg={4} key={t.id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="h6">{t.user.name}</Typography>
                        <VerificationStatusChip status={t.verificationStatus} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{t.user.email} • {t.user.phone || '-'}</Typography>
                      <Typography variant="body2">Experience: {t.experienceHours} hrs</Typography>
                      <Box mt={1}>
                        <Typography variant="subtitle2">Subjects</Typography>
                        <Typography variant="body2">{(t.subjects || []).join(', ')}</Typography>
                      </Box>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Documents ({t.documents?.length || 0})</Typography>
                      <DocumentViewer documents={t.documents || []} onView={handleViewDoc} canDelete={false} />
                      <Box mt={2}>
                        <Button variant="contained" fullWidth onClick={() => handleReview(t)}>Review & Verify</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {pending.length === 0 && (
                <Grid item xs={12}><Typography color="text.secondary">No tutors pending verification.</Typography></Grid>
              )}
            </Grid>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {loadingTutors ? (
            <LoadingSpinner />
          ) : (
            <Grid container spacing={2}>
              {tutors.map((t) => (
                <Grid item xs={12} md={6} lg={4} key={t.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="h6">{t.user.name}</Typography>
                        <VerificationStatusChip status={t.verificationStatus} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{t.user.email} • {t.user.phone || '-'}</Typography>
                      <Typography variant="body2">Experience: {t.experienceHours} hrs</Typography>
                      <Typography variant="body2">Subjects: {(t.subjects || []).join(', ')}</Typography>
                      <Box mt={1}><Button size="small" variant="outlined" onClick={() => handleReview(t)}>View</Button></Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <ErrorAlert error={tutorsError} />
        </Box>
      )}

      <Dialog open={viewerOpen} onClose={() => setViewerOpen(false)} maxWidth="lg" fullWidth>
        <DialogContent>
          {selectedDoc && (selectedDoc.documentUrl.toLowerCase().endsWith('.pdf') ? (
            <iframe src={selectedDoc.documentUrl} title="document" style={{ width: '100%', height: '80vh', border: 'none' }} />
          ) : (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={selectedDoc.documentUrl} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
          ))}
        </DialogContent>
      </Dialog>

      <VerificationModal open={verifyOpen} onClose={() => setVerifyOpen(false)} tutor={selectedTutor} onSubmit={handleVerifySubmit} />
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
