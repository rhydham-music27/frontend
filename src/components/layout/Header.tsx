import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, Divider, Badge, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import useAuth from '../../hooks/useAuth';
import { USER_ROLES } from '../../constants';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from './NotificationsPanel';
import useNotifications from '../../hooks/useNotifications';
import { getMyProfile } from '../../services/tutorService';
import { ITutor } from '../../types';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications({ page: 1, limit: 20, enabled: Boolean(user) && notifOpen });
  const [tutorProfile, setTutorProfile] = useState<ITutor | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    const role = user?.role;
    const target =
      role === USER_ROLES.COORDINATOR
        ? '/coordinator-profile'
        : role === USER_ROLES.TUTOR
        ? '/tutor-profile'
        : '/profile';
    navigate(target);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const initials =
    user?.name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'YS';

  useEffect(() => {
    const loadTutorAvatar = async () => {
      if (!user || user.role !== USER_ROLES.TUTOR) return;
      try {
        const res = await getMyProfile();
        const tutor = res.data;
        setTutorProfile(tutor);
        const profilePhotoDoc = (tutor.documents || []).find((doc) => doc.documentType === 'PROFILE_PHOTO');
        if (profilePhotoDoc) {
          setAvatarUrl(profilePhotoDoc.documentUrl);
        } else {
          setAvatarUrl(undefined);
        }
      } catch {
        setAvatarUrl(undefined);
      }
    };

    loadTutorAvatar();
  }, [user]);

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: '#001F54',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64, md: 70 }, px: { xs: 1, sm: 2 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{
            display: { md: 'none', xs: 'inline-flex' },
            mr: { xs: 1, sm: 2 },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }} sx={{ flexGrow: 1 }}>
          <Box
            component="img"
            src="/1.jpg"
            alt="Your Shikshak Logo"
            sx={{
              height: { xs: 32, sm: 40 },
              width: { xs: 32, sm: 40 },
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              display: { xs: 'none', sm: 'block' },
            }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              Your Shikshak
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: { xs: 'none', md: 'block' },
                opacity: 0.9,
                fontSize: '0.7rem',
                lineHeight: 1,
              }}
            >
              Empowering Education
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1, md: 2 }}>
          <Tooltip title="Notifications" arrow>
            <IconButton
              color="inherit"
              onClick={() => setNotifOpen(true)}
              size="small"
              sx={{
                p: { xs: 0.75, sm: 1 },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontWeight: 700,
                    fontSize: { xs: '0.6rem', sm: '0.65rem' },
                    minWidth: { xs: 16, sm: 20 },
                    height: { xs: 16, sm: 20 },
                  },
                }}
              >
                <NotificationsIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account" arrow>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              size="small"
              sx={{
                p: { xs: 0.5, sm: 0.75 },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
                src={avatarUrl}
              >
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: '12px',
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || ''}
              </Typography>
            </Box>

            <MenuItem 
              onClick={handleProfile}
              sx={{ 
                py: 1.5, 
                gap: 1.5,
                '&:hover': {
                  backgroundColor: '#F8FAFC',
                },
              }}
            >
              <AccountCircleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">Profile</Typography>
            </MenuItem>

            <MenuItem 
              disabled
              sx={{ 
                py: 1.5, 
                gap: 1.5,
              }}
            >
              <SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">Settings</Typography>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                py: 1.5, 
                gap: 1.5,
                color: 'error.main',
                '&:hover': {
                  backgroundColor: '#FEF2F2',
                },
              }}
            >
              <LogoutIcon fontSize="small" />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>

          <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;