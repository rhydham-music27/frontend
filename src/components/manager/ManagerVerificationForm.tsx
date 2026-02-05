import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  alpha,
  useTheme,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { toast } from 'sonner';
import { uploadDocument } from '../../services/managerService';
import { IManager } from '../../types';

interface ManagerVerificationFormProps {
  onComplete: (manager: IManager) => void;
  initialData?: Partial<IManager>;
}

export const ManagerVerificationForm: React.FC<ManagerVerificationFormProps> = ({
  onComplete,
  initialData,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>(
    initialData?.documents?.reduce((acc, doc) => ({
      ...acc,
      [doc.documentType]: doc.documentUrl
    }), {}) || {}
  );

  const docTypes = [
    { type: 'PROFILE_PHOTO', label: 'Profile Photo', icon: PhotoCameraIcon, required: true },
    { type: 'AADHAAR', label: 'Aadhaar Card', icon: ContactPageIcon, required: true },
    { type: 'PAN', label: 'PAN Card', icon: AssignmentIndIcon, required: true },
  ];

  const handleFileUpload = async (type: string, file: File) => {
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB allowed.');
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const resp = await uploadDocument(type, file);
      if (resp.data) {
        setUploadedDocs(prev => ({
          ...prev,
          [type]: (resp.data as IManager).documents?.find(d => d.documentType === type)?.documentUrl || ''
        }));
        toast.success(`${type.replace('_', ' ')} uploaded successfully`);
        
        // Check if all required docs are uploaded to potentially notify parent
        const allRequiredUploaded = docTypes
          .filter(dt => dt.required)
          .every(dt => !!(resp.data as IManager).documents?.find(d => d.documentType === dt.type));
        
        if (allRequiredUploaded) {
          onComplete(resp.data as IManager);
        }
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || `Failed to upload ${type}`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const isComplete = docTypes
    .filter(dt => dt.required)
    .every(dt => !!uploadedDocs[dt.type]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={800} gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Identity Verification
      </Typography>
      
      <Grid container spacing={4}>
        {docTypes.map((doc, index) => {
          const Icon = doc.icon;
          const isUploaded = !!uploadedDocs[doc.type];
          const isLoading = loading[doc.type];

          return (
            <Grid item xs={12} md={4} key={doc.type}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    borderRadius: 4,
                    bgcolor: isUploaded ? alpha(theme.palette.success.main, 0.05) : 'background.paper',
                    border: '2px dashed',
                    borderColor: isUploaded 
                      ? theme.palette.success.main 
                      : alpha(theme.palette.divider, 0.2),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: isUploaded 
                        ? theme.palette.success.main 
                        : theme.palette.primary.main,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      borderRadius: '50%', 
                      bgcolor: isUploaded 
                        ? alpha(theme.palette.success.main, 0.1) 
                        : alpha(theme.palette.primary.main, 0.1),
                      color: isUploaded ? 'success.main' : 'primary.main'
                    }}
                  >
                    <Icon fontSize="large" />
                  </Box>
                  
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {doc.label} {doc.required && <Box component="span" color="error.main">*</Box>}
                  </Typography>

                  <Box sx={{ mt: 'auto', width: '100%' }}>
                    {isUploaded ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
                          {doc.type === 'PROFILE_PHOTO' ? (
                            <Avatar 
                              src={uploadedDocs[doc.type]} 
                              sx={{ width: 80, height: 80, border: `2px solid ${theme.palette.success.main}` }}
                            />
                          ) : (
                            <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                          )}
                        </Box>
                        <Typography variant="caption" color="success.main" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                          Verified Upload
                        </Typography>
                        <Button 
                          size="small" 
                          variant="text" 
                          color="error"
                          onClick={() => setUploadedDocs(prev => {
                            const next = { ...prev };
                            delete next[doc.type];
                            return next;
                          })}
                          startIcon={<DeleteIcon />}
                        >
                          Replace
                        </Button>
                      </Box>
                    ) : (
                      <label htmlFor={`upload-${doc.type}`}>
                        <input
                          accept={doc.type === 'PROFILE_PHOTO' ? 'image/*' : 'image/*,application/pdf'}
                          id={`upload-${doc.type}`}
                          type="file"
                          style={{ display: 'none' }}
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.type, e.target.files[0])}
                          disabled={isLoading}
                        />
                        <Button
                          component="span"
                          variant="contained"
                          fullWidth
                          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                          disabled={isLoading}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700
                          }}
                        >
                          {isLoading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </label>
                    )}
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 6, p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderLeft: `4px solid ${theme.palette.info.main}` }}>
        <Typography variant="subtitle2" fontWeight={700} color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <HelpOutlineIcon fontSize="small" /> Why is this required?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          To maintain the security and trust of our platform, all managers must undergo a background verification process. Your documents are stored securely and used only for internal verification purposes.
        </Typography>
      </Box>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="success.main" fontWeight={700} gutterBottom>
                🎉 All required documents uploaded!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Our team will review your profile and verify your identity within 24-48 hours.
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                color="primary"
                onClick={() => onComplete({} as IManager)} // This will be called via the last upload but button is good for UX
                sx={{ 
                  px: 6, 
                  py: 1.5, 
                  borderRadius: 3, 
                  fontWeight: 800,
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                Proceed to Dashboard
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
