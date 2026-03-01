import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, CircularProgress, Grid, Typography, Chip, Divider, Button } from '@mui/material';
import { getFinalClass, downloadAttendancePdf } from '../../services/finalClassService';
import { IFinalClass } from '../../types';

const ClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [finalClass, setFinalClass] = useState<IFinalClass | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const res = await getFinalClass(classId);
        if (res.success) setFinalClass(res.data as IFinalClass);
        else setError(res.message || 'Failed to load class');
      } catch (e: any) {
        setError(e?.message || 'Failed to load class');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classId]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height={240}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Typography color="error">{error}</Typography></Box>;
  if (!finalClass) return <Box p={4}><Typography>No class found.</Typography></Box>;

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={700} gutterBottom>{finalClass.studentName} — {finalClass.grade}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{finalClass.subject?.join(', ')}</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Tutor</Typography>
                  <Typography>{finalClass.tutor?.name || 'Unassigned'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Schedule</Typography>
                  <Typography>
                    {Array.isArray(finalClass.schedule?.daysOfWeek)
                      ? `${finalClass.schedule.daysOfWeek.join(', ')} • ${finalClass.schedule.timeSlot || ''}`
                      : (typeof finalClass.schedule === 'string' ? finalClass.schedule : '')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Session Progress</Typography>
                  <Typography>{(finalClass as any).completedSessions || 0} / {(finalClass as any).totalSessions || 0}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip label={finalClass.status || 'Unknown'} color={finalClass.status === 'ACTIVE' ? 'success' : 'default'} />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" gap={1}>
                <Button variant="contained" onClick={() => downloadAttendancePdf(finalClass.id)}>
                  Download Attendance PDF
                </Button>
                <Button variant="outlined" onClick={() => window.print()}>
                  Print
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Quick Info</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Pending Attendance: {finalClass.metrics?.pendingAttendanceCount ?? 0}</Typography>
              <Typography variant="body2">Overdue Payments: {finalClass.metrics?.overduePaymentsCount ?? 0}</Typography>
              <Typography variant="body2">Tests / Month: {finalClass.testPerMonth ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClassDetailPage;
