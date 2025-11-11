import React from 'react';
import { Alert, AlertTitle, Collapse } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorAlertProps {
  error: string | null;
  onClose?: () => void;
  title?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose, title = 'Error' }) => {
  return (
    <Collapse in={!!error}>
      {error && (
        <Alert 
          severity="error" 
          onClose={onClose}
          icon={<ErrorOutlineIcon />}
          sx={{ 
            mb: 3,
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              fontSize: 24,
            },
          }}
          className="animate-slide-in-down"
        >
          <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>
          {error}
        </Alert>
      )}
    </Collapse>
  );
};

export default ErrorAlert;