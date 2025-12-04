import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardContent, Button, Stack, Breadcrumbs, Link as MUILink, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem } from '@mui/material';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { listNotes, createFolder, uploadNoteFile } from '../../services/notesService';

interface NoteItem {
  id: string;
  name: string;
  type: 'FOLDER' | 'FILE';
  mimeType?: string;
  url?: string;
}

const NotesDrivePage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [items, setItems] = useState<NoteItem[]>([]);
  const [path, setPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'My Notes' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [grade, setGrade] = useState('');
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<NoteItem | null>(null);

  const currentFolderId = path[path.length - 1]?.id || null;

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listNotes(currentFolderId);
      setItems(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId]);

  const handleItemClick = (item: NoteItem) => {
    if (item.type === 'FOLDER') {
      setPath((prev) => [...prev, { id: item.id, name: item.name }]);
      return;
    }
    // FILE: open PDF viewer dialog
    setSelectedFile(item);
    setViewerOpen(true);
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await createFolder({ name: newFolderName.trim(), parentId: currentFolderId, grade: grade.trim() || undefined } as any);
      setNewFolderName('');
      setGrade('');
      setNewFolderOpen(false);
      await loadItems();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      await uploadNoteFile({ file, parentId: currentFolderId, grade: grade.trim() || undefined });
      await loadItems();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} spacing={2}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drive-style storage for notes and documents for Admin, Manager, and Coordinator.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<CreateNewFolderIcon />}
            onClick={() => setNewFolderOpen(true)}
          >
            New Folder
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload'}
            <input hidden type="file" onChange={handleUpload} />
          </Button>
        </Stack>
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
                    <Typography
                      variant="subtitle2"
                      noWrap
                    >
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
                No notes yet. Create a folder or upload a file to get started.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog open={newFolderOpen} onClose={() => setNewFolderOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create new folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Grade"
            select
            fullWidth
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="1st">1st</MenuItem>
            <MenuItem value="2nd">2nd</MenuItem>
            <MenuItem value="3rd">3rd</MenuItem>
            <MenuItem value="4th">4th</MenuItem>
            <MenuItem value="5th">5th</MenuItem>
            <MenuItem value="6th">6th</MenuItem>
            <MenuItem value="7th">7th</MenuItem>
            <MenuItem value="8th">8th</MenuItem>
            <MenuItem value="9th">9th</MenuItem>
            <MenuItem value="10th">10th</MenuItem>
            <MenuItem value="11th">11th</MenuItem>
            <MenuItem value="12th">12th</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewerOpen}
        onClose={() => { setViewerOpen(false); setSelectedFile(null); }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedFile?.name || 'Document'}
        </DialogTitle>
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
          <Button onClick={() => { setViewerOpen(false); setSelectedFile(null); }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotesDrivePage;
