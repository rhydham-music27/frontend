import React from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps, SnackbarCloseReason } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

interface SnackbarNotificationProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="left" />;
};

const iconMapping = {
  success: <CheckCircleIcon fontSize="small" />,
  error: <ErrorIcon fontSize="small" />,
  warning: <WarningIcon fontSize="small" />,
  info: <InfoIcon fontSize="small" />,
};

const SnackbarNotification: React.FC<SnackbarNotificationProps> = ({
  open,
  message,
  severity = 'info',
  onClose,
  autoHideDuration = 6000,
}) => {
  // Wrap MUI onClose to always close regardless of reason (including 'clickaway')
  const handleClose = (_event?: React.SyntheticEvent | Event, _reason?: SnackbarCloseReason) => {
    onClose();
  };
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert 
        onClose={handleClose}
        severity={severity}
        icon={iconMapping[severity]}
        sx={{ 
          width: '100%',
          minWidth: 300,
          borderRadius: '12px',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
          fontWeight: 500,
          '& .MuiAlert-icon': {
            fontSize: 22,
          },
        }}
        variant="filled"
        onClick={handleClose}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarNotification;