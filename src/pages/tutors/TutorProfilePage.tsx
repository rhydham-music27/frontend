import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Autocomplete, Chip, alpha, useTheme, Grid, Paper, Tabs, Tab, IconButton, Divider, Checkbox, Stack, Avatar } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventIcon from '@mui/icons-material/EventAvailable';
import ListIcon from '@mui/icons-material/ListAlt';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import SchoolIcon from '@mui/icons-material/School';
import { BarChart2 } from 'lucide-react';
import ChangePasswordOtpModal from '../../components/common/ChangePasswordOtpModal';
import TutorTierProgressCard from '../../components/tutors/TutorTierProgressCard';
import MUIProfileCard from '../../components/tutors/MUIProfileCard';
import { getFinalClasses } from '../../services/finalClassService';
import { getPayments } from '../../services/paymentService';
import { getAttendances } from '../../services/attendanceService';
import { getMyProfile, updateTutorProfile, getTutorById, getTutorStats } from '../../services/tutorService';
import type { ITutor, IFinalClass, IAttendance, IPayment } from '../../types';
import { useOptions } from '@/hooks/useOptions';


const areasByCity: Record<string, string[]> = {
  Bhopal: [
    'Arera Colony',
    'MP Nagar',
    'Kolar Road',
    'Hoshangabad Road',
    'Berasia Road',
    'Ayodhya Bypass',
    'Bairagarh',
    'Katara Hills',
    'Shahpura',
    'Jahangirabad',
    'Govindpura',
    'Ashoka Garden',
    'Bawadiya Kalan',
    'Raisen Road',
  ],
};


