import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface IDocument {
  documentType: string;
  documentUrl: string;
  uploadedAt: Date;
  verifiedAt?: Date;
}

interface Props {
  open: boolean;
  onClose: () => void;
  document: IDocument | null;
}

const DocumentViewerModal: React.FC<Props> = ({ open, onClose, document }) => {
  if (!document) return null;

  const cleanUrl = document.documentUrl.toLowerCase().split('?')[0];
  const isPdf = cleanUrl.endsWith('.pdf');
  const isImage = cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|jfif)$/i) || document.documentUrl.includes('image');

  console.log('DocumentViewerModal Debug:', {
    originalUrl: document.documentUrl,
    cleanUrl,
    isPdf,
    isImage,
    type: document.documentType
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ textTransform: 'capitalize' }}>
          {document.documentType.replace(/_/g, ' ')}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.100' }}>
        {isPdf ? (
          <iframe
            src={document.documentUrl}
            title="document"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : isImage ? (
          <Box
            component="img"
            src={document.documentUrl}
            alt={document.documentType}
            crossOrigin="anonymous"
            onError={() => console.error('DocumentViewerModal Image Error', document.documentUrl)}
            sx={{
              maxWidth: '95%',
              maxHeight: '95%',
              objectFit: 'contain',
              boxShadow: 10,
              borderRadius: '8px'
            }}
          />
        ) : (
          <Box textAlign="center" color="text.secondary" p={4}>
            <Typography variant="h6">Preview not available</Typography>
            <Typography>This document type cannot be displayed in the viewer.</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerModal;
