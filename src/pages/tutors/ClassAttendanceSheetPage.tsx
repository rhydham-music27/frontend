import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress,
    Paper,
    Breadcrumbs,
    Link,
    Stack,
    TextField,
    MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { getFinalClass } from '../../services/finalClassService';
import { getAttendanceByClass } from '../../services/attendanceService';
import { getAttendanceSheetPayments } from '../../services/attendanceSheetService';
import api from '../../services/api';
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
    const [searchParams] = useSearchParams();
    const user = useSelector(selectCurrentUser);

    const [finalClass, setFinalClass] = useState<IFinalClass | null>(null);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const [sheetNo, setSheetNo] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [payments, setPayments] = useState<{ classFees?: any | null; tutorPayout?: any | null } | null>(null);

    const sheetRef = useRef<{ exportPdf: () => Promise<void> } | null>(null);

    useEffect(() => {
        const monthFromQuery = searchParams.get('month');
        if (monthFromQuery && /^\d{4}-\d{2}$/.test(monthFromQuery)) {
            setSelectedMonth(monthFromQuery);
        }
    }, [searchParams]);

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

                try {
                    const monthNum = Number(selectedMonth.slice(5, 7));
                    const yearNum = Number(selectedMonth.slice(0, 4));
                    const sheetsRes = await api.get(`/api/attendance-sheets/class/${classId}?month=${monthNum}&year=${yearNum}`);
                    const sheets = (sheetsRes as any)?.data?.data || (sheetsRes as any)?.data || [];
                    const latestSheet = Array.isArray(sheets) ? sheets[0] : null;
                    const sheetId = latestSheet?._id || latestSheet?.id;
                    if (sheetId) {
                        const payRes = await getAttendanceSheetPayments(String(sheetId));
                        setPayments(payRes.data || null);
                    } else {
                        setPayments(null);
                    }
                } catch {
                    setPayments(null);
                }
            } catch (e: any) {
                setError(e?.response?.data?.message || 'Failed to load attendance data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [classId, selectedMonth]);

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
        subject: Array.isArray(finalClass?.subject) ? finalClass.subject.map((s: any) => typeof s === 'string' ? s : s?.label || s?.name || 'N/A').join(', ') : finalClass?.subject as any,
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
                        <TextField
                            select
                            size="small"
                            label="Sessions/Page"
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            sx={{ width: 140 }}
                        >
                            <MenuItem value={10}>10 Sessions</MenuItem>
                            <MenuItem value={20}>20 Sessions</MenuItem>
                        </TextField>
                        <TextField
                            type="number"
                            size="small"
                            label="Sheet No."
                            value={sheetNo}
                            onChange={(e) => setSheetNo(Number(e.target.value))}
                            sx={{ width: 100 }}
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
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
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
                        sheetNo={sheetNo}
                        rowsPerPage={rowsPerPage}
                        payments={payments || undefined}
                        canEditPayments={false}
                    />
                </Box>
            )}
        </Container>
    );
};

export default ClassAttendanceSheetPage;

