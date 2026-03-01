import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { IFinalClass, ITest } from '../../types';
import { FINAL_CLASS_STATUS, TEST_STATUS } from '../../constants';
import { getTests, uploadTestPaper, uploadTestAnswerSheet } from '../../services/testService';
import { getMyClasses } from '../../services/finalClassService';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import ScheduleTestModal from '../../components/tutors/ScheduleTestModal';
import ErrorAlert from '../../components/common/ErrorAlert';

const TutorTestsPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [tests, setTests] = useState<ITest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [fileMap, setFileMap] = useState<Record<string, File | null>>({});
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [successMap, setSuccessMap] = useState<Record<string, string | null>>({});
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});

  const [currentTab, setCurrentTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalTestId, setReportModalTestId] = useState<string | null>(null);
  const [reportTopic, setReportTopic] = useState('');
  const [reportTotalMarks, setReportTotalMarks] = useState<string>('');
  const [reportObtainedMarks, setReportObtainedMarks] = useState<string>('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleModalClass, setScheduleModalClass] = useState<IFinalClass | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const testsPromise = getTests({ page: 1, limit: 50 });

      let classesResp: { data: IFinalClass[] } = { data: [] };
      if (user) {
        const tutorId = (user as any).id || (user as any)._id;
        classesResp = await getMyClasses(tutorId, FINAL_CLASS_STATUS.ACTIVE);
      }

      const testsResp = await testsPromise;

      setTests(testsResp.data || []);
      setClasses(classesResp.data || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to load tests';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const openReportModal = (testId: string) => {
    setReportModalTestId(testId);
    setReportError(null);
    setReportFile(null);
    // Prefill from test if available
    const t = tests.find((x) => String((x as any).id || (x as any)._id) === String(testId));
    const existingTotal = (t as any)?.totalMarks as number | undefined;
    const existingObtained = (t as any)?.obtainedMarks as number | undefined;
    const existingTopic = (t as any)?.topicName as string | undefined;
    setReportTotalMarks(
      typeof existingTotal === 'number' && Number.isFinite(existingTotal) ? String(existingTotal) : ''
    );
    setReportObtainedMarks(
      typeof existingObtained === 'number' && Number.isFinite(existingObtained)
        ? String(existingObtained)
        : ''
    );
    setReportTopic(existingTopic || '');
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportModalTestId(null);
    setReportTopic('');
    setReportTotalMarks('');
    setReportObtainedMarks('');
    setReportFile(null);
    setReportSubmitting(false);
    setReportError(null);
  };

  const handleReportFileChange = (file: File | null) => {
    setReportFile(file);
    setReportError(null);
  };

  const handleSubmitReport = async () => {
    if (!reportModalTestId) return;
    if (!reportFile) {
      setReportError('Please upload the answer sheet file.');
      return;
    }

    const total = reportTotalMarks.trim() !== '' ? Number(reportTotalMarks) : NaN;
    const obtained = reportObtainedMarks.trim() !== '' ? Number(reportObtainedMarks) : NaN;

    if (!Number.isFinite(total) || total <= 0) {
      setReportError('Please enter a valid total marks value.');
      return;
    }
    if (!Number.isFinite(obtained) || obtained < 0 || obtained > total) {
      setReportError('Obtained marks must be between 0 and total marks.');
      return;
    }

    try {
      setReportSubmitting(true);
      setReportError(null);

      await uploadTestAnswerSheet(reportModalTestId, reportFile, {
        topicName: reportTopic.trim() || undefined,
        totalMarks: total,
        obtainedMarks: obtained,
      });

      // Refresh tests so latest marks and URLs are visible
      await loadData();
      closeReportModal();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to upload test report';
      setReportError(msg);
      setReportSubmitting(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        await loadData();
      } catch {
        // loadData already handles error state
      }
    };

    void run();
  }, [loadData]);

  const unscheduledClasses = useMemo(() => {
    if (!classes.length) return [] as IFinalClass[];

    const classIdsWithTests = new Set(
      tests
        .map((t) => {
          const fc: any = t.finalClass as any;
          if (!fc) return null;
          return String(fc.id || fc._id || '');
        })
        .filter((id): id is string => Boolean(id))
    );

    return classes.filter((cls) => {
      const id = String((cls as any).id || (cls as any)._id || '');
      if (!id) return false;
      return !classIdsWithTests.has(id);
    });
  }, [classes, tests]);

  const handleFileChange = (testId: string, file: File | null) => {
    setFileMap((prev) => ({ ...prev, [testId]: file }));
    setSuccessMap((prev) => ({ ...prev, [testId]: null }));
  };

  const handleUpload = async (testId: string) => {
    const file = fileMap[testId];
    if (!file) {
      setSuccessMap((prev) => ({ ...prev, [testId]: null }));
      setError('Please select a file first.');
      return;
    }
    const marksRaw = marksMap[testId];
    const totalMarks = marksRaw != null && marksRaw !== '' ? Number(marksRaw) : NaN;
    if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
      setError('Please enter valid total marks before uploading.');
      return;
    }
    try {
      setUploadingMap((prev) => ({ ...prev, [testId]: true }));
      setError(null);
      setSuccessMap((prev) => ({ ...prev, [testId]: null }));
      // Derive duration from class duration (in hours) if available on the test's finalClass
      const t = tests.find((x) => String((x as any).id || (x as any)._id) === String(testId));
      const classDurationHours = (t as any)?.finalClass?.classLead?.classDurationHours as number | undefined;
      const durationMinutes =
        typeof classDurationHours === 'number' && Number.isFinite(classDurationHours)
          ? Math.round(classDurationHours * 60)
          : undefined;

      await uploadTestPaper(testId, file, { totalMarks, durationMinutes });
      setSuccessMap((prev) => ({ ...prev, [testId]: 'Test paper uploaded successfully.' }));
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to upload test paper';
      setError(msg);
    } finally {
      setUploadingMap((prev) => ({ ...prev, [testId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TEST_STATUS.SCHEDULED:
        return 'primary';
      case TEST_STATUS.COMPLETED:
      case TEST_STATUS.REPORT_SUBMITTED:
        return 'success';
      case TEST_STATUS.CANCELLED:
        return 'default';
      default:
        return 'default';
    }
  };

  const openScheduleModalForClass = (cls: IFinalClass) => {
    setScheduleModalClass(cls);
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    setScheduleModalClass(null);
  };

  const filteredTests = useMemo(() => {
    let list = tests;
    if (selectedMonth) {
        list = list.filter(t => t.testDate && new Date(t.testDate).toISOString().slice(0, 7) === selectedMonth);
    }
    if (currentTab === 0) {
        // Pending: Scheduled or In Progress (if we had such status)
        return list.filter(t => t.status === TEST_STATUS.SCHEDULED);
    } else {
        // Completed: Report Submitted or Completed
        return list.filter(t => t.status === TEST_STATUS.REPORT_SUBMITTED || t.status === TEST_STATUS.COMPLETED);
    }
  }, [tests, currentTab, selectedMonth]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && !tests.length && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      )}

      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
            <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
            <Typography variant="h4" fontWeight={700}>
                Test Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Track scheduled tests, upload question papers, and submit student performance reports.
            </Typography>
            </Box>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
            <TextField
                type="month"
                size="small"
                label="Filter by Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                sx={{ width: 180 }}
            />
        </Stack>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_e, v) => setCurrentTab(v)} aria-label="test tabs">
          <Tab 
            label={
                <Box display="flex" alignItems="center" gap={1}>
                    Pending Tests
                    <Chip size="small" label={tests.filter(t => t.status === TEST_STATUS.SCHEDULED).length} />
                </Box>
            } 
          />
          <Tab label="Report Submitted" />
        </Tabs>
      </Box>

      <Box mb={2}>
        <ErrorAlert error={error} onClose={() => setError(null)} />
      </Box>

      {unscheduledClasses.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Active classes without any tests scheduled
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These classes do not have any tests scheduled yet.
              Tests can only be scheduled after a coordinator is assigned to the class.
            </Typography>
            <Grid container spacing={2}>
              {unscheduledClasses.map((cls) => {
                const hasCoordinator = Boolean((cls as any).coordinator);
                return (
                <Grid item xs={12} md={6} key={cls.id}>
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 1,
                      p: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {cls.studentName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(cls.subject || []).join(', ')} • Grade {cls.grade}
                    </Typography>
                    <Box mt={1.5}>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={!hasCoordinator}
                        onClick={() => hasCoordinator && openScheduleModalForClass(cls)}
                      >
                        Schedule Test
                      </Button>
                      {!hasCoordinator && (
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                          Coordinator not assigned yet.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              )})}
            </Grid>
          </CardContent>
        </Card>
      )}

      {tests.length === 0 && !loading && (
        <Typography variant="body2" color="text.secondary">
          No tests found yet.
        </Typography>
      )}

      <Grid container spacing={3}>
        {filteredTests.map((t) => {
          const testId = (t as any).id || (t as any)._id;
          const finalClassAny: any = (t as any).finalClass;
          const hasCoordinator = Boolean(
            finalClassAny?.coordinator ||
            finalClassAny?.coordinatorId ||
            (typeof finalClassAny?.coordinator === 'string' && finalClassAny.coordinator.trim())
          );
          const classDurationHours = (t as any).finalClass?.classLead?.classDurationHours as number | undefined;
          const marksValue = marksMap[String(testId)] || '';
          return (
          <Grid item xs={12} md={6} key={testId}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {t.finalClass?.studentName || 'Class'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(t.finalClass?.subject || []).join(', ')} • Grade {t.finalClass?.grade}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Test Date: {t.testDate ? new Date(t.testDate).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                  <Chip
                    label={t.status}
                    size="small"
                    color={getStatusColor(t.status) as any}
                  />
                </Box>

                <Box mt={1} mb={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    {t.paperUrl ? 'Question paper already uploaded.' : 'No question paper uploaded yet.'}
                  </Typography>
                  {t.paperUrl && (
                    <Typography variant="caption" color="text.secondary">
                      {t.paperName}
                    </Typography>
                  )}
                </Box>

                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <TextField
                      label="Total Marks"
                      type="number"
                      size="small"
                      value={marksValue}
                      onChange={(e) =>
                        setMarksMap((prev) => ({ ...prev, [String(testId)]: e.target.value }))
                      }
                      sx={{ maxWidth: { xs: '100%', sm: 180 } }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Duration: {classDurationHours ? `${classDurationHours} hour(s)` : 'Based on class duration'}
                    </Typography>
                  </Box>

                  <input
                    type="file"
                    accept=".pdf,image/*"
                    disabled={!hasCoordinator}
                    onChange={(e) => handleFileChange(String(testId), e.target.files?.[0] || null)}
                  />

                  {successMap[String(testId)] && (
                    <Alert severity="success" onClose={() => setSuccessMap((prev) => ({ ...prev, [String(testId)]: null }))}>
                      {successMap[String(testId)]}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<UploadFileIcon />}
                    onClick={() => handleUpload(String(testId))}
                    disabled={
                      !hasCoordinator ||
                      uploadingMap[String(testId)] ||
                      !fileMap[String(testId)] ||
                      !marksValue
                    }
                  >
                    {hasCoordinator
                      ? uploadingMap[String(testId)]
                        ? 'Uploading...'
                        : 'Upload Paper'
                      : 'Coordinator not assigned'}
                  </Button>

                  <Box mt={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openReportModal(String(testId))}
                      disabled={!hasCoordinator}
                    >
                      Upload Test Report
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )})}
      </Grid>

      <Dialog open={reportModalOpen} onClose={reportSubmitting ? undefined : closeReportModal} fullWidth maxWidth="sm">
        <DialogTitle>Upload Test Report</DialogTitle>
        <DialogContent>
          <Box mt={1.5} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Topic Name"
              fullWidth
              size="small"
              value={reportTopic}
              onChange={(e) => setReportTopic(e.target.value)}
            />
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
              <TextField
                label="Total Marks"
                type="number"
                size="small"
                fullWidth
                value={reportTotalMarks}
                onChange={(e) => setReportTotalMarks(e.target.value)}
              />
              <TextField
                label="Marks Obtained"
                type="number"
                size="small"
                fullWidth
                value={reportObtainedMarks}
                onChange={(e) => setReportObtainedMarks(e.target.value)}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Upload Answer Sheet (PDF or image)
              </Typography>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleReportFileChange(e.target.files?.[0] || null)}
                disabled={reportSubmitting}
              />
            </Box>
            {reportError && (
              <Alert severity="error" onClose={() => setReportError(null)}>
                {reportError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReportModal} disabled={reportSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitReport}
            disabled={reportSubmitting || !reportModalTestId}
          >
            {reportSubmitting ? 'Uploading...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {scheduleModalClass && (
        <ScheduleTestModal
          open={scheduleModalOpen}
          onClose={closeScheduleModal}
          finalClass={scheduleModalClass}
          onSuccess={async () => {
            closeScheduleModal();
            await loadData();
          }}
        />
      )}
    </Container>
  );
};

export default TutorTestsPage;
