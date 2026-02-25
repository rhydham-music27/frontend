import React from 'react';

import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PaymentsIcon from '@mui/icons-material/Payments';
import GroupsIcon from '@mui/icons-material/Groups';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLocation, useNavigate } from 'react-router-dom';

type NavItem = {
  value: string;
  label: string;
  icon: React.ReactElement;
  href: string;
  match?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
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
  {
    value: 'payments',
    label: 'Payments',
    icon: <PaymentsIcon />,
    href: '/tutor-payments',
    match: (p) => p === '/tutor-payments',
  },
  {
    value: 'leads',
    label: 'Leads',
    icon: <GroupsIcon />,
    href: '/tutor-leads',
    match: (p) => p === '/tutor-leads',
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

const getSelectedValue = (pathname: string) => {
  const match = NAV_ITEMS.find((i) => (i.match ? i.match(pathname) : i.href === pathname));
  return match?.value ?? 'dashboard';
};

const TutorBottomNav: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  if (!isMobile) return null;

  const value = getSelectedValue(location.pathname);

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
          const item = NAV_ITEMS.find((i) => i.value === nextValue);
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
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.value}
            value={item.value}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default TutorBottomNav;
