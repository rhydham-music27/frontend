import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Breadcrumbs,
    Link,
    Stack,
    TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { getFinalClass } from '../../services/finalClassService';
import { getAttendanceByClass } from '../../services/attendanceService';
import AttendanceSheet, {
    AttendanceRecord,
    AssignedClass,
    TutorProfile,
} from '../../components/tutors/AttendanceSheet';
import { IFinalClass } from '../../types';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

const ClassAttendanceSheetPage: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);

    const [finalClass, setFinalClass] = useState<IFinalClass | null>(null);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

    const sheetRef = useRef<{ exportPdf: () => Promise<void> } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!classId) return;
            try {
                setLoading(true);
                const [classRes, attendanceRes] = await Promise.all([
                    getFinalClass(classId),
                    getAttendanceByClass(classId)
                ]);
                setFinalClass(classRes.data);
                setAttendances(attendanceRes.data || []);
            } catch (e: any) {
                setError(e?.response?.data?.message || 'Failed to load attendance data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [classId]);

    const filteredAttendances = attendances.filter((a: any) => {
        if (!selectedMonth) return true;
        return a.sessionDate && a.sessionDate.slice(0, 7) === selectedMonth;
    });

    const mappedRecords: AttendanceRecord[] = filteredAttendances.map((a: any) => {
        const dateObj = a.sessionDate ? new Date(a.sessionDate) : null;
        const yyyyMmDd = dateObj
            ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
                dateObj.getDate()
            ).padStart(2, '0')}`
            : '';

        let durationHours =
            typeof a.durationHours === 'number'
                ? a.durationHours
                : (finalClass as any)?.classLead?.classDurationHours ?? 1;

        return {
            classId: classId || '',
            date: yyyyMmDd,
            status: a.studentAttendanceStatus || a.status || '',
            duration: durationHours,
            topicsCovered: a.topicCovered || undefined,
            markedAt: a.submittedAt ? String(a.submittedAt) : a.createdAt ? String(a.createdAt) : '',
        };
    }).filter(r => r.date);

    const sheetTutorData: TutorProfile = { attendanceRecords: mappedRecords };
    const sheetClassInfo: AssignedClass = {
        classId: finalClass?.className || classId || '',
        studentName: finalClass?.studentName || '',
        subject: Array.isArray(finalClass?.subject) ? finalClass.subject.join(', ') : finalClass?.subject as any,
        tutorName: user?.name || 'Tutor',
    };

    const sheetRange = mappedRecords.length > 0 ? {
        start: mappedRecords.sort((a, b) => a.date.localeCompare(b.date))[0].date,
        end: mappedRecords.sort((a, b) => b.date.localeCompare(a.date))[0].date
    } : undefined;

    const handleDownloadPdf = async () => {
        if (sheetRef.current) {
            await sheetRef.current.exportPdf();
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading attendance sheet...</Typography>
            </Container>
        );
    }

    if (error || !finalClass) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <ErrorAlert error={error || 'Class not found'} />
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Go Back</Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box mb={4}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link component="button" variant="body2" onClick={() => navigate('/tutor-classes')} underline="hover" color="inherit">
                        My Classes
                    </Link>
                    <Typography variant="body2" color="text.primary">Attendance Sheet</Typography>
                </Breadcrumbs>

                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Attendance Sheet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Viewing attendance for <strong>{finalClass.studentName}</strong> ({finalClass.className || 'No class name'})
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            type="month"
                            size="small"
                            label="Filter Month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            sx={{ width: 160 }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadPdf}
                            disabled={mappedRecords.length === 0}
                        >
                            Download PDF
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                    </Stack>
                </Box>
            </Box>

            {mappedRecords.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <AssignmentTurnedInIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No attendance records found for this month.</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try selecting a different month or mark today's attendance from the classes page.
                    </Typography>
                </Paper>
            ) : (
                <Box display="flex" justifyContent="center">
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

export default ClassAttendanceSheetPage;
