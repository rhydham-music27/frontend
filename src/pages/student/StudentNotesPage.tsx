import React, { useEffect, useState } from 'react';
import { Container, Box, Card, CardContent, Typography, Grid, Button, CardActionArea, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Breadcrumbs, Link as MUILink } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getStudentNotes } from '../../services/studentService';

interface NoteItem {
  id: string;
  name: string;
  type: 'FOLDER' | 'FILE';
  mimeType?: string;
  url?: string;
}

const StudentNotesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [items, setItems] = useState<NoteItem[]>([]);
  const [path, setPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Notes' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<NoteItem | null>(null);

  const studentInfo = {
    name: user?.name || 'Student',
    studentId: (user as any)?.studentId || 'N/A',
    grade: (user as any)?.grade || 'N/A',
  };

  const currentFolderId = path[path.length - 1]?.id || null;

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getStudentNotes({ parentId: currentFolderId });
        const data = (res as any)?.data || [];
        const mapped: NoteItem[] = (Array.isArray(data) ? data : []).map((n: any) => ({
          id: String(n.id),
          name: n.name,
          type: n.type,
          mimeType: n.mimeType,
          url: n.url,
        }));
        setItems(mapped);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load notes');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    void loadItems();
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Study Materials
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access notes and study materials
        </Typography>
      </Box>

      {/* Student Info */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #001F54 0%, #4589FF 100%)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
            Student Information
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
              <strong>Name:</strong> {studentInfo.name}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
              <strong>ID:</strong> {studentInfo.studentId}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
              <strong>Grade:</strong> {studentInfo.grade}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Notes drive-style section */}
      <Box mt={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View notes and documents shared for your grade.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          {path.length > 1 && (
            <Button
              size="small"
              startIcon={<ArrowBackIcon fontSize="small" />}
              onClick={() => handleBreadcrumbClick(path.length - 2)}
            >
              Back
            </Button>
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
                    {item.type === 'FOLDER' ? <FolderIcon color="primary" /> : <DescriptionIcon color="action" />}
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
                  No notes are available yet. When your coordinator shares documents for your grade, they will appear here.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Back Button */}
      <Box mt={4}>
        <Button
          variant="text"
          onClick={() => navigate('/student-dashboard')}
        >
          ← Back to Dashboard
        </Button>
      </Box>

      {/* Preview Dialog */}
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
    </Container>
  );
};

export default StudentNotesPage;
