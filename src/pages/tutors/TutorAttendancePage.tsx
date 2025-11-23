import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Button,
  CircularProgress,
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
  }, []);

  const handleDownloadSheet = async (row: TutorAttendanceSummaryRow) => {
    try {
      setDownloadingId(row.classId);

      const res = await getAttendanceByClass(row.classId);
      const attendances = res.data || [];

      if (!attendances.length) {
        setDownloadingId(null);
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

          const durationHours =
            (a.finalClass as any)?.classLead?.classDurationHours ?? undefined;

          return {
            classId: row.classId,
            date: yyyyMmDd,
            status: (a as any).studentAttendanceStatus || a.status || '',
            // duration in hours; AttendanceSheet converts to minutes
            duration: typeof durationHours === 'number' ? durationHours : undefined,
            topicsCovered: undefined,
            markedAt: a.submittedAt ? String(a.submittedAt) : a.createdAt ? String(a.createdAt) : '',
          } as AttendanceRecord;
        })
        .filter((r) => r.date);

      if (!mapped.length) {
        setDownloadingId(null);
        return;
      }

      const dates = mapped.map((r) => r.date).sort();
      const start = dates[0];
      const end = dates[dates.length - 1];

      setSheetTutorData({ attendanceRecords: mapped });
      setSheetClassInfo({
        classId: row.classId,
        studentName: row.studentName,
        subject: row.className,
        tutorName: user?.name,
      });
      setSheetRange({ start, end });

      // Wait for state update + render
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
    <Container maxWidth="xl" disableGutters>
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
            sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
          >
            Attendance Summary
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            Overview of attendance you have taken across your classes.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <AssignmentTurnedInIcon fontSize="small" />
        </Box>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
          <Typography color="error.main" variant="body2">
            {error}
          </Typography>
          <Button variant="outlined" onClick={fetchSummary}>
            Retry
          </Button>
        </Box>
      )}

      {!loading && !error && rows.length === 0 && (
        <Box py={6} display="flex" justifyContent="center">
          <Typography color="text.secondary" variant="body2">
            No attendance records found.
          </Typography>
        </Box>
      )}

      {!loading && !error && rows.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class Name</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell align="right">Total Classes Taken</TableCell>
                <TableCell align="right">Present</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.classId} hover>
                  <TableCell>{row.className}</TableCell>
                  <TableCell>{row.studentName}</TableCell>
                  <TableCell align="right">{row.totalSessionsTaken}</TableCell>
                  <TableCell align="right">{row.presentCount}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadSheet(row)}
                      disabled={downloadingId === row.classId}
                    >
                      {downloadingId === row.classId ? 'Preparing...' : 'Download Attendance'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Hidden attendance sheet used only for PDF generation */}
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
