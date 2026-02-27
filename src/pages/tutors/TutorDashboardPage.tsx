import React, { useState, useEffect } from "react";

import {
  Container,
  Box,
  Typography,
  Grid2,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import TutorAdvancedAnalyticsCards from "../../components/tutors/TutorAdvancedAnalyticsCards";
import TodayScheduleCard from "../../components/tutors/TodayScheduleCard";
import UpcomingTestsCard from "../../components/tutors/UpcomingTestsCard";
import ActiveClassesOverviewCard from "../../components/tutors/ActiveClassesOverviewCard";
import ClassLeadsFeedCard from "../../components/tutors/ClassLeadsFeedCard";
import DemoClassesCard from "../../components/tutors/DemoClassesCard";
import VerificationFeeModal from "../../components/tutors/VerificationFeeModal";
import { ITutor } from "../../types";
import { getMyProfile, updateVerificationFeeStatus } from "../../services/tutorService";
import { toast } from "sonner";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import { useTheme } from '@mui/material/styles';

const TutorDashboardPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileTab, setMobileTab] = useState<0 | 1>(0);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [showVerificationFeeModal, setShowVerificationFeeModal] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<ITutor | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const checkProfileAndMaybeShow = async () => {
      try {
        const shouldShowFlag =
          typeof window !== "undefined" &&
          window.localStorage.getItem("ys_tutor_show_complete_profile") === "true";
        if (!shouldShowFlag) {
          return;
        }

        const resp = await getMyProfile();
        const data: any = (resp as any)?.data ?? resp;
        const tutor: ITutor | null = (data as ITutor) || null;

        if (!tutor || cancelled) {
          return;
        }

        setTutorProfile(tutor);

        const subjectsEmpty = !tutor.subjects || tutor.subjects.length === 0;
        const qualificationsEmpty = !tutor.qualifications || tutor.qualifications.length === 0;
        const locationsEmpty = !tutor.preferredLocations || tutor.preferredLocations.length === 0;

        const isIncomplete = subjectsEmpty || qualificationsEmpty || locationsEmpty;

        if (isIncomplete && !cancelled) {
          setShowCompleteProfileModal(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch profile info");
      } finally {
        try {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("ys_tutor_show_complete_profile");
          }
        } catch {
          // ignore storage errors
        }
      }
    };

    checkProfileAndMaybeShow();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleVerificationFeeSubmit = async (data: { method: 'PAY_NOW' | 'DEDUCT_LATER'; file?: File }) => {
    if (!tutorProfile?.id) return;
    try {
      if (data.method === 'PAY_NOW') {
        await updateVerificationFeeStatus(tutorProfile.id, 'PAID', data.file, new Date());
        toast.success('Verification proof submitted successfully! Please wait for admin approval.');
      } else {
        await updateVerificationFeeStatus(tutorProfile.id, 'DEDUCT_FROM_FIRST_MONTH');
        toast.success('Verification method updated. Fee will be deducted from your first payout.');
      }
      const resp = await getMyProfile();
      setTutorProfile((prev) => resp.data ? resp.data : prev);
      setShowVerificationFeeModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit verification details.');
    }
  };

  const isProfileComplete = tutorProfile && tutorProfile.subjects?.length > 0;
  const showVerificationBanner = isProfileComplete && (!tutorProfile.verificationFeeStatus || tutorProfile.verificationFeeStatus === 'PENDING');

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Container maxWidth="xl" disableGutters sx={{ position: "relative", px: { xs: 2, sm: 0 }, pb: { xs: 10, sm: 0 } }}>
      {/* ─── Premium Header ──────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 3, sm: 4 },
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          p: { xs: 2.5, sm: 4 },
          mb: { xs: 2.5, sm: 4 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '60%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '40%',
            height: '160%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box position="relative" zIndex={1} display="flex" alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <WavingHandIcon sx={{ color: '#fbbf24', fontSize: { xs: 20, sm: 24 } }} />
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                {getGreeting()}
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {user?.name || "Tutor"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha('#fff', 0.6),
                mt: 0.75,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                maxWidth: 500,
              }}
            >
              Track your classes, demos, and performance — all in one place.
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              px: 2.5,
              py: 1,
              borderRadius: 2.5,
              bgcolor: alpha('#fff', 0.08),
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha('#fff', 0.1)}`,
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8), fontWeight: 600, letterSpacing: '0.02em' }}>
              Dashboard Live
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          filter: showCompleteProfileModal ? "blur(4px)" : "none",
          pointerEvents: showCompleteProfileModal ? "none" : "auto",
          userSelect: showCompleteProfileModal ? "none" : "auto",
        }}
      >
        {loading && (
          <Box display="flex" justifyContent="center" py={8}>
            <LoadingSpinner size={48} message="Loading dashboard..." />
          </Box>
        )}

        {error && <ErrorAlert error={error} />}

        {!loading && !error && (
          <>
            {showVerificationBanner && (
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#fff',
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '30%',
                    height: '100%',
                    background: 'radial-gradient(circle at 100% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
                      <VerifiedUserIcon /> Complete Your Verification
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                      Pay the one-time verification fee to activate your profile and start receiving class leads.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => setShowVerificationFeeModal(true)}
                    sx={{
                      fontWeight: 700,
                      width: { xs: '100%', sm: 'auto' },
                      bgcolor: '#fff',
                      color: '#4f46e5',
                      '&:hover': { bgcolor: alpha('#fff', 0.9) },
                      borderRadius: 2.5,
                      px: 3,
                      textTransform: 'none',
                    }}
                  >
                    Pay Verification Fee
                  </Button>
                </CardContent>
              </Card>
            )}
            <TutorAdvancedAnalyticsCards />

            {isMobile && (
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 30,
                  mb: 2.5,
                  bgcolor: 'background.default',
                  pt: 0.5,
                  pb: 1,
                }}
              >
                <Tabs
                  value={mobileTab}
                  onChange={(_, v) => setMobileTab(v)}
                  variant="fullWidth"
                  TabIndicatorProps={{
                    style: {
                      height: '100%',
                      borderRadius: 14,
                      backgroundColor: '#fff',
                      boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      width: '50%',
                      left: mobileTab === 0 ? '0%' : '50%',
                    },
                  }}
                  sx={{
                    borderRadius: 3.5,
                    minHeight: 48,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    px: 0.5,
                    '& .MuiTab-root': {
                      minHeight: 48,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      color: 'text.secondary',
                      transition: 'color 0.2s',
                    },
                    '& .MuiTabs-indicator': {},
                    '& .MuiTab-root.Mui-selected': {
                      color: 'primary.main',
                      zIndex: 1,
                    },
                  }}
                >
                  <Tab label="🎯 Opportunities" />
                  <Tab label="📚 My Classes" />
                </Tabs>
              </Box>
            )}
          </>
        )}

        {isMobile ? (
          <>
            {mobileTab === 0 ? (
              <Box mb={3}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <ClassLeadsFeedCard />
                  <DemoClassesCard />
                </Box>
              </Box>
            ) : (
              <Box mb={3}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TodayScheduleCard />
                  <UpcomingTestsCard />
                  <ActiveClassesOverviewCard />
                </Box>
              </Box>
            )}
          </>
        ) : (
          <>
            <Box mb={{ xs: 3, sm: 4 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                mb={{ xs: 2, sm: 2.5 }}
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.4rem" },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: 'text.primary',
                }}
              >
                <Box sx={{ width: 4, height: 24, borderRadius: 2, bgcolor: 'primary.main' }} />
                Class Opportunities & Demos
              </Typography>
              <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid2 size={{ xs: 12, md: 7 }}>
                  <Box display="flex" flexDirection="column" gap={{ xs: 2, sm: 2.5, md: 3 }}>
                    <DemoClassesCard />
                    <TodayScheduleCard />
                    <UpcomingTestsCard />
                  </Box>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 5 }} sx={{ maxWidth: { md: '40%' } }}>
                  <Box sx={{ mt: { xs: 0.5, sm: 0 } }}>
                    <ClassLeadsFeedCard />
                  </Box>
                </Grid2>
              </Grid2>
            </Box>

            <Box mt={{ xs: 3, sm: 4 }} mb={{ xs: 3, sm: 4 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                mb={{ xs: 2, sm: 2.5 }}
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.4rem" },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: 'text.primary',
                }}
              >
                <Box sx={{ width: 4, height: 24, borderRadius: 2, bgcolor: 'success.main' }} />
                Active Classes Overview
              </Typography>
              <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid2 size={{ xs: 12 }}>
                  <ActiveClassesOverviewCard />
                </Grid2>
              </Grid2>
            </Box>
          </>
        )}
      </Box>

      {showCompleteProfileModal && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            bgcolor: "rgba(0,0,0,0.6)",
            backdropFilter: 'blur(8px)',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            sx={{
              maxWidth: 420,
              width: "90%",
              borderRadius: 4,
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box textAlign="center" mb={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <VerifiedUserIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                </Box>
              </Box>
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                align="center"
              >
                Complete your profile to get classes
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 3 }}
              >
                Please fill your qualification, subjects, experience and areas so
                that our team can verify you and share class opportunities.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  setShowCompleteProfileModal(false);
                  navigate("/tutor-register?mode=edit");
                }}
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Go to Complete Profile
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Verification Fee Modal */}
      <VerificationFeeModal
        open={showVerificationFeeModal}
        onClose={() => setShowVerificationFeeModal(false)}
        onSubmit={handleVerificationFeeSubmit}
      />

    </Container>
  );
};

export default TutorDashboardPage;
