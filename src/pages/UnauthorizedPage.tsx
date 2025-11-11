import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';
import HomeIcon from '@mui/icons-material/Home';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box 
          textAlign="center" 
          className="animate-scale-in"
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: '24px',
            background: 'white',
            boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
            }}
          >
            <BlockIcon sx={{ fontSize: 64, color: 'error.main' }} />
          </Box>

          <Typography 
            variant="h3" 
            fontWeight={800}
            sx={{ 
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem' },
              background: 'linear-gradient(135deg, #DA1E28 0%, #FF4D5E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            403
          </Typography>

          <Typography 
            variant="h5" 
            fontWeight={700}
            color="text.primary"
            sx={{ mb: 2 }}
          >
            Access Denied
          </Typography>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </Typography>

          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #0F62FE 0%, #4589FF 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0043CE 0%, #0F62FE 100%)',
              },
            }}
          > 
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default UnauthorizedPage;