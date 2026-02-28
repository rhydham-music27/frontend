import React, { useEffect, useState, useCallback } from 'react';
import {
    Container, Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, Avatar,
    Stack, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, CircularProgress, alpha,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { getPendingCoordinatorVerifications, updateCoordinatorVerificationStatus } from '../../services/coordinatorService';
import CoordinatorVerificationModal from '../../components/admin/CoordinatorVerificationModal';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const CoordinatorVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const [coordinators, setCoordinators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; coordinator: any | null }>({ open: false, coordinator: null });
    const [rejectionReason, setRejectionReason] = useState('');

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    const [docModal, setDocModal] = useState<{ open: boolean; coordinator: any | null }>({ open: false, coordinator: null });

    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPendingCoordinatorVerifications();
            setCoordinators((res as any).data || res || []);
        } catch (e: any) {
            setError(e?.response?.data?.error || e?.message || 'Failed to load pending verifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    const handleVerify = async (coordinatorId: string) => {
        setActionLoading(coordinatorId);
        try {
            await updateCoordinatorVerificationStatus(coordinatorId, 'VERIFIED');
            setSnackbar({ open: true, message: 'Coordinator verified successfully', severity: 'success' });
            fetchPending();
        } catch (e: any) {
            setSnackbar({ open: true, message: e?.response?.data?.error || 'Verification failed', severity: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectDialog.coordinator) return;
        const id = rejectDialog.coordinator._id || rejectDialog.coordinator.id;
        setActionLoading(id);
        try {
            await updateCoordinatorVerificationStatus(id, 'REJECTED', rejectionReason);
            setSnackbar({ open: true, message: 'Coordinator rejected', severity: 'success' });
            setRejectDialog({ open: false, coordinator: null });
            setRejectionReason('');
            fetchPending();
        } catch (e: any) {
            setSnackbar({ open: true, message: e?.response?.data?.error || 'Rejection failed', severity: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusChip = (status: string) => {
        const map: Record<string, { label: string; color: 'warning' | 'success' | 'error' | 'default' }> = {
            PENDING: { label: 'Pending', color: 'warning' },
            VERIFIED: { label: 'Verified', color: 'success' },
            REJECTED: { label: 'Rejected', color: 'error' },
        };
        const cfg = map[status] || { label: status, color: 'default' };
        return <Chip label={cfg.label} color={cfg.color} size="small" />;
    };

    return (
        <Container maxWidth="xl" sx={{ p: 3 }}>
            {/* Hero */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                color: 'white', py: { xs: 4, md: 5 }, px: { xs: 2, md: 4 },
                borderRadius: { xs: 0, md: 3 }, mb: 4, position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
            }}>
                <Box position="relative" zIndex={1}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <VerifiedUserIcon sx={{ fontSize: 32 }} />
                        <Typography variant="h4" fontWeight={800}>Coordinator Verification</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 600 }}>
                        Review and verify or reject coordinator profiles awaiting approval.
                    </Typography>
                </Box>
                <Chip
                    label={`${coordinators.length} Pending`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: '1rem', height: 36, px: 1 }}
                />
                {/* Decorative circles */}
                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)' }} />
            </Box>

            {error && <Box mb={2}><ErrorAlert error={error} /></Box>}

            {loading ? (
                <LoadingSpinner />
            ) : coordinators.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <VerifiedUserIcon sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>All caught up!</Typography>
                    <Typography color="text.secondary">No coordinators are pending verification.</Typography>
                    <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate('/admin/coordinators')}>
                        View All Coordinators
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100', '& .MuiTableCell-root': { fontWeight: 700, color: 'text.primary', borderBottom: '2px solid', borderColor: 'divider' } }}>
                                <TableCell>Coordinator</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Specialization</TableCell>
                                <TableCell>Max Capacity</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {coordinators.map((coord: any) => {
                                const user = coord.user || {};
                                const id = coord._id || coord.id;
                                const isActing = actionLoading === id;
                                const specs = Array.isArray(coord.specialization) ? coord.specialization : [];
                                return (
                                    <TableRow key={id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <Avatar sx={{ bgcolor: '#1565C0', width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {(user.name || 'C').charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography
                                                        variant="subtitle2" fontWeight={700}
                                                        sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                                                        onClick={() => navigate(`/coordinator-profile/${id}`)}
                                                    >
                                                        {user.name || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">{coord.teacherId || coord.coordinatorId || ''}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{user.email || '-'}</TableCell>
                                        <TableCell>{user.phone || '-'}</TableCell>
                                        <TableCell>
                                            {specs.length > 0 ? (
                                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                                    {specs.slice(0, 3).map((s: string) => (
                                                        <Chip key={s} label={s} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                                                    ))}
                                                    {specs.length > 3 && <Chip label={`+${specs.length - 3}`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />}
                                                </Box>
                                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                                        </TableCell>
                                        <TableCell>{coord.maxClassCapacity ?? '-'}</TableCell>
                                        <TableCell>{getStatusChip(coord.verificationStatus || 'PENDING')}</TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    startIcon={isActing ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                                                    disabled={!!actionLoading}
                                                    onClick={() => handleVerify(id)}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                                                >
                                                    Verify
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<CancelIcon />}
                                                    disabled={!!actionLoading}
                                                    onClick={() => setRejectDialog({ open: true, coordinator: coord })}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    startIcon={<PersonIcon />}
                                                    onClick={() => navigate(`/coordinator-profile/${id}`)}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
                                                >
                                                    Profile
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="info"
                                                    size="small"
                                                    onClick={() => setDocModal({ open: true, coordinator: coord })}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                                                >
                                                    View Docs
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Reject Dialog */}
            <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, coordinator: null })} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={700} color="error.main">Reject Coordinator</DialogTitle>
                <DialogContent>
                    <Typography mb={2} color="text.secondary">
                        You are about to reject <strong>{rejectDialog.coordinator?.user?.name}</strong>. Please provide a reason (optional).
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Rejection Reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Incomplete documents, failed background check..."
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRejectDialog({ open: false, coordinator: null })} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button
                        variant="contained" color="error"
                        onClick={handleRejectConfirm}
                        disabled={!!actionLoading}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                        {actionLoading ? <CircularProgress size={18} color="inherit" /> : 'Confirm Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            <SnackbarNotification
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            />

            <CoordinatorVerificationModal
                open={docModal.open}
                coordinator={docModal.coordinator}
                onClose={() => setDocModal({ open: false, coordinator: null })}
                onVerificationComplete={() => {
                    setDocModal({ open: false, coordinator: null });
                    setSnackbar({ open: true, message: 'Coordinator verified successfully', severity: 'success' });
                    fetchPending();
                }}
            />
        </Container>
    );
};

export default CoordinatorVerificationPage;
