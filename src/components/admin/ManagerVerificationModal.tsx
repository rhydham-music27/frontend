import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  alpha,
  useTheme,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import { IManager } from '../../types';
import { toast } from 'sonner';
import managerService from '../../services/managerService';

interface ManagerVerificationModalProps {
  open: boolean;
  manager: IManager | null;
  onClose: () => void;
  onVerificationComplete: () => void;
}

export const ManagerVerificationModal: React.FC<ManagerVerificationModalProps> = ({
  open,
  manager,
  onClose,
  onVerificationComplete,
}) => {
  const theme = useTheme();
  const [verifiedDocuments, setVerifiedDocuments] = useState<Record<string, boolean>>({});
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const handleVerifyDocument = async (docId: string) => {
    if (!manager || !manager.documents) return;

    setVerifyingDocId(docId);
    try {
      // Update the document verification status in the backend
      const updatedDocuments = manager.documents.map(doc => ({
        ...doc,
        verifiedAt: doc.documentUrl === docId ? new Date() : doc.verifiedAt,
      }));

      await managerService.updateManagerProfile(manager.id, {
        documents: updatedDocuments,
      } as any);

      setVerifiedDocuments(prev => ({
        ...prev,
        [docId]: true,
      }));
      toast.success('Document verified!');
    } catch (error: any) {
      console.error('Failed to verify document:', error);
      toast.error(error.response?.data?.message || 'Failed to verify document');
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleCompleteVerification = async () => {
    if (!manager?.documents) return;

    const allDocsVerified = (manager.documents || []).every(doc => verifiedDocuments[doc.documentUrl] || doc.verifiedAt);
    
    if (!allDocsVerified) {
      toast.error('Please verify all documents before marking the manager as verified');
      return;
    }

    setSubmittingVerification(true);
    try {
      // Update manager verification status
      const updatePayload: any = {
        verificationStatus: 'VERIFIED',
      };
      await managerService.updateManagerProfile(manager.id, updatePayload);

      toast.success('Manager verified successfully!');
      onVerificationComplete();
      onClose();
    } catch (error: any) {
      console.error('Failed to update verification status:', error);
      toast.error(error.response?.data?.message || 'Failed to update verification status');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const allDocsVerified = (manager?.documents || []).every(doc => verifiedDocuments[doc.documentUrl] || doc.verifiedAt);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <VerifiedIcon color="primary" />
          Manager Document Verification
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {!manager ? (
          <CircularProgress />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Manager Info */}
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Verifying Manager
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {manager.user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {manager.user?.email}
                </Typography>
                <Box mt={2}>
                  <Chip 
                    label={manager.verificationStatus} 
                    color={manager.verificationStatus === 'VERIFIED' ? 'success' : manager.verificationStatus === 'REJECTED' ? 'error' : 'warning'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Documents */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Documents ({manager.documents?.length || 0})
              </Typography>
              
              <AnimatePresence mode="wait">
                {!manager.documents || manager.documents.length === 0 ? (
                  <Alert severity="warning">No documents uploaded yet</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {manager.documents.map((doc, index) => {
                      const isVerified = verifiedDocuments[doc.documentUrl] || doc.verifiedAt;
                      return (
                        <motion.div
                          key={doc.documentUrl}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card 
                            sx={{
                              border: '2px solid',
                              borderColor: isVerified ? 'success.main' : 'divider',
                              bgcolor: isVerified ? alpha(theme.palette.success.main, 0.05) : 'background.paper',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                                <Box flex={1}>
                                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    {doc.documentType}
                                  </Typography>
                                  {/* Display document preview */}
                                  {doc.documentUrl && (
                                    <Box
                                      sx={{
                                        my: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: '#f5f5f5',
                                        maxHeight: 400,
                                        overflow: 'auto',
                                        border: '1px solid #e0e0e0',
                                      }}
                                    >
                                      {doc.documentUrl.toLowerCase().includes('.pdf') || doc.documentUrl.toLowerCase().endsWith('pdf') ? (
                                        <Box
                                          component="iframe"
                                          src={doc.documentUrl}
                                          sx={{
                                            width: '100%',
                                            height: 400,
                                            border: 'none',
                                            borderRadius: 1,
                                          }}
                                        />
                                      ) : (
                                        <Box
                                          component="img"
                                          src={doc.documentUrl}
                                          alt={doc.documentType}
                                          sx={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: 400,
                                            borderRadius: 1,
                                            objectFit: 'contain',
                                          }}
                                        />
                                      )}
                                    </Box>
                                  )}
                                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                                    <Chip 
                                      label={`Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    {doc.verifiedAt && (
                                      <Chip 
                                        label={`Verified: ${new Date(doc.verifiedAt).toLocaleDateString()}`}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                </Box>
                                <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                                  {isVerified && (
                                    <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'success.main' }}>
                                      <CheckCircleIcon fontSize="small" />
                                      <Typography variant="caption" fontWeight={700}>
                                        Verified
                                      </Typography>
                                    </Box>
                                  )}
                                  {!isVerified && (
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      onClick={() => handleVerifyDocument(doc.documentUrl)}
                                      disabled={verifyingDocId === doc.documentUrl}
                                      startIcon={verifyingDocId === doc.documentUrl ? <CircularProgress size={16} /> : undefined}
                                    >
                                      {verifyingDocId === doc.documentUrl ? 'Verifying...' : 'Verify'}
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </Box>
                )}
              </AnimatePresence>
            </Box>

            {/* Summary */}
            {manager.documents && manager.documents.length > 0 && (
              <Card sx={{ bgcolor: allDocsVerified ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.warning.main, 0.05) }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Documents Verified
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {Object.values(verifiedDocuments).filter(Boolean).length + manager.documents.filter(d => d.verifiedAt).length} / {manager.documents.length}
                      </Typography>
                    </Box>
                    {allDocsVerified && (
                      <Chip label="Ready to Verify" color="success" />
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={submittingVerification}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="success"
          onClick={handleCompleteVerification}
          disabled={!allDocsVerified || submittingVerification}
          startIcon={submittingVerification ? <CircularProgress size={20} /> : <VerifiedIcon />}
        >
          {submittingVerification ? 'Verifying Manager...' : 'Complete Verification'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagerVerificationModal;
