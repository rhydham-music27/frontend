import React, { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, Grid, TextField, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const StudentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [isEditing, setIsEditing] = useState(false);

  const studentInfo = {
    name: user?.name || 'Student',
    studentId: (user as any)?.studentId || 'N/A',
    grade: (user as any)?.grade || 'N/A',
    gender: (user as any)?.gender || 'N/A',
    email: user?.email || '',
    phone: '', // Would come from user data
  };

  const [formData, setFormData] = useState({
    name: studentInfo.name,
    email: studentInfo.email,
    phone: studentInfo.phone,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: studentInfo.name,
      email: studentInfo.email,
      phone: studentInfo.phone,
    });
    setIsEditing(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Student Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account settings
        </Typography>
      </Box>

      {/* Profile Card */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Avatar Section */}
            <Grid item xs={12} md={4} textAlign="center">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  color: 'white',
                  margin: '0 auto 2rem',
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {studentInfo.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {studentInfo.studentId}
              </Typography>
            </Grid>

            {/* Information Section */}
            <Grid item xs={12} md={8}>
              <Box mb={3}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Personal Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      value={isEditing ? formData.name : studentInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      fullWidth
                      value={isEditing ? formData.email : studentInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      fullWidth
                      value={isEditing ? formData.phone : studentInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Grade"
                      fullWidth
                      value={studentInfo.grade}
                      disabled
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Gender"
                      fullWidth
                      value={studentInfo.gender}
                      disabled
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Student ID"
                      fullWidth
                      value={studentInfo.studentId}
                      disabled
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Academic Information */}
              <Box mb={3}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Academic Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Grade: {studentInfo.grade} | Student ID: {studentInfo.studentId}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box display="flex" gap={2}>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  onClick={() => navigate('/student-change-password')}
                >
                  Change Password
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Back Button */}
      <Box mt={3}>
        <Button
          variant="text"
          onClick={() => navigate('/parent-dashboard')}
        >
          ← Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default StudentProfilePage;
