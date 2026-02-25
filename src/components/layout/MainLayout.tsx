import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import PermissionDeniedDialog from '../common/PermissionDeniedDialog';
import TutorBottomNav from '../tutors/TutorBottomNav';
import { useSelector, useDispatch } from 'react-redux';
import { hidePermissionDenied, selectPermissionDeniedOpen, selectSidebarWidth, setSidebarWidth } from '../../store/slices/uiSlice';
import { selectCurrentUser, setAcceptedTerms } from '../../store/slices/authSlice';
import TermsAndConditionsModal from '../common/TermsAndConditionsModal';
import WhatsAppCommunityModal from '../common/WhatsAppCommunityModal';
import ManagerProfileCompletionModal from '../manager/ManagerProfileCompletionModal';
import { acceptTerms, } from '../../services/authService';
import { expressInterest } from '../../services/announcementService';
import { useOptions } from '../../hooks/useOptions';
import { toast } from 'sonner';
import { USER_ROLES, TEACHING_MODE } from '../../constants';

// Drawer width is now managed by state
// const drawerWidth = 280;

const MainLayout: React.FC = () => {
  // const theme = useTheme();
  // const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [sidebarWidth, setSidebarWidth] = useState(280); // Moved to Redux
  const dispatch = useDispatch();
  const sidebarWidth = useSelector(selectSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const permissionDeniedOpen = useSelector(selectPermissionDeniedOpen);
  const user = useSelector(selectCurrentUser);
  const [whatsappConfirmed, setWhatsappConfirmed] = useState(false);
  const { options: cityOptions } = useOptions('CITY');

  // Handle pending interest from public page
  React.useEffect(() => {
    const handlePendingInterest = async () => {
      const pendingAnnouncementId = localStorage.getItem('pendingInterestAnnouncementId');
      if (pendingAnnouncementId && user) {
        // Clear immediately to prevent multiple attempts
        localStorage.removeItem('pendingInterestAnnouncementId');

        try {
          toast.info('Processing your interest...', { duration: 2000 });
          const response = await expressInterest(pendingAnnouncementId);
          if (response.success) {
            toast.success('Interest expressed successfully for the lead!');
          }
        } catch (error: any) {
          console.error("Failed to express interest automatically", error);

          // If error is "Target already interested", show a friendly message
          if (error.response?.status === 400 && error.response?.data?.message?.includes('already expressed interest')) {
            toast.info('You have already expressed interest in this lead.');
          } else if (error.response?.status === 403) {
            toast.error('You are not authorized to express interest. Only Tutors can do this.');
          } else {
            toast.error(error.response?.data?.message || 'Failed to express interest. Please try via the dashboard.');
          }
        }
      }
    };

    if (user) {
      handlePendingInterest();
    }
  }, [user]);

  const communityLink = React.useMemo(() => {
    if (!user?.city || !cityOptions.length) return undefined;
    const cityOpt = cityOptions.find(c => c.value === user.city || c.label === user.city);
    return cityOpt?.metadata?.whatsappLink;
  }, [user?.city, cityOptions]);

  const isOfflineTutor = user?.role === USER_ROLES.TUTOR && user?.preferredMode === TEACHING_MODE.OFFLINE;
  const showWhatsapp = user !== null && isOfflineTutor && !user.acceptedTerms && !whatsappConfirmed;
  const showTerms = user !== null && !user.acceptedTerms && (!isOfflineTutor || whatsappConfirmed);
  const showManagerProfileGate = user?.role === USER_ROLES.MANAGER && !user.isProfileComplete && user.acceptedTerms;
  const showTutorBottomNav = user?.role === USER_ROLES.TUTOR;

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

        dispatch(setSidebarWidth(newWidth));
      }
    },
    [isResizing, dispatch]
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
    <Box
      display="flex"
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh / var(--app-scale))',
      }}
    >
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
          height: 'calc(100vh / var(--app-scale))',
          overflowY: 'auto',
          backgroundColor: 'background.default',
          transition: isResizing ? 'none' : 'margin 0.3s ease, width 0.3s ease, filter 0.2s ease',
          filter: permissionDeniedOpen ? 'blur(3px)' : 'none',
        }}
      >
        {/* Spacer to offset fixed AppBar height */}
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64, md: 70 } }} />
        <Box
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 3, lg: 4 },
            pb: showTutorBottomNav
              ? { xs: 'calc(64px + env(safe-area-inset-bottom) + 16px)', sm: 2.5, md: 3, lg: 4 }
              : undefined,
          }}
        >
          <Outlet />
        </Box>
      </Box>
      {showTutorBottomNav && <TutorBottomNav />}
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
