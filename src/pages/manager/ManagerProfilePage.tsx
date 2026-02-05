import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Box, Typography, Grid, Card, CardContent, Avatar, Chip, 
  List, ListItem, ListItemText, Tabs, Tab, Button, Paper, alpha, useTheme, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Autocomplete, CircularProgress
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import ChangePasswordOtpModal from '../../components/common/ChangePasswordOtpModal';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';
import LanguageIcon from '@mui/icons-material/Language';
import PsychologyIcon from '@mui/icons-material/Psychology';
import InfoIcon from '@mui/icons-material/Info';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { IManager, IManagerMetrics } from '../../types';
import managerService from '../../services/managerService';
import DateRangePicker from '../../components/dashboard/DateRangePicker';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { subDays, format } from 'date-fns';
import { useOptions } from '@/hooks/useOptions';

const ManagerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector(selectCurrentUser);
  const theme = useTheme();
  
  const [managerProfile, setManagerProfile] = useState<IManager | null>(null);
  const [managerMetrics, setManagerMetrics] = useState<IManagerMetrics | null>(null);
  const [profileMissing, setProfileMissing] = useState<boolean>(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state for complete profile
  const [bioInput, setBioInput] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string }>({ 
    fromDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'), 
    toDate: format(new Date(), 'yyyy-MM-dd') 
  });
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ 
    open: false, message: '', severity: 'success' 
  });

  const { options: languageOptions } = useOptions('LANGUAGE');
  const { options: skillOptions } = useOptions('SKILL');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        let p: any = null;
        let profileExists = false;
        try {
          if (id) {
            p = await managerService.getManagerById(id);
          } else {
            p = await managerService.getMyProfile();
          }
          setManagerProfile(p.data);
          setProfileMissing(false);
          profileExists = true;
          
          // Check for incomplete profile to show modal
          if (!id && p.data) {
            const isInfoIncomplete = !p.data.bio || !p.data.permanentAddress || !p.data.residentialAddress || !p.data.languagesKnown?.length;
            if (isInfoIncomplete) {
              handleOpenCompleteModal(p.data);
            }
          }
        } catch (e: any) {
          if (e?.response?.status === 404) {
            setProfileMissing(true);
            setManagerProfile(null);
            profileExists = false;
          } else {
            throw e;
          }
        }

        if (profileExists) {
          try {
            let m: any = null;
            if (id) {
              m = await managerService.getManagerMetrics(id, dateRange.fromDate, dateRange.toDate);
            } else {
              m = await managerService.getMyMetrics(dateRange.fromDate, dateRange.toDate);
            }
            setManagerMetrics(m.data);
          } catch (e: any) {
            if (e?.response?.status !== 404) throw e;
          }
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, dateRange.fromDate, dateRange.toDate]);

  useEffect(() => {
    const loadActivity = async () => {
      if (tabValue !== 1) return;
      try {
        const res = id 
          ? await managerService.getManagerActivityLog(id, 1, 20)
          : await managerService.getMyActivityLog(1, 20);
        setActivityLog(res.data);
      } catch (e) {}
    };
    loadActivity();
  }, [tabValue, id]);

  const handleOpenCompleteModal = (profile: IManager) => {
    setBioInput(profile.bio || '');
    setPermanentAddress(profile.permanentAddress || '');
    setResidentialAddress(profile.residentialAddress || '');
    setSelectedLanguages(profile.languagesKnown || []);
    setSelectedSkills(profile.skills || []);
    setCompleteModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!managerProfile) return;
    try {
      setSaving(true);
      await managerService.updateManagerProfile(managerProfile.id, {
        bio: bioInput,
        permanentAddress,
        residentialAddress,
        languagesKnown: selectedLanguages,
        skills: selectedSkills,
      });
      
      const updated = await managerService.getMyProfile();
      setManagerProfile(updated.data);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      setCompleteModalOpen(false);
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to update profile', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const initials = managerProfile?.user?.name 
    ? managerProfile.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() 
    : user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '';

  if (loading && !managerProfile) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Header Section */}
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
            {id ? 'Manager Profile (Admin View)' : 'My Profile'}
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
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mt: 0.5 }}
          >
            {id ? `Managing profile for ${managerProfile?.user?.name || 'Manager'}` : 'View and manage your manager profile, performance metrics, and activity.'}
          </Typography>
        </Box>
        {!id && managerProfile && (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenCompleteModal(managerProfile)}
            >
              Edit Profile
            </Button>
          </Box>
        )}
      </Box>

      {error && <ErrorAlert error={error} />}
      {profileMissing && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={700}>Manager profile not found</Typography>
            <Typography color="text.secondary" paragraph>
              Your account is active but does not have a manager profile yet. Please ask an administrator to create your manager profile.
            </Typography>
          </CardContent>
        </Card>
      )}

      {managerProfile && (
        <React.Fragment>
          {/* Main Profile Card Section */}
          <Box sx={{ mb: 4 }}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.1)',
                  zIndex: 0,
                }
              }}
            >
              <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      fontWeight: 700,
                      border: '4px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                  >
                    {initials}
                  </Avatar>
                </Grid>
                <Grid item xs={12} sm>
                  <Box>
                    <Typography variant="h3" fontWeight={800} gutterBottom>
                      {managerProfile.user?.name}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <MailIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                        <Typography variant="body1">{managerProfile.user?.email}</Typography>
                      </Box>
                      {managerProfile.user?.phone && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                          <Typography variant="body1">{managerProfile.user?.phone}</Typography>
                        </Box>
                      )}
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                        <Typography variant="body1">{managerProfile.department || 'Operations'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarMonthIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                        <Typography variant="body1">Joined {format(new Date(managerProfile.joiningDate), 'MMM yyyy')}</Typography>
                      </Box>
                    </Box>
                    <Box mt={3} display="flex" gap={2}>
                      <Chip 
                        label={managerProfile.isActive ? 'ACTIVE' : 'INACTIVE'} 
                        sx={{ bgcolor: managerProfile.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: managerProfile.isActive ? '#4ade80' : '#94a3b8', fontWeight: 700, fontSize: '0.75rem' }} 
                      />
                      <Chip 
                        label="MANAGER" 
                        sx={{ bgcolor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem' }} 
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Metrics Section */}
          <Box sx={{ mb: 6 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h5" fontWeight={700}>Performance Metrics</Typography>
              <DateRangePicker fromDate={dateRange.fromDate} toDate={dateRange.toDate} onDateChange={setDateRange} />
            </Box>
            <Grid container spacing={2}>
              {[
                { title: 'Leads Created', value: managerMetrics?.classLeadsCreated ?? 0, icon: <AssignmentIcon />, color: '#0ea5e9' },
                { title: 'Demos Scheduled', value: managerMetrics?.demosScheduled ?? 0, icon: <EventIcon />, color: '#8b5cf6' },
                { title: 'Conversions', value: managerMetrics?.classesConverted ?? 0, icon: <ClassIcon />, color: '#10b981' },
                { title: 'Conversion Rate', value: `${managerMetrics?.conversionRate ?? 0}%`, icon: <TrendingUpIcon />, color: '#ef4444' },
                { title: 'Tutors Verified', value: managerMetrics?.tutorsVerified ?? 0, icon: <PeopleIcon />, color: '#6366f1' },
              ].map((stat, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={idx}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      borderRadius: 3,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        borderColor: alpha(stat.color, 0.5)
                      }
                    }}
                  >
                    <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color, mb: 1.5, width: 40, height: 40 }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                      {stat.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Details & Activity Section */}
          <Box sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2 }}>
                  <Tab icon={<InfoIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Overview" />
                  <Tab icon={<ListAltIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Activity Log" />
                </Tabs>
              </Box>
              
              <Box p={4}>
                {tabValue === 0 ? (
                  <Grid container spacing={6}>
                    <Grid item xs={12} md={7}>
                      <Box mb={4}>
                        <Typography variant="h6" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}>
                          <PsychologyIcon fontSize="small" color="primary" /> About Me
                        </Typography>
                        <Box p={3} bgcolor={alpha(theme.palette.primary.main, 0.03)} borderRadius={3} border="1px dashed" borderColor="divider">
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                            {managerProfile.bio || 'Please update your bio to tell us more about yourself.'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}>
                          <LanguageIcon fontSize="small" color="primary" /> Skills & Languages
                        </Typography>
                        <Grid container spacing={3} mt={0.5}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>Key Skills</Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {managerProfile.skills?.length ? (
                                managerProfile.skills.map((skill, idx) => (
                                  <Chip key={idx} label={skill} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                                ))
                              ) : <Typography variant="body2" color="text.disabled italic">None specified</Typography>}
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>Languages</Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {managerProfile.languagesKnown?.length ? (
                                managerProfile.languagesKnown.map((lang, idx) => (
                                  <Chip key={idx} label={lang} size="small" variant="outlined" sx={{ borderRadius: 1.5, borderColor: alpha(theme.palette.secondary.main, 0.3), bgcolor: alpha(theme.palette.secondary.main, 0.05) }} />
                                ))
                              ) : <Typography variant="body2" color="text.disabled italic">None specified</Typography>}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={5}>
                      <Box mb={4}>
                        <Typography variant="h6" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}>
                          <HomeIcon fontSize="small" color="primary" /> Addresses
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={3} mt={2}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">Permanent Address</Typography>
                            <Typography variant="body2" mt={0.5} fontWeight={500}>{managerProfile.permanentAddress || 'Not updated'}</Typography>
                          </Paper>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">Residential Address</Typography>
                            <Typography variant="body2" mt={0.5} fontWeight={500}>{managerProfile.residentialAddress || 'Not updated'}</Typography>
                          </Paper>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Recent Activity</Typography>
                    {activityLog.length === 0 ? (
                      <Box py={8} textAlign="center">
                        <Typography color="text.secondary" variant="body2">No recent activity logged for this period.</Typography>
                      </Box>
                    ) : (
                      <List disablePadding>
                        {activityLog.map((item: any, idx: number) => (
                          <ListItem 
                            key={idx} 
                            sx={{ 
                              px: 0, 
                              py: 2, 
                              borderBottom: idx < activityLog.length - 1 ? '1px solid' : 'none', 
                              borderColor: 'divider' 
                            }}
                          >
                            <ListItemText 
                              primary={<Typography variant="body1" fontWeight={500}>{item.actionDescription || item.actionType}</Typography>} 
                              secondary={
                                <Box display="flex" gap={2} mt={0.5}>
                                  <Typography variant="caption" color="text.secondary">{format(new Date(item.createdAt), 'PPpp')}</Typography>
                                  {item.actionType && <Chip label={item.actionType} size="small" sx={{ height: 20, fontSize: '0.625rem' }} />}
                                </Box>
                              } 
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </React.Fragment>
      )}

      {/* Complete Profile Dialog */}
      <Dialog
        open={completeModalOpen}
        onClose={() => !saving && setCompleteModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Update Manager Profile</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please provide your professional and contact details to complete your profile.
          </Typography>
          
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Professional Summary</Typography>
          <TextField
            label="Bio (About Yourself)"
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            fullWidth
            margin="dense"
            multiline
            rows={4}
            placeholder="Introduce yourself and your experience..."
          />
          
          <Box sx={{ mt: 3, mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Skills & Languages</Typography>
            <Autocomplete
              multiple
              options={skillOptions.length > 0 ? ['Select All', ...skillOptions.map(o => o.label)] : []}
              value={selectedSkills}
              onChange={(_, val) => {
                const availableSkills = skillOptions.map(o => o.label);
                if (val.includes('Select All')) {
                  if (selectedSkills.length === availableSkills.length) {
                    setSelectedSkills([]);
                  } else {
                    setSelectedSkills(availableSkills);
                  }
                } else {
                  setSelectedSkills(val);
                }
              }}
              freeSolo
              renderTags={(value: string[], getTagProps) =>
                value.filter(v => v !== 'Select All').map((option: string, index: number) => (
                  <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Skills" margin="dense" placeholder="Add relevant skills" />
              )}
            />
            <Autocomplete
              multiple
              options={languageOptions.length > 0 ? ['Select All', ...languageOptions.map(o => o.label)] : []}
              value={selectedLanguages}
              onChange={(_, val) => {
                const availableLanguages = languageOptions.map(o => o.label);
                if (val.includes('Select All')) {
                  if (selectedLanguages.length === availableLanguages.length) {
                    setSelectedLanguages([]);
                  } else {
                    setSelectedLanguages(availableLanguages);
                  }
                } else {
                  setSelectedLanguages(val);
                }
              }}
              renderTags={(value: string[], getTagProps) =>
                value.filter(v => v !== 'Select All').map((option: string, index: number) => (
                  <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Languages Known" margin="dense" />
              )}
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Contact Addresses</Typography>
            <TextField
              label="Permanent Address"
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              fullWidth
              margin="dense"
              placeholder="As per Aadhaar/Official docs"
            />
            <TextField
              label="Residential Address"
              value={residentialAddress}
              onChange={(e) => setResidentialAddress(e.target.value)}
              fullWidth
              margin="dense"
              placeholder="Current address"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCompleteModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            color="primary"
            variant="contained"
            disabled={saving}
            startIcon={saving && <CircularProgress size={16} color="inherit" />}
          >
            {saving ? 'Saving...' : 'Save & Update'}
          </Button>
        </DialogActions>
      </Dialog>

      <ChangePasswordOtpModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
      <SnackbarNotification 
        open={snackbar.open} 
        message={snackbar.message} 
        severity={snackbar.severity} 
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))} 
      />
    </Container>
  );
};

export default ManagerProfilePage;
