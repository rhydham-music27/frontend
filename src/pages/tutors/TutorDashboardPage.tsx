import React, { useState, useEffect, useMemo } from "react";

import {
  Container,
  Box,
  Typography,
  Grid2,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import TutorDashboardKpiRow from "../../components/tutors/TutorDashboardKpiRow";
import TutorProfileOverviewCard from "../../components/tutors/TutorProfileOverviewCard";
import TodayScheduleCard from "../../components/tutors/TodayScheduleCard";
import UpcomingTestsCard from "../../components/tutors/UpcomingTestsCard";
import ActiveClassesOverviewCard from "../../components/tutors/ActiveClassesOverviewCard";
import ClassLeadsFeedCard from "../../components/tutors/ClassLeadsFeedCard";
import DemoClassesCard from "../../components/tutors/DemoClassesCard";
import MyClassesCard from "../../components/tutors/MyClassesCard";
import PaymentsEarningsCard from "../../components/tutors/PaymentsEarningsCard";
import FeedbackPerformanceCard from "../../components/tutors/FeedbackPerformanceCard";
import FeedbackSummaryCard from "../../components/tutors/FeedbackSummaryCard";
import NotificationsCenterCard from "../../components/tutors/NotificationsCenterCard";
import AttendanceHistoryCard from "../../components/tutors/AttendanceHistoryCard";
import {
  getMyClasses,
  createOneTimeReschedule,
} from "../../services/finalClassService";
import { FINAL_CLASS_STATUS } from "../../constants";
import { IFinalClass, ITutor } from "../../types";
import { getMyProfile } from "../../services/tutorService";

const TutorDashboardPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [error] = useState<any>(null);
  const [rescheduleClasses, setRescheduleClasses] = useState<IFinalClass[]>([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleToDate, setRescheduleToDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("");

  const [savingReschedule, setSavingReschedule] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(
    null
  );

  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<ITutor | null>(null);

  const availableSessionDates = useMemo(() => {
    if (!selectedClassId) return [] as string[];
    const selectedClass = rescheduleClasses.find(
      (cls) => cls.id === selectedClassId
    );
    if (!selectedClass) return [] as string[];

    const daysOfWeek = (selectedClass as any)?.schedule?.daysOfWeek as
      | string[]
      | undefined;
    if (!daysOfWeek || daysOfWeek.length === 0) return [] as string[];

    const allowedDays = new Set(daysOfWeek);
    const result: string[] = [];
    const today = new Date();

    // Look ahead up to 60 days for matching schedule days
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayName = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ][d.getDay()];
      if (allowedDays.has(dayName)) {
        const iso = d.toISOString().split("T")[0];
        result.push(iso);
      }
    }

    return result;
  }, [selectedClassId, rescheduleClasses]);

  useEffect(() => {
    const loadClasses = async () => {
      if (!user) return;
      try {
        setRescheduleLoading(true);
        setRescheduleError(null);
        const tutorId = (user as any).id || (user as any)._id;
        const resp = await getMyClasses(
          tutorId,
          FINAL_CLASS_STATUS.ACTIVE,
          1,
          50
        );
        setRescheduleClasses(resp.data || []);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          "Failed to load classes for rescheduling.";
        setRescheduleError(msg);
      } finally {
        setRescheduleLoading(false);
      }
    };

    loadClasses();
  }, [user]);

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
      } catch {
        // If profile fetch fails, don't block the tutor dashboard.
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

  const handleSaveReschedule = async () => {
    if (!selectedClassId || !rescheduleDate || !rescheduleStartTime.trim()) {
      setRescheduleError(
        "Please select a class, original date, and start time."
      );
      return;
    }

    try {
      setSavingReschedule(true);
      setRescheduleError(null);
      setRescheduleSuccess(null);

      const targetDate = rescheduleToDate || rescheduleDate;
      // Build timeSlot string from start and end times
      let start = rescheduleStartTime;
      let end = rescheduleEndTime;

      // If end time is still empty for some reason, default to +60 minutes
      if (start && !end) {
        const [h, m] = start.split(":").map((v) => parseInt(v || "0", 10));
        const base = new Date(0, 0, 1, h || 0, m || 0, 0, 0);
        base.setMinutes(base.getMinutes() + 60);
        const hh = String(base.getHours()).padStart(2, "0");
        const mm = String(base.getMinutes()).padStart(2, "0");
        end = `${hh}:${mm}`;
      }

      const timeSlot = start && end ? `${start} - ${end}` : start;

      await createOneTimeReschedule(selectedClassId, {
        fromDate: rescheduleDate,
        toDate: targetDate,
        timeSlot: timeSlot.trim(),
      });
      setRescheduleStartTime("");
      setRescheduleEndTime("");
      setRescheduleToDate("");
      setRescheduleSuccess("Temporary reschedule saved successfully.");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to save reschedule.";
      setRescheduleError(msg);
    } finally {
      setSavingReschedule(false);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters sx={{ position: "relative" }}>
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        mb={{ xs: 3, sm: 4 }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={{ xs: 2, sm: 2 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 0.5,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            }}
          >
            Tutor Dashboard
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
          >
            Welcome back, {user?.name || "Tutor"}! Track your classes, demos,
            and performance.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
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
            <TutorDashboardKpiRow />
          </>
        )}
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
              <ClassLeadsFeedCard />
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
                  navigate("/tutor-profile");
                }}
              >
                Go to Complete Profile
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default TutorDashboardPage;
