import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';

interface StudentLayoutProps {
  children?: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  return (
    <Box display="flex">
      <Header showSidebarMenu={false} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: 'background.default',
        }}
      >
        {/* Spacer to offset fixed AppBar height */}
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64, md: 70 } }} />
        <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3, lg: 4 } }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default StudentLayout;
