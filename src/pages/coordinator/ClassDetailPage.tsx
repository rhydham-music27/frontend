import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
  Chip,
  Button,
  useTheme,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  alpha,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { getFinalClass, updateFinalClassSchedule, downloadAttendancePdf, renewClass } from '../../services/finalClassService';
import { getAttendanceByClass, getAttendanceSheetsByClass, approveAttendanceSheet, rejectAttendanceSheet } from '../../services/attendanceService';
import { getPaymentsByClass } from '../../services/paymentService';
import { IAttendance, IFinalClass, IPayment } from '../../types';
import { getSubjectList } from '../../utils/subjectUtils';
import AttendanceSheetReviewModal from '../../components/coordinator/AttendanceSheetReviewModal';
import RenewClassModal from '../../components/classes/RenewClassModal';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { useErrorDialog } from '../../hooks/useErrorDialog';
import ErrorDialog from '../../components/common/ErrorDialog';

const navItems = [
  { id: 'info', label: 'Class Info', icon: <InfoOutlinedIcon fontSize="small" /> },
  { id: 'schedule', label: 'Schedule', icon: <CalendarMonthOutlinedIcon fontSize="small" /> },
  { id: 'attendance', label: 'Attendance', icon: <FactCheckOutlinedIcon fontSize="small" /> },
  { id: 'payments', label: 'Payments', icon: <PaymentsOutlinedIcon fontSize="small" /> },
];

