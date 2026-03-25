import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Container, Box, Typography, Button, Avatar, Stack, useScrollTrigger, alpha } from '@mui/material';

export const TutorLeadNavbar = () => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  return (
    <AppBar
      position="fixed"
      elevation={trigger ? 4 : 0}
      sx={{
        bgcolor: trigger ? alpha('#001F54', 0.98) : 'transparent',
        backdropFilter: trigger ? 'blur(12px)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: trigger ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: trigger ? 0.5 : 1.5, transition: 'all 0.4s' }}>
          {/* Logo + Brand */}
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none', '&:hover img': { transform: 'scale(1.05)' } }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'white',
                boxShadow: trigger ? '0 4px 12px rgba(0,0,0,0.15)' : '0 8px 16px rgba(0,0,0,0.2)',
                p: 0.5,
                transition: 'all 0.3s'
              }}
            >
              <Box
                component="img"
                src="/1.jpg"
                alt="YourShikshak"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', transition: 'transform 0.3s' }}
                onError={(e: any) => {
                  e.currentTarget.src = 'https://yourshikshak.in/assets/1-CFq2Wthp.jpg';
                }}
              />
            </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={900} 
                color="common.white" 
                sx={{ 
                  letterSpacing: '-0.03em', 
                  lineHeight: 1, 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  textTransform: 'uppercase'
                }}
              >
                YourShikshak
              </Typography>
              <Typography 
                variant="caption" 
                color="common.white" 
                sx={{ 
                  opacity: 0.7, 
                  fontWeight: 600, 
                  display: { xs: 'none', sm: 'block' },
                  letterSpacing: '0.05em',
                  fontSize: '0.65rem',
                  mt: 0.5
                }}
              >
                PREMIUM TUTORING NETWORK
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Nav Links */}
          <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {['Home', 'Blog', 'Contact'].map((item) => (
              <Button 
                key={item}
                component={RouterLink} 
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                color="inherit" 
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  px: 2.5, 
                  borderRadius: '12px',
                  opacity: 0.85,
                  '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.08)' }
                }}
              >
                {item}
              </Button>
            ))}
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              sx={{
                ml: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '12px',
                bgcolor: 'white',
                color: '#001F54',
                px: 3,
                boxShadow: '0 4px 14px rgba(255,255,255,0.2)',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.9),
                  boxShadow: '0 6px 20px rgba(255,255,255,0.3)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Sign In
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default TutorLeadNavbar;
