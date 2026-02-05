import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface PermissionDeniedDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  navigateOnClose?: boolean;
}

const PermissionDeniedDialog: React.FC<PermissionDeniedDialogProps> = ({ 
  open, 
  onClose, 
  message = "You don't have permission to access this. If you think this is a mistake then contact the admin.",
  navigateOnClose = false 
}) => {
  const navigate = useNavigate();

  const handleOk = () => {
    onClose();
    if (navigateOnClose) {
      navigate('/');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Access Denied</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOk} variant="contained" color="primary">
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionDeniedDialog;
