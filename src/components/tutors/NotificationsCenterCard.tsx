import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, Divider, Chip, CardContent, Tabs, Tab, Badge, Alert } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentsIcon from '@mui/icons-material/Payments';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import { StyledCard } from '../common/StyledCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import useNotifications from '../../hooks/useNotifications';
import { INotification } from '../../types';
import { NOTIFICATION_TYPE } from '../../constants';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationsCenterCard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    notifications,
    loading,
    error,
    pagination,
    unreadCount,
    refetch,
    markRead,
    markAllRead,
    deleteNotif,
  } = useNotifications({ page: 1, limit: 20, enabled: true });

  const getNotificationIcon = (type?: string) => {
    const sxCommon = { fontSize: 20 };
    switch (type) {
      case NOTIFICATION_TYPE.ANNOUNCEMENT:
        return <CampaignIcon sx={{ ...sxCommon, color: 'info.main' }} />;
      case NOTIFICATION_TYPE.DEMO_ASSIGNED:
        return <AssignmentIcon sx={{ ...sxCommon, color: 'primary.main' }} />;
      case NOTIFICATION_TYPE.PAYMENT:
        return <PaymentsIcon sx={{ ...sxCommon, color: 'success.main' }} />;
      case NOTIFICATION_TYPE.VERIFICATION:
        return <VerifiedUserIcon sx={{ ...sxCommon, color: 'info.main' }} />;
      case NOTIFICATION_TYPE.ATTENDANCE:
        return <CheckCircleIcon sx={{ ...sxCommon, color: 'warning.main' }} />;
      default:
        return <NotificationsIcon sx={{ ...sxCommon, color: 'text.secondary' }} />;
    }
  };

  const handleViewRelated = (n: INotification) => {
    const anyNotif = n as any;
    if (anyNotif.relatedClassLead) {
      navigate('/class-leads');
      return;
    }
    if (anyNotif.relatedAnnouncement) {
      navigate('/announcements');
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case NOTIFICATION_TYPE.ANNOUNCEMENT:
        return 'Announcement';
      case NOTIFICATION_TYPE.DEMO_ASSIGNED:
        return 'Demo Assigned';
      case NOTIFICATION_TYPE.PAYMENT:
        return 'Payment';
      case NOTIFICATION_TYPE.VERIFICATION:
        return 'Verification';
      case NOTIFICATION_TYPE.ATTENDANCE:
        return 'Attendance';
      case NOTIFICATION_TYPE.GENERAL:
        return 'General';
      default:
        return 'Update';
    }
  };

  const counts = useMemo(() => {
    const base = {
      all: notifications?.length || 0,
      unread: (notifications || []).filter(n => !n.isRead).length,
      [NOTIFICATION_TYPE.ANNOUNCEMENT]: (notifications || []).filter(n => n.type === NOTIFICATION_TYPE.ANNOUNCEMENT).length,
      [NOTIFICATION_TYPE.DEMO_ASSIGNED]: (notifications || []).filter(n => n.type === NOTIFICATION_TYPE.DEMO_ASSIGNED).length,
      [NOTIFICATION_TYPE.PAYMENT]: (notifications || []).filter(n => n.type === NOTIFICATION_TYPE.PAYMENT).length,
      [NOTIFICATION_TYPE.VERIFICATION]: (notifications || []).filter(n => n.type === NOTIFICATION_TYPE.VERIFICATION).length,
    } as Record<string, number>;
    return base;
  }, [notifications]);

  const getFilteredNotifications = () => {
    if (!notifications) return [] as INotification[];
    if (selectedTab === 'all') return notifications;
    if (selectedTab === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === selectedTab);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setActionError(null);
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await markRead(id);
    } catch (e: any) {
      setActionError(e?.message || 'Failed to mark as read');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionError(null);
      await markAllRead();
    } catch (e: any) {
      setActionError(e?.message || 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      setActionError(null);
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await deleteNotif(id);
    } catch (e: any) {
      setActionError(e?.message || 'Failed to delete notification');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleTabChange = (_: React.SyntheticEvent, value: string) => {
    setSelectedTab(value);
  };

  useEffect(() => {
    const id = setInterval(() => {
      refetch();
    }, 45000);
    return () => clearInterval(id);
  }, [refetch]);

  if (loading && (!notifications || notifications.length === 0)) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" justifyContent="center" py={4} aria-busy>
            <LoadingSpinner message="Loading notifications..." />
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  if (error && (!notifications || notifications.length === 0)) {
    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <ErrorAlert error={error} />
            <Box>
              <Button variant="outlined" onClick={refetch}>Retry</Button>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  const filtered = getFilteredNotifications();

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <NotificationsIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>Notifications</Typography>
            <Badge color="error" badgeContent={unreadCount || 0} aria-label="Unread notifications" />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Refresh notifications">
              <span>
                <IconButton onClick={handleRefresh} disabled={loading} aria-label="Refresh">
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="text"
              size="small"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllAsRead}
              disabled={(unreadCount || 0) === 0 || !!loading}
            >
              Mark All Read
            </Button>
          </Box>
        </Box>

        {actionError && (
          <Box mb={2}>
            <Alert severity="error">{actionError}</Alert>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Notifications filters"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="all" label={<Box display="flex" alignItems="center" gap={1}><span>All</span><Chip size="small" label={counts.all} /></Box>} />
          <Tab value="unread" label={<Box display="flex" alignItems="center" gap={1}><span>Unread</span><Chip size="small" color="error" label={counts.unread} /></Box>} />
          <Tab value={NOTIFICATION_TYPE.ANNOUNCEMENT} label={<Box display="flex" alignItems="center" gap={1}><span>Announcements</span><Chip size="small" label={counts[NOTIFICATION_TYPE.ANNOUNCEMENT] || 0} /></Box>} />
          <Tab value={NOTIFICATION_TYPE.DEMO_ASSIGNED} label={<Box display="flex" alignItems="center" gap={1}><span>Demos</span><Chip size="small" label={counts[NOTIFICATION_TYPE.DEMO_ASSIGNED] || 0} /></Box>} />
          <Tab value={NOTIFICATION_TYPE.PAYMENT} label={<Box display="flex" alignItems="center" gap={1}><span>Payments</span><Chip size="small" label={counts[NOTIFICATION_TYPE.PAYMENT] || 0} /></Box>} />
          <Tab value={NOTIFICATION_TYPE.VERIFICATION} label={<Box display="flex" alignItems="center" gap={1}><span>Verification</span><Chip size="small" label={counts[NOTIFICATION_TYPE.VERIFICATION] || 0} /></Box>} />
        </Tabs>

        <Divider sx={{ my: 2 }} />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<NotificationsIcon />}
            title={selectedTab === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
            description="You're all caught up! New notifications will appear here."
          />
        ) : (
          <Box
            sx={{
              maxHeight: 500,
              overflow: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': { width: 8 },
              '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 },
              '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.06)' },
            }}
          >
            {filtered.map((n: INotification, index: number) => (
              <Box
                key={n.id || `${n.type || 'notification'}-${index}`}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 3,
                  p: 2,
                  mb: 1.5,
                  position: 'relative',
                  bgcolor: n.isRead ? 'transparent' : 'action.hover',
                  borderLeft: n.isRead ? 'none' : theme => `3px solid ${theme.palette.primary.main}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'grey.100', transform: 'translateX(2px)' },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    {getNotificationIcon(n.type)}
                    <Box flex={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {n.title || '-'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={getTypeLabel(n.type)}
                      color={
                        n.type === NOTIFICATION_TYPE.PAYMENT
                          ? 'success'
                          : n.type === NOTIFICATION_TYPE.DEMO_ASSIGNED
                          ? 'primary'
                          : n.type === NOTIFICATION_TYPE.VERIFICATION
                          ? 'info'
                          : 'default'
                      }
                    />
                    <Tooltip title="Delete notification">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNotification(n.id)}
                          disabled={!!actionLoading[n.id]}
                          aria-label="Delete notification"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={1} sx={{ wordBreak: 'break-word' }}>
                  {n.message || '-'}
                </Typography>

                {(n as any).relatedAnnouncement || (n as any).relatedClassLead ? (
                  <Box mt={1} pt={1} sx={{ borderTop: '1px solid', borderColor: 'grey.100' }}>
                    <Typography
                      variant="caption"
                      color="primary.main"
                      fontWeight={600}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleViewRelated(n)}
                    >
                      { (n as any).relatedClassLead ? 'View Related Class Lead →' : 'View Announcement →' }
                    </Typography>
                  </Box>
                ) : null}

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Typography variant="caption" color="text.disabled">
                    {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'N/A'}
                  </Typography>
                  {n.isRead ? (
                    <Chip size="small" color="success" variant="outlined" icon={<CheckCircleIcon />} label="Read" />
                  ) : (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleMarkAsRead(n.id)}
                      disabled={!!actionLoading[n.id]}
                    >
                      {actionLoading[n.id] ? 'Marking...' : 'Mark as Read'}
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(NotificationsCenterCard);
