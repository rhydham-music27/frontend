import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Box, Typography, Grid, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import RenewClassModal from '../../components/classes/RenewClassModal';
import finalClassService from '../../services/finalClassService';
import RefreshIcon from '@mui/icons-material/Refresh';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AttendanceSheet, {
  AttendanceRecord,
  AssignedClass,
  TutorProfile,
} from '../../components/tutors/AttendanceSheet';
import { getAttendanceByClass } from '../../services/attendanceService';
import {
  getCoordinatorPendingSheets,
  approveAttendanceSheet,
  rejectAttendanceSheet,
  getAttendanceSheetPayments,
  updateAttendanceSheetPaymentStatus,
} from '../../services/attendanceSheetService';
import { IAttendanceSheet } from '../../types';
import useAuth from '../../hooks/useAuth';

const AttendanceApprovalPage: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  const [renewClassId, setRenewClassId] = useState<string | null>(null);
  const [renewInitialData, setRenewInitialData] = useState<{ fee?: number; sessions?: number }>({});
  const [pendingSheets, setPendingSheets] = useState<IAttendanceSheet[]>([]);
  const [renewModalOpen, setRenewModalOpen] = useState(false);

  // Dialog States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{ title: string; message: string; onConfirm: () => void; severity?: any }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleOpenRenewModal = (finalClass: any) => {
    setRenewClassId(finalClass?.id || finalClass?._id || '');
    setRenewInitialData({
      fee: finalClass?.monthlyFee,
      sessions: finalClass?.sessionsPerMonth
    });
    setRenewModalOpen(true);
  };

  const handleCloseRenewModal = () => {
    setRenewModalOpen(false);
    setRenewClassId(null);
  };

  const handleRenewClass = async (payload: { monthlyFee: number; sessionsPerMonth: number }) => {
    if (!renewClassId) return;
    setLoading(true);
    try {
      await finalClassService.renewClass(renewClassId, payload);
      setSnackbar({ open: true, message: 'Class renewed successfully', severity: 'success' });
      const res = await getCoordinatorPendingSheets();
      setPendingSheets(res.data || []);
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.message || 'Failed to renew class', severity: 'error' });
    } finally {
      setLoading(false);
      handleCloseRenewModal();
    }
  };
  const sheetRef = useRef<{ exportPdf: () => Promise<void> } | null>(null);
  const [sheetTutorData, setSheetTutorData] = useState<TutorProfile | null>(null);
  const [sheetClassInfo, setSheetClassInfo] = useState<AssignedClass | null>(null);
  const [sheetRange, setSheetRange] = useState<{ start: string; end: string } | undefined>();
  const [sheetPayments, setSheetPayments] = useState<{ classFees?: any | null; tutorPayout?: any | null } | null>(null);
  const [activeSheetId, setActiveSheetId] = useState<string>('');
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getCoordinatorPendingSheets();
        setPendingSheets(res.data || []);
      } catch {
        setPendingSheets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRefresh = useCallback(() => {
    setSnackbar({ open: true, message: 'Refreshing data...', severity: 'info' });
    (async () => {
      setLoading(true);
      try {
        const res = await getCoordinatorPendingSheets();
        setPendingSheets(res.data || []);
      } catch {
        setPendingSheets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApproveSheet = useCallback(
    async (sheetId: string) => {
      setLoading(true);
      try {
        await approveAttendanceSheet(sheetId);
        setSnackbar({ open: true, message: 'Attendance sheet approved', severity: 'success' });
        const res = await getCoordinatorPendingSheets();
        setPendingSheets(res.data || []);
      } catch (e: any) {
        setSnackbar({ open: true, message: e?.message || 'Failed to approve sheet', severity: 'error' });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleViewMonthlySheet = useCallback(
    async (sheet: IAttendanceSheet) => {
      try {
        const sheetIdStr = String((sheet as any)?.id || (sheet as any)?._id || '');
        setActiveSheetId(sheetIdStr);
        const finalClass: any = sheet.finalClass || {};
        const classIdStr = String(finalClass.id || finalClass._id || '');
        if (!classIdStr) {
          setSnackbar({ open: true, message: 'Class information missing for this sheet', severity: 'error' });
          return;
        }

        if (sheetIdStr) {
          try {
            const payRes = await getAttendanceSheetPayments(sheetIdStr);
            setSheetPayments(payRes.data || null);
          } catch {
            setSheetPayments(null);
          }
        }

        const res = await getAttendanceByClass(classIdStr);
        const attendances = (res.data || []) as any[];
        if (!attendances.length) {
          setSnackbar({ open: true, message: 'No attendance records found for this class', severity: 'info' });
          return;
        }

        const year = sheet.year;
        const month = sheet.month; // 1-12
        const monthStr = String(month).padStart(2, '0');

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
              classId: classIdStr,
              date: yyyyMmDd,
              status: (a as any).studentAttendanceStatus || a.status || '',
              duration: typeof durationHours === 'number' ? durationHours : undefined,
              topicsCovered: a.topicCovered || undefined,
              markedAt: a.submittedAt
                ? String(a.submittedAt)
                : a.createdAt
                  ? String(a.createdAt)
                  : '',
            } as AttendanceRecord;
          })
          .filter((r) => r.date && r.date.startsWith(`${year}-${monthStr}`));

        if (!mapped.length) {
          setSnackbar({ open: true, message: 'No attendance records for this month', severity: 'info' });
          return;
        }

        const firstDay = `${year}-${monthStr}-01`;
        const lastDate = new Date(year, month, 0).getDate();
        const lastDay = `${year}-${monthStr}-${String(lastDate).padStart(2, '0')}`;

        setSheetTutorData({ attendanceRecords: mapped } as TutorProfile);
        setSheetClassInfo({
          classId: finalClass.className || classIdStr,
          studentName: finalClass.studentName || '',
          subject: Array.isArray(finalClass.subject)
            ? finalClass.subject.map((s: any) => typeof s === 'string' ? s : s?.label || s?.name || 'N/A').join(', ')
            : (typeof finalClass.subject === 'object' && finalClass.subject !== null ? (finalClass.subject as any).label || (finalClass.subject as any).name || 'N/A' : String(finalClass.subject || '')),
          tutorName: user?.name || 'Tutor',
        } as AssignedClass);
        setSheetRange({ start: firstDay, end: lastDay });

        setTimeout(async () => {
          try {
            await sheetRef.current?.exportPdf();
          } catch {
            // ignore
          }
        }, 0);
      } catch (e: any) {
        setSnackbar({ open: true, message: e?.message || 'Failed to prepare attendance sheet PDF', severity: 'error' });
      }
    },
    [user?.name]
  );

  const handleUpdatePaymentStatus = useCallback(async (paymentId: string, status: string) => {
    if (!activeSheetId) return;

    try {
      await updateAttendanceSheetPaymentStatus(activeSheetId, paymentId, status);
      const payRes = await getAttendanceSheetPayments(activeSheetId);
      setSheetPayments(payRes.data || null);
      setSnackbar({ open: true, message: 'Payment status updated', severity: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to update payment status', severity: 'error' });
    }
  }, [activeSheetId]);

  const handleRejectSheet = useCallback(
    async (sheetId: string) => {
      setRejectId(sheetId);
      setRejectReason('');
      setRejectOpen(true);
    },
    []
  );

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
          color: 'white',
          py: { xs: 4, md: 5 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 2, md: 3 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Attendance Approvals
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
              Review and approve monthly attendance sheets submitted by tutors.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Abstract shapes */}
        <Box sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -50,
          left: 100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>

      {error && (
        <Box mb={2}>
          <ErrorAlert error={error} />
        </Box>
      )}

      <Box>
        {loading && pendingSheets.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Pending Monthly Sheets ({pendingSheets.length})
            </Typography>

            {pendingSheets.length === 0 ? (
              <Box
                textAlign="center"
                py={8}
                bgcolor="background.paper"
                borderRadius={3}
                border="1px dashed"
                borderColor="divider"
              >
                <Typography variant="body1" color="text.secondary">
                  No pending attendance sheets
                </Typography>
              </Box>
            ) : (
              pendingSheets.map((sheet, idx) => {
                const sheetId = String((sheet as any)?.id || (sheet as any)?._id || '');
                return (
                <Box
                  key={sheetId || `${sheet.periodLabel || `${sheet.month}/${sheet.year}`}-${idx}`}
                  sx={{
                    mb: 2,
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {sheet.finalClass?.studentName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Array.isArray(sheet.finalClass?.subject)
                          ? sheet.finalClass.subject.map((s: any) => typeof s === 'string' ? s : s?.label || s?.name || 'N/A').join(', ')
                          : (typeof sheet.finalClass?.subject === 'object' && sheet.finalClass?.subject !== null ? (sheet.finalClass.subject as any).label || (sheet.finalClass.subject as any).name || 'N/A' : String(sheet.finalClass?.subject || ''))}
                      </Typography>
                    </Box>
                    <Chip
                      label={sheet.periodLabel || `${sheet.month}/${sheet.year}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        SESSIONS
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {sheet.totalSessionsTaken ?? 0} / {sheet.totalSessionsPlanned ?? '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        PRESENT
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {sheet.presentCount ?? 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        ABSENT
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="error.main">
                        {sheet.absentCount ?? 0}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box display="flex" gap={1.5} flexWrap="wrap">
                    <Button variant="outlined" size="small" onClick={() => handleViewMonthlySheet(sheet)}>
                      View Sheet
                    </Button>
                    <Box flex={1} />
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleRejectSheet(sheetId)}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setConfirmData({
                          title: 'Approve Attendance Sheet',
                          message: 'Approve this sheet and create a one-time payout?',
                          severity: 'success',
                          onConfirm: () => {
                            handleApproveSheet(sheetId);
                            setConfirmOpen(false);
                          }
                        });
                        setConfirmOpen(true);
                      }}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => handleOpenRenewModal(sheet.finalClass)}
                      disabled={loading}
                      sx={{ ml: 1 }}
                    >
                      Renew
                    </Button>
                  </Box>
                </Box>
                );
              })
            )}
          </>
        )}
      </Box>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
      {sheetTutorData && sheetClassInfo && (
        <Box sx={{ position: 'absolute', left: -9999, top: -9999 }}>
          <AttendanceSheet
            ref={sheetRef}
            tutorData={sheetTutorData}
            classInfo={sheetClassInfo}
            range={sheetRange}
            sheetNo={1}
            payments={sheetPayments || undefined}
            canEditPayments={true}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
          />
        </Box>
      )}
      <RenewClassModal
        open={renewModalOpen}
        onClose={handleCloseRenewModal}
        onRenew={handleRenewClass}
        isAdmin={true}
        initialMonthlyFee={renewInitialData.fee}
        initialSessionsPerMonth={renewInitialData.sessions}
      />
      <ConfirmDialog
        open={confirmOpen}
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={confirmData.onConfirm}
        onClose={() => setConfirmOpen(false)}
        severity={confirmData.severity}
      />

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject Attendance Sheet</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this sheet is being rejected..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            disabled={!rejectReason.trim()}
            onClick={async () => {
              const id = rejectId!;
              const reason = rejectReason;
              setRejectOpen(false);
              setLoading(true);
              try {
                await rejectAttendanceSheet(id, reason);
                setSnackbar({ open: true, message: 'Attendance sheet rejected', severity: 'success' });
                const res = await getCoordinatorPendingSheets();
                setPendingSheets(res.data || []);
              } catch (e: any) {
                setSnackbar({ open: true, message: e?.message || 'Failed to reject sheet', severity: 'error' });
              } finally {
                setLoading(false);
              }
            }}
          >
            Reject Sheet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceApprovalPage;

