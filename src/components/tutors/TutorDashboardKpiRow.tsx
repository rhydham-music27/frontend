import React, { useEffect, useState } from 'react';
import { Box, Grid2, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentsIcon from '@mui/icons-material/Payments';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getTutorPerformanceMetrics, getMyProfile } from '../../services/tutorService';
import { getPaymentsByTutor } from '../../services/paymentService';
import { ITutor, ITutorPerformanceMetrics } from '../../types';

const TutorDashboardKpiRow: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tutor, setTutor] = useState<ITutor | null>(null);
  const [metrics, setMetrics] = useState<ITutorPerformanceMetrics | null>(null);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const profileRes = await getMyProfile();
        const tutorData = profileRes.data;
        setTutor(tutorData);

        const tutorId = (tutorData as any)?.id || (tutorData as any)?._id;
        if (tutorId) {
          const perfRes = await getTutorPerformanceMetrics(tutorId);
          setMetrics(perfRes.data || null);

          const paymentsRes = await getPaymentsByTutor(tutorId);
          const payments = paymentsRes.data.payments || [];
          const totalPaid = payments
            .filter((p: any) => String(p.status) === 'PAID')
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          setPaidAmount(totalPaid);
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard summary.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const overall = metrics?.feedbackRatings?.overall ?? tutor?.ratings ?? 0;
  const totalHours = metrics?.totalClassHours ?? tutor?.experienceHours ?? 0;

  const todaysClasses = metrics?.classesAssigned ?? 0;
  const tierLabel = tutor?.tier || 'N/A';

  if (loading) {
    return (
      <Box mb={{ xs: 2, sm: 3 }} display="flex" justifyContent="center">
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error || !tutor) {
    return null;
  }

  return (
    <Box mb={{ xs: 3, sm: 4 }}>
      <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              color: 'common.white',
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    display: 'inline-flex',
                  }}
                >
                  <EventAvailableIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {todaysClasses}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Today's Classes
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
              color: 'common.white',
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    display: 'inline-flex',
                  }}
                >
                  <PaymentsIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  ₹{(paidAmount / 1000).toFixed(1)}k
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Paid Earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              color: 'common.white',
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    display: 'inline-flex',
                  }}
                >
                  <StarIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {overall.toFixed(1)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Rating • Tier {tierLabel}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: 'common.white',
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    display: 'inline-flex',
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {totalHours}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Class Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default TutorDashboardKpiRow;
