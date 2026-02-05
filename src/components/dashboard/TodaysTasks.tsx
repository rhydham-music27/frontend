import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Button, Divider, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CampaignIcon from '@mui/icons-material/Campaign';
import MailIcon from '@mui/icons-material/Mail';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IDashboardStatistics } from '../../types';

import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { USER_ROLES } from '../../constants';

interface Props {
  stats: IDashboardStatistics | null;
  loading?: boolean;
  onViewAction?: (actionId: string) => void;
}

const TodaysTasks: React.FC<Props> = ({ stats, loading = false, onViewAction }) => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const role = user?.role;

  const tasks = [
    {
      id: 'website_leads',
      label: 'New Leads from Website',
      count: stats?.todaysTasks?.websiteLeadsCount || 0,
      icon: <CampaignIcon color="primary" />,
      color: 'primary.main',
      path: role === USER_ROLES.MANAGER ? '/manager-today-tasks' : '/class-leads?leadSource=WEBSITE&status=NEW',
      actionLabel: 'View leads'
    },
    {
      id: 'unassigned_coordinators',
      label: 'Coordinator Not Assigned',
      count: stats?.todaysTasks?.coordinatorNotAssignedCount || 0,
      icon: <AssignmentIcon color="error" />,
      color: 'error.main',
      path: role === USER_ROLES.MANAGER 
        ? '/manager-today-tasks?tab=unassigned' 
        : '/admin/final-classes?coordinator=unassigned&status=ACTIVE',
      actionLabel: 'Assign now'
    },
    {
      id: 'pending_verification',
      label: 'Pending Tutor Verification',
      count: stats?.todaysTasks?.pendingTutorVerificationCount || 0,
      icon: <VerifiedUserIcon color="warning" />,
      color: 'warning.main',
      path: '/tutors?verificationStatus=PENDING',
      actionLabel: 'Verify'
    },
    {
      id: 'leads_not_closed',
      label: 'Leads Not Closed (Active)',
      count: stats?.todaysTasks?.leadsNotClosedCount || 0,
      icon: <WarningIcon sx={{ color: '#E91E63' }} />,
      color: '#E91E63', // Pink
      path: '/class-leads?status=active',
      actionLabel: 'Track leads'
    },
    {
      id: 'coordinator_requests',
      label: 'Coordinator Requests',
      count: stats?.todaysTasks?.coordinatorRequestsCount || 0,
      icon: <MailIcon color="info" />,
      color: 'info.main',
      path: '/requests', // Check if this route exists or use a relevant one
      actionLabel: 'View requests'
    }
  ];

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
         <Typography variant="h6" fontWeight={700} gutterBottom><Skeleton width="60%" /></Typography>
         <Box mt={2}>
             {[1,2,3,4,5].map(i => <Skeleton key={i} height={60} sx={{ mb: 1, transform: 'none' }} />)}
         </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 0, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', height: '100%' }}>
      <Box p={3} pb={2} bgcolor="#FAFAFA" borderBottom="1px solid" borderColor="divider">
          <Typography variant="h6" fontWeight={800} display="flex" alignItems="center" gap={1}>
             📝 Today's Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
             Summary of immediate actions required today.
          </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {tasks.map((task, index) => (
          <React.Fragment key={task.id}>
            <ListItem 
               sx={{ 
                 p: 2.5, 
                 transition: 'background-color 0.2s',
                 '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } 
               }}
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                <Box 
                   sx={{ 
                     p: 1.2, 
                     borderRadius: '10px', 
                     bgcolor: `${task.color}15`, 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center' 
                   }}
                >
                  {task.icon}
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="subtitle2" fontWeight={600}>{task.label}</Typography>}
                secondary={
                   <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
                       {task.count > 0 ? (
                           <Box component="span" color={task.color} fontWeight={700}>
                              {task.count} items needed
                           </Box>
                       ) : (
                           <Box component="span" color="text.disabled">All caught up</Box>
                       )}
                   </Typography>
                }
              />
              <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                 {task.count > 0 && (
                    <Button 
                        size="small" 
                        endIcon={<ArrowForwardIcon fontSize="small" />}
                        sx={{ 
                            color: task.color, 
                            fontWeight: 600, 
                            textTransform: 'none', 
                            bgcolor: `${task.color}10`,
                            '&:hover': { bgcolor: `${task.color}20` }
                        }}
                        onClick={() => {
                            if (onViewAction && task.id === 'unassigned_coordinators') {
                                onViewAction('unassigned_coordinators');
                            } else {
                                navigate(task.path);
                            }
                        }}
                    >
                        {task.actionLabel}
                    </Button>
                 )}
              </Box>
            </ListItem>
            {index < tasks.length - 1 && <Divider component="li" variant="inset" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default TodaysTasks;
