import React from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Container, 
    Button, 
    Box, 
    alpha, 
    useTheme,
    Link
} from '@mui/material';
import { School, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PublicNavbar: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: 'none',
                top: 0,
                zIndex: theme.zIndex.drawer + 1
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ height: 80, justifyContent: 'space-between' }}>
                    {/* Logo Section */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            cursor: 'pointer',
                            '&:hover opacity': 0.8
                        }}
                        onClick={() => navigate('/')}
                    >
                        <Box
                            component="img"
                            src="/1.jpg"
                            alt="Your Shikshak Logo"
                            sx={{
                                height: 40,
                                width: 40,
                                borderRadius: '50%',
                                border: '2px solid rgba(0, 0, 0, 0.05)',
                                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`
                            }}
                        />
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontFamily: "'Manrope', sans-serif", 
                                fontWeight: 800, 
                                color: '#0f172a',
                                letterSpacing: -0.5,
                                fontSize: '1.25rem'
                            }}
                        >
                            YOUR SHIKSHAK
                        </Typography>
                    </Box>

                    {/* Navigation Section */}
                    <Box>
                        <Button 
                            variant="text"
                            onClick={() => navigate('/')}
                            startIcon={<ArrowBack fontSize="small" />}
                            sx={{ 
                                textTransform: 'none', 
                                fontWeight: 700, 
                                color: 'text.secondary',
                                fontFamily: "'Inter', sans-serif",
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    color: 'primary.main'
                                }
                            }}
                        >
                            Back to Home
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default PublicNavbar;

