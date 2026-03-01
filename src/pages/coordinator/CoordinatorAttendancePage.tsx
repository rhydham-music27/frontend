import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import attendanceService from '../../services/attendanceService';

const CoordinatorAttendancePage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [loading, setLoading] = useState(false);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetch = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await attendanceService.getAttendanceByClass(classId);
      if (res.success) setAttendances(res.data || []);
      else setError(res.message || 'Failed to fetch attendances');
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch attendances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [classId]);

  const handleApprove = async (id: string) => {
    try {
      await attendanceService.coordinatorApprove(id);
      fetch();
    } catch (e) { /* ignore */ }
  };

  const handleReject = (id: string) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedId) return;
    try {
      await attendanceService.rejectAttendance(selectedId, rejectionReason || '');
      setConfirmOpen(false);
      setRejectionReason('');
      fetch();
    } catch (e) { }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box p={3}>
      <Stack spacing={2}>
        <Typography variant="h5">Attendance — Class {classId}</Typography>
        <Card>
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell>Present</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendances.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{new Date(a.sessionDate).toLocaleDateString()}</TableCell>
                      <TableCell>{a.topicCovered || a.notes || '-'}</TableCell>
                      <TableCell>{Array.isArray(a.studentAttendance) ? a.studentAttendance.filter((s: any) => s.status === 'PRESENT').length : '-'}</TableCell>
                      <TableCell>{a.status || 'N/A'}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleApprove(a.id)} variant="contained">Approve</Button>
                        <Button size="small" onClick={() => handleReject(a.id)} variant="outlined" sx={{ ml: 1 }}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Reject Attendance</DialogTitle>
        <DialogContent>
          <TextField value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} label="Reason" fullWidth multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmReject}>Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoordinatorAttendancePage;
