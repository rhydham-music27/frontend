import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { ITest } from '../../types';
import testService, { getParentTests } from '../../services/testService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const ParentTestsPage: React.FC = () => {
  const [tests, setTests] = useState<ITest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getParentTests();
      setTests(resp.data || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to load test reports';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTests();
  }, [fetchTests]);

  const handleDownloadPDF = async (testId: string) => {
    try {
      const blob = await testService.downloadTestReportPDF(testId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-report-${testId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // Silent failure for now; could show snackbar
    }
  };

  const swot = useMemo(() => {
    const strengthsMap: Record<string, number> = {};
    const improvementsMap: Record<string, number> = {};

    tests.forEach((t) => {
      const strengths = (t.report?.strengths || '')
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      strengths.forEach((s) => {
        strengthsMap[s] = (strengthsMap[s] || 0) + 1;
      });

      const improvements = (t.report?.areasOfImprovement || '')
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      improvements.forEach((s) => {
        improvementsMap[s] = (improvementsMap[s] || 0) + 1;
      });
    });

    const strengths = Object.entries(strengthsMap)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const improvements = Object.entries(improvementsMap)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return { strengths, improvements };
  }, [tests]);

  if (loading && !tests.length) {
    return <LoadingSpinner fullScreen message="Loading test reports..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tests & Reports
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View your child&apos;s test performance and a simple SWOT-style analysis.
      </Typography>

      <Box sx={{ mt: 2 }}>
        <ErrorAlert error={error} onClose={() => setError(null)} />
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
        <Typography variant="h6">Test reports</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={() => {
            void fetchTests();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              {tests.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No test reports found yet.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {tests.map((t) => (
                    <Grid item xs={12} key={t.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Test on {t.testDate ? new Date(t.testDate).toLocaleDateString() : 'N/A'}
                              </Typography>
                              {t.finalClass && (
                                <Typography variant="body2" color="text.secondary">
                                  {t.finalClass.studentName} • {(t.finalClass.subject || []).join(', ')}
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary">
                                Date: {t.testDate ? new Date(t.testDate).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </Box>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownloadPDF(t.id)}
                            >
                              Download PDF
                            </Button>
                          </Box>
                          {t.report ? (
                            <>
                              {t.report.feedback && (
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  {t.report.feedback}
                                </Typography>
                              )}
                              {t.report.strengths && (
                                <Typography variant="body2" color="success.main">
                                  Strengths: {t.report.strengths}
                                </Typography>
                              )}
                              {t.report.areasOfImprovement && (
                                <Typography variant="body2" color="warning.main">
                                  Areas of improvement: {t.report.areasOfImprovement}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Report not submitted yet.
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6">SWOT-style analysis</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Based on recent test reports, here are some recurring strengths and areas of improvement for your child.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Strengths
                  </Typography>
                  {swot.strengths.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Not enough data yet.
                    </Typography>
                  ) : (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {swot.strengths.map((s) => (
                        <Chip key={s.label} label={s.label} color="success" variant="outlined" size="small" />
                      ))}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Areas for improvement
                  </Typography>
                  {swot.improvements.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Not enough data yet.
                    </Typography>
                  ) : (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {swot.improvements.map((s) => (
                        <Chip key={s.label} label={s.label} color="warning" variant="outlined" size="small" />
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentTestsPage;
