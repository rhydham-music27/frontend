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

export interface AttendanceSheetProps {
  tutorData: TutorProfile;
  classInfo: AssignedClass;
  range?: { start: string; end: string };
  sheetNo?: number;
  rowsPerPage?: number;
}

function toCsvValue(value: string | number | undefined): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const AttendanceSheet = forwardRef(function AttendanceSheet(
  { tutorData, classInfo, range, sheetNo = 1, rowsPerPage = 10 }: AttendanceSheetProps,
  ref: React.Ref<{ exportPdf: () => Promise<void> }>
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const records = useMemo(() => {
    return tutorData.attendanceRecords
      .filter((r) => !range || (r.date >= range.start && r.date <= range.end))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [tutorData.attendanceRecords, range]);

  const chunks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < records.length; i += rowsPerPage) {
      arr.push(records.slice(i, i + rowsPerPage));
    }
    if (arr.length === 0) arr.push([]); // Show at least one empty sheet if no records
    return arr;
  }, [records, rowsPerPage]);

  const exportPdf = async () => {
    if (!containerRef.current) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const sheetElements = containerRef.current.querySelectorAll('.physical-sheet');

    for (let i = 0; i < sheetElements.length; i++) {
      const element = sheetElements[i] as HTMLElement;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    }

    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  useImperativeHandle(ref, () => ({ exportPdf }));

  const today = new Date();
  const formattedToday = `${String(today.getDate()).padStart(2, '0')} / ${String(
    today.getMonth() + 1
  ).padStart(2, '0')} / ${today.getFullYear()}`;

  return (
    <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {chunks.map((chunk, chunkIndex) => {
        const currentSheetNo = sheetNo + chunkIndex;
        const totalMinutes = chunk.reduce((sum, r) => sum + (r.duration || 0) * 60, 0);
        const totalHours = totalMinutes / 60;
        const totalHoursDisplay = totalHours ? totalHours.toFixed(1) : '0.0';

        return (
          <Box
            key={chunkIndex}
            className="physical-sheet"
            sx={{
              bgcolor: 'common.white',
              p: 6,
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              border: '1px solid',
              borderColor: 'grey.100',
              boxShadow: 'none',
              width: '210mm',
              minHeight: '297mm',
              position: 'relative',
              boxSizing: 'border-box',
              '*': {
                letterSpacing: '0.01em !important',
                lineHeight: '1.3 !important',
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif !important'
              },
              '@media print': {
                border: 'none',
                p: 0
              }
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
              variant="h6"
              align="center"
              sx={{
                fontWeight: 700,
                mt: 1,
                mb: 1,
                fontSize: '1.2rem',
                textTransform: 'uppercase',
                color: 'primary.main'
              }}
            >
              Attendance Sheet
            </Typography>

            {/* Meta info */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                rowGap: 1.5,
                columnGap: 4,
                px: 1,
              }}
            >
              <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  <strong>Tutor Name:</strong> {classInfo.tutorName || '__________'}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  <strong>Class ID:</strong> {classInfo.classId}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  <strong>Sheet No:</strong> {currentSheetNo}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  <strong>Student Name:</strong> {classInfo.studentName}
                </Typography>
              </Box>
              {range && (
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                    <strong>Period:</strong> {range.start} – {range.end}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Table */}
            <Box component={Paper} variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1, mt: 1 }}>
              <Table size="small" sx={{ '& th': { bgcolor: 'grey.50', fontWeight: 700, borderBottom: '2px solid', borderColor: 'grey.300' }, '& td, & th': { fontSize: '0.85rem', py: 1, borderRight: '1px solid', borderColor: 'grey.200' }, '& td:last-child, & th:last-child': { borderRight: 'none' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ width: '8%', minWidth: '50px' }}>S. No.</TableCell>
                    <TableCell align="center" sx={{ width: '15%', minWidth: '100px' }}>Date</TableCell>
                    <TableCell align="center" sx={{ width: '12%', minWidth: '80px' }}>Status</TableCell>
                    <TableCell align="center" sx={{ width: '15%', minWidth: '120px' }}>Duration (mins)</TableCell>
                    <TableCell align="center">Topic / Chapter Covered</TableCell>
                    <TableCell align="center" sx={{ width: '18%', minWidth: '140px' }}>Marked At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chunk.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell align="center">{chunkIndex * rowsPerPage + idx + 1}</TableCell>
                      <TableCell align="center">{r.date ?? ''}</TableCell>
                      <TableCell align="center">{r.status ?? ''}</TableCell>
                      <TableCell align="center">{r.duration ? r.duration * 60 : ''}</TableCell>
                      <TableCell sx={{ px: 2 }}>{r.topicsCovered ?? ''}</TableCell>
                      <TableCell align="center">{r.markedAt ? r.markedAt.replace('T', ' ').slice(0, 16) : ''}</TableCell>
                    </TableRow>
                  ))}
                  {/* Fill empty rows if less than rowsPerPage to keep height consistent */}
                  {Array.from({ length: rowsPerPage - chunk.length }).map((_, i) => (
                    <TableRow key={`empty-${i}`} sx={{ height: 33 }}>
                      <TableCell align="center">{chunkIndex * rowsPerPage + chunk.length + i + 1}</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                mt: 'auto', // Push to bottom
                pb: 2
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Teaching Hours: {totalHoursDisplay} hrs</Typography>
              <Typography variant="body2">
                Tutor’s Remarks (if any): __________________________________________________________________
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, mt: 1 }}>
                <Typography variant="body2">Parent’s Final Signature: ______________________</Typography>
                <Typography variant="body2">Date: {formattedToday}</Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
});

export default AttendanceSheet;
