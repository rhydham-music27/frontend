import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  error: string | null;
  title?: string;
}

/**
 * Reusable error dialog component for displaying user-friendly error messages
 */
const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  onClose,
  error,
  title = 'Something Went Wrong',
}) => {
  if (!error) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ErrorOutlineIcon color="error" />
          <Typography variant="h6" component="span" fontWeight={700}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          If this problem persists, please contact support.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Got It
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