const ClassDetailPage: React.FC = () => {
  const theme = useTheme();
  const { classId } = useParams<{ classId: string }>();

  const [activeSection, setActiveSection] = useState('info');
  const [finalClass, setFinalClass] = useState<IFinalClass | null>(null);
  const [attendance, setAttendance] = useState<IAttendance[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Summarized View States
  const [sheets, setSheets] = useState<any[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const { error: dialogError, showError, clearError, handleError } = useErrorDialog();

  const [saveError, setSaveError] = useState<string | null>(null);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [scheduleStartDate, setScheduleStartDate] = useState<string>('');
  const [scheduleDays, setScheduleDays] = useState<string>('');
  const [scheduleTimeSlot, setScheduleTimeSlot] = useState<string>('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  const initials = useMemo(() => {
    const name = finalClass?.studentName || finalClass?.className || '';
    return name ? name.charAt(0).toUpperCase() : 'C';
  }, [finalClass?.studentName, finalClass?.className]);

  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const hydrateScheduleInputs = useCallback((cls: IFinalClass) => {
    const rawDate = cls.schedule?.startDate || cls.startDate;
    const dateStr = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : '';
    setScheduleStartDate(dateStr);
    const days = Array.isArray(cls.schedule?.daysOfWeek) ? cls.schedule.daysOfWeek : [];
    setScheduleDays(days.map((d: any) => typeof d === 'object' ? d.label || d.value : String(d)).join(', '));
    setScheduleTimeSlot(String(cls.schedule?.timeSlot || ''));
  }, []);

  const load = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getFinalClass(classId);
      if (!res.success) throw new Error(res.message || 'Failed to load class');
      const cls = res.data as IFinalClass;
      setFinalClass(cls);
      hydrateScheduleInputs(cls);

      const [attRes, sheetRes, payRes] = await Promise.all([
        getAttendanceByClass(classId),
        getAttendanceSheetsByClass(classId),
        getPaymentsByClass(classId),
      ]);

      setAttendance(Array.isArray((attRes as any)?.data) ? ((attRes as any).data as IAttendance[]) : []);
      setSheets(Array.isArray((sheetRes as any)?.data) ? ((sheetRes as any).data as any[]) : []);
      setPayments(Array.isArray((payRes as any)?.data?.payments) ? ((payRes as any).data.payments as IPayment[]) : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load class');
    } finally {
      setLoading(false);
    }
  }, [classId, hydrateScheduleInputs]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveSchedule = async () => {
    if (!finalClass?.id) return;
    const daysOfWeek = scheduleDays
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      setSavingSchedule(true);
      const res = await updateFinalClassSchedule(finalClass.id, { 
        startDate: scheduleStartDate,
        daysOfWeek, 
        timeSlot: scheduleTimeSlot 
      });
      if (!res.success) throw new Error(res.message || 'Failed to update schedule');
      setFinalClass(res.data as IFinalClass);
      setEditScheduleOpen(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update schedule');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleApproveSheet = async (id: string) => {
    if (!id) return;
    try {
      await approveAttendanceSheet(id);
      setSnackbar({ open: true, message: 'Attendance sheet approved successfully', severity: 'success' });
      const sheetRes = await getAttendanceSheetsByClass(classId!);
      setSheets(Array.isArray((sheetRes as any)?.data) ? ((sheetRes as any).data as any[]) : []);
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to approve sheet', severity: 'error' });
    }
  };

  const handleRejectSheet = async (id: string, reason: string) => {
    if (!id) return;
    try {
      await rejectAttendanceSheet(id, reason);
      setSnackbar({ open: true, message: 'Attendance sheet rejected', severity: 'success' });
      const sheetRes = await getAttendanceSheetsByClass(classId!);
      setSheets(Array.isArray((sheetRes as any)?.data) ? ((sheetRes as any).data as any[]) : []);
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to reject sheet', severity: 'error' });
    }
  };

  const handleReviewSheet = (sheet: any) => {
    setSelectedSheet(sheet);
    setReviewModalOpen(true);
  };

  const handleOpenRenew = (sheet: any) => {
    setSelectedSheet(sheet);
    setRenewModalOpen(true);
  };

  const handleRenewSuccess = async (payload: { monthlyFee: number; sessionsPerMonth: number }) => {
    if (!classId) return;
    try {
      setLoading(true);
      const res = await renewClass(classId, payload);
      if (!res.success) throw new Error(res.message || 'Failed to renew class');
      setSnackbar({ open: true, message: 'Class renewed successfully', severity: 'success' });
      await load();
      setRenewModalOpen(false);
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to renew class', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={240}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!finalClass) {
    return (
      <Box p={4}>
        <Typography>No class found.</Typography>
      </Box>
    );
  }

  const scheduleLabel = Array.isArray(finalClass.schedule?.daysOfWeek)
    ? `${finalClass.schedule.daysOfWeek.map((d: any) => typeof d === 'object' ? d.label || d.value : String(d)).join(', ')} • ${finalClass.schedule.timeSlot || ''}`
    : (typeof finalClass.schedule === 'string' ? finalClass.schedule : '-');

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Left Index */}
      <Box
        sx={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        <Box px={2} py={2.5}>
          <Typography variant="overline" color="text.secondary" display="block">
            Class
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} noWrap>
            {finalClass.className || 'Class'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {finalClass.studentName}
          </Typography>
          <Box mt={1.5} display="flex" gap={1} flexWrap="wrap">
            <Chip
              size="small"
              label={finalClass.status || 'UNKNOWN'}
              color={finalClass.status === 'ACTIVE' ? 'success' : 'default'}
            />
            {finalClass.mode ? <Chip size="small" label={finalClass.mode} variant="outlined" /> : null}
          </Box>
        </Box>

        <Divider />

        <List dense sx={{ py: 1 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={activeSection === item.id}
              onClick={() => scrollToSection(item.id)}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Box px={2} pb={2.5} mt="auto">
          <Button
            fullWidth
            variant="contained"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setEditScheduleOpen(true)}
          >
            Edit Schedule
          </Button>
        </Box>
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Box sx={{ maxWidth: 980, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
          {/* Page Title */}
          <Box mb={2.5}>
            <Typography variant="h5" fontWeight={900}>
              Class Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Managing class for {finalClass.studentName}
            </Typography>
          </Box>

          {/* Profile Summary */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" gap={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main, fontWeight: 800 }}>
                  {initials}
                </Avatar>
                <Box flex={1} minWidth={0}>
                  <Typography variant="h6" fontWeight={800} noWrap>
                    {finalClass.studentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {finalClass.grade} {finalClass.board ? `• ${finalClass.board}` : ''}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={finalClass.tutor?.name ? `Tutor: ${finalClass.tutor.name}` : 'Tutor: Unassigned'} />
                    <Chip size="small" variant="outlined" label={scheduleLabel} />
                  </Stack>
                </Box>
                <Box display="flex" gap={1}>
                  <Button variant="outlined" onClick={() => downloadAttendancePdf(finalClass.id)}>
                    Attendance PDF
                  </Button>
                  <Button variant="outlined" onClick={() => window.print()}>
                    Print
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Sections */}
          <Box id="info" sx={{ scrollMarginTop: 80 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Class Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
                  <InfoRow label="Class Name" value={finalClass.className || '-'} />
                  <InfoRow label="Mode" value={finalClass.mode || '-'} />
                  <InfoRow label="Grade" value={finalClass.grade || '-'} />
                  <InfoRow label="Board" value={finalClass.board || '-'} />
                  <InfoRow label="Subjects" value={getSubjectList(finalClass.subject).join(', ') || '-'} />
                  <InfoRow label="Start Date" value={finalClass.startDate ? new Date(finalClass.startDate as any).toLocaleDateString('en-IN') : '-'} />
                  <InfoRow label="Classes / Month" value={String(finalClass.classesPerMonth ?? '-')} />
                  <InfoRow label="Tests / Month" value={String(finalClass.testPerMonth ?? '-')} />
                  <InfoRow label="Attendance Window (days)" value={String((finalClass as any).attendanceSubmissionWindow ?? '-')} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box id="schedule" sx={{ mt: 3, scrollMarginTop: 80 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Schedule
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {scheduleLabel}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box id="attendance" sx={{ mt: 3, scrollMarginTop: 80 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="h6" fontWeight={800}>
                    Attendance Cycles
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Cycles: {sheets.length}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {sheets.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No attendance sheets found.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Period</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="center">Sessions</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sheets.map((s, idx) => (
                        <TableRow key={s._id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{idx + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{s.periodLabel}</Typography>
                            <Typography variant="caption" color="text.secondary">Cycle {s.cycleNumber}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              size="small" 
                              label={`${s.totalSessionsTaken || 0} / ${s.totalSessionsPlanned || finalClass?.classesPerMonth || '-'}`}
                              sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              label={s.status} 
                              color={s.status === 'APPROVED' ? 'success' : s.status === 'PENDING' ? 'warning' : 'error'}
                              variant="outlined"
                              sx={{ fontWeight: 800, borderRadius: 1.5, fontSize: '0.65rem' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="View Sheet">
                                <IconButton size="small" onClick={() => handleReviewSheet(s)} sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Renew Class">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOpenRenew(s)} 
                                  sx={{ color: 'warning.main', bgcolor: alpha(theme.palette.warning.main, 0.05) }}
                                >
                                  <AutorenewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box id="payments" sx={{ mt: 3, scrollMarginTop: 80 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="h6" fontWeight={800}>
                    Payments
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total records: {payments.length}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {payments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No payments found.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.slice(0, 10).map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell>{p.dueDate ? new Date(p.dueDate as any).toLocaleDateString('en-IN') : '-'}</TableCell>
                          <TableCell>{p.paymentType || '-'}</TableCell>
                          <TableCell align="right">{p.amount != null ? <>{'\u20B9'}{Number(p.amount).toLocaleString('en-IN')}</> : '-'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={p.status || '-'}
                              color={p.status === 'PAID' ? 'success' : p.status === 'OVERDUE' ? 'error' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      <Dialog open={editScheduleOpen} onClose={() => !savingSchedule && setEditScheduleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Schedule</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={scheduleStartDate}
              onChange={(e) => setScheduleStartDate(e.target.value)}
              fullWidth
              disabled={savingSchedule}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Days of Week (comma separated)"
              value={scheduleDays}
              onChange={(e) => setScheduleDays(e.target.value)}
              fullWidth
              disabled={savingSchedule}
              placeholder="Mon, Wed, Fri"
            />
            <TextField
              label="Time Slot"
              value={scheduleTimeSlot}
              onChange={(e) => setScheduleTimeSlot(e.target.value)}
              fullWidth
              disabled={savingSchedule}
              placeholder="4:00 PM - 5:30 PM"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditScheduleOpen(false)} disabled={savingSchedule}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveSchedule} disabled={savingSchedule}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {finalClass && (
        <>
          <AttendanceSheetReviewModal
            open={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            sheet={selectedSheet}
            onApprove={handleApproveSheet}
            onReject={handleRejectSheet}
          />

          <RenewClassModal
            open={renewModalOpen}
            onClose={() => setRenewModalOpen(false)}
            onRenew={handleRenewSuccess}
            initialMonthlyFee={finalClass.monthlyFees || finalClass.monthlyFee}
            initialSessionsPerMonth={finalClass.classesPerMonth || finalClass.sessionsPerMonth}
          />

          <SnackbarNotification
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          />

          <ErrorDialog
            open={showError}
            onClose={clearError}
            error={dialogError}
          />
        </>
      )}
    </Box>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <Box display="flex" justifyContent="space-between" gap={2} py={1} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} textAlign="right">
        {value}
      </Typography>
    </Box>
  );
};

export default ClassDetailPage;
