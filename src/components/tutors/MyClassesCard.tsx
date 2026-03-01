import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  alpha,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ClassIcon from '@mui/icons-material/Class';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import {
  getMyClasses,
  getAttendanceByClass,
  upsertAttendanceSheet,
  submitAttendanceSheet,
} from '../../services/tutorService';
import { getTestsByClass, getTestById } from '../../services/testService';
import { IFinalClass, ITest } from '../../types';
import { FINAL_CLASS_STATUS } from '../../constants';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import TutorClassesStatsBox from './TutorClassesStatsBox';
import SubmitAttendanceModal from './SubmitAttendanceModal';
import AttendanceSheet from './AttendanceSheet';
import TestReportCard from './TestReportCard';

// Dummy types for internal use if not in types.ts
interface AttendanceRecord {
  classId: string;
  date: string;
  status: string;
  duration: number;
  topicsCovered?: string;
  markedAt: string;
}

interface TutorProfile {
  attendanceRecords: AttendanceRecord[];
}

interface AssignedClass {
  classId: string;
  studentName: string;
  subject: string;
  tutorName?: string;
}

const MyClassesCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<IFinalClass | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [attendanceMonthByClassId, setAttendanceMonthByClassId] = useState<Record<string, string>>({});
  const [sheetSubmittingClassId, setSheetSubmittingClassId] = useState<string | null>(null);

  const [testsByClassId, setTestsByClassId] = useState<Record<string, ITest[]>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedTestIdByClassId, setSelectedTestIdByClassId] = useState<Record<string, string>>({});

  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportTest, setReportTest] = useState<ITest | null>(null);
  const [reportSwot, setReportSwot] = useState<{ strengths: Array<{ label: string; count: number }>; improvements: Array<{ label: string; count: number }> } | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetTutorData, setSheetTutorData] = useState<TutorProfile | null>(null);
  const [sheetClassInfo, setSheetClassInfo] = useState<AssignedClass | null>(null);
  const [sheetRange, setSheetRange] = useState<{ start: string; end: string } | undefined>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ensureTestsLoaded = async (classIdStr: string) => {
    if (!classIdStr) return;
    if (testsByClassId[classIdStr]) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dummy = classIdStr;
      const resp = await getTestsByClass(classIdStr);
      const list = (resp.data || []) as ITest[];
      setTestsByClassId((prev) => ({ ...prev, [classIdStr]: list }));
    } catch (e: any) {
      setTestsByClassId((prev) => ({ ...prev, [classIdStr]: [] }));
    } finally {
      // setLoading(false); // or just remove if not needed
    }
  };

  const buildSwotFromTests = (tests: ITest[]) => {
    const strengthsMap: Record<string, number> = {};
    const improvementsMap: Record<string, number> = {};
    tests
      .filter((t) => !!(t as any).report)
      .forEach((t) => {
        const sRaw = ((t as any).report?.strengths || '').toString();
        const iRaw = ((t as any).report?.areasOfImprovement || '').toString();
        const strengths = sRaw.split(/[\n,]/).map((x: string) => x.trim()).filter(Boolean);
        const improvements = iRaw.split(/[\n,]/).map((x: string) => x.trim()).filter(Boolean);
        strengths.forEach((x: string) => (strengthsMap[x] = (strengthsMap[x] || 0) + 1));
        improvements.forEach((x: string) => (improvementsMap[x] = (improvementsMap[x] || 0) + 1));
      });

    const strengths = Object.entries(strengthsMap)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    const improvements = Object.entries(improvementsMap)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    return { strengths, improvements };
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const tutorId = (user as any).id || (user as any)._id;
      if (!tutorId) {
        setClasses([]);
        setLoading(false);
        return;
      }
      const res = await getMyClasses(tutorId, FINAL_CLASS_STATUS.ACTIVE);
      setClasses(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  useEffect(() => {
    const next: Record<string, string> = {};
    classes.forEach((cls) => {
      const classIdStr = String((cls as any).id || (cls as any)._id || '');
      if (!classIdStr) return;
      next[classIdStr] = attendanceMonthByClassId[classIdStr] || new Date().toISOString().slice(0, 7);
    });
    if (Object.keys(next).length) {
      setAttendanceMonthByClassId((prev) => ({ ...next, ...prev }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes]);

  const openAttendanceSheetModal = async (cls: IFinalClass) => {
    setSelectedClass(cls);
    const classIdStr = String((cls as any).id || (cls as any)._id || '');
    const monthStr = attendanceMonthByClassId[classIdStr] || new Date().toISOString().slice(0, 7);
    const [yRaw, mRaw] = monthStr.split('-');
    const year = Number(yRaw);
    const month = Number(mRaw);
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
      setSheetError('Invalid month selected');
      setSheetOpen(true);
      return;
    }

    setSheetOpen(true);
    setSheetLoading(true);
    setSheetError(null);
    setSheetTutorData(null);
    setSheetClassInfo(null);
    setSheetRange(undefined);

    try {
      const res = await getAttendanceByClass(classIdStr);
      const attendances = (res.data || []) as any[];

      const mapped: AttendanceRecord[] = attendances
        .filter((a) => {
          const sm = Number((a as any)._sheetMonth);
          const sy = Number((a as any)._sheetYear);
          if (Number.isFinite(sm) && Number.isFinite(sy)) {
            return sm === month && sy === year;
          }
          // fallback if backend doesn't provide sheet month/year
          return a.sessionDate && String(a.sessionDate).slice(0, 7) === monthStr;
        })
        .map((a: any) => {
          const dateObj = a.sessionDate ? new Date(a.sessionDate as any) : null;
          const yyyyMmDd = dateObj
            ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
              dateObj.getDate()
            ).padStart(2, '0')}`
            : '';

          let durationHours =
            typeof a.durationHours === 'number'
              ? a.durationHours
              : (a.finalClass as any)?.classLead?.classDurationHours ?? 1;

          return {
            classId: classIdStr,
            date: yyyyMmDd,
            status: (a as any).studentAttendanceStatus || a.status || '',
            duration: durationHours,
            topicsCovered: a.topicCovered || undefined,
            markedAt: a.submittedAt ? String(a.submittedAt) : a.createdAt ? String(a.createdAt) : '',
          } as AttendanceRecord;
        })
        .filter((r) => r.date);

      const monthPadded = String(month).padStart(2, '0');
      const firstDay = `${year}-${monthPadded}-01`;
      const lastDate = new Date(year, month, 0).getDate();
      const lastDay = `${year}-${monthPadded}-${String(lastDate).padStart(2, '0')}`;

      setSheetTutorData({ attendanceRecords: mapped });
      setSheetClassInfo({
        classId: (cls as any).className || classIdStr,
        studentName: (cls as any).studentName || '',
        subject: Array.isArray((cls as any).subject) ? (cls as any).subject.join(', ') : String((cls as any).subject || ''),
        tutorName: user?.name,
      });
      setSheetRange({ start: firstDay, end: lastDay });

      if (!mapped.length) {
        setSheetError(`No attendance records found for ${monthStr}.`);
      }
    } catch (e: any) {
      setSheetError(e?.response?.data?.message || e?.message || 'Failed to load attendance sheet');
    } finally {
      setSheetLoading(false);
    }
  };

  const handleCallCoordinator = (cls: IFinalClass) => {
    const phone = cls?.coordinator?.phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
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
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const getStatusThemeColor = (status: string) => {
    switch (status) {
      case FINAL_CLASS_STATUS.ACTIVE: return '#10b981';
      case FINAL_CLASS_STATUS.COMPLETED: return '#3b82f6';
      case FINAL_CLASS_STATUS.PAUSED: return '#f59e0b';
      case FINAL_CLASS_STATUS.CANCELLED: return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const calculateProgress = (cls: IFinalClass) => {
    if ((cls as any).progressPercentage != null) return Math.round((cls as any).progressPercentage);
    const completed = Number(cls.completedSessions || 0);
    const monthlyTotal =
      Number((cls as any)?.classLead?.classesPerMonth ?? (cls as any)?.classesPerMonth ?? (cls as any)?.totalSessions ?? 0);
    const total = Number(monthlyTotal || 0);
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  const handleSubmitMonthlySheet = async (cls: IFinalClass) => {
    const classIdStr = String((cls as any).id || (cls as any)._id || '');
    try {
      setSheetSubmittingClassId(classIdStr);
      const now = new Date();
      const res = await upsertAttendanceSheet(classIdStr, now.getMonth() + 1, now.getFullYear());
      if (res.data?.id) {
        await submitAttendanceSheet(res.data.id);
        setActionSuccess('Monthly attendance sheet submitted.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSheetSubmittingClassId(null);
    }
  };

  const cardSx = {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'grey.100',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s',
    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  };

  if (loading) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" justifyContent="center" py={4}>
            <LoadingSpinner message="Loading your classes..." />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && classes.length === 0) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <ErrorAlert error={error} />
            <Button variant="outlined" onClick={fetchClasses} sx={{ borderRadius: 2, textTransform: 'none' }}>Retry</Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!loading && classes.length === 0) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <EmptyState
            icon={<ClassIcon color="primary" />}
            title="No Active Classes"
            description="You don't have any active classes assigned yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Card Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 2,
                bgcolor: alpha('#6366f1', 0.08),
                display: 'flex',
              }}
            >
              <ClassIcon sx={{ fontSize: 20, color: '#6366f1' }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              My Classes
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${classes.length} active`}
            sx={{
              bgcolor: alpha('#6366f1', 0.08),
              color: '#4f46e5',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 26,
            }}
          />
        </Box>

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}

        {/* Stats */}
        <TutorClassesStatsBox classes={classes} newClassLeads={0} />

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Left: Class Cards */}
          <Grid item xs={12} md={7}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              gutterBottom
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.primary',
                fontSize: '0.88rem',
                mb: 2,
              }}
            >
              <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: '#6366f1' }} />
              Assigned Classes
            </Typography>
            <Box
              sx={{
                maxHeight: 600,
                overflow: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
              }}
            >
              {classes.map((cls) => {
                const progress = calculateProgress(cls);
                const isSelected = selectedClass?.id === cls.id;
                const classIdStr = String((cls as any).id || (cls as any)._id || '');
                const statusColor = getStatusThemeColor(cls.status);
                const progressColor = progress >= 75 ? '#10b981' : progress >= 40 ? '#6366f1' : '#f59e0b';
                const selectedMonth = attendanceMonthByClassId[classIdStr] || new Date().toISOString().slice(0, 7);
                const monthlyTotalSessions =
                  Number((cls as any)?.classLead?.classesPerMonth ?? (cls as any)?.classesPerMonth ?? (cls as any)?.totalSessions ?? 0);
                const completedForMonth = Math.min(Number((cls as any).completedSessions || 0), Number(monthlyTotalSessions || 0) || Number((cls as any).completedSessions || 0));

                return (
                  <Box
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    sx={{
                      border: '1px solid',
                      borderColor: isSelected ? alpha('#6366f1', 0.35) : alpha('#6366f1', 0.08),
                      borderRadius: 2.5,
                      p: 2.5,
                      mb: 2,
                      cursor: 'pointer',
                      bgcolor: isSelected ? alpha('#6366f1', 0.03) : '#fff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: alpha('#6366f1', 0.25),
                        bgcolor: alpha('#6366f1', 0.02),
                      },
                    }}
                  >
                    {/* Student Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <Box
                          sx={{
                            width: 38, height: 38, borderRadius: 2,
                            bgcolor: isSelected ? '#6366f1' : alpha('#6366f1', 0.08),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isSelected ? 'white' : '#6366f1',
                            transition: 'all 0.2s',
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.92rem' }}>{cls.studentName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Grade {cls.grade} â€¢ {cls.board}</Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={cls.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(statusColor, 0.08),
                          color: statusColor,
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 22,
                        }}
                      />
                    </Box>

                    {/* Subject & Mode Chips */}
                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                      {(Array.isArray(cls.subject) ? cls.subject : [cls.subject]).map((sub) => (
                        <Chip
                          key={String(sub)}
                          size="small"
                          label={String(sub)}
                          sx={{
                            bgcolor: alpha('#6366f1', 0.06),
                            color: '#4f46e5',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 22,
                          }}
                        />
                      ))}
                      <Chip
                        size="small"
                        label={cls.mode}
                        sx={{
                          bgcolor: cls.mode === 'ONLINE' ? alpha('#3b82f6', 0.08) : cls.mode === 'OFFLINE' ? alpha('#10b981', 0.08) : alpha('#8b5cf6', 0.08),
                          color: cls.mode === 'ONLINE' ? '#2563eb' : cls.mode === 'OFFLINE' ? '#059669' : '#7c3aed',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 22,
                        }}
                      />
                    </Box>

                    {/* Meta Info */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 2,
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: alpha('#f8fafc', 0.8),
                        border: '1px solid',
                        borderColor: 'grey.50',
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                        <AccessTimeIcon sx={{ fontSize: 13 }} />
                        <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem' }}>{(cls.schedule as any)?.timeSlot || 'No schedule'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                        <PersonIcon sx={{ fontSize: 13 }} />
                        <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem' }}>{cls.coordinator?.name}</Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>Progress {completedForMonth}/{monthlyTotalSessions}</Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: progressColor, fontSize: '0.72rem' }}>{progress}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: alpha(progressColor, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: progressColor,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    {/* Action Row */}
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Tooltip title="Notes">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); navigate('/tutor-notes'); }}
                          sx={{ bgcolor: alpha('#3b82f6', 0.08), '&:hover': { bgcolor: alpha('#3b82f6', 0.15) }, width: 32, height: 32 }}
                        >
                          <NoteAddIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                        </IconButton>
                      </Tooltip>

                      <TextField
                        type="month"
                        size="small"
                        value={selectedMonth}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          setAttendanceMonthByClassId((prev) => ({ ...prev, [classIdStr]: e.target.value }));
                        }}
                        sx={{ width: 140, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.5 } }}
                      />

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); void openAttendanceSheetModal(cls); }}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', height: 32 }}
                      >
                        Attendance
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => { e.stopPropagation(); handleSubmitMonthlySheet(cls); }}
                        disabled={sheetSubmittingClassId === classIdStr}
                        startIcon={<SendIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          boxShadow: 'none',
                          height: 32,
                          borderRadius: 2,
                          bgcolor: '#6366f1',
                          fontSize: '0.7rem',
                          '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' },
                        }}
                      >
                        {sheetSubmittingClassId === classIdStr ? '...' : 'Submit'}
                      </Button>

                      <Tooltip title={`Call ${cls.coordinator?.name || 'Coordinator'}`}>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleCallCoordinator(cls); }}
                          sx={{ bgcolor: alpha('#10b981', 0.08), '&:hover': { bgcolor: alpha('#10b981', 0.15) }, width: 32, height: 32 }}
                        >
                          <LocalPhoneIcon sx={{ fontSize: 16, color: '#10b981' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Right: Attendance Tracker */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: alpha('#6366f1', 0.1),
                borderRadius: 3,
                p: 2.5,
                height: '100%',
                bgcolor: '#fff',
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                mb={2}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '0.88rem',
                }}
              >
                <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: '#10b981' }} />
                Attendance Tracker
              </Typography>
              {selectedClass ? (
                <>
                  <Box
                    sx={{
                      borderRadius: 2.5,
                      p: 2.5,
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: '#fff',
                      mb: 2.5,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        right: '-30%',
                        width: '60%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} sx={{ position: 'relative', zIndex: 1 }}>{selectedClass.studentName}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, position: 'relative', zIndex: 1, fontSize: '0.82rem' }}>Grade {selectedClass.grade} â€¢ {selectedClass.board}</Typography>
                  </Box>
                  <Box mb={2.5}>
                    {[
                      {
                        label: 'Total Sessions',
                        value: Number((selectedClass as any)?.classLead?.classesPerMonth ?? (selectedClass as any)?.classesPerMonth ?? (selectedClass as any)?.totalSessions ?? 0),
                        color: 'text.primary'
                      },
                      { label: 'Completed', value: selectedClass.completedSessions, color: '#10b981' },
                      {
                        label: 'Remaining',
                        value:
                          Number((selectedClass as any)?.classLead?.classesPerMonth ?? (selectedClass as any)?.classesPerMonth ?? (selectedClass as any)?.totalSessions ?? 0) -
                          Number(selectedClass.completedSessions || 0),
                        color: '#f59e0b'
                      },
                    ].map((item, i) => (
                      <Box key={i} display="flex" justifyContent="space-between" alignItems="center" py={1} sx={i < 2 ? { borderBottom: '1px solid', borderColor: alpha('#6366f1', 0.06) } : {}}>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{item.label}</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: item.color, fontSize: '0.88rem' }}>{item.value}</Typography>
                      </Box>
                    ))}
                    <Box mt={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Progress</Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: '#6366f1', fontSize: '0.7rem' }}>{calculateProgress(selectedClass)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={calculateProgress(selectedClass)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha('#6366f1', 0.08),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#6366f1',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </>
              ) : (
                <Box textAlign="center" py={6}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: alpha('#6366f1', 0.06),
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 24, color: '#6366f1' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Select a class to view details
                  </Typography>
                  <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                    Click any class card on the left
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
            finalClass={selectedClass}
            onSuccess={handleActionSuccess}
          />
        )}

        <Dialog
          open={sheetOpen}
          onClose={sheetLoading ? undefined : () => { setSheetOpen(false); setSheetError(null); setSheetTutorData(null); setSheetClassInfo(null); }}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Attendance Sheet</DialogTitle>
          <DialogContent>
            {sheetError && <Alert severity={sheetTutorData ? 'info' : 'error'} sx={{ mb: 2 }}>{sheetError}</Alert>}
            {sheetLoading && (
              <Box py={6} display="flex" justifyContent="center">
                <LoadingSpinner message="Loading attendance sheet..." />
              </Box>
            )}
            {!sheetLoading && sheetTutorData && sheetClassInfo && (
              <Box display="flex" justifyContent="center" sx={{ overflowX: 'auto' }}>
                <AttendanceSheet
                  tutorData={sheetTutorData}
                  classInfo={sheetClassInfo}
                  range={sheetRange}
                  sheetNo={1}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSheetOpen(false);
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Test Report</DialogTitle>
          <DialogContent>
            {reportError && <Alert severity="error" sx={{ mb: 2 }}>{reportError}</Alert>}
            {reportLoading && (
              <Box py={4} display="flex" justifyContent="center">
                <LoadingSpinner message="Loading report..." />
              </Box>
            )}
            {!reportLoading && reportTest && (
              <Box>
                <TestReportCard test={reportTest} showActions={false} />
                {reportSwot && (
                  <Box mt={2} display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} gutterBottom>Strengths</Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {reportSwot.strengths.length === 0
                          ? <Typography variant="body2" color="text.secondary">No data.</Typography>
                          : reportSwot.strengths.map((s) => (
                            <Chip key={s.label} label={s.label} color="success" variant="outlined" size="small" />
                          ))}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} gutterBottom>Improvements</Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {reportSwot.improvements.length === 0
                          ? <Typography variant="body2" color="text.secondary">No data.</Typography>
                          : reportSwot.improvements.map((s) => (
                            <Chip key={s.label} label={s.label} color="warning" variant="outlined" size="small" />
                          ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReportOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MyClassesCard;
