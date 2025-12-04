import React from 'react';
import { Container, Box, Card, CardContent, Typography, Grid, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';

const StudentAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const studentInfo = {
    name: user?.name || 'Student',
    studentId: (user as any)?.studentId || 'N/A',
    grade: (user as any)?.grade || 'N/A',
  };

  // Mock attendance data - would come from API
  const attendanceData = [
    {
      month: 'December 2024',
      stats: {
        total: 20,
        present: 18,
        absent: 1,
        late: 1,
        percentage: 90,
      },
      records: [
        { date: '2024-12-01', status: 'present', subject: 'Mathematics' },
        { date: '2024-12-02', status: 'present', subject: 'Science' },
        { date: '2024-12-03', status: 'late', subject: 'Mathematics' },
        { date: '2024-12-04', status: 'present', subject: 'Science' },
        { date: '2024-12-05', status: 'absent', subject: 'Mathematics' },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'absent':
        return <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'late':
        return <HelpIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
      default:
        return <HelpIcon sx={{ color: 'grey.500', fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Attendance Records
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Check your attendance history and statistics
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

      {/* Attendance Cards */}
      {attendanceData.map((monthData) => (
        <Card key={monthData.month} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {monthData.month}
            </Typography>

            {/* Statistics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {monthData.stats.percentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {monthData.stats.present}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {monthData.stats.absent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {monthData.stats.late}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Recent Records */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Records
            </Typography>
            <Grid container spacing={2}>
              {monthData.records.map((record, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        {getStatusIcon(record.status)}
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {record.date}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.subject}
                          </Typography>
                        </Box>
                        <Chip
                          label={record.status}
                          color={getStatusColor(record.status) as any}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ))}

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

export default StudentAttendancePage;
