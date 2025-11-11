import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button, Typography, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

interface Props {
  tutorId: string;
  onUploadSuccess: (tutorId: string, documentType: string, file: File) => Promise<any> | void;
  loading?: boolean;
  error?: string | null;
}

const DOCUMENT_TYPES = ['AADHAAR', 'CERTIFICATE', 'EXPERIENCE_PROOF', 'DEGREE', 'OTHER'];

export default function DocumentUploadForm({ tutorId, onUploadSuccess, loading = false, error = null }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    setLocalError(null);
    if (!documentType) {
      setLocalError('Please select a document type');
      return;
    }
    if (!selectedFile) {
      setLocalError('Please choose a file to upload');
      return;
    }
    await onUploadSuccess(tutorId, documentType, selectedFile);
    setSelectedFile(null);
    setDocumentType('');
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Alert severity="info">Supported formats: PDF, JPEG, PNG. Max size: 5MB.</Alert>
      <TextField select label="Document Type" value={documentType} onChange={(e) => setDocumentType(e.target.value)} fullWidth>
        {DOCUMENT_TYPES.map((t) => (
          <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>
        ))}
      </TextField>
      <div>
        <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
        <label htmlFor="file-input">
          <Button variant="outlined" startIcon={<CloudUploadIcon />} component="span">Choose File</Button>
        </label>
        {selectedFile && (
          <Typography variant="body2" sx={{ ml: 2, display: 'inline-block' }}>{selectedFile.name}</Typography>
        )}
      </div>
      <ErrorAlert error={error || localError} />
      <Button variant="contained" onClick={handleSubmit} disabled={!documentType || !selectedFile || loading}>
        {loading ? <LoadingSpinner size={20} /> : 'Upload Document'}
      </Button>
    </Box>
  );
}
