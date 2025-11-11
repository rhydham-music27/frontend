import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Grid,
  Divider,
  Chip,
  Alert,
  Pagination,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { getAssignedClasses } from '../../services/coordinatorService';
import {
  sendCoordinatorAnnouncement,
  getCoordinatorAnnouncements,
  getCoordinatorAnnouncementStats,
} from '../../services/announcementService';
import { IFinalClass, ICoordinatorAnnouncement, ISendAnnouncementFormData, ICoordinatorAnnouncementStats } from '../../types';
import { RECIPIENT_TYPE } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';

const schema = yup.object({
  subject: yup.string().required('Subject is required').min(3, 'Minimum 3 characters').max(200, 'Maximum 200 characters'),
  message: yup
    .string()
    .required('Message is required')
    .min(10, 'Minimum 10 characters')
    .max(2000, 'Maximum 2000 characters'),
  recipientType: yup
    .string()
    .required('Recipient type is required')
    .oneOf(Object.values(RECIPIENT_TYPE) as string[], 'Invalid recipient type'),
  targetClassId: yup.string().when('recipientType', {
    is: RECIPIENT_TYPE.SPECIFIC_CLASS,
    then: (s) => s.required('Class selection is required'),
    otherwise: (s) => s.optional(),
  }),
  targetTutorId: yup.string().when('recipientType', {
    is: RECIPIENT_TYPE.SPECIFIC_TUTOR,
    then: (s) => s.required('Tutor selection is required'),
    otherwise: (s) => s.optional(),
  }),
});

