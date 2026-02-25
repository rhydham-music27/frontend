import React, { useState } from 'react';
import { Box, Toolbar, List, ListItem, ListItemButton, ListItemText, Typography, Divider, alpha } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setAcceptedTerms } from '../../store/slices/authSlice';
import TermsAndConditionsModal from '../common/TermsAndConditionsModal';
import { acceptTerms } from '../../services/authService';
import { toast } from 'sonner';

interface StudentLayoutProps {
  children?: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const showTerms = user !== null && !user.acceptedTerms;
  const [termsLoading, setTermsLoading] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/student-dashboard' },
    { label: 'My Classes', path: '/student-classes' },
    { label: 'Attendance', path: '/student-attendance' },
    { label: 'Tests & Assignments', path: '/student-tests' },
    { label: 'Study Materials', path: '/student-notes' },
    { label: 'Payments', path: '/student-payments' },
    { label: 'Profile', path: '/student-profile' },
  ];

  return (
    <Box display="flex">
      <Header showSidebarMenu={false} />
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          minWidth: 0,
          height: 'calc(100vh / var(--app-scale))',
          backgroundColor: 'background.default',
        }}
      >
        {/* Left navigation - student sidebar */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            width: 240,
            borderRight: '1px solid #E2E8F0',
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: '1px solid #E2E8F0' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                color: 'primary.main',
              }}
            >
              Student Portal
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              Quick navigation
            </Typography>
          </Box>
          <List sx={{ flexGrow: 1, py: 1, px: 1 }}>
            {navItems.map((item) => {
              const selected =
                location.pathname === item.path || location.pathname.startsWith(item.path + '/') ;

              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={selected}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: '10px',
                      mx: 0.5,
                      py: 1.1,
                      px: 1.5,
                      transition: 'all 0.2s ease-in-out',
                      '&.Mui-selected': {
                        backgroundColor: alpha('#0F62FE', 0.08),
                        color: 'primary.main',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: alpha('#0F62FE', 0.12),
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#F8FAFC',
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        noWrap: true,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', fontSize: '0.7rem' }}
            >
              © 2024 Your Shikshak
            </Typography>
          </Box>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            minWidth: 0,
            height: 'calc(100vh / var(--app-scale))',
            overflowY: 'auto',
          }}
        >
          {/* Spacer to offset fixed AppBar height */}
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64, md: 70 } }} />
          <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3, lg: 4 } }}>
            {children || <Outlet />}
          </Box>
        </Box>
      </Box>
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
    </Box>
  );
};

export default StudentLayout;
