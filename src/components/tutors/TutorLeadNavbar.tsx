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
        bgcolor: trigger ? alpha('#001F54', 0.95) : 'transparent',
        backdropFilter: trigger ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease-in-out',
        borderBottom: trigger ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: trigger ? 0.5 : 1, transition: 'all 0.3s ease-in-out' }}>
          {/* Logo + Brand */}
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Box
                component="img"
                src="/1.jpg"
                alt="YourShikshak Logo"
                sx={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%' }}
                onError={(e: any) => {
                  e.currentTarget.src = 'https://yourshikshak.in/assets/1-CFq2Wthp.jpg';
                }}
              />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} color="common.white" sx={{ letterSpacing: '-0.02em' }}>
                YourShikshak
              </Typography>
              <Typography variant="caption" color="common.white" sx={{ opacity: 0.8, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                Empowering Education
              </Typography>
            </Box>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Nav Links */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button component={RouterLink} to="/" color="inherit" sx={{ textTransform: 'none', fontWeight: 600, px: 2, borderRadius: 2 }}>
              Home
            </Button>
            <Button component={RouterLink} to="/blog" color="inherit" sx={{ textTransform: 'none', fontWeight: 600, px: 2, borderRadius: 2 }}>
              Blog
            </Button>
            <Button component={RouterLink} to="/#contact" color="inherit" sx={{ textTransform: 'none', fontWeight: 600, px: 2, borderRadius: 2 }}>
              Contact
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="inherit"
              sx={{
                ml: 1,
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Partner Login
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default TutorLeadNavbar;