import React, { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, Typography, Grid, Button, Avatar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { getStudentDashboardStats } from '../../services/studentService';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';

const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stats = await getStudentDashboardStats();
        setDashboardStats(stats.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const studentInfo = {
    name: user?.name || 'Student',
    studentId: (user as any)?.studentId || 'N/A',
    grade: (user as any)?.grade || 'N/A',
    gender: (user as any)?.gender || 'N/A',
  };

  const menuItems = [
    {
      title: 'My Classes',
      description: dashboardStats?.classes?.total ? `${dashboardStats.classes.total} classes enrolled` : 'View your class schedule and details',
      icon: <SchoolIcon />,
      color: '#1976d2',
      action: () => navigate('/student-classes'),
      count: dashboardStats?.classes?.total || 0,
    },
    {
      title: 'Attendance',
      description: dashboardStats?.attendance?.percentage ? `${dashboardStats.attendance.percentage}% attendance rate` : 'Check your attendance records',
      icon: <EventIcon />,
      color: '#388e3c',
      action: () => navigate('/student-attendance'),
      count: dashboardStats?.attendance?.percentage ? `${dashboardStats.attendance.percentage}%` : null,
    },
    {
      title: 'Tests & Assignments',
      description: dashboardStats?.tests?.pending ? `${dashboardStats.tests.pending} pending` : 'View upcoming tests and assignments',
      icon: <AssignmentIcon />,
      color: '#f57c00',
      action: () => navigate('/student-tests'),
      count: dashboardStats?.tests?.pending || 0,
    },
    {
      title: 'Study Materials',
      description: dashboardStats?.notes?.total ? `${dashboardStats.notes.total} materials` : 'Access notes and study materials',
      icon: <BookIcon />,
      color: '#7b1fa2',
      action: () => navigate('/student-notes'),
      count: dashboardStats?.notes?.total || 0,
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/student-login');
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
              Student Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {studentInfo.name}!
            </Typography>
          </Box>

          {/* Student Info Card */}
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #001F54 0%, #4589FF 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                </Grid>
                <Grid item xs={12} sm>
                  <Typography variant="h5" fontWeight={600} color="white" gutterBottom>
                    {studentInfo.name}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
                      <strong>ID:</strong> {studentInfo.studentId}
                    </Typography>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
                      <strong>Grade:</strong> {studentInfo.grade}
                    </Typography>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
                      <strong>Gender:</strong> {studentInfo.gender}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Menu Grid */}
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={item.action}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: item.color,
                          color: 'white',
                          position: 'relative',
                        }}
                      >
                        {item.icon}
                        {item.count && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'error.main',
                              color: 'white',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {item.count}
                          </Box>
                        )}
                      </Avatar>
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick Actions */}
          <Box mt={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/student-profile')}
                  startIcon={<PersonIcon />}
                >
                  My Profile
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/student-change-password')}
                  color="secondary"
                >
                  Change Password
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  color="error"
                  startIcon={<LogoutIcon />}
                >
                  Logout
                </Button>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Container>
  );
};

export default StudentDashboardPage;
