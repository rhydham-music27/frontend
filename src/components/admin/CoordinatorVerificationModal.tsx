import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, Card, CardContent,
    CircularProgress, Chip, alpha, useTheme, Alert, Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { updateCoordinatorVerificationStatus } from '../../services/coordinatorService';

interface Props {
    open: boolean;
    coordinator: any | null;
    onClose: () => void;
    onVerificationComplete: () => void;
}

const CoordinatorVerificationModal: React.FC<Props> = ({ open, coordinator, onClose, onVerificationComplete }) => {
    const theme = useTheme();
    const [verifiedDocs, setVerifiedDocs] = useState<Record<string, boolean>>({});
    const [verifyingDocUrl, setVerifyingDocUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [rejectingDoc, setRejectingDoc] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const documents: any[] = coordinator?.documents || [];
    const coordId = coordinator?._id || coordinator?.id;
    const user = coordinator?.user || {};

    const allDocsVerified = documents.length > 0 && documents.every(
        (doc) => verifiedDocs[doc.documentUrl] || doc.verifiedAt
    );

    const handleMarkDocVerified = (url: string) => {
        setVerifiedDocs(prev => ({ ...prev, [url]: true }));
    };

    const handleCompleteVerification = async () => {
        if (!allDocsVerified) {
            setError('Please review all documents before completing verification.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await updateCoordinatorVerificationStatus(coordId, 'VERIFIED');
            onVerificationComplete();
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.error || 'Failed to verify coordinator');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        setRejectingDoc(true);
        setError(null);
        try {
            await updateCoordinatorVerificationStatus(coordId, 'REJECTED');
            onVerificationComplete();
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.error || 'Failed to reject coordinator');
        } finally {
            setRejectingDoc(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <VerifiedIcon color="primary" />
                    Coordinator Document Verification
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 3 }}>
                {!coordinator ? (
                    <CircularProgress />
                ) : (
                    <Box display="flex" flexDirection="column" gap={3}>

                        {/* Coordinator Info */}
                        <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Verifying Coordinator</Typography>
                                <Typography variant="h6" fontWeight={700}>{user.name || 'Unknown'}</Typography>
                                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap">
                                    <Chip
                                        label={coordinator.verificationStatus || 'PENDING'}
                                        color={coordinator.verificationStatus === 'VERIFIED' ? 'success' : coordinator.verificationStatus === 'REJECTED' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                    {coordinator.specialization?.map((s: string) => (
                                        <Chip key={s} label={s} size="small" variant="outlined" />
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                Documents ({documents.length})
                            </Typography>

                            {documents.length === 0 ? (
                                <Alert severity="warning">No documents uploaded yet by this coordinator.</Alert>
                            ) : (
                                <Box display="flex" flexDirection="column" gap={2}>
                                    {documents.map((doc: any, idx: number) => {
                                        const isVerified = verifiedDocs[doc.documentUrl] || doc.verifiedAt;
                                        const isPdf = doc.documentUrl?.toLowerCase().includes('.pdf');
                                        return (
                                            <Card
                                                key={doc.documentUrl || idx}
                                                sx={{
                                                    border: '2px solid',
                                                    borderColor: isVerified ? 'success.main' : 'divider',
                                                    bgcolor: isVerified ? alpha(theme.palette.success.main, 0.04) : 'background.paper',
                                                    transition: 'all 0.25s ease',
                                                }}
                                            >
                                                <CardContent>
                                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                                                {doc.documentType}
                                                            </Typography>

                                                            {/* Document Preview */}
                                                            {doc.documentUrl && (
                                                                <Box sx={{ my: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', maxHeight: 400, overflow: 'auto' }}>
                                                                    {isPdf ? (
                                                                        <Box
                                                                            component="iframe"
                                                                            src={doc.documentUrl}
                                                                            sx={{ width: '100%', height: 380, border: 'none', borderRadius: 1 }}
                                                                        />
                                                                    ) : (
                                                                        <Box
                                                                            component="img"
                                                                            src={doc.documentUrl}
                                                                            alt={doc.documentType}
                                                                            sx={{ width: '100%', height: 'auto', maxHeight: 380, borderRadius: 1, objectFit: 'contain', display: 'block' }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            )}

                                                            {/* Metadata */}
                                                            <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                                                                {doc.uploadedAt && (
                                                                    <Chip label={`Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}`} size="small" variant="outlined" />
                                                                )}
                                                                {doc.verifiedAt && (
                                                                    <Chip label={`Verified: ${new Date(doc.verifiedAt).toLocaleDateString()}`} size="small" color="success" variant="outlined" />
                                                                )}
                                                                {doc.documentUrl && (
                                                                    <Chip
                                                                        label="Open in new tab"
                                                                        size="small"
                                                                        icon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                                                                        onClick={() => window.open(doc.documentUrl, '_blank')}
                                                                        clickable
                                                                        variant="outlined"
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>

                                                        {/* Verify Button */}
                                                        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1} minWidth={100}>
                                                            {isVerified ? (
                                                                <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'success.main' }}>
                                                                    <CheckCircleIcon fontSize="small" />
                                                                    <Typography variant="caption" fontWeight={700}>Verified</Typography>
                                                                </Box>
                                                            ) : (
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    size="small"
                                                                    onClick={() => handleMarkDocVerified(doc.documentUrl)}
                                                                    disabled={verifyingDocUrl === doc.documentUrl}
                                                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                                                >
                                                                    Mark OK
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>

                        {/* Progress Summary */}
                        {documents.length > 0 && (
                            <Card sx={{ bgcolor: allDocsVerified ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.warning.main, 0.05) }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Documents Reviewed</Typography>
                                            <Typography variant="h6" fontWeight={700}>
                                                {Object.values(verifiedDocs).filter(Boolean).length + documents.filter((d) => d.verifiedAt).length} / {documents.length}
                                            </Typography>
                                        </Box>
                                        {allDocsVerified && <Chip label="Ready to Verify" color="success" />}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {error && <Alert severity="error">{error}</Alert>}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={submitting || rejectingDoc} sx={{ textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleReject}
                    disabled={submitting || rejectingDoc}
                    startIcon={rejectingDoc ? <CircularProgress size={16} /> : undefined}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                    {rejectingDoc ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleCompleteVerification}
                    disabled={!allDocsVerified || submitting || rejectingDoc}
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <VerifiedIcon />}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                    {submitting ? 'Verifying...' : 'Complete Verification'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CoordinatorVerificationModal;
