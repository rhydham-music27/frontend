import React from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Skeleton } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ISystemHealthIndicators } from '../../types';

interface SystemHealthCardProps {
  data: ISystemHealthIndicators | null | undefined;
  loading?: boolean;
  title?: string;
}

const calculateTotalInactiveUsers = (inactiveUsersByRole?: Record<string, number>) => {
  if (!inactiveUsersByRole) return 0;
  return Object.values(inactiveUsersByRole).reduce((sum, v) => sum + (v || 0), 0);
};

const formatInactiveUsersBreakdown = (inactiveUsersByRole?: Record<string, number>) => {
  if (!inactiveUsersByRole) return '';
  return Object.entries(inactiveUsersByRole)
    .filter(([_, v]) => (v || 0) > 0)
    .map(([k, v]) => `${k[0] + k.slice(1).toLowerCase()}: ${v}`)
    .join(', ');
};

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ data, loading = false, title = 'System Health' }) => {
  const pendingApprovalsTotal = data?.pendingApprovals?.totalPending ?? data?.pendingApprovals?.attendance?.total ?? 0;
  const overduePayments = data?.overduePayments ?? 0;
  const pendingVerifications = data?.pendingTutorVerifications ?? 0;
  const inactiveTotal = calculateTotalInactiveUsers(data?.inactiveUsersByRole);
  const inactiveBreakdown = formatInactiveUsersBreakdown(data?.inactiveUsersByRole);

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">{title}</Typography>
        </Box>

        {loading ? (
          <List dense>
            {Array.from({ length: 4 }).map((_, i) => (
              <ListItem key={i}>
                <ListItemIcon>
                  <Skeleton variant="circular" width={24} height={24} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton variant="text" width={180} />}
                  secondary={<Skeleton variant="text" width={220} />}
                />
                <Skeleton variant="rounded" width={60} height={24} />
              </ListItem>
            ))}
          </List>
        ) : !data ? (
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        ) : (
          <List dense>
            <ListItem>
              <ListItemIcon>
                {pendingApprovalsTotal > 0 ? <WarningIcon color="warning" fontSize="small" /> : <CheckCircleIcon color="success" fontSize="small" />}
              </ListItemIcon>
              <ListItemText
                primary="Pending Approvals"
                secondary={`Attendance approvals (Coordinator + Parent)`}
              />
              <Chip size="small" label={pendingApprovalsTotal} color={pendingApprovalsTotal > 0 ? 'warning' : 'success'} variant={pendingApprovalsTotal > 0 ? 'filled' : 'outlined'} />
            </ListItem>
            <Divider />

            <ListItem>
              <ListItemIcon>
                {overduePayments > 0 ? <ErrorIcon color="error" fontSize="small" /> : <CheckCircleIcon color="success" fontSize="small" />}
              </ListItemIcon>
              <ListItemText primary="Overdue Payments" secondary="Payments past due date" />
              <Chip size="small" label={overduePayments} color={overduePayments > 0 ? 'error' : 'success'} variant={overduePayments > 0 ? 'filled' : 'outlined'} />
            </ListItem>
            <Divider />

            <ListItem>
              <ListItemIcon>
                {pendingVerifications > 0 ? <InfoIcon color="info" fontSize="small" /> : <CheckCircleIcon color="success" fontSize="small" />}
              </ListItemIcon>
              <ListItemText primary="Pending Verifications" secondary="Tutors awaiting verification" />
              <Chip size="small" label={pendingVerifications} color={pendingVerifications > 0 ? 'info' : 'success'} variant={pendingVerifications > 0 ? 'filled' : 'outlined'} />
            </ListItem>
            <Divider />

            <ListItem>
              <ListItemIcon>
                {inactiveTotal > 0 ? <InfoIcon color="info" fontSize="small" /> : <CheckCircleIcon color="success" fontSize="small" />}
              </ListItemIcon>
              <ListItemText primary="Inactive Users" secondary={inactiveBreakdown || 'No inactive users'} />
              <Chip size="small" label={inactiveTotal} color={inactiveTotal > 0 ? 'info' : 'success'} variant={inactiveTotal > 0 ? 'filled' : 'outlined'} />
            </ListItem>
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
