import React from 'react';
import { Container, Box, Card, CardContent, Typography, Grid, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import BookIcon from '@mui/icons-material/Book';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

const StudentNotesPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const studentInfo = {
    name: user?.name || 'Student',
    studentId: (user as any)?.studentId || 'N/A',
    grade: (user as any)?.grade || 'N/A',
  };

  // Mock study materials data - would come from API
  const studyMaterials = [
    {
      id: 1,
      title: 'Mathematics Chapter 5 Notes',
      subject: 'Mathematics',
      type: 'pdf',
      size: '2.5 MB',
      uploadDate: '2024-12-01',
      description: 'Complete notes for Chapter 5: Fractions and Decimals',
      downloadUrl: '#',
      previewUrl: '#',
    },
    {
      id: 2,
      title: 'Science Lab Video Tutorial',
      subject: 'Science',
      type: 'video',
      size: '45 MB',
      uploadDate: '2024-12-02',
      description: 'Video tutorial for plant growth experiment',
      downloadUrl: '#',
      previewUrl: '#',
    },
    {
      id: 3,
      title: 'English Grammar Worksheet',
      subject: 'English',
      type: 'document',
      size: '1.2 MB',
      uploadDate: '2024-12-03',
      description: 'Practice worksheet for grammar concepts',
      downloadUrl: '#',
      previewUrl: '#',
    },
    {
      id: 4,
      title: 'Mathematics Practice Problems',
      subject: 'Mathematics',
      type: 'pdf',
      size: '3.1 MB',
      uploadDate: '2024-12-04',
      description: 'Additional practice problems with solutions',
      downloadUrl: '#',
      previewUrl: '#',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdfIcon sx={{ fontSize: 40, color: 'error.main' }} />;
      case 'video':
        return <VideoLibraryIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
      case 'document':
        return <DescriptionIcon sx={{ fontSize: 40, color: 'secondary.main' }} />;
      default:
        return <BookIcon sx={{ fontSize: 40, color: 'grey.500' }} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'error';
      case 'video':
        return 'primary';
      case 'document':
        return 'secondary';
      default:
        return 'default';
    }
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

      {/* Study Materials Grid */}
      <Grid container spacing={3}>
        {studyMaterials.map((material) => (
          <Grid item xs={12} sm={6} md={4} key={material.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box mb={2}>
                  {getTypeIcon(material.type)}
                </Box>

                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: '1rem' }}>
                  {material.title}
                </Typography>

                <Box display="flex" justifyContent="center" gap={1} mb={2}>
                  <Chip
                    label={material.subject}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip
                    label={material.type}
                    color={getTypeColor(material.type) as any}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 48 }}>
                  {material.description}
                </Typography>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Size:</strong> {material.size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Uploaded:</strong> {material.uploadDate}
                  </Typography>
                </Box>

                <Box display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => window.open(material.downloadUrl, '_blank')}
                  >
                    Download
                  </Button>
                  {material.type !== 'video' && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => window.open(material.previewUrl, '_blank')}
                    >
                      Preview
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Back Button */}
      <Box mt={4}>
        <Button
          variant="text"
          onClick={() => navigate('/student-dashboard')}
        >
          ← Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default StudentNotesPage;
