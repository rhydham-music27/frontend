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
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { getFinalClass, updateFinalClassSchedule, downloadAttendancePdf } from '../../services/finalClassService';
import { getAttendanceByClass } from '../../services/attendanceService';
import { getPaymentsByClass } from '../../services/paymentService';
import { IAttendance, IFinalClass, IPayment } from '../../types';
import { getSubjectList } from '../../utils/subjectUtils';

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

      const [attRes, payRes] = await Promise.all([
        getAttendanceByClass(classId),
        getPaymentsByClass(classId),
      ]);

      setAttendance(Array.isArray((attRes as any)?.data) ? ((attRes as any).data as IAttendance[]) : []);
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
                    Attendance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Showing latest {Math.min(attendance.length, 10)} entries
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {attendance.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No attendance records found.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Topic</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendance.slice(0, 10).map((a) => (
                        <TableRow key={a.id} hover>
                          <TableCell>{a.sessionDate ? new Date(a.sessionDate as any).toLocaleDateString('en-IN') : '-'}</TableCell>
                          <TableCell>{(a as any).topicCovered || '-'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={a.status || '-'} variant="outlined" />
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
                          <TableCell align="right">{p.amount != null ? `₹${Number(p.amount).toLocaleString('en-IN')}` : '-'}</TableCell>
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
