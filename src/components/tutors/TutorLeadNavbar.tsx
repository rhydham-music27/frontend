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
        bgcolor: '#001F54',
        boxShadow: trigger ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
        transition: 'all 0.3s ease-in-out',
        borderBottom: trigger ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 } }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
              <Typography 
                variant="h6" 
                fontWeight={900} 
                color="common.white" 
                sx={{ 
                  letterSpacing: '-0.03em', 
                  lineHeight: 1, 
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  textTransform: 'uppercase'
                }}
              >
                Your Shikshak
              </Typography>
              <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.3)', display: { xs: 'none', sm: 'block' } }} />
              <Typography 
                variant="caption" 
                color="common.white" 
                sx={{ 
                  opacity: 0.85, 
                  fontWeight: 600, 
                  letterSpacing: '0.05em',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  lineHeight: 1,
                  textTransform: 'uppercase'
                }}
              >
                Empowering Education
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Nav Links */}
          <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
           
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default TutorLeadNavbar;
