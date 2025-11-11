import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Tabs, Tab, Grid, Card, CardContent, Button, Divider, Chip, Badge, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { getTodaysTasks } from '../../services/coordinatorService';
import { ICoordinatorTodaysTasks, IAttendance, IPaymentReminder, TaskPriority, ITaskWithPriority } from '../../types';
import TaskCard from '../../components/coordinator/TaskCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';

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

const TodayTasksPage: React.FC = () => {
  const [tasksData, setTasksData] = useState<ICoordinatorTodaysTasks | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'attendance' | 'payments' | 'tests' | 'complaints'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTodaysTasks();
      setTasksData(res.data);
    } catch (e) {
      setError("Failed to load today's tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const processedTasks = useMemo(() => {
    const attendance: ITaskWithPriority<IAttendance>[] = tasksData?.pendingAttendanceApprovals?.map((t) => ({
      task: t,
      priority: calculatePriority(t.sessionDate),
      priorityDate: new Date(t.sessionDate),
    })) || [];

    const payments: ITaskWithPriority<IPaymentReminder>[] = tasksData?.paymentReminders?.map((p: any) => ({
      task: p as IPaymentReminder,
      priority: calculatePriority(p.dueDate),
      priorityDate: new Date(p.dueDate),
    })) || [];

    const tests: ITaskWithPriority<any>[] = tasksData?.testsToSchedule?.map((x: any) => ({
      task: x,
      priority: 'upcoming' as TaskPriority,
      priorityDate: new Date(),
    })) || [];

    const complaints: ITaskWithPriority<any>[] = tasksData?.parentComplaints?.map((c: any) => ({
      task: c,
      priority: 'overdue' as TaskPriority,
      priorityDate: new Date(c?.createdAt || Date.now()),
    })) || [];

    return { attendance, payments, tests, complaints };
  }, [tasksData]);

  const filteredTasks = useMemo(() => {
    let list: Array<ITaskWithPriority<any>> = [];
    if (activeTab === 'all') list = [...processedTasks.attendance, ...processedTasks.payments, ...processedTasks.tests, ...processedTasks.complaints];
    if (activeTab === 'attendance') list = processedTasks.attendance;
    if (activeTab === 'payments') list = processedTasks.payments;
    if (activeTab === 'tests') list = processedTasks.tests;
    if (activeTab === 'complaints') list = processedTasks.complaints;

    if (priorityFilter !== 'all') list = list.filter((t) => t.priority === priorityFilter);

    return sortTasksByPriority(list);
  }, [processedTasks, activeTab, priorityFilter]);

  const counts = useMemo(() => ({
    attendance: processedTasks.attendance.length,
    payments: processedTasks.payments.length,
    tests: processedTasks.tests.length,
    complaints: processedTasks.complaints.length,
    total: processedTasks.attendance.length + processedTasks.payments.length + processedTasks.tests.length + processedTasks.complaints.length,
  }), [processedTasks]);

  const handleRefresh = () => {
    setSnackbar({ open: true, message: 'Refreshing tasks...', severity: 'info' });
    fetchTasks();
  };

  const handleTaskAction = (taskId: string, actionType: string) => {
    // Placeholder for inline actions
    console.log('Task action', taskId, actionType);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        mb={2}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 1.5, sm: 1 }}
      >
        <Typography 
          variant="h4" 
          sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
        >
          Today's Tasks
        </Typography>
        <Box 
          display="flex" 
          alignItems="center" 
          gap={1} 
          flexWrap="wrap"
          sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
        >
          <Chip label="All" color={priorityFilter === 'all' ? 'primary' : 'default'} onClick={() => setPriorityFilter('all')} />
          <Chip label="Overdue" color={priorityFilter === 'overdue' ? 'primary' : 'default'} onClick={() => setPriorityFilter('overdue')} />
          <Chip label="Today" color={priorityFilter === 'today' ? 'primary' : 'default'} onClick={() => setPriorityFilter('today')} />
          <Chip label="Upcoming" color={priorityFilter === 'upcoming' ? 'primary' : 'default'} onClick={() => setPriorityFilter('upcoming')} />
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh} 
            aria-label="Refresh tasks"
            sx={{ ml: { sm: 1 }, width: { xs: '100%', sm: 'auto' } }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Box mb={2}>
          <ErrorAlert error={error} />
        </Box>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card onClick={() => setActiveTab('attendance')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircleIcon color={counts.attendance > 0 ? 'warning' : 'disabled'} />
                <Typography variant="subtitle1">Attendance</Typography>
              </Box>
              <Typography variant="h4">{tasksData?.counts?.pendingAttendance ?? counts.attendance}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card onClick={() => setActiveTab('payments')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <PaymentIcon color={counts.payments > 0 ? 'error' : 'disabled'} />
                <Typography variant="subtitle1">Payments</Typography>
              </Box>
              <Typography variant="h4">{tasksData?.counts?.paymentReminders ?? counts.payments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card onClick={() => setActiveTab('tests')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AssignmentIcon color={counts.tests > 0 ? 'info' : 'disabled'} />
                <Typography variant="subtitle1">Tests</Typography>
              </Box>
              <Typography variant="h4">{tasksData?.counts?.testsToSchedule ?? counts.tests}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card onClick={() => setActiveTab('complaints')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon color={counts.complaints > 0 ? 'error' : 'disabled'} />
                <Typography variant="subtitle1">Complaints</Typography>
              </Box>
              <Typography variant="h4">{tasksData?.counts?.parentComplaints ?? counts.complaints}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="all" label={<Badge color="primary" badgeContent={counts.total}>All Tasks</Badge>} />
          <Tab value="attendance" label={<Badge color="warning" badgeContent={counts.attendance}>Attendance</Badge>} />
          <Tab value="payments" label={<Badge color="error" badgeContent={counts.payments}>Payments</Badge>} />
          <Tab value="tests" label={<Badge color="info" badgeContent={counts.tests}>Tests</Badge>} />
          <Tab value="complaints" label={<Badge color="error" badgeContent={counts.complaints}>Complaints</Badge>} />
        </Tabs>
      </Card>

      {loading && !tasksData && (
        <Box mt={4} display="flex" justifyContent="center">
          <LoadingSpinner />
        </Box>
      )}

      {!loading && filteredTasks.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary">No tasks found</Typography>
          <Typography variant="body2">Great job! You're all caught up.</Typography>
          {priorityFilter !== 'all' && (
            <Box mt={2}>
              <Button onClick={() => setPriorityFilter('all')} variant="outlined" startIcon={<FilterListIcon />}>Clear Filter</Button>
            </Box>
          )}
        </Box>
      )}

      {!loading && filteredTasks.length > 0 && (
        <>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>Showing {filteredTasks.length} tasks</Typography>
          <Grid container spacing={3}>
            {filteredTasks.map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <TaskCard
                  taskType={(activeTab === 'all' ? (item.task.status && (item.task as any).sessionDate ? 'attendance' : (item.task as any).dueDate ? 'payment' : (item.task as any).summary ? 'complaint' : 'test') : (activeTab === 'payments' ? 'payment' : activeTab === 'attendance' ? 'attendance' : activeTab === 'complaints' ? 'complaint' : 'test')) as any}
                  task={item.task}
                  priority={item.priority}
                  loading={loading}
                  onAction={handleTaskAction}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button fullWidth variant="contained" color="success" onClick={() => navigate('/attendance-approvals')}>View All Attendance</Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button fullWidth variant="contained" color="primary" onClick={() => navigate('/payments')}>Manage Payments</Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button fullWidth variant="contained" color="primary" onClick={() => navigate('/test-scheduling')}>Schedule Tests</Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button fullWidth variant="outlined" onClick={() => navigate('/assigned-classes')}>View Classes</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Container>
  );
};

export default TodayTasksPage;
