import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import PermissionDeniedDialog from '../common/PermissionDeniedDialog';
import { useSelector, useDispatch } from 'react-redux';
import { hidePermissionDenied, selectPermissionDeniedOpen } from '../../store/slices/uiSlice';

const drawerWidth = 280;

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const permissionDeniedOpen = useSelector(selectPermissionDeniedOpen);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box display="flex" sx={{ position: 'relative' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${drawerWidth}px`, xs: 0 },
          width: { md: `calc(100% - ${drawerWidth}px)`, xs: '100%' },
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: 'background.default',
          transition: 'margin 0.3s ease, width 0.3s ease, filter 0.2s ease',
          filter: permissionDeniedOpen ? 'blur(3px)' : 'none',
        }}
      >
        {/* Spacer to offset fixed AppBar height */}
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64, md: 70 } }} />
        <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3, lg: 4 } }}>
          <Outlet />
        </Box>
      </Box>
      <PermissionDeniedDialog
        open={permissionDeniedOpen}
        onClose={() => dispatch(hidePermissionDenied())}
      />
    </Box>
  );
};

export default MainLayout;
