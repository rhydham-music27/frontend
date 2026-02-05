import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Card, CardContent, Typography, Chip, Button, Divider } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface StudentTestRouteState {
  test?: {
    id: string | number;
    title: string;
    subject?: string;
    type: string;
    date: string;
    time: string;
    duration?: string;
    status: string;
    totalMarks?: number;
    obtainedMarks?: number;
    description?: string;
    paperUrl?: string;
    topicName?: string;
    answerSheetUrl?: string;
  };
}

const StudentTestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state || {}) as StudentTestRouteState;
  const test = state.test;

  if (!test) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Test details not available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please go back to your tests list and open the test again.
        </Typography>
        <Button variant="text" onClick={() => navigate('/student-tests')}>
           Back to Tests
        </Button>
      </Container>
    );
  }

  const scoreText =
    typeof test.obtainedMarks === 'number' && typeof test.totalMarks === 'number'
      ? `${test.obtainedMarks}/${test.totalMarks}`
      : test.totalMarks
      ? `${test.totalMarks} marks`
      : undefined;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {test.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed information about this test.
          </Typography>
        </Box>
        <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexWrap="wrap" gap={1.5} mb={2}>
            <Chip label={test.type} color="primary" size="small" />
            <Chip label={test.status} size="small" />
            {test.subject && (
              <Chip label={test.subject} size="small" />
            )}
          </Box>

          {test.description && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {test.description}
              </Typography>
            </Box>
          )}

          {test.topicName && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Topic
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {test.topicName}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <EventIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {test.date} at {test.time}
              </Typography>
            </Box>
            {test.duration && (
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Duration: {test.duration}
                </Typography>
              </Box>
            )}
          </Box>

          {scoreText && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Marks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {scoreText}
              </Typography>
              {typeof test.obtainedMarks === 'number' && typeof test.totalMarks === 'number' && test.totalMarks > 0 && (
                <Typography variant="body2" color="success.main">
                  Score: {Math.round((test.obtainedMarks / test.totalMarks) * 100)}%
                </Typography>
              )}
            </Box>
          )}

          {test.paperUrl && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Question Paper
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 1,
                }}
              >
                <iframe
                  src={test.paperUrl}
                  title="Test Question Paper"
                  style={{ width: '100%', height: 480, border: 'none' }}
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                href={test.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PDF in New Tab
              </Button>
            </Box>
          )}

          {test.answerSheetUrl && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Answer Sheet
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 1,
                }}
              >
                <iframe
                  src={test.answerSheetUrl}
                  title="Test Answer Sheet"
                  style={{ width: '100%', height: 480, border: 'none' }}
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                href={test.answerSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Answer Sheet in New Tab
              </Button>
            </Box>
          )}

          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={() => navigate('/student-tests')}
              size="small"
            >
              Back to Tests
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentTestDetailPage;
