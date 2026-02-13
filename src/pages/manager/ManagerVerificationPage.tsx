import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { setSidebarWidth } from '../../store/slices/uiSlice';
import { USER_ROLES } from '../../constants';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Avatar,
    Divider,
    Chip,
    Button,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Alert,
    AlertColor,
    TextField,
    MenuItem,
    IconButton
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    Verified as VerifiedIcon,
    Cancel as CancelIcon,
    ArrowBack as ArrowBackIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { IManager } from '../../types';
import managerService from '../../services/managerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ManagerVerificationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);
    const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

    const [manager, setManager] = useState<IManager | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [selectedDocIndex, setSelectedDocIndex] = useState(0);

    const dispatch = useDispatch();
    useEffect(() => {
        // Auto-minimize sidebar for secondary page view
        dispatch(setSidebarWidth(80));
        return () => {
            // Restore sidebar on unmount
            dispatch(setSidebarWidth(280));
        };
    }, [dispatch]);

    const [verifyDropdownOpen, setVerifyDropdownOpen] = useState(false);
    const [rejectDropdownOpen, setRejectDropdownOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'success' });

    // Upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedDocType, setSelectedDocType] = useState('AADHAAR');
    const [uploadLoading, setUploadLoading] = useState(false);

    const fetchManager = useCallback(async () => {
        try {
            setLoading(true);
            if (id && isAdmin) {
                // Admin viewing specific manager
                const response = await managerService.getManagerById(id);
                setManager(response.data as unknown as IManager);
            } else if (!isAdmin || !id) {
                // Manager viewing self or fallback
                const response = await managerService.getMyProfile();
                setManager(response.data as unknown as IManager);
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || err.message || 'Failed to fetch manager details');
        } finally {
            setLoading(false);
        }
    }, [id, isAdmin]);

    useEffect(() => {
        fetchManager();
    }, [fetchManager]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleVerify = async () => {
        if (!manager) return;
        try {
            setActionLoading(true);
            await managerService.updateManagerProfile(manager.id, {
                isActive: true,
                // @ts-ignore
                verificationStatus: 'VERIFIED'
            });

            setSnackbar({ open: true, message: 'Manager verified successfully', severity: 'success' });
            setVerifyDropdownOpen(false);
            fetchManager();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || 'Verification failed', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!manager) return;
        try {
            setActionLoading(true);
            await managerService.updateManagerProfile(manager.id, {
                // @ts-ignore
                verificationStatus: 'REJECTED',
                isActive: false
            });
            setSnackbar({ open: true, message: 'Manager rejected', severity: 'success' });
            setRejectDropdownOpen(false);
            fetchManager();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || 'Rejection failed', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type/size if needed (e.g., max 5MB, PDF/Image)
        if (file.size > 5 * 1024 * 1024) {
            setSnackbar({ open: true, message: 'File size too large (max 5MB)', severity: 'error' });
            return;
        }

        try {
            setUploadLoading(true);
            // Assuming uploadDocument handles the single file upload and returns updated manager
            await managerService.uploadDocument(selectedDocType, file);
            setSnackbar({ open: true, message: 'Document uploaded successfully', severity: 'success' });
            fetchManager();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || 'Upload failed', severity: 'error' });
        } finally {
            setUploadLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <Container maxWidth="lg" sx={{ mt: 4 }}><ErrorAlert error={error} /></Container>;
    if (!manager) return <Container maxWidth="lg" sx={{ mt: 4 }}><Alert severity="warning">Manager not found</Alert></Container>;

    const documents = manager.documents || [];

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', bgcolor: '#f5f5f5', overflow: 'hidden' }}>
            <Grid container sx={{ height: '100%' }}>
                {/* SIDEBAR: Manager Details - Only visible to Admins */}
                {isAdmin && (
                    <Grid item xs={12} md={3} sx={{ height: '100%', bgcolor: 'white', borderRight: '1px solid #e0e0e0', overflowY: 'auto' }}>
                        <Box p={3}>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/managers')} sx={{ mb: 2 }}>
                                Back to List
                            </Button>

                            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                                <Avatar
                                    src={(manager.user as any)?.avatar}
                                    alt={manager.user?.name}
                                    sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}
                                >
                                    {manager.user?.name?.charAt(0)}
                                </Avatar>
                                <Typography variant="h6" fontWeight={700} textAlign="center">{manager.user?.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{manager.user?.email}</Typography>
                                <Chip
                                    label={manager.verificationStatus || 'PENDING'}
                                    color={manager.verificationStatus === 'VERIFIED' ? 'success' : manager.verificationStatus === 'REJECTED' ? 'error' : 'warning'}
                                    size="small"
                                    sx={{ mt: 1 }}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Personal Details */}
                            <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary">Personal Information</Typography>
                            <List disablePadding dense>
                                <ListItem disableGutters>
                                    <ListItemIcon sx={{ minWidth: 35 }}><PhoneIcon color="action" fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={manager.user?.phone || 'N/A'} secondary="Phone" />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemIcon sx={{ minWidth: 35 }}><EmailIcon color="action" fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={manager.user?.email} secondary="Email" />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemIcon sx={{ minWidth: 35 }}><LocationIcon color="action" fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={(manager as any).city || (manager.user as any)?.city || 'N/A'} secondary="City" />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemIcon sx={{ minWidth: 35 }}><LocationIcon color="action" fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={manager.residentialAddress || 'N/A'} secondary="Residential Address" />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemIcon sx={{ minWidth: 35 }}><LocationIcon color="action" fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={manager.permanentAddress || 'N/A'} secondary="Permanent Address" />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary={(manager.user as any)?.gender || 'N/A'}
                                        secondary="Gender"
                                        inset
                                    />
                                </ListItem>
                            </List>

                            <Divider sx={{ my: 2 }} />

                            {/* Professional Details */}
                            <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary">Professional Details</Typography>
                            <List disablePadding dense>
                                <ListItem disableGutters>
                                    <ListItemText primary={manager.department || 'N/A'} secondary="Department" />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemText primary={(manager.user as any)?.preferredMode || 'N/A'} secondary="Preferred Mode" />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemIcon sx={{ minWidth: 35 }}><CalendarIcon color="action" fontSize="small" /></ListItemIcon>
                                    <ListItemText
                                        primary={new Date(manager.joiningDate || manager.createdAt).toLocaleDateString()}
                                        secondary="Joining Date"
                                    />
                                </ListItem>
                            </List>

                            <Typography variant="body2" fontWeight={600} mt={1}>Skills</Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                                {manager.skills && manager.skills.length > 0 ? (
                                    manager.skills.map((skill, index) => (
                                        <Chip key={index} label={skill} size="small" variant="outlined" />
                                    ))
                                ) : (
                                    <Typography variant="caption" color="text.secondary">No skills listed.</Typography>
                                )}
                            </Box>

                            <Typography variant="body2" fontWeight={600}>Languages</Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                                {manager.languagesKnown && manager.languagesKnown.length > 0 ? (
                                    manager.languagesKnown.map((lang, index) => (
                                        <Chip key={index} label={lang} size="small" variant="outlined" />
                                    ))
                                ) : (
                                    <Typography variant="caption" color="text.secondary">No languages listed.</Typography>
                                )}
                            </Box>
                            <Typography variant="body2" fontWeight={600}>Bio</Typography>
                            <Typography variant="body2" paragraph color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {manager.bio || 'No bio provided.'}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            {/* Statistics */}
                            <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary">Performance Stats</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Leads Created</Typography>
                                    <Typography variant="body2" fontWeight={500}>{manager.classLeadsCreated || 0}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Demos Scheduled</Typography>
                                    <Typography variant="body2" fontWeight={500}>{manager.demosScheduled || 0}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Classes Converted</Typography>
                                    <Typography variant="body2" fontWeight={500}>{manager.classesConverted || 0}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Revenue Gen.</Typography>
                                    <Typography variant="body2" fontWeight={500}>₹{manager.revenueGenerated || 0}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Tutors Verified</Typography>
                                    <Typography variant="body2" fontWeight={500}>{manager.tutorsVerified || 0}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Coords Created</Typography>
                                    <Typography variant="body2" fontWeight={500}>{manager.coordinatorsCreated || 0}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Payments</Typography>
                                    <Typography variant="body2" fontWeight={500}>{manager.paymentsProcessed || 0}</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            {/* System Details */}
                            <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary">System Info</Typography>
                            <List disablePadding dense>
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary={manager.isActive ? 'Active' : 'Inactive'}
                                        secondary="Account Status"
                                        primaryTypographyProps={{ color: manager.isActive ? 'success.main' : 'error.main', fontWeight: 500 }}
                                    />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary={manager.lastActivityAt ? new Date(manager.lastActivityAt).toLocaleString() : 'Never'}
                                        secondary="Last Activity"
                                    />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary={new Date(manager.createdAt).toLocaleString()}
                                        secondary="Created At"
                                    />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary={new Date(manager.updatedAt).toLocaleString()}
                                        secondary="Updated At"
                                    />
                                </ListItem>
                            </List>
                        </Box>
                    </Grid>
                )}

                {/* MAIN CONTENT: Documents & Verification */}
                {/* If Not Admin, take full width (xs=12, md=12). If Admin, take remaining width (xs=12, md=9) */}
                <Grid item xs={12} md={isAdmin ? 9 : 12} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header / Action Bar */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: 'white'
                        }}
                    >
                        <Box>
                            <Typography variant="h6">Verification Documents</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isAdmin ? 'Review uploaded proofs before verifying.' : 'Upload your verification documents below.'}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} alignItems="center">
                            {isAdmin ? (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={() => setRejectDropdownOpen(true)}
                                        disabled={manager.verificationStatus === 'REJECTED'}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<VerifiedIcon />}
                                        onClick={() => setVerifyDropdownOpen(true)}
                                        disabled={manager.verificationStatus === 'VERIFIED'}
                                    >
                                        Verify Manager
                                    </Button>
                                </>
                            ) : (
                                <Box display="flex" gap={1} alignItems="center">
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                    <TextField
                                        select
                                        size="small"
                                        value={selectedDocType}
                                        onChange={(e) => setSelectedDocType(e.target.value)}
                                        sx={{ width: 170 }}
                                    >
                                        <MenuItem value="AADHAAR">Aadhaar</MenuItem>
                                        <MenuItem value="PROFILE_PHOTO">Photo</MenuItem>
                                        <MenuItem value="EXPERIENCE_PROOF">Experience Proof</MenuItem>
                                        <MenuItem value="DEGREE">Degree</MenuItem>
                                        <MenuItem value="CERTIFICATE">Certificate</MenuItem>
                                    </TextField>
                                    <Button
                                        variant="contained"
                                        startIcon={uploadLoading ? <LoadingSpinner size={20} /> : <CloudUploadIcon />}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadLoading}
                                    >
                                        Upload
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    {/* Document Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="document tabs">
                            <Tab label="Documents Viewer" />
                        </Tabs>
                    </Box>

                    {/* Document Viewer Content */}
                    <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                        {documents.length === 0 ? (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                height="100%"
                                color="text.secondary"
                            >
                                <DescriptionIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                                <Typography variant="h6">No Documents Uploaded</Typography>
                                <Typography variant="body2">
                                    {isAdmin ? 'This manager has not uploaded any verification documents yet.' : 'Please upload requested documents to proceed with verification.'}
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={3} height="100%">
                                {/* List of Docs */}
                                <Grid item xs={12} md={3}>
                                    <Paper variant="outlined">
                                        <List component="nav">
                                            {documents.map((doc, index) => (
                                                <ListItem
                                                    key={index}
                                                    disablePadding
                                                    secondaryAction={
                                                        !isAdmin && (
                                                            <IconButton edge="end" aria-label="delete" size="small">
                                                                {/* Implement delete functionality if needed */}
                                                                {/* <DeleteIcon fontSize="small" /> */}
                                                            </IconButton>
                                                        )
                                                    }
                                                >
                                                    <ListItemButton
                                                        selected={selectedDocIndex === index}
                                                        onClick={() => setSelectedDocIndex(index)}
                                                    >
                                                        <ListItemIcon>
                                                            {doc.verifiedAt ? <CheckCircleIcon color="success" /> : <DescriptionIcon />}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={doc.documentType.replace('_', ' ')}
                                                            secondary={new Date(doc.uploadedAt).toLocaleDateString()}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                </Grid>

                                {/* Selected Doc Preview */}
                                <Grid item xs={12} md={9} sx={{ height: '100%' }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            bgcolor: '#333',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box p={2} bgcolor="white" borderBottom="1px solid #e0e0e0" display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {documents[selectedDocIndex]?.documentType} Preview
                                            </Typography>
                                            <Button
                                                size="small"
                                                href={documents[selectedDocIndex]?.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Open in New Tab
                                            </Button>
                                        </Box>
                                        <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center" p={2} sx={{ position: 'relative' }}>
                                            {documents[selectedDocIndex] && (
                                                getDocumentComponent(documents[selectedDocIndex].documentUrl)
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={verifyDropdownOpen}
                title="Verify Manager"
                message={`Are you sure you want to verify ${manager.user?.name}? This will grant them full access permissions.`}
                confirmText="Yes, Verify"
                onConfirm={handleVerify}
                onClose={() => setVerifyDropdownOpen(false)}
                loading={actionLoading}
                severity="success"
            />

            <ConfirmDialog
                open={rejectDropdownOpen}
                title="Reject Manager"
                message={`Are you sure you want to reject ${manager.user?.name}? This will deactivate their account.`}
                confirmText="Yes, Reject"
                onConfirm={handleReject}
                onClose={() => setRejectDropdownOpen(false)}
                loading={actionLoading}
                severity="error"
            />

            <SnackbarNotification
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </Box>
    );
};

const getDocumentComponent = (url: string) => {
    // Basic check for image vs pdf based on extension or assumptions
    // Ideally we should have mimetype
    const isPdf = url.toLowerCase().endsWith('.pdf');
    const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i);

    if (isImage) {
        return (
            <img
                src={url}
                alt="Document Preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
        );
    } else if (isPdf) {
        return (
            <iframe
                src={url}
                title="PDF Preview"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
            />
            // Alternatively use <embed> or PDF viewer library if iframe doesn't work well with authorized S3 links
        );
    } else {
        return (
            <Box textAlign="center" color="white">
                <DescriptionIcon sx={{ fontSize: 64, mb: 2 }} />
                <Typography>Preview not available for this file type.</Typography>
                <Button variant="contained" sx={{ mt: 2 }} href={url} target="_blank">Download to View</Button>
            </Box>
        );
    }
};

export default ManagerVerificationPage;
