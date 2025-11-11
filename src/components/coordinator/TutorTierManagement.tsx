import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  Divider,
  Alert,
  Grid,
  CircularProgress,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ITutor, ITutorPerformanceMetrics } from '../../types';
import { TUTOR_TIER } from '../../constants';
import { requestTierChange } from '../../services/tutorService';

interface TutorTierManagementProps {
  open: boolean;
  onClose: () => void;
  tutor: ITutor | null;
  performanceMetrics: ITutorPerformanceMetrics | null;
  onSuccess: () => void;
}

const formatDate = (d?: Date | string) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString();
};

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

const TutorTierManagement: React.FC<TutorTierManagementProps> = ({ open, onClose, tutor, performanceMetrics, onSuccess }) => {
  const [newTier, setNewTier] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recommendedTier = useMemo(() => {
    if (!performanceMetrics) return TUTOR_TIER.BRONZE;
    const a = performanceMetrics.attendanceApprovalRate || 0;
    const f = performanceMetrics.feedbackRatings?.overall || 0;
    const r = performanceMetrics.recommendationRate || 0;
    if (a > 90 && f > 4.5 && r > 90) return TUTOR_TIER.PLATINUM;
    if (a > 80 && f > 4.0 && r > 80) return TUTOR_TIER.GOLD;
    if (a > 70 && f > 3.5 && r > 70) return TUTOR_TIER.SILVER;
    return TUTOR_TIER.BRONZE;
  }, [performanceMetrics]);

  const handleSubmit = async () => {
    if (!tutor || !newTier) return;
    try {
      setLoading(true);
      setError(null);
      await requestTierChange({ tutorId: tutor.id, newTier, reason });
      onSuccess();
      handleClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to submit tier change request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewTier('');
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage Tutor Tier</DialogTitle>
      <DialogContent dividers>
        {!tutor ? (
          <Alert severity="info">No tutor selected</Alert>
        ) : (
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="subtitle2">Current Tier:</Typography>
              <Chip
                icon={<StarIcon style={{ color: tierColor(tutor.tier) }} />}
                label={tutor.tier}
                sx={{ borderColor: tierColor(tutor.tier), color: 'text.primary' }}
                variant="outlined"
              />
              {tutor.tierUpdatedAt && (
                <Typography variant="caption" color="text.secondary">Last updated: {formatDate(tutor.tierUpdatedAt)}</Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
            {performanceMetrics ? (
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography>Attendance Approval Rate: {performanceMetrics.attendanceApprovalRate}%</Typography></Grid>
                <Grid item xs={6}><Typography>Average Feedback: {performanceMetrics.feedbackRatings?.overall?.toFixed(2)}/5</Typography></Grid>
                <Grid item xs={6}><Typography>Recommendation Rate: {performanceMetrics.recommendationRate}%</Typography></Grid>
                <Grid item xs={6}><Typography>Total Feedback: {performanceMetrics.totalFeedback}</Typography></Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">No performance data available</Typography>
            )}

            <Box mt={2}>
              <Alert icon={<TrendingUpIcon />} severity="info">
                Recommended Tier: <strong>{recommendedTier}</strong>
                <Typography variant="caption" display="block">Based on performance metrics</Typography>
              </Alert>
            </Box>

            {tutor.pendingTierChange ? (
              <Box mt={2}>
                <Alert severity="warning">
                  <Box>
                    <Typography variant="subtitle2">Pending tier change request:</Typography>
                    <Typography>New Tier: {tutor.pendingTierChange.newTier}</Typography>
                    <Typography>Requested by: {tutor.pendingTierChange.requestedBy?.name || 'User'}</Typography>
                    <Typography>Requested at: {formatDate(tutor.pendingTierChange.requestedAt)}</Typography>
                    <Typography>Reason: {tutor.pendingTierChange.reason || 'No reason provided'}</Typography>
                    <Typography variant="caption" color="text.secondary">This request is awaiting manager approval</Typography>
                  </Box>
                </Alert>
              </Box>
            ) : (
              <Box mt={2}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Request Tier Change</Typography>
                <TextField
                  select
                  label="New Tier"
                  fullWidth
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  {Object.values(TUTOR_TIER).map((tier) => (
                    <MenuItem key={tier} value={tier} disabled={tier === tutor.tier}>
                      <Chip label={tier} sx={{ borderColor: tierColor(tier), color: 'text.primary' }} variant="outlined" />
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Reason for Change"
                  multiline
                  rows={3}
                  fullWidth
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this tier change is recommended based on performance"
                />
              </Box>
            )}

            {error && (
              <Box mt={2}><Alert severity="error">{error}</Alert></Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !newTier || !!tutor?.pendingTierChange}
          startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TutorTierManagement;
