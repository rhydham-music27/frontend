
import React, { useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Button, alpha, Grow, Fade, Paper, useTheme, Avatar, Chip, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaymentIcon from '@mui/icons-material/Payment';
import FilterListIcon from '@mui/icons-material/FilterList';
import WarningIcon from '@mui/icons-material/Warning';

import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import useCoordinator from '../../hooks/useCoordinator';
import MetricsCard from '../../components/dashboard/MetricsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import TaskCard from '../../components/coordinator/TaskCard';
import { IAttendance, IPaymentReminder, TaskPriority, ITaskWithPriority } from '../../types';

const calculatePriority = (date: Date | string): TaskPriority => {
    const d = new Date(date);
    const today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (d.getTime() < today.getTime()) return 'overdue';
    if (d.getTime() === today.getTime()) return 'today';
    return 'upcoming';
};

const sortTasksByPriority = <T,>(arr: ITaskWithPriority<T>[]): ITaskWithPriority<T>[] => {
    const order: Record<TaskPriority, number> = { overdue: 1, today: 2, upcoming: 3 };
    return [...arr].sort((a, b) => {
        if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
        return new Date(a.priorityDate).getTime() - new Date(b.priorityDate).getTime();
    });
};

const CoordinatorDashboardPage: React.FC = () => {
    const theme = useTheme();
    const user = useSelector(selectCurrentUser);
    const navigate = useNavigate();
    const { dashboardStats, todaysTasks, loading, error, refetch } = useCoordinator();
    const [activeTab, setActiveTab] = React.useState<'all' | 'payments' | 'tests' | 'complaints' | 'attendance'>('all');
    const [priorityFilter, setPriorityFilter] = React.useState<TaskPriority | 'all'>('all');
    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const isDarkMode = theme.palette.mode === 'dark';

    const processedTasks = React.useMemo(() => {
        const attendance: ITaskWithPriority<IAttendance>[] = todaysTasks?.pendingAttendanceApprovals?.map((a: any) => ({
            task: a as IAttendance,
            priority: calculatePriority(a.sessionDate),
            priorityDate: new Date(a.sessionDate),
        })) || [];

        const payments: ITaskWithPriority<IPaymentReminder>[] = todaysTasks?.paymentReminders?.map((p: any) => ({
            task: p as IPaymentReminder,
            priority: calculatePriority(p.dueDate),
            priorityDate: new Date(p.dueDate),
        })) || [];

        const tests: ITaskWithPriority<any>[] = todaysTasks?.testsToSchedule?.map((cls) => ({
            task: cls,
            priority: 'upcoming' as TaskPriority,
            priorityDate: new Date(),
        })) || [];

        const complaints: ITaskWithPriority<any>[] = todaysTasks?.parentComplaints?.map((c: any) => ({
            task: c,
            priority: 'overdue' as TaskPriority,
            priorityDate: new Date(c?.createdAt || Date.now()),
        })) || [];

        return { attendance, payments, tests, complaints };
    }, [todaysTasks]);

    const filteredTasks = React.useMemo(() => {
        let list: Array<ITaskWithPriority<any>> = [];
        if (activeTab === 'all') list = [...processedTasks.attendance, ...processedTasks.payments, ...processedTasks.tests, ...processedTasks.complaints];
        if (activeTab === 'payments') list = processedTasks.payments;
        if (activeTab === 'attendance') list = processedTasks.attendance;
        if (activeTab === 'tests') list = processedTasks.tests;
        if (activeTab === 'complaints') list = processedTasks.complaints;

        if (priorityFilter !== 'all') list = list.filter((t) => t.priority === priorityFilter);

        return sortTasksByPriority(list);
    }, [processedTasks, activeTab, priorityFilter]);

    const counts = React.useMemo(() => ({
        attendance: processedTasks.attendance.length,
        payments: processedTasks.payments.length,
        tests: processedTasks.tests.length,
        complaints: processedTasks.complaints.length,
        total: processedTasks.attendance.length + processedTasks.payments.length + processedTasks.tests.length + processedTasks.complaints.length,
    }), [processedTasks]);

    const handleTaskAction = (taskId: string, actionType: string) => {
        setSnackbar({ open: true, message: `Task action executed: ${actionType}`, severity: 'info' });
    };

    return (
        <Container maxWidth="xl" sx={{ pb: 8 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    background: isDarkMode 
                        ? 'linear-gradient(225deg, #1E3A8A 0%, #111827 100%)' 
                        : 'linear-gradient(225deg, #2563EB 0%, #1D4ED8 100%)',
                    color: 'white',
                    pt: { xs: 5, md: 7 },
                    pb: { xs: 10, md: 12 },
                    px: { xs: 3, md: 5 },
                    borderRadius: { xs: 0, md: '32px' },
                    mt: 3,
                    mb: -6,
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px -20px rgba(37, 99, 235, 0.4)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-10%',
                        right: '-5%',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        zIndex: 0
                    }
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ maxWidth: '600px' }}>
                        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.03em' }}>
                            Dashboard
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, mb: 4, lineHeight: 1.5 }}>
                            Welcome back, {user?.name || 'Coordinator'}. Here is your operations overview for today.
                        </Typography>
                        <Box display="flex" gap={2} flexWrap="wrap">
                          <Button 
                            variant="contained" 
                            color="inherit" 
                            onClick={() => window.location.href='/assigned-classes'}
                            sx={{ 
                                bgcolor: 'white', 
                                color: 'primary.main', 
                                fontWeight: 700, 
                                px: 3, 
                                borderRadius: '12px',
                                '&:hover': { bgcolor: alpha('#fff', 0.9) }
                            }}
                          >
                            My Classes
                          </Button>
                          <Button 
                            variant="outlined" 
                            onClick={() => window.location.href='/payment-tracking'}
                            sx={{ 
                                color: 'white', 
                                borderColor: alpha('#fff', 0.4), 
                                fontWeight: 700, 
                                px: 3, 
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)',
                                '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) }
                            }}
                          >
                            Payment Tracking
                          </Button>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={refetch}
                        sx={{
                            bgcolor: alpha(theme.palette.common.white, 0.1),
                            backdropFilter: 'blur(20px)',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.common.white, 0.2),
                            borderRadius: '12px',
                            fontWeight: 600,
                            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.2) }
                        }}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {error && <Box mt={8}><ErrorAlert error={error} /></Box>}

            {(loading && !dashboardStats) ? (
                <Box display="flex" justifyContent="center" py={12}>
                    <LoadingSpinner size={48} message="Fetching latest data..." />
                </Box>
            ) : dashboardStats && (
                <Box mt={0}>
                    {/* Metrics Section */}
                    <Grid container spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
                        {[
                            { title: 'Active Classes', value: dashboardStats.activeClassesCount, icon: <ClassIcon />, color: '#10B981' },
                            { title: 'Classes Handled', value: dashboardStats.totalClassesHandled, icon: <DashboardIcon />, color: '#3B82F6' },
                            { 
                                title: 'Attendance Approval', 
                                value: dashboardStats.pendingAttendanceApprovals, 
                                icon: <CheckCircleIcon />, 
                                color: '#F59E0B',
                                onClick: () => navigate('/attendance-sheet-approvals')
                            },
                            { title: 'Today\'s Total Tasks', value: dashboardStats.todaysTasksCount, icon: <AssignmentIcon />, color: '#EF4444' }
                        ].map((stat, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Grow in timeout={500 + (i * 100)}>
                                    <Box height="100%">
                                        <MetricsCard
                                            title={stat.title}
                                            value={stat.value}
                                            icon={stat.icon}
                                            color={stat.color}
                                            loading={loading}
                                            onClick={(stat as any).onClick}
                                        />
                                    </Box>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Tasks Section */}
                    <Box mt={8}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} flexWrap="wrap" gap={2}>
                            <Box>
                                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                                    Operational Tasks
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Action required items categorized by priority and type.
                                </Typography>
                            </Box>
                            
                            {/* Priority Filter Chips */}
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 0.5, 
                                    borderRadius: '14px', 
                                    bgcolor: alpha(theme.palette.divider, 0.05),
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    gap: 0.5
                                }}
                            >
                                {[
                                    { label: 'All', value: 'all', color: theme.palette.text.primary },
                                    { label: 'Overdue', value: 'overdue', color: '#EF4444' },
                                    { label: 'Due Today', value: 'today', color: '#F59E0B' },
                                    { label: 'Upcoming', value: 'upcoming', color: '#10B981' }
                                ].map((p) => (
                                    <Chip
                                        key={p.value}
                                        label={p.label}
                                        onClick={() => setPriorityFilter(p.value as any)}
                                        sx={{
                                            height: 32,
                                            fontWeight: 700,
                                            borderRadius: '10px',
                                            bgcolor: priorityFilter === p.value ? alpha(p.color, 0.1) : 'transparent',
                                            color: priorityFilter === p.value ? p.color : 'text.secondary',
                                            border: '1px solid',
                                            borderColor: priorityFilter === p.value ? alpha(p.color, 0.2) : 'transparent',
                                            '&:hover': { bgcolor: alpha(p.color, 0.05) }
                                        }}
                                    />
                                ))}
                            </Paper>
                        </Box>

                        {/* Category Selector Cards */}
                        <Grid container spacing={3} mb={6}>
                            {[
                                { key: 'attendance', label: 'Attendance', count: counts.attendance, icon: <CheckCircleIcon />, color: '#F59E0B', desc: 'Awaiting Approval' },
                                { key: 'payments', label: 'Payments', count: counts.payments, icon: <PaymentIcon />, color: '#10B981', desc: 'Fee follow-ups' },
                                { key: 'tests', label: 'Tests', count: counts.tests, icon: <AssignmentIcon />, color: '#3B82F6', desc: 'Scheduling' },
                                { key: 'complaints', label: 'Complaints', count: counts.complaints, icon: <WarningAmberIcon />, color: '#EF4444', desc: 'Parent issues' }
                            ].map((cat, i) => (
                                <Grid item xs={12} sm={3} key={cat.key}>
                                    <Grow in timeout={800 + (i * 100)}>
                                        <Paper
                                            elevation={0}
                                            onClick={() => setActiveTab(cat.key as any)}
                                            sx={{
                                                p: 3,
                                                borderRadius: '24px',
                                                cursor: 'pointer',
                                                border: '2px solid',
                                                borderColor: activeTab === cat.key ? cat.color : alpha(cat.color, 0.05),
                                                bgcolor: activeTab === cat.key ? alpha(cat.color, 0.04) : alpha(theme.palette.background.paper, 0.6),
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                '&:hover': {
                                                    borderColor: cat.color,
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 10px 20px -10px ${alpha(cat.color, 0.3)}`
                                                }
                                            }}
                                        >
                                            <Avatar sx={{ bgcolor: alpha(cat.color, 0.1), color: cat.color, width: 48, height: 48, borderRadius: '14px' }}>
                                                {cat.icon}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body1" fontWeight={800}>
                                                    {cat.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    {cat.desc}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h5" fontWeight={900} sx={{ color: cat.color }}>
                                                    {cat.count}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                                    Items
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grow>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Task List Header */}
                        <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                                    {activeTab === 'all' ? 'All Pending Tasks' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List`}
                                </Typography>
                                <Chip 
                                    label={filteredTasks.length} 
                                    size="small" 
                                    sx={{ fontWeight: 800, height: 20, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} 
                                />
                            </Box>
                            {activeTab !== 'all' && (
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => setActiveTab('all')}
                                    sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
                                >
                                    Back to Global View
                                </Button>
                            )}
                        </Box>

                        {!loading && filteredTasks.length === 0 ? (
                            <Fade in timeout={600}>
                                <Box 
                                    textAlign="center" 
                                    py={10} 
                                    sx={{ 
                                        bgcolor: alpha(theme.palette.success.main, 0.03), 
                                        borderRadius: '32px', 
                                        border: '1px dashed',
                                        borderColor: alpha(theme.palette.success.main, 0.3)
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', width: 80, height: 80, mx: 'auto', mb: 3 }}>
                                        <CheckCircleIcon sx={{ fontSize: 40 }} />
                                    </Avatar>
                                    <Typography variant="h5" fontWeight={800} gutterBottom>All Clear!</Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '400px', mx: 'auto' }}>
                                        You don't have any {priorityFilter !== 'all' ? priorityFilter : ''} {activeTab !== 'all' ? activeTab : ''} tasks requiring attention right now.
                                    </Typography>
                                </Box>
                            </Fade>
                        ) : (
                            <Grid container spacing={3}>
                                {filteredTasks.map((item, idx) => (
                                    <Grid item xs={12} sm={6} md={4} key={idx}>
                                        <TaskCard
                                            taskType={(activeTab === 'all'
                                                ? (item.task && (item.task as any).sessionDate
                                                    ? 'attendance'
                                                    : (item.task as any).dueDate
                                                        ? 'payment'
                                                        : (item.task as any).summary
                                                            ? 'complaint'
                                                            : 'test')
                                                : activeTab === 'payments'
                                                    ? 'payment'
                                                    : activeTab === 'attendance'
                                                        ? 'attendance'
                                                        : activeTab === 'complaints'
                                                            ? 'complaint'
                                                            : 'test') as any}
                                            task={item.task}
                                            priority={item.priority}
                                            loading={loading}
                                            onAction={handleTaskAction}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Box>
            )}

            <SnackbarNotification
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            />
        </Container>
    );
};

export default CoordinatorDashboardPage;
