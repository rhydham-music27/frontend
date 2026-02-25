import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Paper, Tabs, Tab, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import TodaysTasks from '../../components/dashboard/TodaysTasks';
import useDashboard from '../../hooks/useDashboard';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { format } from 'date-fns';
import finalClassService from '../../services/finalClassService';
import coordinatorService from '../../services/coordinatorService';
import { IFinalClass } from '../../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

const ManagerTodayTasksPage: React.FC = () => {
    const { overallStats, loading, refetch } = useDashboard({ fromDate: format(new Date(), 'yyyy-MM-dd'), toDate: format(new Date(), 'yyyy-MM-dd') }, false);
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Initialize tab from search params if present
    const initialTab = searchParams.get('tab') === 'unassigned' ? 1 : 0;
    const [tabValue, setTabValue] = useState(initialTab);
    const [unassignedClasses, setUnassignedClasses] = useState<IFinalClass[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    
    // Assignment Modal State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<IFinalClass | null>(null);
    const [coordinators, setCoordinators] = useState<any[]>([]);
    const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('');
    const [loadingCoordinators, setLoadingCoordinators] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (tabValue === 1) {
            loadUnassignedClasses();
        }
    }, [tabValue]);

    const loadUnassignedClasses = async () => {
        setLoadingClasses(true);
        try {
            const res = await finalClassService.getFinalClasses(1, 20, { noCoordinator: true, status: 'ACTIVE' });
            setUnassignedClasses(res.data);
        } catch (error) {
            console.error("Failed to load unassigned classes", error);
        } finally {
            setLoadingClasses(false);
        }
    };

    const loadCoordinators = async () => {
        if (coordinators.length > 0) return; // Already loaded
        setLoadingCoordinators(true);
        try {
            const res = await coordinatorService.getCoordinators(1, 100, true); // Fetch active coordinators
            setCoordinators(res.data);
        } catch (error) {
            console.error("Failed to load coordinators", error);
        } finally {
            setLoadingCoordinators(false);
        }
    };

    const openAssignModal = async (cls: IFinalClass) => {
        setSelectedClassForAssignment(cls);
        setSelectedCoordinatorId('');
        setAssignModalOpen(true);
        await loadCoordinators();
    };

    const handleAssignCoordinator = async () => {
        if (!selectedClassForAssignment || !selectedCoordinatorId) return;
        
        setAssigning(true);
        try {
            await finalClassService.assignCoordinatorToClass(selectedClassForAssignment.id, selectedCoordinatorId);
            setAssignModalOpen(false);
            // Refresh list and stats
            await loadUnassignedClasses();
            refetch();
            // Optional: Show success message/snackbar
        } catch (error) {
            console.error("Failed to assign coordinator", error);
            // Optional: Show error
        } finally {
            setAssigning(false);
        }
    };

    const handleViewAction = (actionId: string) => {
        if (actionId === 'unassigned_coordinators') {
            setTabValue(1);
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        // Sync search param
        if (newValue === 1) {
            setSearchParams({ tab: 'unassigned' });
        } else {
            setSearchParams({});
        }
    };

    return (
        <Container maxWidth="xl" sx={{ pb: 6 }}>
            {/* Hero Section */}
            <Box 
                sx={{ 
                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                    color: 'white',
                    pt: { xs: 4, md: 6 },
                    pb: { xs: 8, md: 10 },
                    px: { xs: 3, md: 5 },
                    borderRadius: { xs: 0, md: 4 },
                    mt: 3,
                    mb: -6,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    position: 'relative',
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h3" fontWeight={800} gutterBottom>
                            Today's Priorities
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400 }}>
                            Focus on what matters most for today.
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<RefreshIcon />}
                        onClick={() => refetch()}
                        sx={{ 
                            bgcolor: 'rgba(255,255,255,0.1)', 
                            backdropFilter: 'blur(10px)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                        }}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ mt: 5 }}>
                <Grid container spacing={4}>
                    {/* Widget Side (or Top on mobile) */}
                    <Grid item xs={12} md={4}>
                        <TodaysTasks stats={overallStats} loading={loading} onViewAction={handleViewAction} />
                    </Grid>

                    {/* CRM Metrics Grid - 6 columns */}
                    <Grid item xs={12}>
                        <Typography variant="h6" fontWeight={700} mb={2} color="text.primary">Lead Funnel Tracker</Typography>
                        <Grid container spacing={2}>
                            {[
                                { key: 'new', label: 'New', color: '#3B82F6' },
                                { key: 'announced', label: 'Announced', color: '#F59E0B' },
                                { key: 'interested', label: 'Interested', color: '#8B5CF6' },
                                { key: 'demoScheduled', label: 'Demo Scheduled', color: '#10B981' },
                                { key: 'demoPending', label: 'Demo Completed', color: '#EC4899' },
                                { key: 'won', label: 'Won', color: '#059669' },
                            ].map((col) => (
                                <Grid item xs={6} sm={4} md={2} key={col.key}>
                                    <Paper 
                                        elevation={0}
                                        onClick={() => navigate(`/manager/leads-crm?column=${col.key}`)}
                                        sx={{ 
                                            p: 2, 
                                            borderRadius: 3, 
                                            border: '1px solid', 
                                            borderColor: 'divider',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: col.color,
                                                bgcolor: alpha(col.color, 0.05),
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                            }
                                        }}
                                    >
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>{col.label}</Typography>
                                        <Typography variant="h4" fontWeight={800} sx={{ color: col.color }}>
                                            {(overallStats as any)?.crmCounts?.[col.key] || 0}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    {/* Detailed View Side */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', minHeight: 600 }}>
                           <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#FAFAFA' }}>
                                <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                    <Tab label="Website Leads" />
                                    <Tab label="Unassigned Classes" />
                                    <Tab label="Pending Verifications" />
                                    <Tab label="Open Leads" />
                                    <Tab label="Requests" />
                                </Tabs>
                           </Box>
                           
                           <Box p={3}>
                                {tabValue === 0 && (
                                    <Box>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>New Website Leads</Typography>
                                        <Typography color="text.secondary">
                                            List of leads from website that are marked as NEW. 
                                            <br/>
                                            <i>(Detailed table view coming soon - please use the "View leads" button in the widget to manage them for now)</i>
                                        </Typography>
                                    </Box>
                                )}
                                {tabValue === 1 && (
                                    <Box>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="h6" fontWeight={700}>Classes without Coordinator</Typography>
                                            <Button size="small" onClick={loadUnassignedClasses} startIcon={<RefreshIcon />}>Refresh</Button>
                                        </Box>
                                        
                                        {loadingClasses ? (
                                            <Typography>Loading...</Typography>
                                        ) : unassignedClasses.length === 0 ? (
                                            <Typography color="text.secondary">No unassigned active classes found.</Typography>
                                        ) : (
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Class</TableCell>
                                                            <TableCell>Student</TableCell>
                                                            <TableCell>Subject</TableCell>
                                                            <TableCell>Action</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {unassignedClasses.map((cls) => (
                                                            <TableRow key={cls.id}>
                                                                <TableCell>{cls.className}</TableCell>
                                                                <TableCell>{cls.studentName}</TableCell>
                                                                <TableCell>{cls.subject.join(', ')}</TableCell>
                                                                <TableCell>
                                                                    <Button 
                                                                        size="small" 
                                                                        variant="outlined" 
                                                                        endIcon={<ArrowForwardIcon />}
                                                                        onClick={() => openAssignModal(cls)}
                                                                    >
                                                                        Assign
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                        <Box mt={2} />
                                    </Box>
                                )}
                                {tabValue === 2 && (
                                    <Box>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Tutors Pending Verification</Typography>
                                        <Typography color="text.secondary">Tutors waiting for document approval.</Typography>
                                    </Box>
                                )}
                                {tabValue === 3 && (
                                    <Box>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Open Leads Tracking</Typography>
                                        <Typography color="text.secondary">Leads that are open and need follow-up.</Typography>
                                    </Box>
                                )}
                                {tabValue === 4 && (
                                    <Box>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Coordinator Requests</Typography>
                                        <Typography color="text.secondary">No pending requests.</Typography>
                                    </Box>
                                )}
                           </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Assign Coordinator Modal */}
            <Dialog open={assignModalOpen} onClose={() => setAssignModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Coordinator</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Assigning coordinator for class: <b>{selectedClassForAssignment?.className}</b>
                    </Typography>
                    <Box mt={2}>
                        <TextField
                            select
                            label="Select Coordinator"
                            fullWidth
                            value={selectedCoordinatorId}
                            onChange={(e) => setSelectedCoordinatorId(e.target.value)}
                            disabled={loadingCoordinators}
                        >
                            {coordinators.map((coord) => (
                                <MenuItem key={coord.id} value={coord.user?.id || coord.user?._id || coord.userId}>
                                    {coord.user?.name || coord.name || 'Unknown'} ({coord.specialization?.join(', ') || 'General'})
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignModalOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleAssignCoordinator} 
                        variant="contained" 
                        disabled={!selectedCoordinatorId || assigning}
                    >
                        {assigning ? 'Assigning...' : 'Assign'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ManagerTodayTasksPage;
