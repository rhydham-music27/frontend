
import React, { useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Button, alpha, Grow, Paper, useTheme, Avatar, Chip, Badge } from '@mui/material';
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
    const { dashboardStats, todaysTasks, loading, error, refetch } = useCoordinator();
    const [activeTab, setActiveTab] = React.useState<'all' | 'attendance' | 'payments' | 'tests' | 'complaints'>('all');
    const [priorityFilter, setPriorityFilter] = React.useState<TaskPriority | 'all'>('all');
    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const processedTasks = React.useMemo(() => {
        const attendance: ITaskWithPriority<IAttendance>[] = todaysTasks?.pendingAttendanceApprovals?.map((t) => ({
            task: t,
            priority: calculatePriority(t.sessionDate),
            priorityDate: new Date(t.sessionDate),
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
        if (activeTab === 'attendance') list = processedTasks.attendance;
        if (activeTab === 'payments') list = processedTasks.payments;
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
        console.log('Task action', taskId, actionType);
        // You could implement specific actions here or refetch
        setSnackbar({ open: true, message: `Task action: ${actionType}`, severity: 'info' });
    };

    return (
        <Container maxWidth="xl" sx={{ pb: 6 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)', // Blue/Indigo
                    color: 'white',
                    pt: { xs: 4, md: 5 },
                    pb: { xs: 6, md: 8 },
                    px: { xs: 2, md: 4 },
                    borderRadius: { xs: 0, md: 3 },
                    mt: 3,
                    mb: -4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    position: 'relative'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Coordinator Dashboard
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Welcome back, {user?.name || 'Coordinator'}. Here is your daily overview.
                        </Typography>
                        <Box mt={2} display="flex" gap={2}>
                          <Button variant="contained" color="primary" onClick={() => window.location.href='/attendance-approvals'}>Go to Attendance Approvals</Button>
                          <Button variant="contained" color="secondary" onClick={() => window.location.href='/assigned-classes'}>Go to My Classes</Button>
                          <Button variant="contained" color="success" onClick={() => window.location.href='/payment-tracking'}>Go to Payments follow-ups</Button>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={refetch}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                        }}
                    >
                        Refresh Data
                    </Button>
                </Box>
            </Box>

            {error && <Box mt={6}><ErrorAlert error={error} /></Box>}

            {loading && !dashboardStats && (
                <Box display="flex" justifyContent="center" py={8} mt={4}>
                    <LoadingSpinner size={48} message="Loading dashboard..." />
                </Box>
            )}

            {dashboardStats && (
                <Box mt={6}>
                    {/* KPI Section - Overlapping Hero */}
                    <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'none' }}>Overview</Typography> {/* Hidden visually but useful for screen readers/structure, actually prefer relying on visual grouping */}

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                            <MetricsCard
                                title="Active Classes"
                                value={dashboardStats.activeClassesCount}
                                icon={<ClassIcon />}
                                gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <MetricsCard
                                title="Classes Handled"
                                value={dashboardStats.totalClassesHandled}
                                icon={<DashboardIcon />}
                                gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <MetricsCard
                                title="Pending Approvals"
                                value={dashboardStats.pendingAttendanceApprovals}
                                icon={<CheckCircleIcon />}
                                color="warning.main"
                                loading={loading}
                            />
                        </Grid>
                    </Grid>

                    {/* Detailed Stats Row 2 */}
                    <Grid container spacing={3} mt={0.5}>
                        <Grid item xs={12} sm={6} md={4}>
                            <MetricsCard
                                title="Today's Tasks"
                                value={dashboardStats.todaysTasksCount}
                                icon={<AssignmentIcon />}
                                color="error.main"
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <MetricsCard
                                title="Total Assigned"
                                value={dashboardStats.totalClassesAssigned}
                                icon={<ClassIcon />}
                                color="info.main"
                                loading={loading}
                            />
                        </Grid>
                    </Grid>

                    {/* Today's Tasks Summary Section */}
                    <Box mt={5}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <AssignmentIcon color="primary" />
                                <Typography variant="h5" fontWeight={700}>Today's Priority Tasks</Typography>
                            </Box>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                <Chip
                                    label="All Priorities"
                                    onClick={() => setPriorityFilter('all')}
                                    sx={{
                                        bgcolor: priorityFilter === 'all' ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                                        color: priorityFilter === 'all' ? 'white' : 'primary.main',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: priorityFilter === 'all' ? 'primary.dark' : alpha(theme.palette.primary.main, 0.2) }
                                    }}
                                />
                                <Chip
                                    label="Overdue"
                                    onClick={() => setPriorityFilter('overdue')}
                                    sx={{
                                        bgcolor: priorityFilter === 'overdue' ? '#EF4444' : alpha('#EF4444', 0.1),
                                        color: priorityFilter === 'overdue' ? 'white' : '#EF4444',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: priorityFilter === 'overdue' ? '#DC2626' : alpha('#EF4444', 0.2) }
                                    }}
                                />
                                <Chip
                                    label="Today"
                                    onClick={() => setPriorityFilter('today')}
                                    sx={{
                                        bgcolor: priorityFilter === 'today' ? '#F59E0B' : alpha('#F59E0B', 0.1),
                                        color: priorityFilter === 'today' ? 'white' : '#F59E0B',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: priorityFilter === 'today' ? '#D97706' : alpha('#F59E0B', 0.2) }
                                    }}
                                />
                                <Chip
                                    label="Upcoming"
                                    onClick={() => setPriorityFilter('upcoming')}
                                    sx={{
                                        bgcolor: priorityFilter === 'upcoming' ? '#10B981' : alpha('#10B981', 0.1),
                                        color: priorityFilter === 'upcoming' ? 'white' : '#10B981',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: priorityFilter === 'upcoming' ? '#059669' : alpha('#10B981', 0.2) }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Grid container spacing={3} mb={4}>
                            {[
                                { key: 'attendance', label: 'Attendance', count: counts.attendance, icon: <CheckCircleIcon />, color: theme.palette.primary.main, desc: 'Sessions awaiting review' },
                                { key: 'payments', label: 'Payments', count: counts.payments, icon: <PaymentIcon />, color: theme.palette.success.main, desc: 'Due for follow-up' },
                                { key: 'tests', label: 'Tests', count: counts.tests, icon: <AssignmentIcon />, color: theme.palette.warning.main, desc: 'Upcoming assessments' },
                                { key: 'complaints', label: 'Complaints', count: counts.complaints, icon: <WarningAmberIcon />, color: theme.palette.error.main, desc: 'Requires attention' }
                            ].map((cat) => (
                                <Grid item xs={12} sm={6} md={3} key={cat.key}>
                                    <Paper
                                        elevation={0}
                                        onClick={() => setActiveTab(cat.key as any)}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            height: '100%',
                                            cursor: 'pointer',
                                            border: '2px solid',
                                            borderColor: activeTab === cat.key ? cat.color : alpha(cat.color, 0.1),
                                            background: activeTab === cat.key
                                                ? alpha(cat.color, 0.05)
                                                : `linear-gradient(135deg, ${alpha(cat.color, 0.02)} 0%, ${alpha(cat.color, 0.05)} 100%)`,
                                            transition: 'all 0.2s',
                                            boxShadow: activeTab === cat.key ? 4 : 0,
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 2,
                                                borderColor: cat.color
                                            }
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Avatar sx={{ bgcolor: alpha(cat.color, 0.1), color: cat.color }}>
                                                {cat.icon}
                                            </Avatar>
                                            <Typography variant="h4" fontWeight={800} sx={{ color: cat.color }}>
                                                {cat.count}
                                            </Typography>
                                        </Box>
                                        <Typography variant="subtitle1" fontWeight={700}>{cat.label}</Typography>
                                        <Typography variant="body2" color="text.secondary">{cat.desc}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Filter Info & Detailed Tasks Grid */}
                        <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" fontWeight={700}>
                                {activeTab === 'all' ? 'All Tasks' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tasks`}
                                <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                                    ({filteredTasks.length} items)
                                </Typography>
                            </Typography>
                            {activeTab !== 'all' && (
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<FilterListIcon />}
                                    onClick={() => setActiveTab('all')}
                                >
                                    View All Categories
                                </Button>
                            )}
                        </Box>

                        {loading && (
                            <Box display="flex" justifyContent="center" py={4}>
                                <LoadingSpinner size={32} />
                            </Box>
                        )}

                        {!loading && filteredTasks.length === 0 ? (
                            <Box textAlign="center" py={6} bgcolor={alpha(theme.palette.success.main, 0.05)} borderRadius={4} border={`1px dashed ${theme.palette.success.main}`}>
                                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1, opacity: 0.8 }} />
                                <Typography variant="h6" fontWeight={700}>All caught up!</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    No {priorityFilter !== 'all' ? priorityFilter : ''} {activeTab !== 'all' ? activeTab : 'priority'} tasks found.
                                </Typography>
                            </Box>
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