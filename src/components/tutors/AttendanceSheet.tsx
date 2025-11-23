import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import logoUrl from '../../assets/1.jpg';

// Local, minimal types matching the template structure.
// You can later swap these to your central types if needed.
export interface AttendanceRecord {
  classId: string;
  date: string; // YYYY-MM-DD
  status: string;
  duration?: number; // in hours
  topicsCovered?: string;
  markedAt?: string; // ISO string
}

export interface AssignedClass {
  classId: string;
  studentName: string;
  subject?: string;
  tutorName?: string;
}

export interface TutorProfile {
  attendanceRecords: AttendanceRecord[];
}

interface AttendanceSheetProps {
  tutorData: TutorProfile;
  classInfo: AssignedClass;
  range?: { start: string; end: string }; // inclusive ISO dates YYYY-MM-DD
  sheetNo?: number;
}

function toCsvValue(value: string | number | undefined): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const AttendanceSheet = forwardRef(function AttendanceSheet(
  { tutorData, classInfo, range, sheetNo }: AttendanceSheetProps,
  ref: React.Ref<{ exportPdf: () => Promise<void> }>
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const records = tutorData.attendanceRecords
    .filter(
      (r) =>
        r.classId === classInfo.classId &&
        (!range || (r.date >= range.start && r.date <= range.end))
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const csv = useMemo(() => {
    const header = ['Date', 'Status', 'Duration (h)', 'Topics Covered', 'Marked At'];
    const rows = records.map((r) => [
      r.date,
      r.status,
      r.duration ?? '',
      r.topicsCovered ?? '',
      r.markedAt ?? '',
    ]);
    return [header, ...rows]
      .map((row) => row.map(toCsvValue).join(','))
      .join('\n');
  }, [records]);

  const exportPdf = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Header with logo and title
    pdf.setFontSize(14);

    // Content image
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - 20;
    const imgProps = { w: canvas.width, h: canvas.height };
    const ratio = contentWidth / imgProps.w;
    const imgHeight = imgProps.h * ratio;
    pdf.addImage(imgData, 'PNG', 10, 28, contentWidth, imgHeight);
    const label = range ? `${range.start}_to_${range.end}` : 'sheet';
    const subjectPart = classInfo.subject || 'class';
    pdf.save(`${subjectPart}-${classInfo.studentName}-${label}.pdf`);
  };

  useImperativeHandle(ref, () => ({ exportPdf }));

  // Build table rows only for filled records (up to 21)
  const rows: Array<{
    sn: number;
    date?: string;
    duration?: number;
    topic?: string;
    marked?: string;
  }> = records.slice(0, 21).map((rec, index) => ({
    sn: index + 1,
    date: rec.date,
    duration: rec.duration ? rec.duration * 60 : undefined,
    topic: rec.topicsCovered,
    marked: rec.markedAt ? rec.markedAt.replace('T', ' ').slice(0, 16) : undefined,
  }));

  const today = new Date();
  const formattedToday = `${String(today.getDate()).padStart(2, '0')} / ${String(
    today.getMonth() + 1
  ).padStart(2, '0')} / ${today.getFullYear()}`;

  const totalMinutes = rows.reduce((sum, r) => sum + (r.duration || 0), 0);
  const totalHours = totalMinutes / 60;
  const totalHoursDisplay = totalHours ? totalHours.toFixed(1) : '0.0';

  return (
    <Box
      ref={containerRef}
      sx={{
        bgcolor: 'common.white',
        p: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: '1px solid',
        borderColor: 'grey.300',
        maxWidth: 800,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'grey.300',
        }}
      >
        <Box
          component="img"
          src={logoUrl}
          alt="logo"
          sx={{ width: 40, height: 40, objectFit: 'contain' }}
        />
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Your Shikshak – Home Tuition Attendance Sheet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Your Learning Partner
          </Typography>
        </Box>
      </Box>

      {/* Meta info */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: 1,
          rowGap: 0.5,
          fontSize: '0.75rem',
        }}
      >
        <Typography>
          Tutor Name: {classInfo.tutorName || '__________'}
        </Typography>
        <Typography>Class ID: {classInfo.classId}</Typography>
        <Typography>Attendance Sheet No. {sheetNo ?? 1}</Typography>
        <Typography>Student Name: {classInfo.studentName}</Typography>
        {range && (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography>
              Period: {range.start} – {range.end}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Table */}
      <Box component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>S. No.</TableCell>
              <TableCell sx={{ width: 120 }}>Date</TableCell>
              <TableCell sx={{ width: 140 }}>Duration (in mins)</TableCell>
              <TableCell>Topic / Chapter Covered</TableCell>
              <TableCell sx={{ width: 160 }}>Marked At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.sn}>
                <TableCell align="center">{r.sn}</TableCell>
                <TableCell>{r.date ?? ''}</TableCell>
                <TableCell>{r.duration ?? ''}</TableCell>
                <TableCell>{r.topic ?? ''}</TableCell>
                <TableCell>{r.marked ?? ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Footer */}
      <Box sx={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography>Total Teaching Hours: {totalHoursDisplay} hrs</Typography>
        <Typography>
          Tutor’s Remarks (if any): _________________________________________
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography>Parent’s Final Signature: ______________________</Typography>
          <Typography>Date: {formattedToday}</Typography>
        </Box>
      </Box>
    </Box>
  );
});

export default AttendanceSheet;
