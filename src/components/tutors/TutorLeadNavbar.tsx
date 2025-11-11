import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Container, Box, Typography, Button, Avatar, Stack } from '@mui/material';

export const TutorLeadNavbar = () => {
  return (
    <AppBar position="fixed" elevation={1} sx={{ bgcolor: '#001F54' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo + Brand */}
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
            <Avatar sx={{ width: 44, height: 44, bgcolor: 'white' }}>
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
              <Typography variant="h6" fontWeight={700} color="common.white">
                YourShikshak
              </Typography>
              <Typography variant="caption" color="common.white" sx={{ opacity: 0.9 }}>
                Empowering Education
              </Typography>
            </Box>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Nav Links */}
          <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button component={RouterLink} to="/" color="inherit" sx={{ textTransform: 'none' }}>
              Home
            </Button>
            <Button component={RouterLink} to="/blog" color="inherit" sx={{ textTransform: 'none' }}>
              Blog
            </Button>
            <Button component={RouterLink} to="/#contact" color="inherit" sx={{ textTransform: 'none' }}>
              Contact
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};