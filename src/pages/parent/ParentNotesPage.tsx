import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Breadcrumbs,
  Link as MUILink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import { listParentNotes } from '../../services/notesService';

interface NoteItem {
  id: string;
  name: string;
  type: 'FOLDER' | 'FILE';
  mimeType?: string;
  url?: string;
}

const ParentNotesPage: React.FC = () => {
  const [items, setItems] = useState<NoteItem[]>([]);
  const [path, setPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Notes' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<NoteItem | null>(null);

  const currentFolderId = path[path.length - 1]?.id || null;

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listParentNotes(currentFolderId);
      setItems(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId]);

  const handleItemClick = (item: NoteItem) => {
    if (item.type === 'FOLDER') {
      setPath((prev) => [...prev, { id: item.id, name: item.name }]);
      return;
    }
    setSelectedFile(item);
    setViewerOpen(true);
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} spacing={2}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View notes and documents shared with you about your child&apos;s classes.
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        {path.length > 1 && (
          <IconButton size="small" onClick={() => handleBreadcrumbClick(path.length - 2)}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 13 }}>
          {path.map((crumb, index) => (
            <MUILink
              key={crumb.id ?? 'root'}
              color={index === path.length - 1 ? 'text.primary' : 'inherit'}
              underline={index === path.length - 1 ? 'none' : 'hover'}
              sx={{ cursor: index === path.length - 1 ? 'default' : 'pointer' }}
              onClick={index === path.length - 1 ? undefined : () => handleBreadcrumbClick(index)}
            >
              {crumb.name}
            </MUILink>
          ))}
        </Breadcrumbs>
      </Stack>

      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.id}>
            <Card variant="outlined">
              <CardActionArea onClick={() => handleItemClick(item)}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {item.type === 'FOLDER' ? (
                    <FolderIcon color="primary" />
                  ) : (
                    <DescriptionIcon color="action" />
                  )}
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="subtitle2" noWrap>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.type === 'FOLDER' ? 'Folder' : item.mimeType || 'File'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        {!loading && items.length === 0 && (
          <Grid item xs={12}>
            <Box textAlign="center" py={6}>
              <Typography variant="body2" color="text.secondary">
                No notes are available yet. When your coordinator shares documents, they will appear here.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedFile(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{selectedFile?.name || 'Document'}</DialogTitle>
        <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
          {selectedFile?.url ? (
            <Box sx={{ width: '100%', height: '100%' }}>
              <iframe
                src={`${selectedFile.url}#toolbar=0&navpanes=0&scrollbar=0`}
                title={selectedFile.name}
                style={{ border: 'none', width: '100%', height: '100%' }}
              />
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                This file does not have a preview URL.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewerOpen(false);
              setSelectedFile(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentNotesPage;
