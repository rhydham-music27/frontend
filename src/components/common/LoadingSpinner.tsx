import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, fullScreen = false, message }) => {
  if (fullScreen) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh" 
        flexDirection="column" 
        gap={3}
        className="animate-fade-in"
      >
        <Box position="relative">
          <CircularProgress 
            color="primary" 
            size={size} 
            thickness={4}
            sx={{
              animationDuration: '0.8s',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress 
              color="secondary" 
              size={size * 0.6} 
              thickness={4}
              sx={{
                animationDuration: '1.2s',
                animationDirection: 'reverse',
              }}
            />
          </Box>
        </Box>
        {message && (
          <Typography 
            variant="body1" 
            color="text.secondary"
            fontWeight={500}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <CircularProgress 
      color="primary" 
      size={size}
      thickness={4}
      sx={{
        animationDuration: '0.8s',
      }}
    />
  );
};

export default LoadingSpinner;