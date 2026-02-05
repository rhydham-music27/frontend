import React, { useEffect, useState } from 'react';
import { Container, Box, Card, CardContent, Typography, Grid, Chip, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { getStudentTests } from '../../services/studentService';

const StudentTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<
    Array<{
      id: string | number;
      title: string;
      subject: string;
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
    }>
  >([]);

  const studentInfo = {
    name: user?.name || 'Student',
    studentId: (user as any)?.studentId || 'N/A',
    grade: (user as any)?.grade || 'N/A',
  };

  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        const res = await getStudentTests({ page: 1, limit: 50 });
        const data = (res as any)?.data || [];
        setTests(Array.isArray(data) ? data : []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load student tests', e as any);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'submitted':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'upcoming':
        return <EventIcon sx={{ color: 'primary.main', fontSize: 20 }} />;
      case 'pending':
        return <RadioButtonUncheckedIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
      default:
        return <RadioButtonUncheckedIcon sx={{ color: 'grey.500', fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'submitted':
        return 'success';
      case 'upcoming':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'Test' ? 'primary' : 'secondary';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Tests & Assignments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View upcoming tests and assignments
        </Typography>
      </Box>

      {/* Student Info */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #001F54 0%, #4589FF 100%)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
            Student Information
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
              <strong>Name:</strong> {studentInfo.name}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
              <strong>ID:</strong> {studentInfo.studentId}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
              <strong>Grade:</strong> {studentInfo.grade}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* No data state */}
      {tests.length === 0 && (
        <Box mt={2} mb={4}>
          <Typography variant="body2" color="text.secondary">
            No tests or assignments found yet.
          </Typography>
        </Box>
      )}

      {/* Tests Grid */}
      <Grid container spacing={3}>
        {tests.map((test) => (
          <Grid item xs={12} md={6} lg={4} key={test.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                    {test.title}
                  </Typography>
                  {getStatusIcon(test.status)}
                </Box>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={test.type}
                    color={getTypeColor(test.type) as any}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip
                    label={test.status}
                    color={getStatusColor(test.status) as any}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {test.description}
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {test.date} at {test.time}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Duration: {test.duration}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Marks:</strong> {test.obtainedMarks ? `${test.obtainedMarks}/${test.totalMarks}` : `${test.totalMarks} marks`}
                  </Typography>
                  {typeof test.obtainedMarks === 'number' && typeof test.totalMarks === 'number' && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                      Score: {Math.round((test.obtainedMarks / test.totalMarks) * 100)}%
                    </Typography>
                  )}
                </Box>

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/student-tests/${test.id}`, { state: { test } })}
                  >
                    {test.status === 'submitted'
                      ? 'View Result'
                      : test.status === 'pending'
                      ? 'Start Assignment'
                      : 'View Details'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Back Button */}
      <Box mt={4}>
        <Button
          variant="text"
          onClick={() => navigate('/student-dashboard')}
        >
          ← Back to Dashboard
        </Button>
      </Box>
        </>
      )}
    </Container>
  );
};

export default StudentTestsPage;
