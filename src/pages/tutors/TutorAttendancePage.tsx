import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stack,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DownloadIcon from '@mui/icons-material/Download';
import { getMyAttendanceSummary, getAttendanceByClass } from '../../services/attendanceService';
import { ApiResponse } from '../../types';
import AttendanceSheet, {
  AttendanceRecord,
  AssignedClass,
  TutorProfile,
} from '../../components/tutors/AttendanceSheet';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import ErrorAlert from '../../components/common/ErrorAlert';

interface TutorAttendanceSummaryRow {
  classId: string;
  className: string;
  studentName: string;
  totalSessionsTaken: number;
  presentCount: number;
}

const TutorAttendancePage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [rows, setRows] = useState<TutorAttendanceSummaryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const sheetRef = useRef<{ exportPdf: () => Promise<void> } | null>(null);
  const [sheetTutorData, setSheetTutorData] = useState<TutorProfile | null>(null);
  const [sheetClassInfo, setSheetClassInfo] = useState<AssignedClass | null>(null);
  const [sheetRange, setSheetRange] = useState<{ start: string; end: string } | undefined>(
    undefined
  );

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<TutorAttendanceSummaryRow[]> = await getMyAttendanceSummary();
      setRows(res.data || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load attendance summary.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth]);

  const handleDownloadSheet = async (row: TutorAttendanceSummaryRow) => {
    try {
      setDownloadingId(row.classId);

      const res = await getAttendanceByClass(row.classId);
      const attendances = (res.data || []).filter((a: any) => {
          if (!selectedMonth) return true;
          return a.sessionDate && a.sessionDate.slice(0, 7) === selectedMonth;
      });

      if (!attendances.length) {
        setDownloadingId(null);
        setError(`No attendance records found for ${selectedMonth} for this class.`);
        return;
      }

      const mapped: AttendanceRecord[] = attendances
        .map((a: any) => {
          const dateObj = a.sessionDate ? new Date(a.sessionDate as any) : null;
          const yyyyMmDd = dateObj
            ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
                dateObj.getDate()
              ).padStart(2, '0')}`
            : '';

          let durationHours =
            typeof a.durationHours === 'number'
              ? a.durationHours
              : (a.finalClass as any)?.classLead?.classDurationHours ?? undefined;

          if (typeof durationHours !== 'number') {
            durationHours = 1;
          }

          return {
            classId: row.classId,
            date: yyyyMmDd,
            status: (a as any).studentAttendanceStatus || a.status || '',
            duration: typeof durationHours === 'number' ? durationHours : undefined,
            topicsCovered: a.topicCovered || undefined,
            markedAt: a.submittedAt ? String(a.submittedAt) : a.createdAt ? String(a.createdAt) : '',
          } as AttendanceRecord;
        })
        .filter((r) => r.date);

      const dates = mapped.map((r) => r.date).sort();
      const start = dates[0];
      const end = dates[dates.length - 1];

      setSheetTutorData({ attendanceRecords: mapped });
      setSheetClassInfo({
        classId: row.className || row.classId,
        studentName: row.studentName,
        subject: row.className,
        tutorName: user?.name,
      });
      setSheetRange({ start, end });

      setTimeout(async () => {
        try {
          await sheetRef.current?.exportPdf();
        } finally {
          setDownloadingId(null);
        }
      }, 0);
    } catch (e) {
      setDownloadingId(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Attendance Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your teaching sessions, track student attendance, and generate official reports.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
              type="month"
              size="small"
              label="Select Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              sx={{ width: 180 }}
          />
          <IconButton onClick={fetchSummary} color="primary">
            <AssignmentTurnedInIcon />
          </IconButton>
        </Stack>
      </Box>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && (
        <Grid container spacing={3}>
            {rows.length === 0 ? (
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No attendance records found for this period.</Typography>
                    </Paper>
                </Grid>
            ) : (
                rows.map((row) => (
                    <Grid item xs={12} md={6} lg={4} key={row.classId}>
                        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} gutterBottom>{row.studentName}</Typography>
                                <Typography variant="body2" color="primary" sx={{ mb: 2 }}>{row.className}</Typography>
                                
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" color="text.secondary">Total Sessions:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{row.totalSessionsTaken}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={3}>
                                    <Typography variant="body2" color="text.secondary">Present:</Typography>
                                    <Typography variant="body2" fontWeight={600} color="success.main">{row.presentCount}</Typography>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => handleDownloadSheet(row)}
                                    disabled={downloadingId === row.classId}
                                >
                                    {downloadingId === row.classId ? 'Exporting...' : 'Export Attendance Report'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))
            )}
        </Grid>
      )}

      {sheetTutorData && sheetClassInfo && (
        <Box sx={{ position: 'absolute', left: -9999, top: -9999 }}>
          <AttendanceSheet
            ref={sheetRef}
            tutorData={sheetTutorData}
            classInfo={sheetClassInfo}
            range={sheetRange}
            sheetNo={1}
          />
        </Box>
      )}
    </Container>
  );
};

export default TutorAttendancePage;
