import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface PermissionDeniedDialogProps {
  open: boolean;
  onClose: () => void;
}

const PermissionDeniedDialog: React.FC<PermissionDeniedDialogProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleOk = () => {
    onClose();
    navigate('/');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Access Denied</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          You don&apos;t have permission to access this. If you think this is a mistake then contact the admin.
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
