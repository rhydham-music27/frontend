import React, { useEffect, useState } from 'react';
import { Box, CardContent, Grid } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { StyledCard } from '../common/StyledCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import MetricsCard from '../dashboard/MetricsCard';
import { getMyProfile, getTutorPerformanceMetrics } from '../../services/tutorService';
import { ITutor, ITutorPerformanceMetrics } from '../../types';

const clamp = (val: number, min: number, max: number) => {
  if (Number.isNaN(val as any)) return min;
  return Math.max(min, Math.min(max, val));
};

const formatPercentage = (value: number) => `${(value ?? 0).toFixed(1)}%`;

const FeedbackSummaryCard: React.FC = () => {
  const [tutorProfile, setTutorProfile] = useState<ITutor | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<ITutorPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileRes = await getMyProfile();
      const profile = profileRes.data;
      setTutorProfile(profile || null);

      const tutorId = (profile as any)?.id || (profile as any)?._id;
      if (tutorId) {
        const perfRes = await getTutorPerformanceMetrics(tutorId);
        setPerformanceMetrics(perfRes.data || null);
      } else {
        setPerformanceMetrics(null);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={4} aria-busy>
            <LoadingSpinner message="Loading performance summary..." />
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (error && !performanceMetrics) {
    return (
      <StyledCard>
        <CardContent>
          <ErrorAlert error={error} />
        </CardContent>
      </StyledCard>
    );
  }

  if (!performanceMetrics) {
    return null;
  }

  const totalFeedback = performanceMetrics.totalFeedback || 0;
  const overall = clamp(performanceMetrics.feedbackRatings?.overall ?? 0, 0, 5);
  const totalClassHours = performanceMetrics.totalClassHours || 0;

  const demosTaken = tutorProfile?.demosTaken || 0;
  const demosApproved = tutorProfile?.demosApproved || 0;
  const approvalRatioRaw = tutorProfile?.approvalRatio || 0;
  const approvalRatio = clamp(approvalRatioRaw, 0, 100);

  const conversionDisplay = demosTaken > 0 ? formatPercentage(approvalRatio) : 'N/A';
  const conversionSubtitle = `${demosApproved}/${demosTaken} demos`;

  return (
    <StyledCard>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <MetricsCard
              title="Overall Rating"
              value={`${overall.toFixed(1)}/5.0`}
              subtitle={`${totalFeedback} review${totalFeedback === 1 ? '' : 's'}`}
              icon={<StarIcon color="warning" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <MetricsCard
              title="Class Hours Completed"
              value={totalClassHours}
              subtitle="Total hours of class taken"
              icon={<CheckCircleIcon color="success" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <MetricsCard
              title="Demo Conversion"
              value={conversionDisplay}
              subtitle={conversionSubtitle}
              icon={<TrendingUpIcon color="primary" />}
            />
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(FeedbackSummaryCard);
