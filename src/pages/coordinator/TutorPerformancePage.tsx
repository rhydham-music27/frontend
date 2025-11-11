import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  MenuItem,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Pagination,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { useNavigate } from 'react-router-dom';
import { getCoordinatorTutors, getTutorFeedback, getTutorPerformanceMetrics } from '../../services/tutorService';
import { ITutor, ITutorPerformanceMetrics, ITutorFeedback } from '../../types';
import { TUTOR_TIER } from '../../constants';
import TutorTierManagement from '../../components/coordinator/TutorTierManagement';

const tierColor = (tier: string) => {
  switch (tier) {
    case TUTOR_TIER.BRONZE:
      return '#CD7F32';
    case TUTOR_TIER.SILVER:
      return '#C0C0C0';
    case TUTOR_TIER.GOLD:
      return '#FFD700';
    case TUTOR_TIER.PLATINUM:
      return '#E5E4E2';
    default:
      return 'default';
  }
};

const TutorPerformancePage: React.FC = () => {
  const [view, setView] = useState<'tutors' | 'feedback'>('tutors');
  const [tutors, setTutors] = useState<ITutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<ITutor | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<ITutorPerformanceMetrics | null>(null);
  const [feedback, setFeedback] = useState<ITutorFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ tier?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; page: number; limit: number }>({ page: 1, limit: 9 });
  const [pagination, setPagination] = useState<{ total: number; pages: number }>({ total: 0, pages: 0 });
  const [tierModalOpen, setTierModalOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const fetchTutors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, pagination } = await getCoordinatorTutors(filters);
      setTutors(data);
      setPagination({ total: pagination.total, pages: pagination.pages });
    } catch {
      setError('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchPerformanceMetrics = useCallback(async (tutorId: string) => {
    try {
      const { data } = await getTutorPerformanceMetrics(tutorId);
      setPerformanceMetrics(data);
    } catch {
      // ignore
    }
  }, []);

  const fetchFeedback = useCallback(async (tutorId: string) => {
    try {
      const { data } = await getTutorFeedback(tutorId, { page: 1, limit: 10 });
      setFeedback(data);
    } catch {
      setFeedback([]);
    }
  }, []);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 9 });
  };

  const handlePageChange = (_: any, page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    fetchTutors();
    setSnackbar({ open: true, message: 'Refreshing data...', severity: 'info' });
  };

  const handleManageTier = (tutor: ITutor) => {
    setSelectedTutor(tutor);
    fetchPerformanceMetrics(tutor.id);
    setTierModalOpen(true);
  };

  const handleTierChangeSuccess = () => {
    setSnackbar({ open: true, message: 'Tier change request submitted successfully', severity: 'success' });
    setTierModalOpen(false);
    fetchTutors();
  };

  const handleViewFeedback = (tutor: ITutor) => {
    setSelectedTutor(tutor);
    fetchFeedback(tutor.id);
    setView('feedback');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Tutor Performance Management</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>Refresh</Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <Tabs value={view} onChange={(_, v) => setView(v)}>
          <Tab label="Tutors" value="tutors" />
          <Tab label="Feedback" value="feedback" />
        </Tabs>
      </Card>

      {view === 'tutors' && (
        <>
          <Card sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="Tier" value={filters.tier || ''} onChange={(e) => handleFilterChange('tier', e.target.value || undefined)}>
                  <MenuItem value="">All Tiers</MenuItem>
                  {Object.values(TUTOR_TIER).map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="Sort By" value={filters.sortBy || ''} onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}>
                  <MenuItem value="">Default</MenuItem>
                  <MenuItem value="user.name">Name</MenuItem>
                  <MenuItem value="ratings">Rating</MenuItem>
                  <MenuItem value="classesCompleted">Classes Completed</MenuItem>
                  <MenuItem value="approvalRatio">Approval Ratio</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="Order" value={filters.sortOrder || ''} onChange={(e) => handleFilterChange('sortOrder', e.target.value || undefined)}>
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3} display="flex" alignItems="center">
                <Button startIcon={<FilterListIcon />} onClick={handleClearFilters}>Clear Filters</Button>
              </Grid>
            </Grid>
          </Card>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Showing {tutors.length} tutors</Typography>

          <Grid container spacing={3}>
            {tutors.map((tutor) => (
              <Grid key={tutor.id} item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6">{tutor.user?.name}</Typography>
                      <Chip
                        icon={<StarIcon style={{ color: tierColor(tutor.tier) }} />}
                        label={tutor.tier}
                        variant="outlined"
                        sx={{ borderColor: tierColor(tutor.tier) }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{tutor.user?.email}</Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2">Performance Metrics</Typography>
                    <Grid container spacing={1} mt={0.5}>
                      <Grid item xs={6}><Typography variant="body2">Classes: {tutor.classesAssigned}</Typography></Grid>
                      <Grid item xs={6}><Typography variant="body2">Completed: {tutor.classesCompleted}</Typography></Grid>
                      <Grid item xs={6}><Typography variant="body2">Rating: {tutor.ratings}/5</Typography></Grid>
                      <Grid item xs={6}><Typography variant="body2">Approval: {Math.round(tutor.approvalRatio)}%</Typography></Grid>
                    </Grid>
                    {tutor.pendingTierChange && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography variant="caption">Pending tier change to {tutor.pendingTierChange.newTier}</Typography>
                      </Alert>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button variant="contained" size="small" onClick={() => handleManageTier(tutor)} startIcon={<TrendingUpIcon />}>Manage Tier</Button>
                    <Button variant="outlined" size="small" onClick={() => handleViewFeedback(tutor)} startIcon={<FeedbackIcon />}>View Feedback</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {!loading && tutors.length === 0 && (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">No tutors found</Typography>
              <Typography variant="body2">Tutors assigned to your classes will appear here</Typography>
            </Box>
          )}

          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination count={pagination.pages} page={filters.page} onChange={handlePageChange} color="primary" size="large" />
            </Box>
          )}
        </>
      )}

      {view === 'feedback' && (
        <>
          {selectedTutor && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{selectedTutor.user.name}</Typography>
                    <Chip label={selectedTutor.tier} icon={<StarIcon style={{ color: tierColor(selectedTutor.tier) }} />} variant="outlined" />
                  </Box>
                  <Button onClick={() => setView('tutors')}>Back to Tutors</Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Grid container spacing={2}>
            {feedback.map((f) => (
              <Grid key={`${f.submittedBy.id}-${f.month}`} item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1">{f.submittedBy.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{f.month}</Typography>
                    </Box>
                    <Chip label={f.submitterRole} size="small" sx={{ mt: 1 }} />
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2">Ratings</Typography>
                    <Grid container spacing={1} mt={0.5}>
                      <Grid item xs={6}><Typography variant="body2">Overall: {f.overallRating}/5</Typography></Grid>
                      <Grid item xs={6}><Typography variant="body2">Teaching: {f.teachingQuality}/5</Typography></Grid>
                      <Grid item xs={6}><Typography variant="body2">Punctuality: {f.punctuality}/5</Typography></Grid>
                      <Grid item xs={6}><Typography variant="body2">Communication: {f.communication}/5</Typography></Grid>
                      <Grid item xs={6}><Typography variant="body2">Subject Knowledge: {f.subjectKnowledge}/5</Typography></Grid>
                    </Grid>
                    {f.comments && <Typography variant="body2" mt={1}>Comments: {f.comments}</Typography>}
                    {f.strengths && <Typography variant="body2">Strengths: {f.strengths}</Typography>}
                    {f.improvements && <Typography variant="body2">Improvements: {f.improvements}</Typography>}
                    <Chip label={f.wouldRecommend ? 'Would Recommend' : 'Would Not Recommend'} color={f.wouldRecommend ? 'success' as any : 'error' as any} size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {feedback.length === 0 && (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">No feedback available for this tutor</Typography>
            </Box>
          )}
        </>
      )}

      <TutorTierManagement
        open={tierModalOpen}
        onClose={() => setTierModalOpen(false)}
        tutor={selectedTutor}
        performanceMetrics={performanceMetrics}
        onSuccess={handleTierChangeSuccess}
      />
    </Container>
  );
};

export default TutorPerformancePage;
