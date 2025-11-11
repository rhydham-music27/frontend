import React from 'react';
import { Card, CardContent, CardActions, Box, Typography, Chip, Button, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { IAttendance, IPaymentReminder, TaskPriority } from '../../types';
import { ATTENDANCE_STATUS, PAYMENT_STATUS } from '../../constants';

interface TaskCardBaseProps {
  priority: TaskPriority;
  onAction?: (taskId: string, actionType: string) => void;
  loading?: boolean;
}

interface AttendanceTaskProps extends TaskCardBaseProps {
  taskType: 'attendance';
  task: IAttendance;
}

interface PaymentTaskProps extends TaskCardBaseProps {
  taskType: 'payment';
  task: IPaymentReminder;
}

interface TestTaskProps extends TaskCardBaseProps {
  taskType: 'test';
  task: any;
}

interface ComplaintTaskProps extends TaskCardBaseProps {
  taskType: 'complaint';
  task: any;
}

type TaskCardProps = AttendanceTaskProps | PaymentTaskProps | TestTaskProps | ComplaintTaskProps;

const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'overdue':
      return 'error.main';
    case 'today':
      return 'warning.main';
    default:
      return 'info.main';
  }
};

const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case 'overdue':
      return 'Overdue';
    case 'today':
      return 'Due Today';
    default:
      return 'Upcoming';
  }
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  const diff = (dd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString();
};

const formatCurrency = (amount: number): string => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `₹${amount}`;
  }
};

const TaskCard: React.FC<TaskCardProps> = (props) => {
  const navigate = useNavigate();
  const { priority, onAction } = props;

  const priorityColor = getPriorityColor(priority);
  const PriorityChip = (
    <Chip
      size="small"
      label={getPriorityLabel(priority)}
      sx={{ bgcolor: `${priorityColor}`, color: 'common.white' }}
      aria-label={`Priority ${getPriorityLabel(priority)}`}
    />
  );

  return (
    <Card elevation={2} sx={{ transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 4 }, borderLeft: '4px solid', borderLeftColor: priorityColor }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            {props.taskType === 'attendance' && <CheckCircleIcon color="success" />}
            {props.taskType === 'payment' && <PaymentIcon color="primary" />}
            {props.taskType === 'test' && <AssignmentIcon color="info" />}
            {props.taskType === 'complaint' && <WarningIcon color="error" />}
            <Typography variant="h6">
              {props.taskType === 'attendance' && 'Attendance Approval'}
              {props.taskType === 'payment' && 'Payment Reminder'}
              {props.taskType === 'test' && 'Test to Schedule'}
              {props.taskType === 'complaint' && 'Parent Complaint'}
            </Typography>
          </Box>
          {PriorityChip}
        </Box>

        {/* Content per type */}
        {props.taskType === 'attendance' && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <SchoolIcon fontSize="small" />
              <Typography variant="body2">
                {(props.task as IAttendance).finalClass.studentName} - {(props.task as IAttendance).finalClass.subject.join(', ')}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">{formatDate((props.task as IAttendance).sessionDate)}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">{(props.task as IAttendance).tutor.name}</Typography>
            </Box>
            {(props.task as IAttendance).sessionNumber && (
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2">Session #{(props.task as IAttendance).sessionNumber}</Typography>
              </Box>
            )}
            {(props.task as IAttendance).notes && (
              <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">{(props.task as IAttendance).notes}</Typography>
              </Box>
            )}
          </Box>
        )}

        {props.taskType === 'payment' && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <SchoolIcon fontSize="small" />
              <Typography variant="body2">
                {(props.task as IPaymentReminder).finalClass.studentName} - {(props.task as IPaymentReminder).finalClass.subject.join(', ')}
              </Typography>
            </Box>
            <Typography variant="h5" color="primary">
              {formatCurrency((props.task as IPaymentReminder).amount)}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">Due {formatDate((props.task as IPaymentReminder).dueDate)}</Typography>
            </Box>
            <Box>
              <Chip
                size="small"
                label={(props.task as IPaymentReminder).status}
                color={(props.task as IPaymentReminder).status === PAYMENT_STATUS.OVERDUE ? 'error' : (props.task as IPaymentReminder).status === PAYMENT_STATUS.PENDING ? 'warning' : 'success'}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">{(props.task as IPaymentReminder).tutor.name}</Typography>
            </Box>
          </Box>
        )}

        {props.taskType === 'test' && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <SchoolIcon fontSize="small" />
              <Typography variant="body2">{props.task?.finalClass?.studentName} - {props.task?.finalClass?.subject?.join(', ')}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">No test scheduled for this class</Typography>
            {props.task?.lastTestDate && (
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarTodayIcon fontSize="small" />
                <Typography variant="body2">Last test: {formatDate(props.task.lastTestDate)}</Typography>
              </Box>
            )}
            {props.task?.tutor?.name && (
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2">{props.task.tutor.name}</Typography>
              </Box>
            )}
          </Box>
        )}

        {props.taskType === 'complaint' && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="body2">{props.task?.parentName} - {props.task?.contact}</Typography>
            <Typography variant="body2">{props.task?.finalClass?.studentName} - {props.task?.finalClass?.subject?.join(', ')}</Typography>
            {props.task?.summary && (
              <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">{props.task.summary}</Typography>
              </Box>
            )}
            {props.task?.createdAt && (
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarTodayIcon fontSize="small" />
                <Typography variant="body2">Received {formatDate(props.task.createdAt)}</Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2 }}>
        {props.taskType === 'attendance' && (
          <>
            <Button variant="contained" color="success" onClick={() => navigate('/attendance-approvals')} aria-label="Review and approve attendance">
              Review & Approve
            </Button>
            <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => onAction?.((props.task as IAttendance).id, 'view')} aria-label="View attendance details">
              View Details
            </Button>
          </>
        )}
        {props.taskType === 'payment' && (
          <>
            <Button variant="contained" color="primary" onClick={() => navigate(`/payments/${(props.task as IPaymentReminder).id}`)} aria-label="Send payment reminder">
              Send Reminder
            </Button>
            <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/assigned-classes')} aria-label="View class">
              View Class
            </Button>
          </>
        )}
        {props.taskType === 'test' && (
          <>
            <Button variant="contained" color="primary" onClick={() => navigate('/test-scheduling')} aria-label="Schedule test">
              Schedule Test
            </Button>
            <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/assigned-classes')} aria-label="View class">
              View Class
            </Button>
          </>
        )}
        {props.taskType === 'complaint' && (
          <>
            <Button variant="contained" color="primary" aria-label="Contact parent">
              Contact Parent
            </Button>
            <Button variant="outlined" endIcon={<ArrowForwardIcon />} aria-label="View complaint details">
              View Details
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default TaskCard;
