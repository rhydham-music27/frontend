import React from 'react';

import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PaymentsIcon from '@mui/icons-material/Payments';
import GroupsIcon from '@mui/icons-material/Groups';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useLocation, useNavigate } from 'react-router-dom';

type NavItem = {
  value: string;
  label: string;
  icon: React.ReactElement;
  href: string;
  match?: (pathname: string) => boolean;
};

const MAIN_NAV_ITEMS: NavItem[] = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/tutor-dashboard',
    match: (p) => p === '/tutor-dashboard' || p === '/',
  },
  {
    value: 'classes',
    label: 'Classes',
    icon: <ClassIcon />,
    href: '/tutor-classes',
    match: (p) => p.startsWith('/tutor-classes'),
  },
  {
    value: 'timetable',
    label: 'Timetable',
    icon: <ScheduleIcon />,
    href: '/tutor-timetable',
    match: (p) => p === '/tutor-timetable',
  },
];

const MORE_NAV_ITEMS: NavItem[] = [
  {
    value: 'leads',
    label: 'Leads',
    icon: <GroupsIcon />,
    href: '/tutor-leads',
    match: (p) => p === '/tutor-leads',
  },
  {
    value: 'payments',
    label: 'Payments',
    icon: <PaymentsIcon />,
    href: '/tutor-payments',
    match: (p) => p === '/tutor-payments',
  },
  {
    value: 'notes',
    label: 'Notes',
    icon: <NoteAltIcon />,
    href: '/tutor-notes',
    match: (p) => p === '/tutor-notes' || p === '/notes',
  },
  {
    value: 'profile',
    label: 'Profile',
    icon: <AccountCircleIcon />,
    href: '/profile',
    match: (p) => p.startsWith('/tutor-profile') || p === '/profile',
  },
];

const TutorBottomNav: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  if (!isMobile) return null;

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (href: string) => {
    navigate(href);
    handleMoreClose();
  };

  const isMoreActive = MORE_NAV_ITEMS.some((item) => 
    item.match ? item.match(location.pathname) : item.href === location.pathname
  );

  const activeMainItem = MAIN_NAV_ITEMS.find((item) => 
    item.match ? item.match(location.pathname) : item.href === location.pathname
  );

  const value = activeMainItem ? activeMainItem.value : (isMoreActive ? 'more' : 'dashboard');

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
        borderTop: '1px solid',
        borderColor: 'divider',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, nextValue) => {
          if (nextValue === 'more') return;
          const item = MAIN_NAV_ITEMS.find((i) => i.value === nextValue);
          if (item) navigate(item.href);
        }}
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            px: 0.5,
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.72rem',
            fontWeight: 700,
          },
        }}
      >
        {MAIN_NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.value}
            value={item.value}
            label={item.label}
            icon={item.icon}
          />
        ))}
        <BottomNavigationAction
          value="more"
          label="More"
          icon={<MoreHorizIcon />}
          onClick={handleMoreClick}
          sx={{
            color: isMoreActive ? theme.palette.primary.main : 'inherit',
          }}
        />
      </BottomNavigation>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMoreClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mb: 1,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        {MORE_NAV_ITEMS.map((item) => {
          const isActive = item.match 
            ? item.match(location.pathname) 
            : item.href === location.pathname;
          
          return (
            <MenuItem
              key={item.value}
              onClick={() => handleNavigate(item.href)}
              sx={{
                py: 1.5,
                px: 2,
                gap: 2,
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: isActive 
                    ? alpha(theme.palette.primary.main, 0.12) 
                    : alpha(theme.palette.action.hover, 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 'auto',
                color: isActive ? theme.palette.primary.main : 'inherit' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  variant: 'body2', 
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? theme.palette.primary.main : 'text.primary'
                }} 
              />
            </MenuItem>
          );
        })}
      </Menu>
    </Paper>
  );
};

export default TutorBottomNav;

