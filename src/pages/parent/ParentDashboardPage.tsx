import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Avatar,
  Tooltip,
  Divider,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { IAttendance, IFinalClass, IPayment, IParentDashboardStats } from '../../types';
import * as studentService from '../../services/studentService';
import * as attendanceService from '../../services/attendanceService';
import * as paymentService from '../../services/paymentService';
import * as tutorService from '../../services/tutorService';
import * as finalClassService from '../../services/finalClassService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { PAYMENT_STATUS } from '../../constants';
import { useNavigate } from 'react-router-dom';

const ParentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<IParentDashboardStats | null>(null);
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [pendingAttendance, setPendingAttendance] = useState<IAttendance[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryTutorTeacherId, setPrimaryTutorTeacherId] = useState<string | null>(null);
  const [primaryTutorId, setPrimaryTutorId] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const primaryClass = classes[0] as IFinalClass | undefined;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, classesRes, pendingRes, paymentsRes] = await Promise.all([
        studentService.getParentDashboardStats(),
        studentService.getParentClasses({ page: 1, limit: 5 }),
        attendanceService.getParentPendingApprovals(),
        paymentService.getParentPayments({ status: undefined }),
      ]);

      setStats(statsRes.data);
      setClasses(classesRes.data);
      setPendingAttendance(pendingRes.data || []);
      setPayments(paymentsRes.data?.payments || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load parent dashboard';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const loadPrimaryTutorTeacherId = async () => {
      if (!primaryClass || !primaryClass.tutor) {
        console.log('ParentDashboard: no primaryClass or tutor, skipping teacherId load');
        setPrimaryTutorTeacherId(null);
        setPrimaryTutorId(null);
        return;
      }

      // tutor field may be a populated user object or just a userId string
      const tutorField: any = primaryClass.tutor as any;
      const tutorUserId: string | undefined =
        typeof tutorField === 'string' ? tutorField : tutorField.id || tutorField._id;

      if (!tutorUserId) {
        console.log('ParentDashboard: tutorUserId not found on primaryClass.tutor, value =', tutorField);
        setPrimaryTutorTeacherId(null);
        setPrimaryTutorId(null);
        return;
      }
      try {
        console.log('ParentDashboard: loading tutor for user id', tutorUserId);
        const res = await tutorService.getTutorByUserId(tutorUserId);
        const tutor: any = res.data;
        console.log('ParentDashboard: tutorService.getTutorByUserId result', tutor);
        setPrimaryTutorTeacherId(tutor?.teacherId || null);
        setPrimaryTutorId(tutor?.id || tutor?._id || null);
      } catch {
        console.log('ParentDashboard: failed to load tutor by user id');
        setPrimaryTutorTeacherId(null);
        setPrimaryTutorId(null);
      }
    };
    void loadPrimaryTutorTeacherId();
  }, [primaryClass]);

  const handleApproveAttendance = async (id: string) => {
    try {
      await attendanceService.parentApprove(id);
      setPendingAttendance((prev) => prev.filter((a) => a.id !== id));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to approve attendance';
      setError(msg);
    }
  };

  const handleRequestReschedule = async () => {
    if (!primaryClass) return;
    try {
      await finalClassService.requestParentReschedule(primaryClass.id);
      setInfoMessage('Reschedule request has been sent to the tutor.');
      setError(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to request reschedule';
      setError(msg);
      setInfoMessage(null);
    }
  };

  if (loading && !stats) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

   const alerts: string[] = [];
   if (stats) {
     const att = stats.attendanceSummary;
     if (att && att.totalSessions > 0 && att.approvalRate < 90) {
       alerts.push('Attendance approval rate is below 90%. Please review recent sessions.');
     }

     const pay = stats.paymentSummary;
     if (pay && pay.overdueAmount > 0) {
       alerts.push(`You have overdue payments totaling ₹${pay.overdueAmount}.`);
     }
   }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Parent Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {primaryClass
          ? `Overview for ${primaryClass.studentName}, Grade ${primaryClass.grade} ${Array.isArray(primaryClass.subject) ? primaryClass.subject.join(', ') : primaryClass.subject}`
          : "Overview of your child's classes, attendance and payments."}
      </Typography>

      <Box sx={{ mt: 2 }}>
        <ErrorAlert error={error} onClose={() => setError(null)} />
      </Box>

      {primaryClass && (
        <Card sx={{ mt: 2, mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Class details
                </Typography>
                <Typography variant="subtitle1">
                  {primaryClass.studentName} - {Array.isArray(primaryClass.subject)
                    ? primaryClass.subject.join(', ')
                    : primaryClass.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Grade {primaryClass.grade}  {primaryClass.board}  {primaryClass.mode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Schedule: {primaryClass.schedule?.daysOfWeek?.join(', ') || 'N/A'} at{' '}
                  {primaryClass.schedule?.timeSlot || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sessions: {primaryClass.completedSessions}/{primaryClass.totalSessions}  Status:{' '}
                  {primaryClass.status}
                </Typography>
                {primaryClass.location && (
                  <Typography variant="body2" color="text.secondary">
                    Location: {primaryClass.location}
                  </Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" size="small" onClick={handleRequestReschedule}>
                    Request Reschedule
                  </Button>
                  {infoMessage && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                      {infoMessage}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 1 }} />
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
                  <Tooltip title="View tutor public profile">
                    <Avatar
                      sx={{ bgcolor: 'primary.main', cursor: 'pointer', width: 56, height: 56 }}
                      onClick={() => {
                        console.log('ParentDashboard: avatar clicked, teacherId =', primaryTutorTeacherId);
                        if (!primaryTutorTeacherId) return;
                        navigate(`/ourtutor/${primaryTutorTeacherId}`);
                      }}
                    >
                      {primaryClass.tutor?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || '?'}
                    </Avatar>
                  </Tooltip>
                  <Box>
                    <Typography variant="subtitle1">Tutor</Typography>
                    <Typography variant="body1">{primaryClass.tutor?.name || 'Tutor not assigned'}</Typography>
                    {primaryTutorTeacherId && (
                      <Typography variant="body2" color="text.secondary">
                        Teacher ID: {primaryTutorTeacherId}
                      </Typography>
                    )}
                    {/* Temporary debug info */}
                   
                    {primaryClass.tutor?.email && (
                      <Typography variant="body2" color="text.secondary">
                        {primaryClass.tutor.email}
                      </Typography>
                    )}
                    {primaryClass.tutor?.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {primaryClass.tutor.phone}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alerts
              </Typography>
              {alerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Everything looks good right now. We&apos;ll highlight important updates here.
                </Typography>
              ) : (
                <List dense>
                  {alerts.map((msg, idx) => (
                    <ListItem key={idx} disableGutters>
                      <ListItemText primary={msg} />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Summary cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Classes</Typography>
                <SchoolIcon color="primary" />
              </Stack>
              <Typography variant="h4">{stats?.totalClasses ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active: {stats?.activeClasses ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              navigate('/parent-attendance');
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Attendance</Typography>
                <EventAvailableIcon color="primary" />
              </Stack>
              <Typography variant="h4">{stats?.attendanceSummary.totalSessions ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Approved: {stats?.attendanceSummary.approvedCount ?? 0} · Pending: {stats?.attendanceSummary.pendingCount ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approval rate: {stats ? `${stats.attendanceSummary.approvalRate}%` : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Payments</Typography>
                <PaymentIcon color="primary" />
              </Stack>
              <Typography variant="h5">
                ₹{stats?.paymentSummary.totalAmount ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid: ₹{stats?.paymentSummary.paidAmount ?? 0} · Pending: ₹{stats?.paymentSummary.pendingAmount ?? 0}
              </Typography>
              <Typography variant="body2" color="error.main">
                Overdue: ₹{stats?.paymentSummary.overdueAmount ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tests summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Tests</Typography>
                <EventAvailableIcon color="primary" />
              </Stack>
              <Typography variant="h4">{stats?.upcomingTestsCount ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Upcoming tests scheduled for your child&apos;s classes.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check with your child to ensure they are prepared.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent classes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Recent Classes</Typography>
                <Chip label={`${classes.length} shown`} size="small" />
              </Stack>
              {classes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No classes found yet.
                </Typography>
              ) : (
                <List dense>
                  {classes.map((cls) => (
                    <ListItem key={cls.id} disableGutters>
                      <ListItemText
                        primary={`${cls.studentName} - ${Array.isArray(cls.subject) ? cls.subject.join(', ') : cls.subject}`}
                        secondary={`${cls.grade} · ${cls.board} · ${cls.mode}`}
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={cls.status}
                          size="small"
                          color={cls.status === 'ACTIVE' ? 'success' : 'default'}
                        />
                        <Chip
                          label={`${Math.round(
                            (cls.progressPercentage ?? cls.metrics?.progressPercentage ?? 0) || 0
                          )}% complete`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending attendance approvals */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Pending Attendance Approvals</Typography>
                <Chip label={`${pendingAttendance.length} pending`} size="small" color="warning" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Sessions appear here only after your child&apos;s class has completed all planned sessions and the
                coordinator has approved their attendance.
              </Typography>
              {pendingAttendance.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No attendance records waiting for your approval.
                </Typography>
              ) : (
                <List dense>
                  {pendingAttendance.map((att) => (
                    <ListItem
                      key={att.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="approve"
                          onClick={() => handleApproveAttendance(att.id)}
                        >
                          <CheckCircleIcon color="success" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          att.finalClass
                            ? `${att.finalClass.studentName} - ${Array.isArray(att.finalClass.subject)
                                ? att.finalClass.subject.join(', ')
                                : att.finalClass.subject}`
                            : 'Class'
                        }
                        secondary={new Date(att.sessionDate).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent payments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Recent Payments</Typography>
                <Chip label={`${payments.length} records`} size="small" />
              </Stack>
              {payments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No payments found yet.
                </Typography>
              ) : (
                <List dense>
                  {payments.map((p) => (
                    <ListItem key={p.id} disableGutters>
                      <ListItemText
                        primary={`₹${p.amount} · ${p.status}`}
                        secondary={
                          p.finalClass
                            ? `${p.finalClass.studentName} - ${Array.isArray(p.finalClass.subject)
                                ? p.finalClass.subject.join(', ')
                                : p.finalClass.subject}`
                            : undefined
                        }
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={p.status}
                          size="small"
                          color={
                            p.status === PAYMENT_STATUS.PAID
                              ? 'success'
                              : p.status === PAYMENT_STATUS.OVERDUE
                              ? 'error'
                              : 'warning'
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {p.paymentDate
                            ? new Date(p.paymentDate).toLocaleDateString()
                            : p.dueDate
                            ? `Due ${new Date(p.dueDate).toLocaleDateString()}`
                            : ''}
                        </Typography>
                        {p.status === PAYMENT_STATUS.OVERDUE && <ErrorOutlineIcon color="error" />}
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentDashboardPage;
