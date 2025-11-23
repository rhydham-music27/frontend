import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography, alpha } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_ITEMS, USER_ROLES } from '../../constants';
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
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth?: number;
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
      return <AssignmentIcon />;
    case 'Tutors':
      return <PeopleIcon />;
    case 'Coordinators':
      return <SchoolIcon />;
    case 'Managers':
      return <SupervisorAccountIcon />;
    case 'Coordinators Management':
      return <ManageAccountsIcon />;
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
    case 'Profile':
      return <AccountCircleIcon />;
    case 'My Profile':
      return <AccountCircleIcon />;
    case 'Admin Profile':
      return <AccountBoxIcon />;
    case "Today's Tasks":
      return <TodayIcon />;
    case 'Announcements':
      return <CampaignIcon />;
    case 'Test Reports':
      return <AssessmentIcon />;
    case 'Tutor Performance':
      return <PeopleIcon />;
    case 'Payment Tracking':
      return <AccountBalanceWalletIcon />;
    default:
      return <DashboardIcon />;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth = 240 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const userRole = (user?.role as string) || '';

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <Box sx={{ width: drawerWidth, height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <Box 
        sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 }, 
          display: 'flex', 
          alignItems: 'center', 
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
        <Box sx={{ minWidth: 0, flex: 1 }}>
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

      <List sx={{ flexGrow: 1, py: { xs: 1, sm: 1.5, md: 2 }, px: { xs: 0.5, sm: 1 } }}>
        {NAVIGATION_ITEMS.filter((item: any) => !item.allowedRoles || item.allowedRoles.includes(userRole)).map((item) => {
          let resolvedPath = item.path;
          if (item.label === 'Dashboard') {
            if (userRole === USER_ROLES.ADMIN) {
              resolvedPath = '/admin-dashboard';
            } else if (userRole === USER_ROLES.COORDINATOR) {
              resolvedPath = '/coordinator-dashboard';
            }
          }
          const selected = location.pathname === resolvedPath || location.pathname.startsWith(resolvedPath + '/');
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: { xs: 0.25, sm: 0.5 } }}>
              <ListItemButton 
                selected={selected} 
                onClick={() => handleNavigation(resolvedPath)}
                sx={{
                  borderRadius: { xs: '8px', sm: '10px' },
                  mx: { xs: 0.5, sm: 1 },
                  py: { xs: 1, sm: 1.25 },
                  px: { xs: 1, sm: 1.5 },
                  transition: 'all 0.2s ease-in-out',
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
                <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                  {iconForLabel(item.label)}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
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
      
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
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