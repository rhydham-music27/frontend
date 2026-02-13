import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Autocomplete, Chip, alpha, useTheme, Grid, Paper, Tabs, Tab, IconButton, Divider, Checkbox } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventIcon from '@mui/icons-material/EventAvailable';
import ListIcon from '@mui/icons-material/ListAlt';
import LockResetIcon from '@mui/icons-material/LockReset';
import { BarChart2 } from 'lucide-react';
import ChangePasswordOtpModal from '../../components/common/ChangePasswordOtpModal';
import ProfileVerificationCard from '../../components/tutors/ProfileVerificationCard';
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

        // Automatic modal opening removed as per user request

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
      valueGetter: (params: any) => Array.isArray(params.row.subject) ? params.row.subject.join(', ') : params.row.subject
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
          color={params.value === 'ACTIVE' ? 'success' : 'default'} 
          variant="outlined" 
        />
      )
    },
    {
      field: 'sessions',
      headerName: 'Progress',
      width: 150,
      renderCell: (params: any) => (
        <Typography variant="body2">
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
          color="primary"
          onClick={() => handleViewClassDetails(params.row as IFinalClass)}
          size="small"
        >
          <VisibilityIcon />
        </IconButton>
      )
    }
  ];


  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={{ xs: 3, sm: 4 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 2 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            {id ? 'Tutor Profile (Admin View)' : 'My Profile'}
          </Typography>
          {!id && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<LockResetIcon />}
              onClick={() => setChangePasswordOpen(true)}
              sx={{ mt: 1 }}
            >
              Change Password
            </Button>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            {id ? `Managing profile for ${tutorProfile?.user?.name || 'Tutor'}` : 'View and manage your tutor profile, documents, and verification status.'}
          </Typography>
        </Box>
        {(() => {
          if (!tutorProfile || id) return null; // Hide if not self
          const hasSubjects = Array.isArray(tutorProfile.subjects) && tutorProfile.subjects.length > 0;
          const hasQualifications =
            Array.isArray(tutorProfile.qualifications) && tutorProfile.qualifications.length > 0;
          const hasLocations =
            Array.isArray(tutorProfile.preferredLocations) &&
            tutorProfile.preferredLocations.length > 0;
          const isIncomplete = !hasSubjects || !hasQualifications || !hasLocations;
          if (!isIncomplete) return null;
          return (
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.href = '/tutor-register?mode=edit'}
              >
                Complete Profile
              </Button>
            </Box>
          );
        })()}
      </Box>

      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          px: { xs: 1.5, sm: 0 },
        }}
      >
        <Box
          sx={{
            maxWidth: '100%',
          }}
        >
          {tutorProfile && <TutorTierProgressCard tutor={tutorProfile} />}
          <MUIProfileCard tutorId={id} />
        </Box>
      </Box>

      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          px: { xs: 1.5, sm: 0 },
        }}
      >
        <Box sx={{ maxWidth: 960, mx: 'auto' }}>
          <ProfileVerificationCard tutorId={id} />
        </Box>
      </Box>


      
      {/* Internal Details & Performance Metrics (Combined Section) */}
      {id && (
        <React.Fragment>
            {/* Internal Stats */}
            <Box sx={{ mb: 6, px: { xs: 1.5, sm: 0 } }}>
              <Typography variant="h5" fontWeight={800} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BarChart2 className="text-blue-500" size={24} />
                Internal Performance Metrics
              </Typography>
                 <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }} gap={3}>
                 {[
                   { label: 'Assigned', value: tutorProfile?.classesAssigned || 0, color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.05) },
                   { label: 'Reschedules', value: (tutorProfile as any)?.internalStats?.oneTimeReschedules || 0, color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.05) },
                   { label: 'Total Payout', value: `₹${((tutorProfile as any)?.internalStats?.totalPayouts || 0).toLocaleString()}`, color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.05) },
                   { label: 'Attendance', value: (tutorProfile as any)?.internalStats?.attendanceSheetsSubmitted || 0, color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.05) },
                   { label: 'Demos', value: (tutorProfile as any)?.internalStats?.demosScheduled || 0, color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.05) }
                 ].map((stat, index) => (
                   <Paper 
                    key={index} 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 4, 
                      bgcolor: stat.bg,
                      border: '1px solid',
                      borderColor: alpha(stat.color, 0.1),
                      textAlign: 'center',
                      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': { transform: 'scale(1.05)' }
                    }}
                   >
                     <Typography variant="h4" fontWeight={900} color={stat.color} sx={{ mb: 0.5 }}>{stat.value}</Typography>
                     <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', tracking: '0.1em' }}>{stat.label}</Typography>
                   </Paper>
                 ))}
              </Box>
            </Box>

            {/* Personal & Verification Details */}
            <Box sx={{ mb: 6, px: { xs: 1.5, sm: 0 } }}>
              <Typography variant="h5" fontWeight={800} mb={3}>Personal & Verification Details</Typography>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                 <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={4}>
                    <Box>
                       <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Permanent Address</Typography>
                       <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary', lineHeight: 1.6 }}>{tutorProfile?.permanentAddress || 'Not provided'}</Typography>
                    </Box>
                    <Box>
                       <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Residential Address (Same as Aadhaar)</Typography>
                       <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary', lineHeight: 1.6 }}>{tutorProfile?.residentialAddress || 'Not provided'}</Typography>
                    </Box>
                    <Box>
                       <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Aadhaar Card Status</Typography>
                       <Chip 
                         label={tutorProfile?.documents?.find((d) => d.documentType === 'AADHAAR')?.verifiedAt ? 'VERIFIED' : 'PENDING / NOT UPLOADED'} 
                         color={tutorProfile?.documents?.find((d) => d.documentType === 'AADHAAR')?.verifiedAt ? 'success' : 'default'} 
                         size="small" 
                         variant="filled"
                         sx={{ 
                           fontWeight: 900, 
                           borderRadius: 2, 
                           fontSize: '0.65rem', 
                           letterSpacing: '0.05em',
                           backgroundColor: tutorProfile?.documents?.find((d) => d.documentType === 'AADHAAR')?.verifiedAt ? alpha(theme.palette.success.main, 0.1) : undefined,
                           color: tutorProfile?.documents?.find((d) => d.documentType === 'AADHAAR')?.verifiedAt ? theme.palette.success.main : undefined
                         }}
                       />
                    </Box>
                 </Box>
              </Paper>
            </Box>
        </React.Fragment>
      )}

      {/* Admin Internal Details Section (Existing: Classes, Payments, Attendance) */}
      {id && (
        <React.Fragment>
          {/* Assigned Classes */}
          <Box sx={{ mb: 6, px: { xs: 1.5, sm: 0 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h5" fontWeight={800}>Assigned Classes</Typography>
            </Box>
            <Paper elevation={0} sx={{ height: 420, width: '100%', borderRadius: 5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
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
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 0,
                  },
                  '& .MuiDataGrid-cell:focus': { outline: 'none' },
                  '& .MuiDataGrid-cell': { px: 2 },
                  '& .MuiDataGrid-columnHeader': { px: 2 },
                }}
              />
            </Paper>
          </Box>

          {/* Payment History */}
          <Box sx={{ mb: 4, px: { xs: 1.5, sm: 0 } }}>
             <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h5" fontWeight={700}>Payment History</Typography>
            </Box>
            <Box overflow="auto" border={1} borderColor="divider" borderRadius={2} bgcolor="background.paper">
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                 <thead>
                   <tr style={{ borderBottom: '1px solid var(--mui-palette-divider)' }}>
                     <th style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600 }}>Amount</th>
                     <th style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
                     <th style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600 }}>Method</th>
                     <th style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600 }}>Date</th>
                   </tr>
                 </thead>
                 <tbody>
                    {adminPayments.length > 0 ? (
                      adminPayments.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--mui-palette-divider)' }}>
                           <td style={{ padding: '12px 16px' }}>₹{p.amount?.toLocaleString()}</td>
                           <td style={{ padding: '12px 16px' }}>
                             <Chip label={p.status} size="small" color={p.status === 'PAID' ? 'success' : p.status === 'PENDING' ? 'warning' : 'default'} />
                           </td>
                           <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{p.paymentMethod || '-'}</td>
                           <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'text.secondary' }}>No payment records found.</td>
                      </tr>
                    )}
                 </tbody>
               </table>
            </Box>
          </Box>

          {/* Attendance Snapshot */}
          <Box sx={{ mb: 4, px: { xs: 1.5, sm: 0 } }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h5" fontWeight={700}>Attendance Snapshot</Typography>
            </Box>
            <Box p={3} border={1} borderColor="divider" borderRadius={2} bgcolor="background.paper">
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Box flex={1} minWidth={100} p={2} borderRadius={2} bgcolor={alpha('#10B981', 0.1)} textAlign="center">
                     <Typography variant="h4" fontWeight={700} color="success.main">{attendanceStats.present}</Typography>
                     <Typography variant="caption" fontWeight={600}>PRESENT</Typography>
                  </Box>
                  <Box flex={1} minWidth={100} p={2} borderRadius={2} bgcolor={alpha('#EF4444', 0.1)} textAlign="center">
                     <Typography variant="h4" fontWeight={700} color="error.main">{attendanceStats.absent}</Typography>
                     <Typography variant="caption" fontWeight={600}>ABSENT</Typography>
                  </Box>
                  <Box flex={1} minWidth={100} p={2} borderRadius={2} bgcolor={alpha('#F59E0B', 0.1)} textAlign="center">
                     <Typography variant="h4" fontWeight={700} color="warning.main">{attendanceStats.late}</Typography>
                     <Typography variant="caption" fontWeight={600}>LATE</Typography>
                  </Box>
                </Box>
            </Box>
          </Box>
        </React.Fragment>
      )}

      <Dialog
        open={completeModalOpen}
        onClose={() => !saving && setCompleteModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Complete your tutor profile</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fill these details so our team can match you with the right classes.
          </Typography>
          <TextField
            label="Experience"
            value={experienceInput}
            onChange={(e) => setExperienceInput(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="e.g., 2 years, Fresher"
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
                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Preferred Areas for Offline Classes"
                placeholder="Preferred Areas for Offline Classes"
                margin="normal"
                fullWidth
              />
            )}
          />
          {/* Subjects and locations are now selected via dropdowns, so no comma instruction needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCompleteProfile}
            color="primary"
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save & Continue'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Class Details Drill-down Modal */}
      <Dialog 
        open={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <ListIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Class: {selectedClass?.className}
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0, minHeight: 400 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
              <Tab icon={<VisibilityIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="General Info" />
              <Tab icon={<EventIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Attendance" />
              <Tab icon={<PaymentsIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Payments" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && selectedClass && (
              <Grid container spacing={3}>
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
                  { label: 'Status', value: <Chip label={selectedClass.status} size="small" color={selectedClass.status === 'ACTIVE' ? 'success' : 'default'} /> }
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      {item.label}
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {item.value || '-'}
                    </Typography>
                  </Grid>
                ))}
                {selectedClass.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {selectedClass.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}

            {activeTab === 1 && (
              <Box>
                {loadingDetails ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : classAttendance.length > 0 ? (
                  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700 }}>DATE</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700 }}>TOPIC</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700 }}>STUDENT ATTENDANCE</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700 }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classAttendance.map((att) => (
                          <tr key={att.id} style={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                            <td style={{ padding: '12px', fontSize: '0.875rem' }}>{new Date(att.sessionDate).toLocaleDateString()}</td>
                            <td style={{ padding: '12px', fontSize: '0.875rem' }}>{att.topicCovered || '-'}</td>
                            <td style={{ padding: '12px', fontSize: '0.875rem' }}>
                              <Chip label={att.studentAttendanceStatus || 'PRESENT'} size="small" color={att.studentAttendanceStatus === 'ABSENT' ? 'error' : 'success'} variant="outlined" />
                            </td>
                            <td style={{ padding: '12px', fontSize: '0.875rem' }}>
                              <Chip label={att.status} size="small" color={att.status === 'APPROVED' ? 'success' : att.status === 'REJECTED' ? 'error' : 'warning'} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Paper>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    No attendance records found for this tutor in this class.
                  </Typography>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                {loadingDetails ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : classPayments.length > 0 ? (
                  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700 }}>DUE DATE</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700 }}>AMOUNT</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700 }}>STATUS</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700 }}>PAYMENT DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classPayments.map((pay) => (
                          <tr key={pay.id} style={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                            <td style={{ padding: '12px', fontSize: '0.875rem' }}>{new Date(pay.dueDate).toLocaleDateString()}</td>
                            <td style={{ padding: '12px', fontSize: '0.875rem' }}>₹{pay.amount.toLocaleString()}</td>
                            <td style={{ padding: '12px', fontSize: '0.875rem' }}>
                              <Chip label={pay.status} size="small" color={pay.status === 'PAID' ? 'success' : pay.status === 'OVERDUE' ? 'error' : 'warning'} />
                            </td>
                            <td style={{ padding: '12px', fontSize: '0.875rem' }}>{pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Paper>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    No payment records found for this tutor in this class.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
      <ChangePasswordOtpModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </Container>
  );
};

export default TutorProfilePage;

