import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';

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
    .filter((r) => !range || (r.date >= range.start && r.date <= range.end))
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
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginLeft = 10;
    const marginRight = 10;
    const marginTop = 20;
    const headerLineGap = 5;
    const tableStartY = marginTop + headerLineGap * 5 + 14; // space for logo + brand + title + 3 lines of meta
    const rowHeight = 8;
    const rowsPerPage = 10; // exactly 10 entries per page

    const colSnWidth = 10;
    const colDateWidth = 24;
    const colStatusWidth = 24;
    const colDurationWidth = 26;
    const colMarkedWidth = 40;
    const colTopicWidth = pageWidth - marginLeft - marginRight - colSnWidth - colDateWidth - colStatusWidth - colDurationWidth - colMarkedWidth;

    const drawHeader = () => {
      // Logo (from public/1.jpg) on the left
      const logoImg = new Image();
      logoImg.src = '/1.jpg';

      const logoSize = 18;
      const logoX = marginLeft;
      const logoY = marginTop;

      // Because addImage with an HTMLImageElement is synchronous once loaded,
      // we optimistically draw text; the browser will have usually cached /1.jpg
      try {
        pdf.addImage(logoImg, 'JPEG', logoX, logoY, logoSize, logoSize);
      } catch {
        // If the image is not ready yet, skip without breaking PDF generation.
      }

      // Brand name and tagline next to logo
      pdf.setFontSize(14);
      pdf.text('YOUR SHIKSHAK', logoX + logoSize + 4, logoY + 6);
      pdf.setFontSize(9);
      pdf.text('Your Learning Partner', logoX + logoSize + 4, logoY + 12);

      // Thin divider line below brand row
      const dividerY = logoY + logoSize + 4;
      pdf.setLineWidth(0.2);
      pdf.line(marginLeft, dividerY, pageWidth - marginRight, dividerY);

      // Sheet title centered below divider
      pdf.setFontSize(11);
      const title = 'Your Shikshak  Home Tuition Attendance Sheet';
      const titleWidth = pdf.getTextWidth(title);
      const titleX = (pageWidth - titleWidth) / 2;
      const titleY = dividerY + headerLineGap + 1;
      pdf.text(title, titleX, titleY);

      // Meta info lines under title
      pdf.setFontSize(9);
      let metaY = titleY + headerLineGap;

      // Line 1: Tutor Name (left) and Class ID (right)
      if (classInfo.tutorName) {
        pdf.text(`Tutor Name: ${classInfo.tutorName}`, marginLeft, metaY);
      }
      pdf.text(`Class ID: ${classInfo.classId}`, marginLeft + 80, metaY);

      // Line 2: Attendance Sheet No. and Student Name
      metaY += headerLineGap;
      pdf.text(`Attendance Sheet No. ${sheetNo ?? 1}`, marginLeft, metaY);
      pdf.text(`Student Name: ${classInfo.studentName}`, marginLeft + 80, metaY);

      // Line 3: Period (full width)
      metaY += headerLineGap;
      if (range) {
        pdf.text(`Period: ${range.start} – ${range.end}`, marginLeft, metaY);
      }

      // Table header
      let x = marginLeft;
      const y = tableStartY;
      pdf.setFontSize(9);
      pdf.text('S. No.', x, y);
      x += colSnWidth;
      pdf.text('Date', x, y);
      x += colDateWidth;
      pdf.text('Status', x, y);
      x += colStatusWidth;
      pdf.text('Duration (mins)', x, y);
      x += colDurationWidth;
      pdf.text('Topic / Chapter', x, y);
      x += colTopicWidth;
      pdf.text('Marked At', x, y);
    };

    const totalPages = Math.max(1, Math.ceil(records.length / rowsPerPage));

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      drawHeader();

      const start = pageIndex * rowsPerPage;
      const end = start + rowsPerPage;
      const slice = records.slice(start, end);

      slice.forEach((rec, idx) => {
        const rowY = tableStartY + rowHeight * (idx + 1);
        let x = marginLeft;
        const sn = start + idx + 1;
        const durationMins = rec.duration ? rec.duration * 60 : undefined;
        const marked = rec.markedAt ? rec.markedAt.replace('T', ' ').slice(0, 16) : '';

        pdf.setFontSize(8);
        pdf.text(String(sn), x, rowY);
        x += colSnWidth;
        pdf.text(rec.date || '', x, rowY);
        x += colDateWidth;
        pdf.text(rec.status || '', x, rowY, { maxWidth: colStatusWidth });
        x += colStatusWidth;
        pdf.text(durationMins != null ? String(durationMins) : '', x, rowY);
        x += colDurationWidth;
        pdf.text(rec.topicsCovered || '', x, rowY, { maxWidth: colTopicWidth });
        x += colTopicWidth;
        pdf.text(marked, x, rowY, { maxWidth: colMarkedWidth });
      });
    }

    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  useImperativeHandle(ref, () => ({ exportPdf }));

  // Build table rows only for filled records (up to 10 per sheet)
  const rows: Array<{
    sn: number;
    date?: string;
    duration?: number;
    status?: string;
    topic?: string;
    marked?: string;
  }> = records.slice(0, 10).map((rec, index) => ({
    sn: index + 1,
    date: rec.date,
    duration: rec.duration ? rec.duration * 60 : undefined,
    status: rec.status,
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
        p: 3,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        border: '1px solid',
        borderColor: 'grey.200',
        boxShadow: 2,
        maxWidth: 900,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 1,
          px: 1,
          pt: 0.5,
          color: 'text.primary',
        }}
      >
        <Box
          component="img"
          src="/1.jpg"
          alt="logo"
          sx={{ width: 46, height: 46, objectFit: 'contain' }}
        />
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>
            YOUR SHIKSHAK
          </Typography>
          <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
            Your Learning Partner
          </Typography>
        </Box>
      </Box>

      {/* Thin divider under brand header */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          mt: 1,
        }}
      />

      {/* Centered sheet title */}
      <Typography
        variant="subtitle1"
        align="center"
        sx={{ fontWeight: 600, mt: 0.5, mb: 0.5, fontSize: '0.9rem' }}
      >
        Your Shikshak  Home Tuition Attendance Sheet
      </Typography>

      {/* Meta info */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: 2,
          rowGap: 0.75,
          fontSize: '0.8rem',
        }}
      >
        <Typography>
          Tutor Name: {classInfo.tutorName || '__________'}
        </Typography>
        <Typography>Class ID: {classInfo.classId}</Typography>
        <Typography>
          Attendance Sheet No. {sheetNo ?? 1}
        </Typography>
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
      <Box component={Paper} variant="outlined" sx={{ overflowX: 'auto', borderRadius: 2 }}>
        <Table size="small" sx={{ '& th': { bgcolor: 'grey.100', fontWeight: 600 }, '& td, & th': { fontSize: '0.8rem' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>S. No.</TableCell>
              <TableCell sx={{ width: 120 }}>Date</TableCell>
              <TableCell sx={{ width: 80 }}>Status</TableCell>
              <TableCell sx={{ width: 140 }}>Duration (mins)</TableCell>
              <TableCell>Topic / Chapter Covered</TableCell>
              <TableCell sx={{ width: 160 }}>Marked At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.sn}>
                <TableCell align="center">{r.sn}</TableCell>
                <TableCell>{r.date ?? ''}</TableCell>
                <TableCell>{r.status ?? ''}</TableCell>
                <TableCell>{r.duration ?? ''}</TableCell>
                <TableCell>{r.topic ?? ''}</TableCell>
                <TableCell>{r.marked ?? ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          mt: 1,
        }}
      >
        <Typography>Total Teaching Hours: {totalHoursDisplay} hrs</Typography>
        <Typography>
          Tutor’s Remarks (if any): _________________________________________
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography>Parent’s Final Signature: ______________________</Typography>
          <Typography>Date: {formattedToday}</Typography>
        </Box>
      </Box>
    </Box>
  );
});

export default AttendanceSheet;
