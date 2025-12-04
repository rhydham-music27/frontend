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
  Stack,
  MenuItem,
  TextField,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useSelector } from 'react-redux';
import { IAttendance, IFinalClass } from '../../types';
import * as attendanceService from '../../services/attendanceService';
import * as studentService from '../../services/studentService';
import { selectCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { ATTENDANCE_STATUS } from '../../constants';

const ParentAttendancePage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [attendances, setAttendances] = useState<IAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const [classesRes, attendanceRes] = await Promise.all([
        studentService.getParentClasses({ page: 1, limit: 100 }),
        attendanceService.getAttendances({ parentId: user.id, limit: 100 }),
      ]);

      setClasses(classesRes.data || []);
      setAttendances(attendanceRes.data || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load attendance';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredAttendances = attendances.filter((a) =>
    selectedClassId === 'all' ? true : (a.finalClass as any)?.id === selectedClassId || String((a.finalClass as any)?._id) === selectedClassId
  );

  const total = filteredAttendances.length;
  const approved = filteredAttendances.filter(
    (a) => a.status === ATTENDANCE_STATUS.APPROVED || a.status === ATTENDANCE_STATUS.PARENT_APPROVED
  ).length;
  const pending = filteredAttendances.filter((a) => a.status === ATTENDANCE_STATUS.PENDING).length;
  const rejected = filteredAttendances.filter((a) => a.status === ATTENDANCE_STATUS.REJECTED).length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  if (loading && !attendances.length) {
    return <LoadingSpinner fullScreen message="Loading attendance..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View your child&apos;s attendance history and status across classes.
      </Typography>

      <Box sx={{ mt: 2 }}>
        <ErrorAlert error={error} onClose={() => setError(null)} />
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Summary cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Sessions</Typography>
                <EventAvailableIcon color="primary" />
              </Stack>
              <Typography variant="h4">{total}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total sessions recorded
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4">{approved}</Typography>
              <Typography variant="body2" color="text.secondary">
                Approval rate: {approvalRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4">{pending}</Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting coordinator/parent review
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rejected
              </Typography>
              <Typography variant="h4">{rejected}</Typography>
              <Typography variant="body2" color="text.secondary">
                Sessions marked as rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                  select
                  label="Filter by class"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  size="small"
                  sx={{ minWidth: 220 }}
                >
                  <MenuItem value="all">All classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.studentName} - {Array.isArray(cls.subject) ? cls.subject.join(', ') : cls.subject}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance list */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance history
              </Typography>
              {filteredAttendances.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No attendance records found for the selected filters.
                </Typography>
              ) : (
                <List dense>
                  {filteredAttendances.map((a) => {
                    const cls = a.finalClass as unknown as IFinalClass | undefined;
                    const dateLabel = a.sessionDate ? new Date(a.sessionDate).toLocaleDateString() : '';
                    return (
                      <ListItem key={a.id} disableGutters>
                        <ListItemText
                          primary={
                            cls
                              ? `${cls.studentName} - ${Array.isArray(cls.subject)
                                  ? cls.subject.join(', ')
                                  : cls.subject}`
                              : 'Class session'
                          }
                          secondary={`${dateLabel} · ${a.topicCovered || 'No topic specified'}`}
                        />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={a.status}
                            size="small"
                            color={
                              a.status === ATTENDANCE_STATUS.APPROVED || a.status === ATTENDANCE_STATUS.PARENT_APPROVED
                                ? 'success'
                                : a.status === ATTENDANCE_STATUS.REJECTED
                                ? 'error'
                                : 'warning'
                            }
                          />
                          {a.status === ATTENDANCE_STATUS.REJECTED && <ErrorOutlineIcon color="error" />}
                        </Stack>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentAttendancePage;
