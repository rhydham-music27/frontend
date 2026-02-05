import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { format } from 'date-fns';
import { getApprovalLists } from '../../services/adminService';
import { coordinatorApprove, rejectAttendance } from '../../services/attendanceService';
import { updateVerificationStatus, approveTierChange } from '../../services/tutorService';
import { toast } from 'sonner';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`approval-tabpanel-${index}`}
      aria-labelledby={`approval-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ApprovalsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [approvalType, setApprovalType] = useState<'ATTENDANCE' | 'TUTOR' | 'TIER'>('ATTENDANCE');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getApprovalLists();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch approval lists');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleApproveAttendance = (id: string) => {
    setConfirmTitle('Approve Attendance');
    setConfirmMessage('Are you sure you want to approve this attendance record?');
    setConfirmOpen(true);
    setConfirmAction(() => async () => {
      try {
        setConfirmLoading(true);
        const res = await coordinatorApprove(id);
        if (res.success) {
          toast.success('Attendance approved successfully');
          setConfirmOpen(false);
          fetchData();
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to approve attendance');
      } finally {
        setConfirmLoading(false);
      }
    });
  };

  const handleRejectClick = (item: any, type: 'ATTENDANCE' | 'TUTOR' | 'TIER') => {
    setSelectedItem(item);
    setApprovalType(type);
    setRejectionReason('');
    setRejectionDialogOpen(true);
  };

  const handleConfirmRejection = async () => {
    if (!selectedItem) return;
    try {
      if (approvalType === 'ATTENDANCE') {
        const res = await rejectAttendance(selectedItem._id, rejectionReason);
        if (res.success) {
          toast.success('Attendance rejected');
          fetchData();
        }
      } else if (approvalType === 'TUTOR') {
        const res = await updateVerificationStatus(selectedItem._id, 'REJECTED' as any, rejectionReason);
        if (res.success) {
          toast.success('Tutor verification rejected');
          fetchData();
        }
      } else if (approvalType === 'TIER') {
        const res = await approveTierChange(selectedItem._id, false, rejectionReason);
        if (res.success) {
          toast.success('Tier change rejected');
          fetchData();
        }
      }
      setRejectionDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleApproveTutor = (id: string) => {
    setConfirmTitle('Verify Tutor');
    setConfirmMessage('Are you sure you want to verify this tutor?');
    setConfirmOpen(true);
    setConfirmAction(() => async () => {
      try {
        setConfirmLoading(true);
        const res = await updateVerificationStatus(id, 'VERIFIED' as any, 'Approved by Admin');
        if (res.success) {
          toast.success('Tutor verified successfully');
          setConfirmOpen(false);
          fetchData();
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to verify tutor');
      } finally {
        setConfirmLoading(false);
      }
    });
  };

  const handleApproveTier = (id: string) => {
    setConfirmTitle('Approve Tier Change');
    setConfirmMessage('Are you sure you want to approve this tier change request?');
    setConfirmOpen(true);
    setConfirmAction(() => async () => {
      try {
        setConfirmLoading(true);
        const res = await approveTierChange(id, true, 'Approved by Admin');
        if (res.success) {
          toast.success('Tier change approved');
          setConfirmOpen(false);
          fetchData();
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to approve tier change');
      } finally {
        setConfirmLoading(false);
      }
    });
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Approvals Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage pending approvals for attendance, tutor certifications, and system requests.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }} elevation={0} variant="outlined">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            background: (theme) => theme.palette.grey[50],
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '0.95rem',
              fontWeight: 500,
            }
          }}
        >
          <Tab icon={<EventNoteIcon sx={{ mr: 1 }} />} iconPosition="start" label={`Attendance (${data?.attendance?.length || 0})`} />
          <Tab icon={<VerifiedUserIcon sx={{ mr: 1 }} />} iconPosition="start" label={`Tutor Verifications (${data?.tutors?.length || 0})`} />
          <Tab icon={<TrendingUpIcon sx={{ mr: 1 }} />} iconPosition="start" label={`Tier Changes (${data?.tierChanges?.length || 0})`} />
          <Tab icon={<PendingActionsIcon sx={{ mr: 1 }} />} iconPosition="start" label={`Demos (${data?.demos?.length || 0})`} />
        </Tabs>

        {/* Attendance Tab */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class / Student</TableCell>
                  <TableCell>Tutor</TableCell>
                  <TableCell>Session Date</TableCell>
                  <TableCell>Topic</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.attendance?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No pending attendance approvals</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.attendance?.map((row: any) => (
                    <TableRow key={row._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{row.finalClass?.className || 'Manual Entry'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Student: {row.finalClass?.studentName || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {row.tutor?.name?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{row.tutor?.name || 'N/A'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{row.sessionDate ? format(new Date(row.sessionDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                      <TableCell>
                        <Tooltip title={row.topicCovered || ''}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.topicCovered || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status === 'PENDING' ? 'Coord. Pending' : 'Parent Pending'}
                          size="small"
                          color={row.status === 'PENDING' ? 'warning' : 'info'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleApproveAttendance(row._id)}>
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error" onClick={() => handleRejectClick(row, 'ATTENDANCE')}>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tutor Verification Tab */}
        <TabPanel value={activeTab} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tutor</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Docs</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.tutors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No tutors pending verification</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.tutors?.map((row: any) => (
                    <TableRow key={row._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar>{row.user?.name?.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle2">{row.user?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.user?.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {row.subjects?.map((s: string) => (
                            <Chip key={s} label={s} size="small" sx={{ fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{row.experienceHours} Hrs</TableCell>
                      <TableCell>
                        <Chip
                          icon={<VisibilityIcon sx={{ fontSize: '1rem !important' }} />}
                          label={row.documents?.length || 0}
                          size="small"
                          variant="outlined"
                          clickable
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Verify Tutor">
                            <IconButton size="small" color="success" onClick={() => handleApproveTutor(row._id)}>
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error" onClick={() => handleRejectClick(row, 'TUTOR')}>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tier Change Tab */}
        <TabPanel value={activeTab} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tutor</TableCell>
                  <TableCell>Current Tier</TableCell>
                  <TableCell>Requested Tier</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.tierChanges?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No pending tier change requests</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.tierChanges?.map((row: any) => (
                    <TableRow key={row._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{row.user?.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.tier} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={row.pendingTierChange?.newTier} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {row.pendingTierChange?.reason || 'No reason provided'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Approve Tier">
                            <IconButton size="small" color="success" onClick={() => handleApproveTier(row._id)}>
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error" onClick={() => handleRejectClick(row, 'TIER')}>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Demos Tab */}
        <TabPanel value={activeTab} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Scheduled At</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.demos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No scheduled demos</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.demos?.map((row: any) => (
                    <TableRow key={row._id} hover>
                      <TableCell>{row.lead?.studentName || 'N/A'}</TableCell>
                      <TableCell>{row.lead?.subject?.[0] || 'N/A'}</TableCell>
                      <TableCell>
                        {row.scheduledAt ? format(new Date(row.scheduledAt), 'dd MMM yyyy HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip label={row.status} size="small" color="info" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary">
              Note: Mark demos as completed in the Class Leads section.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reason for Rejection</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              variant="outlined"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this is being rejected..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRejection} color="error" variant="contained" disabled={!rejectionReason.trim()}>
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
        title={confirmTitle}
        message={confirmMessage}
        loading={confirmLoading}
        severity="info"
      />
    </Container>
  );
};

export default ApprovalsManagementPage;
