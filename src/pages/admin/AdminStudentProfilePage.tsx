import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentsIcon from '@mui/icons-material/Payments';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import studentService from '../../services/studentService';
import finalClassService from '../../services/finalClassService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { FINAL_CLASS_STATUS } from '../../constants';

const AdminStudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedClassReschedules, setSelectedClassReschedules] = useState<any[]>([]);

  useEffect(() => {
    fetchStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchStudentData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await studentService.getStudentProfile(id);
      setStudent(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReschedules = (reschedules: any[]) => {
    setSelectedClassReschedules(reschedules || []);
    setRescheduleModalOpen(true);
  };

  const handleStatusChange = async (classId: string, newStatus: string) => {
    try {
      await finalClassService.updateClassStatus(classId, newStatus);
      setNotification({ message: `Class status updated to ${newStatus}`, severity: 'success' });
      fetchStudentData(); // Refresh data
    } catch (e: any) {
      setNotification({ message: e.message || 'Failed to update status', severity: 'error' });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Container sx={{ py: 4 }}><ErrorAlert error={error} /></Container>;
  if (!student) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header & Back Button */}
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 2 }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" fontWeight={700}>Internal Student Profile</Typography>
          <Typography variant="body2" color="text.secondary">Detailed administrative view for {student.name}</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar Info */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CardContent>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: alpha('#0F62FE', 0.1),
                  color: 'primary.main',
                  margin: '0 auto 1.5rem',
                }}
              >
                <PersonIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700}>{student.name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{student.studentId}</Typography>
              <Box mt={2} display="flex" justifyContent="center" gap={1}>
                <Chip label={student.grade} size="small" variant="outlined" color="primary" />
                <Chip label={student.gender} size="small" variant="outlined" />
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Stack spacing={2} textAlign="left">
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Email</Typography>
                  <Typography variant="body2" fontWeight={500}>{student.email || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Phone</Typography>
                  <Typography variant="body2" fontWeight={500}>{student.phone || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Address</Typography>
                  <Typography variant="body2" fontWeight={500}>{student.address || 'N/A'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Stack spacing={4}>
            {/* Section 1: Class Details */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <SchoolIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Class Details</Typography>
              </Box>
              {student.classes?.length > 0 ? (
                <Stack spacing={3}>
                  {student.classes.map((cls: any) => (
                    <Card key={cls.id || cls._id} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={8}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>{cls.className}</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {cls.subject.join(', ')} • {cls.grade} • Start Date: {new Date(cls.startDate).toLocaleDateString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4} display="flex" justifyContent="flex-end" alignItems="flex-start">
                             <FormControl size="small" sx={{ minWidth: 150 }}>
                               <InputLabel>Status</InputLabel>
                               <Select
                                 value={cls.status}
                                 label="Status"
                                 onChange={(e) => handleStatusChange(cls.id || cls._id, e.target.value)}
                               >
                                 {Object.values(FINAL_CLASS_STATUS).map((s) => (
                                   <MenuItem key={s} value={s}>{s}</MenuItem>
                                 ))}
                               </Select>
                             </FormControl>
                          </Grid>

                          <Grid item xs={12}><Divider /></Grid>

                          {/* Tutors & Coordinators */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Current Staff</Typography>
                            <Stack spacing={1}>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Tutor:</Typography>
                                <Typography variant="body2" fontWeight={500}>{cls.tutor?.name || 'Unassigned'}</Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                 <Typography variant="body2" color="text.secondary">Coordinator:</Typography>
                                 <Typography variant="body2" fontWeight={500}>{cls.coordinator?.name || 'Unassigned'}</Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Teachers Changed:</Typography>
                                <Typography variant="body2" fontWeight={500}>0 (Logs N/A)</Typography>
                              </Box>
                               <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Coordinators Changed:</Typography>
                                <Typography variant="body2" fontWeight={500}>0 (Logs N/A)</Typography>
                              </Box>
                            </Stack>
                          </Grid>

                          {/* Demo Details */}
                          <Grid item xs={12} md={6}>
                             <Typography variant="subtitle2" fontWeight={600} gutterBottom>Demo Details</Typography>
                             {cls.classLead?.demoDetails ? (
                               <Stack spacing={1}>
                                 <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Date:</Typography>
                                    <Typography variant="body2">{new Date(cls.classLead.demoDetails.demoDate).toLocaleDateString()}</Typography>
                                 </Box>
                                 <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                                    <Typography variant="body2">{cls.classLead.demoDetails.demoStatus}</Typography>
                                 </Box>
                                  <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Feedback:</Typography>
                                    <Typography variant="caption" sx={{ maxWidth: '60%', textAlign: 'right' }}>{cls.classLead.demoDetails.feedback || '-'}</Typography>
                                 </Box>
                               </Stack>
                             ) : (
                               <Typography variant="body2" color="text.secondary" fontStyle="italic">No demo details available.</Typography>
                             )}
                          </Grid>

                           <Grid item xs={12}><Divider /></Grid>

                          {/* Stats & Actions */}
                          <Grid item xs={12} md={4}>
                             <Box 
                               p={2} 
                               bgcolor="action.hover" 
                               borderRadius={2} 
                               textAlign="center" 
                               sx={{ cursor: 'pointer' }}
                               onClick={() => handleOpenReschedules(cls.oneTimeReschedules)}
                             >
                               <Typography variant="h5" fontWeight={700} color="primary">{cls.oneTimeReschedules?.length || 0}</Typography>
                               <Typography variant="caption" fontWeight={600}>Reschedules Requested</Typography>
                               <Typography variant="caption" display="block" color="text.secondary">(Click to view)</Typography>
                             </Box>
                          </Grid>
                          
                           <Grid item xs={12} md={4}>
                             <Box p={2} bgcolor="action.hover" borderRadius={2} textAlign="center">
                               {/* Filter tests for this class if multiple classes exist */}
                               <Typography variant="h5" fontWeight={700} color="info.main">{student.tests?.filter((t: any) => t.finalClass === (cls.id || cls._id)).length || 0}</Typography>
                               <Typography variant="caption" fontWeight={600}>Tests Conducted</Typography>
                             </Box>
                          </Grid>

                           <Grid item xs={12} md={4}>
                             <Box p={2} bgcolor="action.hover" borderRadius={2} textAlign="center">
                               <Typography variant="h5" fontWeight={700} color="success.main">{cls.completedSessions}/{cls.totalSessions}</Typography>
                               <Typography variant="caption" fontWeight={600}>Sessions Completed</Typography>
                             </Box>
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={600} mt={1}>Recent Logs</Typography>
                            <Typography variant="caption" color="text.secondary" fontStyle="italic">No additional logs recorded for this class.</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Card variant="outlined" sx={{ borderRadius: 2, p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No classes assigned to this student.</Typography>
                </Card>
              )}
            </Box>

            {/* Section 2: Payment History */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PaymentsIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Payment History</Typography>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {student.payments?.length > 0 ? (
                      student.payments.map((p: any) => (
                        <TableRow key={p.id || p._id}>
                          <TableCell sx={{ fontWeight: 500 }}>{p.month}</TableCell>
                          <TableCell>₹{p.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip label={p.status} size="small" variant="outlined" color={p.status === 'PAID' ? 'success' : 'warning'} />
                          </TableCell>
                          <TableCell color="text.secondary">
                            {p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>No payment records found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Section 3: Attendance Snapshot */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EventAvailableIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Attendance Snapshot</Typography>
              </Box>
              <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Grid container spacing={2} mt={1}>
                  {['PRESENT', 'ABSENT', 'LATE'].map((status) => {
                    const stat = student.attendanceStats?.find((s: any) => s._id === status);
                    return (
                      <Grid item xs={4} key={status}>
                        <Box p={2} sx={{ bgcolor: alpha(status === 'PRESENT' ? '#10B981' : status === 'ABSENT' ? '#EF4444' : '#F59E0B', 0.05), borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight={700} color={status === 'PRESENT' ? 'success.main' : status === 'ABSENT' ? 'error.main' : 'warning.main'}>
                            {stat?.count || 0}
                          </Typography>
                          <Typography variant="caption" fontWeight={600} color="text.secondary">{status}</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
                <Box mt={3}>
                   <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                     * Attendance history can be viewed in detail from the specific Class page.
                   </Typography>
                </Box>
              </Card>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Reschedule Modal */}
      <Dialog open={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">One-Time Reschedules</Typography>
            <IconButton onClick={() => setRescheduleModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedClassReschedules.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                     <TableCell>From</TableCell>
                     <TableCell>To</TableCell>
                     <TableCell>Time Slot</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedClassReschedules.map((r: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(r.fromDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(r.toDate).toLocaleDateString()}</TableCell>
                      <TableCell>{r.timeSlot}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box py={3} textAlign="center">
              <Typography color="text.secondary">No reschedules requested.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <SnackbarNotification
        open={!!notification}
        message={notification?.message || ''}
        severity={notification?.severity || 'success'}
        onClose={() => setNotification(null)}
      />
    </Container>
  );
};

export default AdminStudentProfilePage;
