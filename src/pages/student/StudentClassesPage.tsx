import React, { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, Typography, Grid, Chip, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getStudentClasses } from '../../services/studentService';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

const StudentClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getStudentClasses();
        setClasses(response.data || []);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const studentInfo = {
    name: user?.name || 'Student',
    studentId: (user as any)?.studentId || 'N/A',
    grade: (user as any)?.grade || 'N/A',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
              My Classes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View your class schedule and details
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

          {/* Classes Grid */}
          <Grid container spacing={3}>
            {classes.map((classItem) => (
              <Grid item xs={12} md={6} key={classItem.id}>
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
                      <Typography variant="h6" fontWeight={600}>
                        {classItem.name || classItem.subject}
                      </Typography>
                      <Chip
                        label={classItem.status || 'active'}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {classItem.teacher || 'Teacher'}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {classItem.schedule || 'Schedule TBD'}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Next class: {classItem.nextClass || 'TBD'}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress: {classItem.progress || 0}%
                      </Typography>
                      <Box
                        sx={{
                          height: 8,
                          backgroundColor: 'grey.200',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${classItem.progress || 0}%`,
                            backgroundColor: 'primary.main',
                          }}
                        />
                      </Box>
                    </Box>

                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/student-class/${classItem.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/student-attendance/${classItem.id}`)}
                      >
                        Attendance
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

export default StudentClassesPage;
