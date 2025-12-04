import React from 'react';
import { Container, Box, Card, CardContent, Typography, Grid, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const StudentTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const studentInfo = {
    name: user?.name || 'Student',
    studentId: (user as any)?.studentId || 'N/A',
    grade: (user as any)?.grade || 'N/A',
  };

  // Mock test data - would come from API
  const tests = [
    {
      id: 1,
      title: 'Mathematics Chapter 5 Test',
      subject: 'Mathematics',
      type: 'Test',
      date: '2024-12-10',
      time: '10:00 AM',
      duration: '45 minutes',
      status: 'upcoming',
      totalMarks: 100,
      description: 'Chapter 5: Fractions and Decimals',
    },
    {
      id: 2,
      title: 'Science Lab Report',
      subject: 'Science',
      type: 'Assignment',
      date: '2024-12-08',
      time: '11:59 PM',
      duration: '2 hours',
      status: 'submitted',
      totalMarks: 50,
      obtainedMarks: 45,
      description: 'Lab report on plant growth experiment',
    },
    {
      id: 3,
      title: 'English Essay Writing',
      subject: 'English',
      type: 'Assignment',
      date: '2024-12-12',
      time: '2:00 PM',
      duration: '1 hour',
      status: 'pending',
      totalMarks: 25,
      description: 'Essay on "My Favorite Season"',
    },
  ];

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
                  {test.obtainedMarks && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                      Score: {Math.round((test.obtainedMarks / test.totalMarks) * 100)}%
                    </Typography>
                  )}
                </Box>

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/student-test/${test.id}`)}
                  >
                    {test.status === 'submitted' ? 'View Result' : test.status === 'pending' ? 'Start Assignment' : 'View Details'}
                  </Button>
                  {test.status === 'pending' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/student-test/${test.id}/instructions`)}
                    >
                      Instructions
                    </Button>
                  )}
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
    </Container>
  );
};

export default StudentTestsPage;
