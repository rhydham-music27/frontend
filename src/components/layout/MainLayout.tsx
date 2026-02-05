import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import PermissionDeniedDialog from '../common/PermissionDeniedDialog';
import { useSelector, useDispatch } from 'react-redux';
import { hidePermissionDenied, selectPermissionDeniedOpen } from '../../store/slices/uiSlice';
import { selectCurrentUser, setAcceptedTerms } from '../../store/slices/authSlice';
import TermsAndConditionsModal from '../common/TermsAndConditionsModal';
import WhatsAppCommunityModal from '../common/WhatsAppCommunityModal';
import ManagerProfileCompletionModal from '../manager/ManagerProfileCompletionModal';
import { acceptTerms } from '../../services/authService';
import { useOptions } from '../../hooks/useOptions';
import { toast } from 'sonner';
import { USER_ROLES, TEACHING_MODE } from '../../constants';

// Drawer width is now managed by state
// const drawerWidth = 280;

const MainLayout: React.FC = () => {
  // const theme = useTheme();
  // const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const dispatch = useDispatch();
  const permissionDeniedOpen = useSelector(selectPermissionDeniedOpen);
  const user = useSelector(selectCurrentUser);
  const [whatsappConfirmed, setWhatsappConfirmed] = useState(false);
  const { options: cityOptions } = useOptions('CITY');

  const communityLink = React.useMemo(() => {
    if (!user?.city || !cityOptions.length) return undefined;
    const cityOpt = cityOptions.find(c => c.value === user.city || c.label === user.city);
    return cityOpt?.metadata?.whatsappLink;
  }, [user?.city, cityOptions]);

  const isOfflineTutor = user?.role === USER_ROLES.TUTOR && user?.preferredMode === TEACHING_MODE.OFFLINE;
  const showWhatsapp = user !== null && isOfflineTutor && !user.acceptedTerms && !whatsappConfirmed;
  const showTerms = user !== null && !user.acceptedTerms && (!isOfflineTutor || whatsappConfirmed);
  const showManagerProfileGate = user?.role === USER_ROLES.MANAGER && !user.isProfileComplete && user.acceptedTerms;

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        let newWidth = mouseMoveEvent.clientX;
        // Constraints
        if (newWidth < 80) newWidth = 80; // Min width (icon mode)
        if (newWidth > 480) newWidth = 480; // Max width
        // Snap to icon mode only when very small to prevent "stuck" feeling during expansion
        if (newWidth < 110) newWidth = 80;
        
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <Box display="flex" sx={{ position: 'relative' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar 
        open={mobileOpen} 
        onClose={handleDrawerToggle} 
        drawerWidth={sidebarWidth} 
        onResizeStart={startResizing}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${sidebarWidth}px`, xs: 0 },
          width: { md: `calc(100% - ${sidebarWidth}px)`, xs: '100%' },
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: 'background.default',
          transition: isResizing ? 'none' : 'margin 0.3s ease, width 0.3s ease, filter 0.2s ease',
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
      <WhatsAppCommunityModal 
        open={showWhatsapp} 
        onConfirm={() => setWhatsappConfirmed(true)} 
        link={communityLink}
      />
      <TermsAndConditionsModal 
        open={showTerms} 
        loading={termsLoading}
        onAccept={async () => {
          try {
            setTermsLoading(true);
            const res = await acceptTerms();
            if (res.success) {
              dispatch(setAcceptedTerms());
              toast.success('Thank you for accepting our Terms and Conditions!');
            }
          } catch (err: any) {
            toast.error(err?.message || 'Failed to accept terms');
          } finally {
            setTermsLoading(false);
          }
        }} 
      />
      <ManagerProfileCompletionModal open={showManagerProfileGate} />
    </Box>
  );
};

export default MainLayout;
