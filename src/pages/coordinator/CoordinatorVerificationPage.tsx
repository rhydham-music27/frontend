import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip,
  Button,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/Verified';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { VERIFICATION_STATUS } from '../../constants';
import { ICoordinator } from '../../types';
import * as coordinatorService from '../../services/coordinatorService';

const CoordinatorVerificationPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinatorProfile, setCoordinatorProfile] = useState<ICoordinator | null>(null);

  const [docType, setDocType] = useState<string>('AADHAAR');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const documentTypes = useMemo(
    () => ['AADHAAR', 'PROFILE_PHOTO', 'EXPERIENCE_PROOF', 'DEGREE', 'CERTIFICATE', 'OTHER'],
    []
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const profileRes = await coordinatorService.getCoordinatorByUserId(user.id);
        setCoordinatorProfile(profileRes.data as unknown as ICoordinator);
      } catch (e: any) {
        if (e?.response?.status === 404) {
          setCoordinatorProfile(null);
          setError('Coordinator profile not found. Please ask an administrator to create your coordinator profile.');
        } else {
          setError(e?.response?.data?.message || e?.response?.data?.error || 'Failed to load coordinator profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const verificationStatus = (user as any)?.verificationStatus || (coordinatorProfile as any)?.verificationStatus;
  const statusLabel = String(verificationStatus || VERIFICATION_STATUS.PENDING);

  const statusChip = useMemo(() => {
    const s = String(verificationStatus || VERIFICATION_STATUS.PENDING);
    if (s === VERIFICATION_STATUS.VERIFIED) {
      return <Chip label={s} color="success" size="small" icon={<VerifiedIcon />} />;
    }
    if (s === VERIFICATION_STATUS.REJECTED) {
      return <Chip label={s} color="error" size="small" />;
    }
    return <Chip label={s} color="warning" size="small" icon={<HourglassBottomIcon />} />;
  }, [verificationStatus]);

  const handleUploadDoc = async () => {
    if (!coordinatorProfile) return;
    if (!docType) {
      setDocError('Please select a document type');
      return;
    }
    if (!docFile) {
      setDocError('Please choose a file');
      return;
    }

    const docs = Array.isArray((coordinatorProfile as any)?.documents) ? ((coordinatorProfile as any).documents as any[]) : [];
    if (docs.some((d: any) => d?.documentType === docType)) {
      setDocError('This document type has already been uploaded. Please delete the existing one before uploading again.');
      return;
    }

    try {
      setDocUploading(true);
      setDocError(null);

      const coordinatorId = (coordinatorProfile as any).id || (coordinatorProfile as any)._id;
      const resp = await coordinatorService.uploadCoordinatorDocument(String(coordinatorId), docType, docFile);
      setCoordinatorProfile(resp.data as unknown as ICoordinator);
      setDocType('AADHAAR');
      setDocFile(null);
      setSnackbar({ open: true, message: 'Document uploaded', severity: 'success' });
    } catch (e: any) {
      setDocError(e?.response?.data?.message || e?.response?.data?.error || 'Failed to upload document');
    } finally {
      setDocUploading(false);
    }
  };

  const handleDeleteDoc = async (index: number) => {
    if (!coordinatorProfile) return;
    try {
      setDocUploading(true);
      setDocError(null);

      const coordinatorId = (coordinatorProfile as any).id || (coordinatorProfile as any)._id;
      const resp = await coordinatorService.deleteCoordinatorDocument(String(coordinatorId), index);
      setCoordinatorProfile(resp.data as unknown as ICoordinator);
      setSnackbar({ open: true, message: 'Document deleted', severity: 'success' });
    } catch (e: any) {
      setDocError(e?.response?.data?.message || e?.response?.data?.error || 'Failed to delete document');
    } finally {
      setDocUploading(false);
    }
  };

  const documents = Array.isArray((coordinatorProfile as any)?.documents) ? ((coordinatorProfile as any).documents as any[]) : [];

  if (loading && !coordinatorProfile) return <LoadingSpinner />;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box mb={2}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Coordinator Verification
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload your verification documents to get access to the coordinator portal.
        </Typography>
      </Box>

      {error ? (
        <Box mb={2}>
          <ErrorAlert error={error} />
        </Box>
      ) : null}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current verification status: <strong>{statusLabel}</strong>
              </Typography>
            </Box>
            {statusChip}
          </Box>

          <Divider sx={{ my: 2 }} />

          {verificationStatus === VERIFICATION_STATUS.VERIFIED ? (
            <Alert severity="success">
              Your profile is verified. You can now access all coordinator features.
            </Alert>
          ) : (
            <Alert severity="warning">
              Your profile is not verified yet. Please upload the required documents. Once reviewed, you will be verified.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={800} gutterBottom>
            Document Upload
          </Typography>

          {!coordinatorProfile ? (
            <Alert severity="info">Coordinator profile not loaded.</Alert>
          ) : (
            <>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField
                  select
                  size="small"
                  label="Document Type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  fullWidth
                >
                  {documentTypes.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>

                <Button variant="outlined" component="label" size="small" disabled={docUploading} startIcon={<CloudUploadIcon />}>
                  Choose File
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  />
                </Button>

                {docFile ? (
                  <Typography variant="caption" color="text.secondary">
                    {docFile.name}
                  </Typography>
                ) : null}

                {docError ? (
                  <Typography variant="caption" color="error">
                    {docError}
                  </Typography>
                ) : null}

                <Button
                  variant="contained"
                  size="small"
                  onClick={handleUploadDoc}
                  disabled={docUploading || !docType || !docFile}
                >
                  {docUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                Uploaded Documents
              </Typography>

              {documents.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No documents uploaded yet.
                </Typography>
              ) : (
                <List dense>
                  {documents.map((d: any, idx: number) => (
                    <ListItem
                      key={`${d?.documentType || 'DOC'}-${idx}`}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDoc(idx)} disabled={docUploading}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${d?.documentType || 'Document'}${d?.verifiedAt ? ' (Verified)' : ''}`}
                        secondary={d?.documentUrl ? 'Uploaded' : ''}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default CoordinatorVerificationPage;
