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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
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

  // After OTP tutor login, show a blocking modal asking them to complete profile
  // ONLY if the tutor profile is actually incomplete.
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
        // If profile fetch fails, don't block the tutor dashboard.
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
      // Refresh profile
      const resp = await getMyProfile();
      setTutorProfile((prev) => resp.data ? resp.data : prev);
      setShowVerificationFeeModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit verification details.');
    }
  };

  const isProfileComplete = tutorProfile && tutorProfile.subjects?.length > 0;
  const showVerificationBanner = isProfileComplete && (!tutorProfile.verificationFeeStatus || tutorProfile.verificationFeeStatus === 'PENDING');


  return (
    <Container maxWidth="xl" disableGutters sx={{ position: "relative", px: { xs: 2, sm: 0 }, pb: { xs: 10, sm: 0 } }}>
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        mb={{ xs: 3, sm: 4 }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={{ xs: 2, sm: 2 }}
        sx={{
          py: { xs: 1, sm: 0 }
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mb: 0.5,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
              letterSpacing: '-0.02em',
              background: 'linear-gradient(45deg, #1e293b 30%, #334155 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Tutor Dashboard
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              lineHeight: 1.6,
              maxWidth: { xs: '100%', sm: '600px' }
            }}
          >
            Welcome back, <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>{user?.name || "Tutor"}</Box>! Track your classes, demos, and performance.
          </Typography>
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 1,
            p: 1.5,
            borderRadius: '12px',
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.100',
            color: "text.secondary",
          }}
        >
          <DashboardIcon fontSize="small" />
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
              <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
                      <VerifiedUserIcon /> Complete Your Verification
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Pay the one-time verification fee to activate your profile and start receiving class leads.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setShowVerificationFeeModal(true)}
                    sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
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
                  mb: 2,
                  bgcolor: 'background.default',
                  pt: 0.5,
                  pb: 1,
                }}
              >
                <Tabs
                  value={mobileTab}
                  onChange={(_, v) => setMobileTab(v)}
                  variant="fullWidth"
                  sx={{
                    borderRadius: 3,
                    minHeight: 44,
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.100',
                    px: 0.5,
                    '& .MuiTab-root': {
                      minHeight: 44,
                      fontWeight: 800,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                    },
                    '& .MuiTabs-indicator': {
                      height: '100%',
                      borderRadius: 12,
                      bgcolor: 'common.white',
                      boxShadow: '0 10px 30px rgba(15,23,42,0.10)',
                      border: '1px solid',
                      borderColor: 'grey.100',
                    },
                    '& .MuiTab-root.Mui-selected': {
                      color: 'text.primary',
                      zIndex: 1,
                    },
                  }}
                >
                  <Tab label="Opportunities" />
                  <Tab label="My Classes" />
                </Tabs>
              </Box>
            )}
          </>
        )}

        {isMobile ? (
          <>
            {mobileTab === 0 ? (
              <Box mb={3}>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  mb={1.5}
                  sx={{ fontSize: '1.1rem' }}
                >
                  Class Opportunities
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <ClassLeadsFeedCard />
                  <DemoClassesCard />
                </Box>
              </Box>
            ) : (
              <Box mb={3}>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  mb={1.5}
                  sx={{ fontSize: '1.1rem' }}
                >
                  My Classes
                </Typography>
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
                fontWeight={700}
                mb={{ xs: 2, sm: 2.5, md: 3 }}
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
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
                fontWeight={700}
                mb={{ xs: 2, sm: 2.5, md: 3 }}
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
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
            bgcolor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            sx={{
              maxWidth: 420,
              width: "90%",
              borderRadius: 3,
            }}
          >
            <CardContent>
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
