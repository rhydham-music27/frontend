import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography, alpha } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_ITEMS, USER_ROLES, VERIFICATION_STATUS } from '../../constants';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ClassIcon from '@mui/icons-material/Class';
import TodayIcon from '@mui/icons-material/Today';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import StorageIcon from '@mui/icons-material/Storage';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FolderIcon from '@mui/icons-material/Folder';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SummarizeIcon from '@mui/icons-material/Summarize';
import InsightsIcon from '@mui/icons-material/Insights';
import PersonIcon from '@mui/icons-material/Person';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth?: number;
  onResizeStart?: () => void;
}

const iconForLabel = (label: string) => {
  switch (label) {
    case 'Dashboard':
      return <DashboardIcon />;
    case 'Admin Dashboard':
      return <AdminPanelSettingsIcon />;
    case 'Tutor Dashboard':
      return <DashboardIcon />;
    case 'Timetable':
      return <ScheduleIcon />;
    case 'Class Leads':
      return <AssignmentIcon />;
    case 'Test Scheduling':
      return <EventIcon />;
    case 'Tutors':
      return <PeopleIcon />;
    case 'Coordinators':
      return <SchoolIcon />;
    case 'Managers':
      return <SupervisorAccountIcon />;
    case 'Coordinators Management':
      return <ManageAccountsIcon />;
    case 'Final Classes':
      return <CastForEducationIcon />;
    case 'Lead CRM':
      return <RecentActorsIcon />;
    case 'Data Management':
      return <StorageIcon />;
    case 'Register New Member':
      return <PersonAddIcon />;
    case 'Attendance':
      return <CheckCircleIcon />;
    case 'Attendance Approvals':
      return <CheckCircleOutlineIcon />;
    case 'Payments':
      return <PaymentIcon />;
    case 'My Classes':
      return <ClassIcon />;
    case 'Analytics':
      return <AnalyticsIcon />;
    case 'Business Analytics':
      return <TrendingUpIcon />;
    case 'Profile':
      return <AccountCircleIcon />;
    case 'My Profile':
      return <PersonIcon />;
    case 'Admin Profile':
      return <AccountBoxIcon />;
    case "Today's Tasks":
      return <TodayIcon />;
    case 'Announcements':
      return <CampaignIcon />;
    case 'Tests':
      return <AssessmentIcon />;
    case 'Test Reports':
      return <SummarizeIcon />;
    case 'Tutor Performance':
      return <InsightsIcon />;
    case 'Payment Tracking':
      return <AccountBalanceWalletIcon />;
    case 'Notes':
      return <FolderIcon />;
    default:
      return <DashboardIcon />;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth = 280, onResizeStart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const userRole = (user?.role as string) || '';
  const isCollapsed = drawerWidth < 180;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <Box sx={{ 
      width: drawerWidth, 
      height: '100%', 
      maxHeight: '100vh',
      display: 'flex', 
      flexDirection: 'column', 
      overflowX: 'hidden',
      position: 'relative'
    }}>
      <Box 
        sx={{ 
          p: isCollapsed ? 1 : { xs: 2, sm: 2.5, md: 3 }, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: { xs: 1, sm: 1.5 },
          borderBottom: '1px solid #E2E8F0',
          minHeight: { xs: 56, sm: 64, md: 70 },
        }}
      >
        <Box 
          component="img" 
          src="/1.jpg" 
          alt="Logo" 
          sx={{ 
            height: { xs: 32, sm: 36 }, 
            width: { xs: 32, sm: 36 }, 
            borderRadius: '50%',
            border: '2px solid #E2E8F0',
          }} 
        />
        <Box sx={{ minWidth: 0, flex: 1, display: isCollapsed ? 'none' : 'block' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 700,
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Your Shikshak
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userRole || 'Dashboard'}
          </Typography>
        </Box>
      </Box>

      <List sx={{ flexGrow: 1, py: { xs: 1, sm: 1.5, md: 2 }, px: isCollapsed ? 1 : { xs: 0.5, sm: 1 } }}>
        {NAVIGATION_ITEMS.filter((item: any) => !item.allowedRoles || item.allowedRoles.includes(userRole)).map((item) => {
          let resolvedPath = item.path;
          if (item.label === 'Dashboard') {
            if (userRole === USER_ROLES.ADMIN) {
              resolvedPath = '/admin-dashboard';
            } else if (userRole === USER_ROLES.COORDINATOR) {
              resolvedPath = '/coordinator-dashboard';
            }
          }

          if (item.label === 'Analytics' && userRole === USER_ROLES.ADMIN) {
            resolvedPath = '/admin/analytics';
          }

          if (item.label === 'Profile' && userRole === USER_ROLES.TUTOR) {
            resolvedPath = '/tutor-profile';
          }

          const selected = location.pathname === resolvedPath || location.pathname.startsWith(resolvedPath + '/');
          const isUnverifiedManager = userRole === USER_ROLES.MANAGER && user?.verificationStatus !== VERIFICATION_STATUS.VERIFIED;
          const isItemDisabled = isUnverifiedManager && !['Dashboard', 'Profile', 'My Profile'].includes(item.label);
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: { xs: 0.25, sm: 0.5 }, display: 'block' }}>
              <ListItemButton 
                selected={selected} 
                disabled={isItemDisabled}
                onClick={() => handleNavigation(resolvedPath)}
                sx={{
                  borderRadius: { xs: '8px', sm: '10px' },
                  mx: { xs: 0.5, sm: 1 },
                  py: { xs: 1, sm: 1.25 },
                  px: { xs: 1, sm: 1.5 },
                  transition: 'all 0.2s ease-in-out',
                  opacity: isItemDisabled ? 0.6 : 1,
                  filter: isItemDisabled ? 'grayscale(1)' : 'none',
                  '&.Mui-disabled': {
                    cursor: 'not-allowed',
                    pointerEvents: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    }
                  },
                  '&.Mui-selected': {
                    backgroundColor: alpha('#0F62FE', 0.08),
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: alpha('#0F62FE', 0.12),
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '4px',
                      height: '60%',
                      backgroundColor: 'primary.main',
                      borderRadius: '0 4px 4px 0',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#F8FAFC',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: 'center' }}>
                  {iconForLabel(item.label)}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{ opacity: isCollapsed ? 0 : 1 }}
                  primaryTypographyProps={{
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: selected ? 600 : 500,
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      
      <Box sx={{ p: { xs: 1.5, sm: 2 }, display: isCollapsed ? 'none' : 'block' }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: 'block', 
            textAlign: 'center',
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
          }}
        >
          © 2024 Your Shikshak
        </Typography>
      </Box>
      {/* Resize Handle */}
      <Box
        onMouseDown={onResizeStart}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '5px',
          height: '100%',
          cursor: 'col-resize',
          zIndex: 1200, // Above content
          '&:hover': {
            backgroundColor: 'primary.main',
            opacity: 0.5,
          },
        }}
      />
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ 
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{ 
          display: { xs: 'none', md: 'block' }, 
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            borderRight: '1px solid #E2E8F0',
            overflowX: 'hidden',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;