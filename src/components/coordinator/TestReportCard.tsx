import React from 'react';
import { Card, CardContent, CardActions, Box, Typography, Grid, Chip, Divider, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ITest } from '../../types';
import { TEST_STATUS } from '../../constants';
import { format } from 'date-fns';

interface TestReportCardProps {
  test: ITest;
  onDownloadPDF?: (testId: string) => void;
  showActions?: boolean;
  loading?: boolean;
}

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd MMM, yyyy');
  } catch {
    return String(date);
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case TEST_STATUS.SCHEDULED:
      return 'warning';
    case TEST_STATUS.COMPLETED:
      return 'info';
    case TEST_STATUS.REPORT_SUBMITTED:
      return 'success';
    case TEST_STATUS.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
};

const TestReportCard: React.FC<TestReportCardProps> = ({ test, onDownloadPDF, showActions = true, loading }) => {
  return (
    <Card elevation={2} sx={{ '&:hover': { boxShadow: 4 }, mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">Test Report</Typography>
          </Box>
          <Chip label={test.status} color={getStatusColor(test.status) as any} size="small" />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">Test Date: {formatDate(test.testDate)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon fontSize="small" />
              <Typography variant="body2">Test Time: {test.testTime}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <SchoolIcon fontSize="small" />
              <Typography variant="body2">
                Class: {test.finalClass?.studentName} • {test.finalClass?.subject?.join(', ')} • {test.finalClass?.grade}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">Tutor: {test.tutor?.name}</Typography>
            </Box>
          </Grid>
        </Grid>

        {test.report ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" mb={2}>Test Report Details</Typography>

            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Overall Feedback</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{test.report.feedback}</Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography>Student Strengths</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{test.report.strengths}</Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon color="warning" fontSize="small" />
                  <Typography>Areas of Improvement</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{test.report.areasOfImprovement}</Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Student Performance Assessment</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{test.report.studentPerformance}</Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Recommendations</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{test.report.recommendations}</Typography>
              </AccordionDetails>
            </Accordion>

            <Box mt={2} p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                Report submitted by: {test.reportSubmittedBy?.name || '-'}
              </Typography>
              <Typography variant="caption" display="block">
                Submitted at: {formatDate(test.reportSubmittedAt)}
              </Typography>
            </Box>
          </>
        ) : (
          <Box mt={2} p={2} display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography color="text.secondary">Test report not yet submitted</Typography>
          </Box>
        )}
      </CardContent>

      {showActions && (
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => onDownloadPDF?.(test.id)}
            disabled={!test.report || !!loading}
          >
            Download PDF
          </Button>
          <Button variant="outlined" onClick={() => { window.location.href = `/assigned-classes`; }}>
            View Class
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default TestReportCard;