const SendAnnouncementPage: React.FC = () => {
  const [view, setView] = useState<'compose' | 'history'>('compose');
  const [assignedClasses, setAssignedClasses] = useState<IFinalClass[]>([]);
  const [announcements, setAnnouncements] = useState<ICoordinatorAnnouncement[]>([]);
  const [stats, setStats] = useState<ICoordinatorAnnouncementStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [historyFilters, setHistoryFilters] = useState<{
    recipientType?: string;
    fromDate?: string;
    toDate?: string;
    page: number;
    limit: number;
  }>({ page: 1, limit: 10 });
  const [pagination, setPagination] = useState<{ total: number; pages: number }>({ total: 0, pages: 0 });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>(
    { open: false, message: '', severity: 'success' }
  );
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ISendAnnouncementFormData>({
    resolver: yupResolver(schema),
    defaultValues: { subject: '', message: '', recipientType: '', targetClassId: '', targetTutorId: '' },
  });

  const recipientType = watch('recipientType');

  const fetchAssignedClasses = useCallback(async () => {
    try {
      const { data, pagination } = await getAssignedClasses(1, 100);
      const classes = (data as any[]).filter((c: any) => !c.status || c.status === 'ACTIVE');
      setAssignedClasses(classes as IFinalClass[]);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load assigned classes');
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const { data, pagination } = await getCoordinatorAnnouncements(historyFilters);
      setAnnouncements(data as ICoordinatorAnnouncement[]);
      setPagination({ total: pagination.total, pages: pagination.pages });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [historyFilters]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await getCoordinatorAnnouncementStats();
      setStats(data as ICoordinatorAnnouncementStats);
    } catch (e) {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchAssignedClasses();
    fetchStats();
  }, [fetchAssignedClasses, fetchStats]);

  useEffect(() => {
    if (view === 'history') fetchAnnouncements();
  }, [view, fetchAnnouncements]);

  const handleSendAnnouncement: SubmitHandler<ISendAnnouncementFormData> = async (form) => {
    try {
      setLoading(true);
      await sendCoordinatorAnnouncement(form);
      setSnackbar({ open: true, message: 'Announcement sent successfully', severity: 'success' });
      reset();
      fetchStats();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to send announcement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('recipientType', value as any);
    setValue('targetClassId', '');
    setValue('targetTutorId', '');
  };

  const handleRefresh = () => {
    setSnackbar({ open: true, message: 'Refreshing data...', severity: 'info' });
    if (view === 'compose') {
      fetchAssignedClasses();
      fetchStats();
    } else {
      fetchAnnouncements();
    }
  };

  const handleFilterChange = (key: 'recipientType' | 'fromDate' | 'toDate', value?: string) => {
    setHistoryFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handleClearFilters = () => {
    setHistoryFilters({ page: 1, limit: 10 });
  };

  const handlePageChange = (_: any, page: number) => {
    setHistoryFilters((prev) => ({ ...prev, page }));
  };

  const uniqueTutors = useMemo(() => {
    const map = new Map<string, any>();
    assignedClasses.forEach((c: any) => {
      const t = c.tutor;
      if (t && !map.has(t.id || t._id)) map.set(t.id || t._id, t);
    });
    return Array.from(map.values());
  }, [assignedClasses]);

  const renderCompose = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Send New Announcement
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Send announcements to students, parents, and tutors assigned to your classes
        </Alert>
        <Box component="form" onSubmit={handleSubmit(handleSendAnnouncement)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Subject"
                fullWidth
                {...register('subject')}
                error={!!errors.subject}
                helperText={errors.subject?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message"
                fullWidth
                multiline
                rows={6}
                placeholder="Enter your announcement message..."
                {...register('message')}
                error={!!errors.message}
                helperText={errors.message?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Send To"
                fullWidth
                value={recipientType || ''}
                {...register('recipientType')}
                onChange={handleRecipientTypeChange}
                error={!!errors.recipientType}
                helperText={errors.recipientType?.message}
              >
                <MenuItem value={RECIPIENT_TYPE.SPECIFIC_CLASS}>Specific Class (Tutor & Parent)</MenuItem>
                <MenuItem value={RECIPIENT_TYPE.ALL_CLASSES}>All My Classes (All Tutors & Parents)</MenuItem>
                <MenuItem value={RECIPIENT_TYPE.SPECIFIC_TUTOR}>Specific Tutor</MenuItem>
                <MenuItem value={RECIPIENT_TYPE.ALL_TUTORS}>All My Tutors</MenuItem>
                <MenuItem value={RECIPIENT_TYPE.STUDENTS_PARENTS}>All Students/Parents</MenuItem>
              </TextField>
            </Grid>

            {recipientType === RECIPIENT_TYPE.SPECIFIC_CLASS && (
              <Grid item xs={12}>
                <TextField select label="Select Class" fullWidth {...register('targetClassId')} error={!!errors.targetClassId} helperText={errors.targetClassId?.message}>
                  {assignedClasses.map((cls: any) => (
                    <MenuItem key={cls.id || cls._id} value={cls.id || cls._id}>
                      {cls.studentName} - {(cls.subject || []).join(', ')} (Grade {cls.grade})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {recipientType === RECIPIENT_TYPE.SPECIFIC_TUTOR && (
              <Grid item xs={12}>
                <TextField select label="Select Tutor" fullWidth {...register('targetTutorId')} error={!!errors.targetTutorId} helperText={errors.targetTutorId?.message}>
                  {uniqueTutors.map((t: any) => (
                    <MenuItem key={t.id || t._id} value={t.id || t._id}>
                      {t.name} - {t.email}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {(watch('subject') || watch('message')) && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview
                    </Typography>
                    <Typography variant="subtitle1">{watch('subject') || 'Untitled'}</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                      {watch('message')}
                    </Typography>
                    <Chip label={`Recipient: ${recipientType || 'N/A'}`} size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" startIcon={<SendIcon />} disabled={loading} fullWidth>
                Send Announcement
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );

  const renderHistory = () => (
    <>
      <Typography variant="h6" gutterBottom>
        Announcement History
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select label="Recipient Type" fullWidth value={historyFilters.recipientType || ''} onChange={(e) => handleFilterChange('recipientType', e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value={RECIPIENT_TYPE.SPECIFIC_CLASS}>Specific Class</MenuItem>
                <MenuItem value={RECIPIENT_TYPE.ALL_CLASSES}>All Classes</MenuItem>
                <MenuItem value={RECIPIENT_TYPE.SPECIFIC_TUTOR}>Specific Tutor</MenuItem>
                <MenuItem value={RECIPIENT_TYPE.ALL_TUTORS}>All Tutors</MenuItem>
                <MenuItem value={RECIPIENT_TYPE.STUDENTS_PARENTS}>Students/Parents</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField type="date" label="From Date" fullWidth InputLabelProps={{ shrink: true }} value={historyFilters.fromDate || ''} onChange={(e) => handleFilterChange('fromDate', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField type="date" label="To Date" fullWidth InputLabelProps={{ shrink: true }} value={historyFilters.toDate || ''} onChange={(e) => handleFilterChange('toDate', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" startIcon={<FilterListIcon />} onClick={handleClearFilters} fullWidth>
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner />}

      {!loading && announcements.length === 0 && (
        <Typography variant="body2">No announcements found</Typography>
      )}

      {!loading && announcements.length > 0 && (
        <Card>
          <CardContent>
            {announcements.map((a) => (
              <Box key={a.id as any}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{a.subject}</Typography>
                  <Typography variant="caption">{new Date(a.sentAt).toLocaleString()}</Typography>
                </Box>
                <Chip label={a.recipientType} size="small" sx={{ mt: 1, mb: 1 }} />
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {a.message}
                </Typography>
                <Box mt={1} display="flex" gap={2}>
                  <Typography variant="caption">{a.recipientCount} recipients</Typography>
                  {a.targetClass && (
                    <Typography variant="caption">
                      Class: {a.targetClass.studentName} - {(a.targetClass.subject || []).join(', ')} (Grade {a.targetClass.grade})
                    </Typography>
                  )}
                  {a.targetTutor && <Typography variant="caption">Tutor: {a.targetTutor.name}</Typography>}
                </Box>
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
            {pagination.pages > 1 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination count={pagination.pages} page={historyFilters.page} onChange={handlePageChange} color="primary" />
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Announcements</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Total Announcements</Typography>
                <Typography variant="h5">{stats.totalAnnouncements}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Total Recipients</Typography>
                <Typography variant="h5">{stats.totalRecipients}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Breakdown</Typography>
                <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                  {stats.breakdown?.map((b, idx) => (
                    <Chip key={idx} label={`${b.recipientType}: ${b.count}`} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 2 }}>
        <Tabs value={view} onChange={(_, v) => setView(v)} aria-label="announcement-tabs">
          <Tab label="Compose Announcement" value="compose" icon={<SendIcon />} iconPosition="start" />
          <Tab label="History" value="history" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Card>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

      {view === 'compose' ? renderCompose() : renderHistory()}

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default SendAnnouncementPage;
