import React from 'react';
import { Box, Card, CardContent, CardActions, Typography, IconButton, Chip, Grid } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import { IDocument } from '../../types';

interface Props {
  documents: IDocument[];
  onDelete?: (index: number) => void;
  canDelete?: boolean;
  onView?: (doc: IDocument) => void;
}

const getIcon = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <PictureAsPdfIcon color="error" />;
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return <ImageIcon color="primary" />;
  return <VisibilityIcon />;
};

const fmt = (d?: Date) => (d ? new Date(d).toLocaleString() : '-');

export default function DocumentViewer({ documents, onDelete, canDelete = false, onView }: Props) {
  if (!documents || documents.length === 0) {
    return <Typography color="text.secondary">No documents uploaded yet.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {documents.map((doc, idx) => {
        const friendlyType = (doc.documentType || '').replace(/_/g, ' ');
        return (
          <Grid item xs={12} sm={12} md={6} key={`${doc.documentUrl}-${idx}`}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'grey.200',
                boxShadow: '0 10px 25px rgba(15,23,42,0.08)',
                height: '100%',
              }}
            >
              <CardContent sx={{ pb: 1.5 }}>
                <Box display="flex" alignItems="center" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1.25}>
                    {getIcon(doc.documentUrl)}
                    <Box>
                      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                        {friendlyType || 'Document'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.documentUrl.split('.').pop()?.toUpperCase() || 'FILE'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    size="small"
                    label={doc.verifiedAt ? 'Verified' : 'Pending'}
                    color={doc.verifiedAt ? 'success' : 'warning'}
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Uploaded: {fmt(doc.uploadedAt)}
                </Typography>
                {doc.verifiedAt && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Verified: {fmt(doc.verifiedAt)}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ pt: 0.5, pb: 1.5, px: 1.5, justifyContent: canDelete ? 'space-between' : 'flex-start' }}>
                <Box>
                  <IconButton size="small" onClick={() => onView && onView(doc)} title="View">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => window.open(doc.documentUrl, '_blank')} title="Download">
                    <DownloadIcon />
                  </IconButton>
                </Box>
                {canDelete && (
                  <IconButton size="small" color="error" onClick={() => onDelete && onDelete(idx)} title="Delete">
                    <DeleteIcon />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
