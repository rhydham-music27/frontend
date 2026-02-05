
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Tabs, Tab, Grid, Card, CardContent, Button, Divider, Chip, Badge, useTheme, alpha, IconButton, Avatar } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import ScheduleIcon from '@mui/icons-material/Schedule';
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
  const theme = useTheme();
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

    const tests: ITaskWithPriority<any>[] = tasksData?.testsToSchedule?.map((cls) => ({
      task: cls,
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
    console.log('Task action', taskId, actionType);
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
                  Today's Tasks
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage pending actions and urgent items.
                </Typography>
            </Box>
            <Box display="flex" gap={1}>
                <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    sx={{ 
                        bgcolor: 'rgba(255,255,255,0.15)', 
                        backdropFilter: 'blur(10px)', 
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } 
                    }}
                >
                    Refresh
                </Button>
            </Box>
        </Box>
        
        {/* Priority Filter Chips in Hero */}
        <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              label="All Priorities" 
              onClick={() => setPriorityFilter('all')} 
              sx={{ bgcolor: priorityFilter === 'all' ? 'white' : 'rgba(255,255,255,0.2)', color: priorityFilter === 'all' ? 'primary.main' : 'white', fontWeight: 600, '&:hover': { bgcolor: 'white', color: 'primary.main' } }} 
            />
            <Chip 
              label="Overdue" 
              onClick={() => setPriorityFilter('overdue')} 
              sx={{ bgcolor: priorityFilter === 'overdue' ? '#EF4444' : 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, border: priorityFilter === 'overdue' ? '2px solid white' : 'none' }} 
            />
            <Chip 
              label="Today" 
              onClick={() => setPriorityFilter('today')} 
              sx={{ bgcolor: priorityFilter === 'today' ? '#F59E0B' : 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, border: priorityFilter === 'today' ? '2px solid white' : 'none' }} 
            />
            <Chip 
              label="Upcoming" 
              onClick={() => setPriorityFilter('upcoming')} 
              sx={{ bgcolor: priorityFilter === 'upcoming' ? '#10B981' : 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, border: priorityFilter === 'upcoming' ? '2px solid white' : 'none' }} 
            />
        </Box>
      </Box>

      {error && <Box mt={6}><ErrorAlert error={error} /></Box>}

      {/* Summary Cards (Filter Tabs) */}
      <Box mt={6} mb={4}>
         <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'none' }}>Categories</Typography>
         <Grid container spacing={2}>
            {[
                { key: 'attendance', label: 'Attendance', count: counts.attendance, icon: <CheckCircleIcon />, color: theme.palette.primary.main },
                { key: 'payments', label: 'Payments', count: counts.payments, icon: <PaymentIcon />, color: theme.palette.error.main },
                { key: 'tests', label: 'Tests', count: counts.tests, icon: <AssignmentIcon />, color: theme.palette.info.main },
                { key: 'complaints', label: 'Complaints', count: counts.complaints, icon: <WarningIcon />, color: theme.palette.warning.main }
            ].map((cat) => (
               <Grid item xs={6} sm={6} md={3} key={cat.key}>
                   <Card 
                     onClick={() => setActiveTab(cat.key as any)}
                     sx={{ 
                         cursor: 'pointer',
                         borderRadius: 3,
                         border: activeTab === cat.key ? `2px solid ${cat.color}` : '1px solid transparent',
                         boxShadow: activeTab === cat.key ? 4 : 1,
                         transition: 'all 0.2s',
                         '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                     }}
                   >
                       <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:last-child': { pb: 2 } }}>
                           <Box>
                               <Typography variant="body2" color="text.secondary" fontWeight={600}>{cat.label}</Typography>
                               <Typography variant="h4" fontWeight={800} color={cat.count > 0 ? 'text.primary' : 'text.disabled'}>
                                   {cat.count}
                               </Typography>
                           </Box>
                           <Avatar sx={{ bgcolor: alpha(cat.color, 0.1), color: cat.color }}>
                               {cat.icon}
                           </Avatar>
                       </CardContent>
                   </Card>
               </Grid>
            ))}
         </Grid>
      </Box>

      {/* Helper Tabs (Hidden primarily, but can keep for 'All' reset if needed, or just rely on cards) */}
      {/* We are using cards as tabs now, but let's add a "View All" chip if a category is selected */}
      {activeTab !== 'all' && (
          <Box mb={3} display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">Filtered by: <strong>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</strong></Typography>
              <Button size="small" onClick={() => setActiveTab('all')} startIcon={<FilterListIcon />}>Show All Categories</Button>
          </Box>
      )}

      {loading && !tasksData && (
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner />
        </Box>
      )}

      {!loading && filteredTasks.length === 0 && (
        <Box textAlign="center" py={8} bgcolor={alpha(theme.palette.success.main, 0.05)} borderRadius={4}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2, opacity: 0.8 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>No tasks found</Typography>
          <Typography variant="body1" color="text.secondary">
             Category: <strong>{activeTab}</strong> | Priority: <strong>{priorityFilter}</strong>
          </Typography>
          <Button onClick={() => { setActiveTab('all'); setPriorityFilter('all'); }} sx={{ mt: 2 }}>
             Reset Filters
          </Button>
        </Box>
      )}

      {!loading && filteredTasks.length > 0 && (
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
