import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Props {
  open: boolean;
  onConfirm: () => void;
  link?: string;
}

const WhatsAppCommunityModal: React.FC<Props> = ({ open, onConfirm, link }) => {
  const theme = useTheme();
  const whatsappLink = link || "https://chat.whatsapp.com/YOUR_COMMUNITY_LINK";

  return (
    <Dialog 
      open={open} 
      maxWidth="xs" 
      fullWidth 
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        <Box 
          sx={{ 
            display: 'inline-flex', 
            p: 2, 
            borderRadius: '50%', 
            bgcolor: alpha('#25D366', 0.1), 
            mb: 2 
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 40, color: '#25D366' }} />
        </Box>
        <Typography variant="h5" fontWeight={800}>
          Join Our Community
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Since you've selected <strong>Offline</strong> as your preferred teaching mode, we require you to join our official WhatsApp community to receive the latest offline class opportunities in your area.
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<WhatsAppIcon />}
          href={whatsappLink}
          target="_blank"
          sx={{ 
            bgcolor: '#25D366', 
            '&:hover': { bgcolor: '#128C7E' },
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Join WhatsApp Group
        </Button>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button 
          variant="outlined" 
          fullWidth
          onClick={onConfirm}
          startIcon={<CheckCircleIcon />}
          sx={{ 
            borderRadius: 2,
            py: 1.2,
            fontWeight: 600,
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary
          }}
        >
          I have joined the group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WhatsAppCommunityModal;
