import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CardContent,
  Grid,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import ClassIcon from '@mui/icons-material/Class';
import { StyledCard } from '../common/StyledCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import SubmitAttendanceModal from './SubmitAttendanceModal';
import { getMyClasses } from '../../services/finalClassService';
import { getAttendanceByClass } from '../../services/attendanceService';
import AttendanceSheet, {
  AttendanceRecord,
  AssignedClass,
  TutorProfile,
} from './AttendanceSheet';
import { IFinalClass } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

const MyClassesCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<IFinalClass | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedRangeByClass, setSelectedRangeByClass] = useState<
    Record<string, { label: string; start: string; end: string }>
  >({});

  // State for client-side AttendanceSheet PDF generation
  const sheetRef = useRef<{ exportPdf: () => Promise<void> } | null>(null);
  const [sheetTutorData, setSheetTutorData] = useState<TutorProfile | null>(null);
  const [sheetClassInfo, setSheetClassInfo] = useState<AssignedClass | null>(null);
  const [sheetRange, setSheetRange] = useState<{ start: string; end: string } | undefined>();
  const [downloadingClassId, setDownloadingClassId] = useState<string | null>(null);

  const handleViewAttendanceSheet = async (cls: IFinalClass) => {
    const classIdStr = String((cls as any).id || (cls as any)._id || '');
    try {
      setDownloadingClassId(classIdStr);
      const res = await getAttendanceByClass(classIdStr);
      const attendances = res.data || [];
      if (!attendances.length) {
        setDownloadingClassId(null);
        return;
      }

      const mapped: AttendanceRecord[] = attendances
        .map((a: any) => {
          const dateObj = a.sessionDate ? new Date(a.sessionDate as any) : null;
          const yyyyMmDd = dateObj
            ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
                dateObj.getDate()
              ).padStart(2, '0')}`
            : '';

          // Prefer explicit duration on attendance, otherwise fall back to classLead duration
          let durationHours =
            typeof a.durationHours === 'number'
              ? a.durationHours
              : (a.finalClass as any)?.classLead?.classDurationHours ?? undefined;

          // For old seeded data without explicit duration, assume 1 hour per session
          if (typeof durationHours !== 'number') {
            durationHours = 1;
          }

          return {
            classId: classIdStr,
            date: yyyyMmDd,
            status: (a as any).studentAttendanceStatus || a.status || '',
            duration: typeof durationHours === 'number' ? durationHours : undefined,
            topicsCovered: a.topicCovered || undefined,
            markedAt: a.submittedAt
              ? String(a.submittedAt)
              : a.createdAt
              ? String(a.createdAt)
              : '',
          } as AttendanceRecord;
        })
        .filter((r) => r.date);

      if (!mapped.length) {
        setDownloadingClassId(null);
        return;
      }

      const dates = mapped.map((r) => r.date).sort();
      const start = dates[0];
      const end = dates[dates.length - 1];

      setSheetTutorData({ attendanceRecords: mapped } as TutorProfile);
      setSheetClassInfo({
        // Prefer FinalClass.className (e.g. CL-xxxx) for the visible Class ID on the sheet
        classId: (cls as any).className || classIdStr,
        studentName: cls.studentName,
        subject: Array.isArray(cls.subject) ? cls.subject.join(', ') : (cls.subject as any),
        tutorName: user?.name || 'Tutor',
      } as AssignedClass);
      setSheetRange({ start, end });

      setTimeout(async () => {
        try {
          await sheetRef.current?.exportPdf();
        } finally {
          setDownloadingClassId(null);
        }
      }, 0);
    } catch (e) {
      setDownloadingClassId(null);
      // eslint-disable-next-line no-console
      console.error('Failed to generate attendance sheet', e);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user?.id && !(user as any)?._id) {
        setClasses([]);
        setLoading(false);
        return;
      }
      const tutorId = (user as any).id || (user as any)._id;
      const res = await getMyClasses(tutorId, FINAL_CLASS_STATUS.ACTIVE);
      setClasses(res.data);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to load classes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    return () => {};
  }, []);

  const handleAttendanceClick = (cls: IFinalClass) => {
    setSelectedClass(cls);
    setAttendanceModalOpen(true);
  };

  const handleContactCoordinator = (cls: IFinalClass) => {
    const email = cls?.coordinator?.email;
    const subject = `Regarding Class: ${cls?.studentName}`;
    if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    }
  };

  const handleModalClose = () => {
    setAttendanceModalOpen(false);
    setSelectedClass(null);
  };

  const handleActionSuccess = () => {
    setActionSuccess('Action completed successfully.');
    fetchClasses();
    setAttendanceModalOpen(false);
    const timer = setTimeout(() => setActionSuccess(null), 5000);
    return () => clearTimeout(timer);
  };

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case FINAL_CLASS_STATUS.ACTIVE:
        return 'success' as const;
      case FINAL_CLASS_STATUS.COMPLETED:
        return 'info' as const;
      case FINAL_CLASS_STATUS.PAUSED:
        return 'warning' as const;
      case FINAL_CLASS_STATUS.CANCELLED:
        return 'error' as const;
      default:
        return 'default' as const;
    }
  };

  const calculateProgress = (cls: IFinalClass) => {
    if ((cls as any).progressPercentage != null) return Math.round((cls as any).progressPercentage);
    const completed = Number(cls.completedSessions || 0);
    const total = Number(cls.totalSessions || 0);
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  const getMonthlyRanges = (cls: IFinalClass): Array<{ label: string; start: string; end: string }> => {
    // Simple rolling ranges inspired by YS trial; for now, static labels driven by class start date
    const base = cls.startDate ? new Date(cls.startDate) : new Date();
    const ranges: Array<{ label: string; start: string; end: string }> = [];
    for (let i = 0; i < 4; i++) {
      const start = new Date(base);
      start.setMonth(start.getMonth() + i);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const label = `${i + 1} month (${start.toLocaleDateString()} – ${end.toLocaleDateString()})`;
      ranges.push({
        label,
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      });
    }
    return ranges;
  };

  if (loading) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" justifyContent="center" py={4}>
            <LoadingSpinner message="Loading your classes..." />
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (error && classes.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <ErrorAlert error={error} />
            <Box>
              <Button variant="outlined" onClick={fetchClasses}>Retry</Button>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (!loading && classes.length === 0) {
    return (
      <StyledCard>
        <CardContent>
          <EmptyState
            icon={<ClassIcon color="primary" />}
            title="No Active Classes"
            description="You don't have any active classes assigned yet. Check the Class Opportunities section for new leads!"
          />
        </CardContent>
      </StyledCard>
    );
  }

  const totalClasses = classes.length;
  const totalCompletedSessions = classes.reduce((sum, cls) => sum + (cls.completedSessions || 0), 0);
  const totalPlannedSessions = classes.reduce((sum, cls) => sum + (cls.totalSessions || 0), 0);
  const totalRemainingSessions = Math.max(totalPlannedSessions - totalCompletedSessions, 0);
  const overallProgress = totalPlannedSessions
    ? Math.round((totalCompletedSessions / totalPlannedSessions) * 100)
    : 0;

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <ClassIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>My Classes</Typography>
          </Box>
          <Chip size="small" color="primary" variant="outlined" label={`${classes.length} active`} />
        </Box>

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}

        {/* KPI row inspired by YS trial Classes tab */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                borderRadius: 3,
                p: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <ClassIcon fontSize="small" />
                <Typography variant="h5" fontWeight={700}>{totalClasses}</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Classes</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                borderRadius: 3,
                p: 2,
                bgcolor: 'success.main',
                color: 'success.contrastText',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <CheckCircleIcon fontSize="small" />
                <Typography variant="h5" fontWeight={700}>{totalCompletedSessions}</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Completed Sessions</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                borderRadius: 3,
                p: 2,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <ClassIcon fontSize="small" />
                <Typography variant="h5" fontWeight={700}>{totalRemainingSessions}</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Remaining Sessions</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                borderRadius: 3,
                p: 2,
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <TrendingUpIcon fontSize="small" />
                <Typography variant="h5" fontWeight={700}>{overallProgress}%</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Overall Progress</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Two-column layout: Assigned Classes (left) + Attendance Tracker (right) */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Assigned Classes
            </Typography>
            <Box sx={{ maxHeight: 500, overflow: 'auto', pr: 1 }}>
              {classes.map((cls) => {
                const progress = calculateProgress(cls);
                const isOffline = cls.mode === 'OFFLINE' || cls.mode === 'HYBRID';
                const isSelected = selectedClass?.id === cls.id;
                const classIdStr = String((cls as any).id || (cls as any)._id || '');
                return (
                  <Box
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 3,
                      p: 2.5,
                      mb: 2,
                      position: 'relative',
                      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                      boxShadow: isSelected ? 3 : 0,
                      bgcolor: isSelected ? '#EEF2FF' : 'background.paper',
                      '&:hover': {
                        bgcolor: isSelected ? '#E0E7FF' : 'grey.50',
                      },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SchoolIcon fontSize="small" />
                        <Typography variant="h6" fontWeight={600}>{cls.studentName}</Typography>
                      </Box>
                      <Chip label={cls.status} color={getStatusColor(cls.status) as any} size="small" />
                    </Box>

                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">Grade {cls.grade} • {cls.board}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {(Array.isArray(cls.subject) ? cls.subject : [cls.subject]).filter(Boolean).map((sub) => (
                            <Chip key={String(sub)} size="small" variant="outlined" color="primary" label={String(sub)} />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Chip
                          size="small"
                          label={cls.mode}
                          color={cls.mode === 'ONLINE' ? 'info' : cls.mode === 'OFFLINE' ? 'success' : 'secondary'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {cls.schedule && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body2">
                              {(cls.schedule as any).daysOfWeek?.join(', ')} • {(cls.schedule as any).timeSlot}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon fontSize="small" />
                          <Typography variant="body2">Started: {cls.startDate ? formatDate(cls.startDate) : '-'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon fontSize="small" />
                          <Typography variant="body2">Coordinator: {cls.coordinator?.name}</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <TrendingUpIcon fontSize="small" />
                          <Typography variant="body2">
                            Session Progress: {cls.completedSessions}/{cls.totalSessions} ({progress}%)
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={progress >= 50 ? 'primary' : 'secondary'}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>

                    {/* Month selector + View Attendance Sheet, inspired by YS trial */}
                    <Box display="flex" flexWrap="wrap" alignItems="center" gap={1.5} mb={1}>
                      <Typography variant="caption" color="text.secondary">
                        Month:
                      </Typography>
                      <Box sx={{ position: 'relative', minWidth: 180 }}>
                        <Box
                          component="select"
                          defaultValue={String(Math.max(getMonthlyRanges(cls).length - 1, 0))}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const ranges = getMonthlyRanges(cls);
                            const idx = parseInt(e.target.value, 10);
                            const sel = ranges[idx] || ranges[ranges.length - 1];
                            if (sel) {
                              setSelectedRangeByClass((prev) => ({
                                ...prev,
                                [cls.id]: sel,
                              }));
                            }
                          }}
                          sx={{
                            width: '100%',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            px: 1.5,
                            py: 0.75,
                            pr: 4,
                            fontSize: 12,
                            backgroundColor: 'background.paper',
                            appearance: 'none',
                          }}
                        >
                          {getMonthlyRanges(cls).map((r, idx) => (
                            <option key={r.label} value={idx}>
                              {r.label}
                            </option>
                          ))}
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAttendanceSheet(cls);
                        }}
                        disabled={downloadingClassId === classIdStr}
                      >
                        {downloadingClassId === classIdStr ? 'Preparing...' : 'View Attendance Sheet'}
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" gap={1.5} flexWrap="wrap">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={(e) => { e.stopPropagation(); handleAttendanceClick(cls); }}
                      >
                        Submit Attendance
                      </Button>
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        startIcon={<EmailIcon />}
                        onClick={(e) => { e.stopPropagation(); handleContactCoordinator(cls); }}
                      >
                        Contact Coordinator
                      </Button>
                    </Box>

                    {cls.location && isOffline && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Location: {cls.location}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Attendance Tracker panel on the right */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 3,
              p: 2.5,
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Attendance Tracker
            </Typography>

            {selectedClass ? (
              <>
                <Box
                  sx={{
                    borderRadius: 2,
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {Array.isArray(selectedClass.subject)
                      ? selectedClass.subject.join(', ')
                      : selectedClass.subject}
                  </Typography>
                  <Typography variant="body2">{selectedClass.studentName}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Grade {selectedClass.grade} • {selectedClass.board}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Total Sessions</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedClass.totalSessions}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {selectedClass.completedSessions}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Remaining</Typography>
                    <Typography variant="body2" fontWeight={600} color="warning.main">
                      {Math.max(
                        (selectedClass.totalSessions || 0) - (selectedClass.completedSessions || 0),
                        0
                      )}
                    </Typography>
                  </Box>
                  <Box mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(selectedClass)}
                      color="primary"
                      sx={{ height: 8, borderRadius: 1, mt: 0.5 }}
                    />
                  </Box>
                </Box>

                {/* Recent Attendance list inspired by YS trial (synthetic based on completedSessions) */}
                <Box mt={2} mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    Recent Attendance
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {Array.from({
                      length: Math.min(Number(selectedClass.completedSessions || 0), 10),
                    }).map((_, index) => {
                      const sessionNumber = Number(selectedClass.completedSessions || 0) - index;
                      const d = new Date();
                      d.setDate(d.getDate() - index * 2);
                      return (
                        <Box
                          key={sessionNumber}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            mb: 1,
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                            <Box>
                              <Typography variant="caption" fontWeight={600}>
                                Session {sessionNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {d.toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" fontWeight={600} color="success.main">
                            Present
                          </Typography>
                        </Box>
                      );
                    })}
                    {Number(selectedClass.completedSessions || 0) === 0 && (
                      <Typography variant="caption" color="text.secondary">
                        No completed sessions yet.
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                  sx={{ mb: 2 }}
                  onClick={() => handleAttendanceClick(selectedClass!)}
                >
                  Mark Today's Attendance
                </Button>

                <Typography variant="caption" color="text.secondary">
                  Use the button above to submit attendance for the latest session of this class.
                </Typography>
              </>
            ) : (
              <Box textAlign="center" py={6}>
                <ClassIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Select a class on the left to view its attendance summary.
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        </Grid>

        {selectedClass && attendanceModalOpen && (
          <SubmitAttendanceModal
            open={attendanceModalOpen}
            onClose={handleModalClose}
            finalClass={selectedClass!}
            onSuccess={handleActionSuccess}
          />
        )}

        {/* Hidden AttendanceSheet for client-side PDF generation */}
        {sheetTutorData && sheetClassInfo && (
          <Box sx={{ position: 'absolute', left: -9999, top: -9999 }}>
            <AttendanceSheet
              ref={sheetRef}
              tutorData={sheetTutorData}
              classInfo={sheetClassInfo}
              range={sheetRange}
              sheetNo={1}
            />
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(MyClassesCard);