import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const TutorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tutorProfile, setTutorProfile] = useState<ITutor | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedExtracurriculars, setSelectedExtracurriculars] = useState<string[]>([]);
  const [qualificationsInput, setQualificationsInput] = useState('');
  const [preferredAreas, setPreferredAreas] = useState<string[]>([]);
  const [experienceInput, setExperienceInput] = useState('');
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  useEffect(() => {
    if (tutorProfile) {
      const rawCity =
        ((tutorProfile as any).city as string) ||
        ((tutorProfile as any).user?.city as string) ||
        'Bhopal';
      const city = (rawCity || 'Bhopal').trim() || 'Bhopal';
      const areas = areasByCity[city] || areasByCity.Bhopal || [];
      setAvailableAreas(areas);
    }
  }, [tutorProfile]);

  const { options: subjectOptions } = useOptions('SUBJECT');
  const subjectLabels = useMemo(() => subjectOptions.map((o) => o.label), [subjectOptions]);

  const { options: extracurricularOptions } = useOptions('EXTRACURRICULAR_ACTIVITY');

  // Admin view state
  const theme = useTheme();
  const [adminClasses, setAdminClasses] = useState<IFinalClass[]>([]);
  const [adminPayments, setAdminPayments] = useState<IPayment[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<{ present: number; absent: number; late: number }>({ present: 0, absent: 0, late: 0 });

  // Class Details Modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<IFinalClass | null>(null);
  const [classAttendance, setClassAttendance] = useState<IAttendance[]>([]);
  const [classPayments, setClassPayments] = useState<IPayment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(0);


  useEffect(() => {
    const loadProfile = async () => {
      try {
        const resp = id ? await getTutorById(id) : await getMyProfile();
        const data: any = (resp as any)?.data ?? resp;
        const tutor = (data as ITutor) || null;
        setTutorProfile(tutor);

        // Fetch detailed data for Admin view
        if (id && tutor && tutor.user) {
          const userId = tutor.user.id || (tutor.user as any)._id;
          try {
            const [classesRes, paymentsRes, attendanceRes, statsRes] = await Promise.all([
              getFinalClasses(1, 100, { tutorId: userId }),
              getPayments({ page: 1, limit: 50, tutorId: userId }),
              getAttendances({ page: 1, limit: 200, tutorId: userId }),
              getTutorStats(id)
            ]);

            setAdminClasses(Array.isArray((classesRes as any).data) ? (classesRes as any).data : []);
            setAdminPayments(Array.isArray((paymentsRes as any).data) ? (paymentsRes as any).data : []);

            // Merge internal stats into tutor profile object for easier rendering
            const internalStats = (statsRes as any).data || {};
            setTutorProfile((prev: any) => ({ ...prev, internalStats }));

            const attData = (attendanceRes as any).data;
            const atts: any[] = Array.isArray(attData) ? attData : [];
            const stats = atts.reduce((acc, curr) => {
              const status = curr.studentAttendanceStatus || 'PRESENT';
              if (status === 'PRESENT') acc.present++;
              else if (status === 'ABSENT') acc.absent++;
              else if (status === 'LATE' || status === 'DELAYED') acc.late++;
              return acc;
            }, { present: 0, absent: 0, late: 0 });
            setAttendanceStats(stats);

          } catch (detailsErr) {
            console.error('Failed to load detailed tutor data', detailsErr);
          }
        }

      } catch {
        // ignore errors here; ProfileVerificationCard already handles its own loading/error state
      }
    };

    loadProfile();
  }, [id]);



  const handleSaveCompleteProfile = async () => {
    if (!tutorProfile) {
      setCompleteModalOpen(false);
      return;
    }

    const subjects = selectedSubjects;
    const qualifications = qualificationsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const rawCity =
      ((tutorProfile as any).city as string) ||
      ((tutorProfile as any).user?.city as string) ||
      'Bhopal';
    const city = (rawCity || 'Bhopal').trim() || 'Bhopal';
    const preferredLocations = preferredAreas.filter((area) => area && area !== city);
    const experience = experienceInput.trim() || undefined;
    const extracurricularActivities = selectedExtracurriculars;

    try {
      setSaving(true);
      await updateTutorProfile(tutorProfile.id, {
        subjects,
        qualifications,
        preferredLocations,
        experience,
        extracurricularActivities,
      } as any);

      // Refresh local copy so future opens reflect latest data
      const resp = await getMyProfile();
      const data: any = (resp as any)?.data ?? resp;
      setTutorProfile((data as ITutor) || null);

      setCompleteModalOpen(false);
    } catch {
      // In case of error, keep modal open so user can retry or adjust
    } finally {
      setSaving(false);
    }
  };

  const fetchClassDetails = async (classObj: IFinalClass) => {
    if (!tutorProfile || !tutorProfile.user) return;
    const userId = tutorProfile.user.id || (tutorProfile.user as any)._id;

    setLoadingDetails(true);
    try {
      const [attendanceRes, paymentsRes] = await Promise.all([
        getAttendances({ finalClassId: classObj.id || (classObj as any)._id, tutorId: userId, limit: 100 }),
        getPayments({ finalClassId: classObj.id || (classObj as any)._id, tutorId: userId, limit: 100 })
      ]);

      setClassAttendance((attendanceRes as any).data || []);
      setClassPayments((paymentsRes as any).data || []);
    } catch (err) {
      console.error('Failed to fetch class details', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewClassDetails = (classObj: IFinalClass) => {
    setSelectedClass(classObj);
    setDetailsModalOpen(true);
    setActiveTab(0);
    fetchClassDetails(classObj);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const classColumns: GridColDef<IFinalClass>[] = [
    { field: 'className', headerName: 'Class ID', flex: 1, minWidth: 150 },
    { field: 'studentName', headerName: 'Student', flex: 1, minWidth: 150 },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1,
      minWidth: 150,
      valueGetter: (_value: any, row: any) => Array.isArray(row.subject) ? row.subject.join(', ') : row.subject
    },
    { field: 'grade', headerName: 'Grade', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            height: 22,
            bgcolor: params.value === 'ACTIVE' ? alpha('#10b981', 0.1) : alpha('#64748b', 0.08),
            color: params.value === 'ACTIVE' ? '#059669' : '#475569',
          }}
        />
      )
    },
    {
      field: 'sessions',
      headerName: 'Progress',
      width: 150,
      renderCell: (params: any) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>
          {params.row.completedSessions}/{params.row.totalSessions} sessions
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: any) => (
        <IconButton
          onClick={() => handleViewClassDetails(params.row as IFinalClass)}
          size="small"
          sx={{
            bgcolor: alpha('#6366f1', 0.06),
            color: '#6366f1',
            '&:hover': { bgcolor: alpha('#6366f1', 0.12) },
          }}
        >
          <VisibilityIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )
    }
  ];

  // Stat cards config for admin view
  const internalStatCards = [
    { label: 'Assigned', value: tutorProfile?.classesAssigned || 0, color: '#6366f1', icon: '📚' },
    { label: 'Reschedules', value: (tutorProfile as any)?.internalStats?.oneTimeReschedules || 0, color: '#f59e0b', icon: '🔄' },
    { label: 'Total Payout', value: `₹${((tutorProfile as any)?.internalStats?.totalPayouts || 0).toLocaleString()}`, color: '#10b981', icon: '💰' },
    { label: 'Attendance', value: (tutorProfile as any)?.internalStats?.attendanceSheetsSubmitted || 0, color: '#3b82f6', icon: '📋' },
    { label: 'Demos', value: (tutorProfile as any)?.internalStats?.demosScheduled || 0, color: '#a855f7', icon: '🎯' },
  ];


  return (
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 0 }, pb: { xs: 10, sm: 0 } }}>
      {/* ─── Premium Header ──────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 3, sm: 4 },
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 100%)',
          p: { xs: 2.5, sm: 4 },
          mb: { xs: 2.5, sm: 4 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-15%',
            width: '60%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '40%',
            height: '150%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box position="relative" zIndex={1}>
          <Box display="flex" alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2} flexWrap="wrap">
            <Box>
              <Box display="flex" alignItems="center" gap={1.5} mb={0.75}>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.2rem' },
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                  }}
                >
                  {id ? 'Tutor Profile' : 'My Profile'}
                </Typography>
                {id && (
                  <Chip
                    label="Admin View"
                    size="small"
                    sx={{
                      bgcolor: alpha('#f59e0b', 0.15),
                      color: '#fbbf24',
                      fontWeight: 700,
                      fontSize: '0.62rem',
                      height: 22,
                      border: `1px solid ${alpha('#f59e0b', 0.2)}`,
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: alpha('#fff', 0.55),
                  fontSize: { xs: '0.8rem', sm: '0.88rem' },
                  maxWidth: 500,
                }}
              >
                {id
                  ? `Managing profile for ${tutorProfile?.user?.name || 'Tutor'}`
                  : 'View and manage your tutor profile and verification status.'}
              </Typography>
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap">
              {!id && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LockResetIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setChangePasswordOpen(true)}
                  sx={{
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderColor: alpha('#fff', 0.2),
                    color: alpha('#fff', 0.8),
                    backdropFilter: 'blur(8px)',
                    '&:hover': { borderColor: alpha('#fff', 0.4), bgcolor: alpha('#fff', 0.05) },
                  }}
                >
                  Change Password
                </Button>
              )}
              {(() => {
                if (!tutorProfile || id) return null;
                const hasSubjects = Array.isArray(tutorProfile.subjects) && tutorProfile.subjects.length > 0;
                const hasQualifications = Array.isArray(tutorProfile.qualifications) && tutorProfile.qualifications.length > 0;
                const hasLocations = Array.isArray(tutorProfile.preferredLocations) && tutorProfile.preferredLocations.length > 0;
                const isIncomplete = !hasSubjects || !hasQualifications || !hasLocations;
                if (!isIncomplete) return null;
                return (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => window.location.href = '/tutor-register?mode=edit'}
                    sx={{
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      bgcolor: '#6366f1',
                      boxShadow: `0 4px 14px ${alpha('#6366f1', 0.4)}`,
                      '&:hover': { bgcolor: '#4f46e5' },
                    }}
                  >
                    Complete Profile
                  </Button>
                );
              })()}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ─── Tier Progress + Profile Card ────────────── */}
      <Box sx={{ mb: { xs: 2.5, sm: 4 } }}>
        {tutorProfile && <TutorTierProgressCard tutor={tutorProfile} />}
        <MUIProfileCard tutorId={id} />
      </Box>

      {/* ═══════════════════════════════════════════════ */}
      {/* ─── Admin-Only Sections ──────────────────────── */}
      {/* ═══════════════════════════════════════════════ */}
      {id && (
        <>
          {/* Internal Performance Metrics */}
          <Box sx={{ mb: { xs: 3, sm: 5 } }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: alpha('#6366f1', 0.06), display: 'flex' }}>
                <BarChart2 size={18} color="#6366f1" />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: '-0.01em' }}>
                Internal Performance Metrics
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {internalStatCards.map((stat, index) => (
                <Grid item xs={index < 3 ? 4 : 6} sm key={index}>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2.5 },
                      borderRadius: { xs: 2.5, sm: 3 },
                      bgcolor: '#fff',
                      border: '1px solid',
                      borderColor: alpha(stat.color, 0.12),
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha(stat.color, 0.12)}`,
                        borderColor: alpha(stat.color, 0.25),
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.3)})`,
                        borderRadius: '12px 12px 0 0',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, mb: { xs: 0, sm: 0.25 } }}>
                      {stat.icon}
                    </Typography>
                    <Typography variant="h5" fontWeight={900} sx={{ color: stat.color, fontSize: { xs: '1.1rem', sm: '1.5rem' }, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: { xs: '0.55rem', sm: '0.65rem' } }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Personal & Verification Details */}
          <Box sx={{ mb: { xs: 3, sm: 5 } }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: alpha('#10b981', 0.06), display: 'flex' }}>
                <VerifiedIcon sx={{ fontSize: 18, color: '#10b981' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: '-0.01em' }}>
                Personal & Verification Details
              </Typography>
            </Box>

            <Box
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 3,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: 'grey.100',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    Permanent Address
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {tutorProfile?.permanentAddress || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    Residential Address (Same as Aadhaar)
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {tutorProfile?.residentialAddress || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
                    Aadhaar Card Status
                  </Typography>
                  {(() => {
                    const verified = tutorProfile?.documents?.find((d) => d.documentType === 'AADHAAR')?.verifiedAt;
                    return (
                      <Chip
                        label={verified ? 'VERIFIED' : 'PENDING / NOT UPLOADED'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 24,
                          bgcolor: verified ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                          color: verified ? '#059669' : '#d97706',
                        }}
                      />
                    );
                  })()}
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Assigned Classes DataGrid */}
          <Box sx={{ mb: { xs: 3, sm: 5 } }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: alpha('#6366f1', 0.06), display: 'flex' }}>
                <SchoolIcon sx={{ fontSize: 18, color: '#6366f1' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: '-0.01em' }}>
                Assigned Classes
              </Typography>
            </Box>
            <Paper
              elevation={0}
              sx={{
                height: 420,
                width: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.100',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <DataGrid
                rows={adminClasses}
                columns={classColumns}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
                disableRowSelectionOnClick
                getRowId={(row: any) => row.id || row._id}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: alpha('#6366f1', 0.04),
                    borderRadius: 0,
                  },
                  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
                  '& .MuiDataGrid-cell:focus': { outline: 'none' },
                  '& .MuiDataGrid-cell': { px: 2 },
                  '& .MuiDataGrid-columnHeader': { px: 2 },
                  '& .MuiDataGrid-row:hover': { bgcolor: alpha('#6366f1', 0.02) },
                }}
              />
            </Paper>
          </Box>

          {/* Payment History */}
          <Box sx={{ mb: { xs: 3, sm: 5 } }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: alpha('#10b981', 0.06), display: 'flex' }}>
                <PaymentsIcon sx={{ fontSize: 18, color: '#10b981' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: '-0.01em' }}>
                Payment History
              </Typography>
            </Box>
            <Box
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.100',
                bgcolor: '#fff',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${alpha('#6366f1', 0.06)}` }}>
                    {['Amount', 'Status', 'Method', 'Date'].map((h) => (
                      <th key={h} style={{ padding: '14px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adminPayments.length > 0 ? (
                    adminPayments.map((p) => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${alpha('#6366f1', 0.04)}` }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.88rem' }}>₹{p.amount?.toLocaleString()}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <Chip
                            label={p.status}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.62rem',
                              height: 22,
                              bgcolor: p.status === 'PAID' ? alpha('#10b981', 0.1) : p.status === 'PENDING' ? alpha('#f59e0b', 0.1) : alpha('#64748b', 0.08),
                              color: p.status === 'PAID' ? '#059669' : p.status === 'PENDING' ? '#d97706' : '#475569',
                            }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#64748b' }}>{p.paymentMethod || '-'}</td>
                        <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#64748b' }}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No payment records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Box>

          {/* Attendance Snapshot */}
          <Box sx={{ mb: { xs: 3, sm: 5 } }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: alpha('#3b82f6', 0.06), display: 'flex' }}>
                <EventIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: '-0.01em' }}>
                Attendance Snapshot
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
              {[
                { label: 'Present', value: attendanceStats.present, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
                { label: 'Absent', value: attendanceStats.absent, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
                { label: 'Late', value: attendanceStats.late, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
              ].map((stat, idx) => (
                <Grid item xs={4} key={idx}>
                  <Box
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: { xs: 2.5, sm: 3 },
                      background: stat.gradient,
                      color: '#fff',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(stat.color, 0.3)}` },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        right: '-30%',
                        width: '70%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%)',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <Typography variant="h4" fontWeight={900} sx={{ position: 'relative', zIndex: 1, fontSize: { xs: '1.4rem', sm: '2rem' } }}>{stat.value}</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ position: 'relative', zIndex: 1, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: { xs: '0.55rem', sm: '0.7rem' } }}>{stat.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      {/* ─── Complete Profile Dialog ─────────────────── */}
      <Dialog
        open={completeModalOpen}
        onClose={() => !saving && setCompleteModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            pb: 2,
          }}
        >
          <Typography variant="h6" component="div" fontWeight={700} sx={{ fontSize: '1.05rem' }}>
            Complete your tutor profile
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.82rem' }}>
            Fill these details so our team can match you with the right classes.
          </Typography>
          <TextField
            label="Experience"
            value={experienceInput}
            onChange={(e) => setExperienceInput(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="e.g., 2 years, Fresher"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={subjectLabels.length > 0 ? ['Select All', ...subjectLabels] : []}
            value={selectedSubjects}
            onChange={(_, value) => {
              if (value.includes('Select All')) {
                if (selectedSubjects.length === subjectLabels.length) {
                  setSelectedSubjects([]);
                } else {
                  setSelectedSubjects(subjectLabels);
                }
              } else {
                setSelectedSubjects(value);
              }
            }}
            renderOption={(props, option, { selected }) => {
              const isSelectAll = option === 'Select All';
              const allSelected = selectedSubjects.length === subjectLabels.length && subjectLabels.length > 0;
              return (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={isSelectAll ? allSelected : selected}
                  />
                  {option}
                </li>
              );
            }}
            renderTags={(value: readonly string[], getTagProps) =>
              value.filter(v => v !== 'Select All').map((option: string, index: number) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.75rem' }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Subjects you can teach"
                placeholder="Select one or more subjects"
                margin="normal"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}
          />
          <TextField
            label="Your qualifications"
            value={qualificationsInput}
            onChange={(e) => setQualificationsInput(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="e.g., B.Sc, M.Sc, B.Ed"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={extracurricularOptions.length > 0 ? ['Select All', ...extracurricularOptions.map((opt) => opt.value)] : []}
            value={selectedExtracurriculars}
            onChange={(_, value) => {
              if (value.includes('Select All')) {
                const allValues = extracurricularOptions.map((opt) => opt.value);
                if (selectedExtracurriculars.length === allValues.length) {
                  setSelectedExtracurriculars([]);
                } else {
                  setSelectedExtracurriculars(allValues);
                }
              } else {
                setSelectedExtracurriculars(value);
              }
            }}
            renderOption={(props, option, { selected }) => {
              const isSelectAll = option === 'Select All';
              const allValues = extracurricularOptions.map((opt) => opt.value);
              const allSelected = selectedExtracurriculars.length === allValues.length && allValues.length > 0;
              return (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={isSelectAll ? allSelected : selected}
                  />
                  {option}
                </li>
              );
            }}
            renderTags={(value: readonly string[], getTagProps) =>
              value.filter(v => v !== 'Select All').map((option: string, index: number) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.75rem' }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Extracurricular activities you can teach/coach"
                placeholder="Select one or more activities"
                margin="normal"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={availableAreas.length > 0 ? ['Select All', ...availableAreas] : []}
            value={preferredAreas}
            onChange={(_, value) => {
              if (value.includes('Select All')) {
                if (preferredAreas.length === availableAreas.length) {
                  setPreferredAreas([]);
                } else {
                  setPreferredAreas(availableAreas);
                }
              } else {
                setPreferredAreas(value);
              }
            }}
            renderOption={(props, option, { selected }) => {
              const isSelectAll = option === 'Select All';
              const allSelected = preferredAreas.length === availableAreas.length && availableAreas.length > 0;
              return (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={isSelectAll ? allSelected : selected}
                  />
                  {option}
                </li>
              );
            }}
            renderTags={(value: readonly string[], getTagProps) =>
              value.filter(v => v !== 'Select All').map((option: string, index: number) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.75rem' }} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Preferred Areas for Offline Classes"
                placeholder="Preferred Areas for Offline Classes"
                margin="normal"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setCompleteModalOpen(false)}
            disabled={saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCompleteProfile}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' },
              boxShadow: 'none',
              px: 3,
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save & Continue'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Class Details Drill-down Dialog ──────────── */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            m: 0,
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ p: 0.5, borderRadius: 1.5, bgcolor: alpha('#fff', 0.1), display: 'flex' }}>
              <ListIcon sx={{ fontSize: 18, color: alpha('#fff', 0.8) }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
              Class: {selectedClass?.className}
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsModalOpen(false)} size="small" sx={{ color: alpha('#fff', 0.6) }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              px: 2,
              '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 2.5, borderRadius: 2 },
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', '&.Mui-selected': { color: '#6366f1' } },
            }}
          >
            <Tab icon={<VisibilityIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="General Info" />
            <Tab icon={<EventIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Attendance" />
            <Tab icon={<PaymentsIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Payments" />
          </Tabs>
        </Box>
        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc', minHeight: 400 }}>
          {activeTab === 0 && selectedClass && (
            <Grid container spacing={2.5}>
              {[
                { label: 'Student Name', value: selectedClass.studentName },
                { label: 'Grade', value: selectedClass.grade },
                { label: 'Subject', value: Array.isArray(selectedClass.subject) ? selectedClass.subject.join(', ') : selectedClass.subject },
                { label: 'Board', value: selectedClass.board },
                { label: 'Mode', value: selectedClass.mode },
                { label: 'Location', value: selectedClass.location || 'N/A' },
                { label: 'Start Date', value: new Date(selectedClass.startDate).toLocaleDateString() },
                { label: 'Timing', value: selectedClass.schedule?.timeSlot || 'N/A' },
                { label: 'Days', value: selectedClass.schedule?.daysOfWeek?.join(', ') || 'N/A' },
                { label: 'Total Sessions', value: selectedClass.totalSessions },
                { label: 'Rate per Session', value: selectedClass.ratePerSession ? `₹${selectedClass.ratePerSession}` : 'N/A' },
                { label: 'Status', value: <Chip label={selectedClass.status} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', height: 22, bgcolor: selectedClass.status === 'ACTIVE' ? alpha('#10b981', 0.1) : alpha('#64748b', 0.08), color: selectedClass.status === 'ACTIVE' ? '#059669' : '#475569' }} /> }
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff', border: '1px solid', borderColor: alpha('#6366f1', 0.06) }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.06em' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', mt: 0.25 }}>
                      {item.value || '-'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
              {selectedClass.notes && (
                <Grid item xs={12}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff', border: '1px solid', borderColor: alpha('#6366f1', 0.06) }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.06em' }}>
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.25 }}>
                      {selectedClass.notes}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              {loadingDetails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={32} sx={{ color: '#6366f1' }} /></Box>
              ) : classAttendance.length > 0 ? (
                <Box sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'grey.100', overflow: 'hidden', bgcolor: '#fff' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${alpha('#6366f1', 0.06)}` }}>
                        {['Date', 'Topic', 'Student Attendance', 'Status'].map((h) => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classAttendance.map((att) => (
                        <tr key={att.id} style={{ borderTop: `1px solid ${alpha('#6366f1', 0.04)}` }}>
                          <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 600 }}>{new Date(att.sessionDate).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.82rem' }}>{att.topicCovered || '-'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <Chip label={att.studentAttendanceStatus || 'PRESENT'} size="small" sx={{ fontWeight: 700, fontSize: '0.62rem', height: 22, bgcolor: att.studentAttendanceStatus === 'ABSENT' ? alpha('#ef4444', 0.1) : alpha('#10b981', 0.1), color: att.studentAttendanceStatus === 'ABSENT' ? '#dc2626' : '#059669' }} />
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <Chip label={att.status} size="small" sx={{ fontWeight: 700, fontSize: '0.62rem', height: 22, bgcolor: att.status === 'APPROVED' ? alpha('#10b981', 0.1) : att.status === 'REJECTED' ? alpha('#ef4444', 0.1) : alpha('#f59e0b', 0.1), color: att.status === 'APPROVED' ? '#059669' : att.status === 'REJECTED' ? '#dc2626' : '#d97706' }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4} sx={{ fontSize: '0.85rem' }}>
                  No attendance records found for this tutor in this class.
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              {loadingDetails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={32} sx={{ color: '#6366f1' }} /></Box>
              ) : classPayments.length > 0 ? (
                <Box sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'grey.100', overflow: 'hidden', bgcolor: '#fff' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${alpha('#6366f1', 0.06)}` }}>
                        {['Due Date', 'Amount', 'Status', 'Payment Date'].map((h) => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classPayments.map((pay) => (
                        <tr key={pay.id} style={{ borderTop: `1px solid ${alpha('#6366f1', 0.04)}` }}>
                          <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 600 }}>{new Date(pay.dueDate).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.88rem', fontWeight: 800 }}>₹{pay.amount.toLocaleString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <Chip label={pay.status} size="small" sx={{ fontWeight: 700, fontSize: '0.62rem', height: 22, bgcolor: pay.status === 'PAID' ? alpha('#10b981', 0.1) : pay.status === 'OVERDUE' ? alpha('#ef4444', 0.1) : alpha('#f59e0b', 0.1), color: pay.status === 'PAID' ? '#059669' : pay.status === 'OVERDUE' ? '#dc2626' : '#d97706' }} />
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#64748b' }}>{pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4} sx={{ fontSize: '0.85rem' }}>
                  No payment records found for this tutor in this class.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <ChangePasswordOtpModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </Container>
  );
};

export default TutorProfilePage;
