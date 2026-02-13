import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void | Promise<void>;
  onClose?: () => void; // new preferred prop
  onCancel?: () => void; // deprecated but kept for compatibility
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'info'; // deprecated in favor of severity
  severity?: 'warning' | 'error' | 'info' | 'success';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  onConfirm,
  onClose,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  severity = 'warning',
  loading = false,
}) => {
  const color = ((): 'primary' | 'error' | 'warning' | 'success' | 'info' => {
    if (confirmColor) return confirmColor;
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
      default:
        return 'primary';
    }
  })();

  const handleClose = onClose || onCancel || (() => {});

  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />;
      case 'warning':
        return <WarningAmberIcon sx={{ fontSize: 48, color: 'warning.main' }} />;
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />;
      default:
        return <InfoOutlinedIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Box display="flex" alignItems="center" gap={2}>
          {getIcon()}
          <Box>
            <Box fontWeight={700} fontSize="1.25rem">
              {title}
            </Box>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'text.secondary',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.9375rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ 
            borderRadius: '10px',
            fontWeight: 600,
            px: 3,
          }}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color={color}
          sx={{ 
            borderRadius: '10px',
            fontWeight: 600,
            px: 3,
          }}
          disabled={loading}
        >
          {loading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={18} color="inherit" />
              {confirmText}
            </Box>
          ) : (
            confirmText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;