import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';

const CoordinatorStudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  // TODO: Fetch student info and assigned classes for this coordinator
  // TODO: Implement tabs for Info, Attendance, Payments, Reports

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Student Profile</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Student Basic Info</Typography>
        {/* Student info fields here */}
      </Paper>
      <Tabs value={0}>
        <Tab label="Classes" />
        <Tab label="Attendance" />
        <Tab label="Payments" />
        <Tab label="Reports" />
      </Tabs>
      {/* Tab content here: classes, attendance, payments, reports */}
      <Box mt={2}>
        {/* TODO: Render tab content based on selection */}
        <Typography>Tab content placeholder</Typography>
      </Box>
    </Box>
  );
};

export default CoordinatorStudentProfilePage;
