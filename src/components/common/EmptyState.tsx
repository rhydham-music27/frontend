import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = <InboxIcon />, 
  title, 
  description, 
  action 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, sm: 8 },
        px: { xs: 2, sm: 3 },
        textAlign: 'center',
      }}
      className="animate-fade-in"
    >
      <Box
        sx={{
          width: { xs: 64, sm: 80 },
          height: { xs: 64, sm: 80 },
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: { xs: 2, sm: 3 },
          '& svg': {
            fontSize: { xs: 32, sm: 40 },
            color: 'text.secondary',
          },
        }}
      >
        {icon}
      </Box>

      <Typography 
        variant="h6" 
        fontWeight={600}
        color="text.primary"
        sx={{ 
          mb: 1,
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: { xs: 2.5, sm: 3 }, 
            maxWidth: 400,
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
          }}
        >
          {description}
        </Typography>
      )}

      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          size={{ xs: 'medium', sm: 'large' } as any}
          sx={{
            borderRadius: { xs: '10px', sm: '12px' },
            fontWeight: 600,
            px: { xs: 2.5, sm: 3 },
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;