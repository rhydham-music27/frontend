import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Tabs, Tab, Grid, Card, CardContent, TextField, MenuItem, Button, Pagination, Alert, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getAssignedClasses } from '../../services/coordinatorService';
import testService, { getTests } from '../../services/testService';
import { ITest, IFinalClass, ITestReportFilters, ITestReportAnalytics } from '../../types';
import { TEST_STATUS, FINAL_CLASS_STATUS } from '../../constants';
import TestReportCard from '../../components/coordinator/TestReportCard';
import MetricsCard from '../../components/dashboard/MetricsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { format, subDays } from 'date-fns';

const TestReportAnalysisPage: React.FC = () => {
  const [view, setView] = useState<'reports' | 'analytics'>('reports');
  const [tests, setTests] = useState<ITest[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ITestReportFilters>({ page: 1, limit: 9, status: TEST_STATUS.REPORT_SUBMITTED });
  const [pagination, setPagination] = useState<{ total: number; pages: number }>({ total: 0, pages: 0 });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const testsWithReports = useMemo(() => tests.filter((t) => !!t.report), [tests]);

  const analytics: ITestReportAnalytics = useMemo(() => {
    const totalTests = testsWithReports.length;

    // Placeholder average performance score. Could be enhanced with scoring logic.
    const averagePerformanceScore = totalTests > 0 ? 75 : 0;

    const byDateMap: Record<string, { count: number; scoreSum: number }> = {};
    const byClassMap: Record<string, { className: string; classId: string; testCount: number; scoreSum: number }> = {};
    const byTutorMap: Record<string, { tutorName: string; tutorId: string; testCount: number; scoreSum: number }> = {};
    const strengthsMap: Record<string, number> = {};
    const improvementsMap: Record<string, number> = {};

    testsWithReports.forEach((t) => {
      const dateKey = format(new Date(t.testDate), 'yyyy-MM-dd');
      byDateMap[dateKey] = byDateMap[dateKey] || { count: 0, scoreSum: 0 };
      byDateMap[dateKey].count += 1;
      byDateMap[dateKey].scoreSum += 75; // placeholder

      const classId = t.finalClass?.id || 'unknown';
      const className = t.finalClass?.studentName ? `${t.finalClass.studentName} (${(t.finalClass.subject || []).join(', ')})` : 'Unknown Class';
      byClassMap[classId] = byClassMap[classId] || { className, classId, testCount: 0, scoreSum: 0 };
      byClassMap[classId].testCount += 1;
      byClassMap[classId].scoreSum += 75;

      const tutorId = t.tutor?.id || 'unknown';
      const tutorName = t.tutor?.name || 'Unknown Tutor';
      byTutorMap[tutorId] = byTutorMap[tutorId] || { tutorName, tutorId, testCount: 0, scoreSum: 0 };
      byTutorMap[tutorId].testCount += 1;
      byTutorMap[tutorId].scoreSum += 75;

      const strengths = (t.report?.strengths || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
      strengths.forEach((s) => (strengthsMap[s] = (strengthsMap[s] || 0) + 1));
      const improvements = (t.report?.areasOfImprovement || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
      improvements.forEach((s) => (improvementsMap[s] = (improvementsMap[s] || 0) + 1));
    });

    const testsOverTime = Object.keys(byDateMap)
      .sort()
      .map((date) => ({ date, count: byDateMap[date].count, averageScore: byDateMap[date].count ? Math.round(byDateMap[date].scoreSum / byDateMap[date].count) : 0 }));

    const performanceByClass = Object.values(byClassMap)
      .map((v) => ({ className: v.className, classId: v.classId, testCount: v.testCount, averageScore: v.testCount ? Math.round(v.scoreSum / v.testCount) : 0 }))
      .sort((a, b) => b.testCount - a.testCount);

    const performanceByTutor = Object.values(byTutorMap)
      .map((v) => ({ tutorName: v.tutorName, tutorId: v.tutorId, testCount: v.testCount, averageScore: v.testCount ? Math.round(v.scoreSum / v.testCount) : 0 }))
      .sort((a, b) => b.testCount - a.testCount);

    const commonStrengths = Object.entries(strengthsMap)
      .map(([strength, frequency]) => ({ strength, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
    const commonImprovements = Object.entries(improvementsMap)
      .map(([improvement, frequency]) => ({ improvement, frequency }))
      .sort((a, b) => b.frequency - a.frequency);

    return { totalTests, averagePerformanceScore, testsOverTime, performanceByClass, performanceByTutor, commonStrengths, commonImprovements };
  }, [testsWithReports]);

  const fetchAssignedClasses = useCallback(async () => {
    try {
      const resp = await getAssignedClasses(1, 100);
      const classes = (resp.data || []) as IFinalClass[];
      const active = classes.filter((c) => c.status === FINAL_CLASS_STATUS.ACTIVE);
      setAssignedClasses(active);
    } catch (e: any) {
      setError('Failed to load assigned classes');
    }
  }, []);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: any = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.status) query.status = filters.status;
      if (filters.classId) query.finalClassId = filters.classId;
      if (filters.tutorId) query.tutorId = filters.tutorId;
      if (filters.fromDate) query.fromDate = filters.fromDate;
      if (filters.toDate) query.toDate = filters.toDate;

      const resp = await getTests(query);
      setTests(resp.data || []);
      const pages = resp.pagination ? resp.pagination.pages : 0;
      const total = resp.pagination ? resp.pagination.total : 0;
      setPagination({ total, pages });
    } catch (e: any) {
      setError('Failed to load test reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAssignedClasses();
  }, [fetchAssignedClasses]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleFilterChange = (field: keyof ITestReportFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 9, status: TEST_STATUS.REPORT_SUBMITTED });
  };

  const handlePageChange = (event: any, page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    setSnackbar({ open: true, message: 'Refreshing data...', severity: 'info' });
    fetchAssignedClasses();
    fetchTests();
  };

  const handleDownloadPDF = async (testId: string) => {
    try {
      setLoading(true);
      const blob = await testService.downloadTestReportPDF(testId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-report-${testId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'PDF downloaded successfully', severity: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, message: 'Failed to download PDF', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const uniqueTutors = useMemo(() => {
    const map: Record<string, string> = {};
    assignedClasses.forEach((c) => {
      if (c.tutor?.id) map[c.tutor.id] = c.tutor.name;
    });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [assignedClasses]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <ErrorAlert error={error} onClose={() => setError(null)} />

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Test Report Analysis</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>Refresh</Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <Tabs value={view} onChange={(_, v) => setView(v)} aria-label="test-report-tabs">
          <Tab label="Test Reports" value="reports" />
          <Tab label="Analytics" value="analytics" />
        </Tabs>
      </Card>

      {view === 'reports' && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField select fullWidth label="Class" value={filters.classId || ''} onChange={(e) => handleFilterChange('classId', e.target.value || undefined)}>
                    <MenuItem value="">All Classes</MenuItem>
                    {assignedClasses.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.studentName} • {(cls.subject || []).join(', ')}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField select fullWidth label="Tutor" value={filters.tutorId || ''} onChange={(e) => handleFilterChange('tutorId', e.target.value || undefined)}>
                    <MenuItem value="">All Tutors</MenuItem>
                    {uniqueTutors.map((t) => (
                      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth type="date" label="From Date" InputLabelProps={{ shrink: true }} value={filters.fromDate || ''} onChange={(e) => handleFilterChange('fromDate', e.target.value || undefined)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth type="date" label="To Date" InputLabelProps={{ shrink: true }} value={filters.toDate || ''} onChange={(e) => handleFilterChange('toDate', e.target.value || undefined)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField select fullWidth label="Status" value={filters.status || ''} onChange={(e) => handleFilterChange('status', e.target.value || undefined)}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value={TEST_STATUS.REPORT_SUBMITTED}>Report Submitted</MenuItem>
                    <MenuItem value={TEST_STATUS.COMPLETED}>Completed</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button startIcon={<FilterListIcon />} onClick={handleClearFilters}>Clear Filters</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box mb={1} display="flex" alignItems="center" justifyContent="space-between">
            <Typography>Showing {tests.length} test reports</Typography>
            {loading && <LoadingSpinner size={24} />}
          </Box>

          {tests.length === 0 && !loading ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">No test reports found</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>Try adjusting your filters or check back later</Typography>
              <Button variant="outlined" onClick={handleClearFilters}>Clear Filters</Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {tests.map((t) => (
                <Grid item xs={12} sm={6} md={4} key={t.id}>
                  <TestReportCard test={t} onDownloadPDF={handleDownloadPDF} showActions loading={loading} />
                </Grid>
              ))}
            </Grid>
          )}

          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination count={pagination.pages} page={filters.page} onChange={handlePageChange} color="primary" size="large" />
            </Box>
          )}
        </>
      )}

      {view === 'analytics' && (
        <>
          {analytics.totalTests === 0 ? (
            <Alert severity="info">No test reports available for analysis. Test reports will appear here once tutors submit them.</Alert>
          ) : (
            <>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricsCard title="Total Tests" value={analytics.totalTests} icon={<AssessmentIcon />} color="primary" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricsCard title="Average Performance" value={`${analytics.averagePerformanceScore}%`} icon={<TrendingUpIcon />} color="success" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricsCard title="Classes Analyzed" value={analytics.performanceByClass.length} icon={<AssessmentIcon />} color="info" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricsCard title="Tutors Analyzed" value={analytics.performanceByTutor.length} icon={<AssessmentIcon />} color="secondary" />
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>Test Reports Over Time</Typography>
                      {analytics.testsOverTime.length === 0 ? (
                        <Typography color="text.secondary">No data available</Typography>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={analytics.testsOverTime}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="count" stroke="#1976d2" fill="#90caf9" name="Test Count" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>Performance by Class</Typography>
                      {analytics.performanceByClass.length === 0 ? (
                        <Typography color="text.secondary">No data available</Typography>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.performanceByClass.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="className" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="testCount" fill="#1976d2" name="Tests" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>Performance by Tutor</Typography>
                      {analytics.performanceByTutor.length === 0 ? (
                        <Typography color="text.secondary">No data available</Typography>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.performanceByTutor.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tutorName" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="testCount" fill="#2e7d32" name="Tests Conducted" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>Common Strengths Identified</Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {analytics.commonStrengths.slice(0, 5).map((s) => (
                          <Chip key={s.strength} label={`${s.strength} (${s.frequency})`} color="success" variant="outlined" />
                        ))}
                        {analytics.commonStrengths.length === 0 && <Typography color="text.secondary">No data available</Typography>}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>Common Areas of Improvement</Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {analytics.commonImprovements.slice(0, 5).map((s) => (
                          <Chip key={s.improvement} label={`${s.improvement} (${s.frequency})`} color="warning" variant="outlined" />
                        ))}
                        {analytics.commonImprovements.length === 0 && <Typography color="text.secondary">No data available</Typography>}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}

      <SnackbarNotification open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} />
    </Container>
  );
};

export default TestReportAnalysisPage;
