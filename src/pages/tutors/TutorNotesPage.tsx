import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid2,
  Card,
  CardContent,
  IconButton,
  Button,
  Breadcrumbs,
  Link,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
  Tooltip,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { listTutorNotes, NoteItemDto } from '../../services/notesService';
import ErrorAlert from '../../components/common/ErrorAlert';
import api from '../../services/api';

const TutorNotesPage: React.FC = () => {
  const [items, setItems] = useState<NoteItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'My Notes' }]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<NoteItemDto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const currentParentId = path[path.length - 1].id;

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listTutorNotes(currentParentId);
      setItems(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [currentParentId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleFolderClick = (id: string, name: string) => {
    setPath([...path, { id, name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath(path.slice(0, index + 1));
  };

  const handleFileClick = (item: NoteItemDto) => {
    setSelectedFile(item);
    setViewerOpen(true);
  };

  useEffect(() => {
    const loadPreview = async () => {
      if (!viewerOpen || !selectedFile?.url) return;
      try {
        setPreviewLoading(true);
        const res = await api.get(selectedFile.url, { responseType: 'blob' });
        const objectUrl = URL.createObjectURL(res.data);
        setPreviewUrl(objectUrl);
      } catch (e: any) {
        setPreviewUrl(null);
        setError(e?.response?.data?.message || e?.message || 'Failed to load preview');
      } finally {
        setPreviewLoading(false);
      }
    };

    void loadPreview();
  }, [viewerOpen, selectedFile?.url]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Note Repository
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            {path.map((p, index) => (
              <Link
                key={index}
                component="button"
                underline="hover"
                color={index === path.length - 1 ? 'text.primary' : 'inherit'}
                onClick={() => handleBreadcrumbClick(index)}
              >
                {p.name}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      </Box>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid2 container spacing={3}>
          {items.length === 0 ? (
            <Box textAlign="center" width="100%" py={8}>
              <Typography color="text.secondary">This folder is empty.</Typography>
            </Box>
          ) : (
            items.map((item) => (
              <Grid2 key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  sx={{
                    cursor: item.type === 'FOLDER' ? 'pointer' : 'default',
                    '&:hover': { boxShadow: 4 },
                    transition: 'box-shadow 0.2s',
                  }}
                  onClick={() => item.type === 'FOLDER' && handleFolderClick(item.id, item.name)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      {item.type === 'FOLDER' ? (
                        <FolderIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      ) : (
                        <InsertDriveFileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                      )}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {item.name}
                        </Typography>
                        {item.type === 'FILE' && (
                          <Typography variant="caption" color="text.secondary">
                            {item.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Typography>
                        )}
                      </Box>
                      {item.type === 'FILE' && item.url && (
                        <Tooltip title="View File">
                          <IconButton size="small" onClick={() => handleFileClick(item)}>
                            <UploadFileIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
            ))
          )}
        </Grid2>
      )}
      <Dialog
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedFile(null);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{selectedFile?.name || 'Document'}</DialogTitle>
        <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
          {previewLoading ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Loading preview...
              </Typography>
            </Box>
          ) : previewUrl ? (
            <Box sx={{ width: '100%', height: '100%' }}>
              <iframe
                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title={selectedFile?.name || 'Document'}
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
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TutorNotesPage;
