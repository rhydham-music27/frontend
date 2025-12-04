import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TutorNotesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Notes
      </Typography>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Notes for your classes will appear here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TutorNotesPage;
