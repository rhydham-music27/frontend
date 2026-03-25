import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Divider,
  alpha,
  useTheme,
  IconButton,
  Avatar,
  Grid,
  Zoom,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { format } from 'date-fns';
import { ATTENDANCE_STATUS } from '../../constants';
import { getOptionLabel, getSubjectLabel } from '../../utils/subjectUtils';

interface AttendanceSheetReviewModalProps {
  open: boolean;
  onClose: () => void;
  sheet: any;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

const AttendanceSheetReviewModal: React.FC<AttendanceSheetReviewModalProps> = ({
  open,
  onClose,
  sheet,
  onApprove,
  onReject,
}) => {
  const theme = useTheme();
  if (!sheet) return null;

  const handleApprove = async () => {
    if (window.confirm('Approve this sheet and create a one-time payout for the sessions recorded so far? After approval, this sheet will be closed and new sessions will go into a new sheet.')) {
      await onApprove(sheet._id);
      onClose();
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please enter the reason for rejection:');
    if (reason && reason.trim()) {
      await onReject(sheet._id, reason);
      onClose();
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 800, borderRadius: '6px' }} />;
      case 'PENDING':
        return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 800, borderRadius: '6px' }} />;
      case 'REJECTED':
        return <Chip label="Rejected" color="error" size="small" sx={{ fontWeight: 800, borderRadius: '6px' }} />;
      default:
        return <Chip label={status} size="small" sx={{ fontWeight: 800, borderRadius: '6px' }} />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          borderRadius: '28px',
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(16px)',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.05)
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <HistoryEduIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800}>Review Attendance Sheet</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Tracking ID: {sheet._id.substring(sheet._id.length - 8).toUpperCase()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusChip(sheet.status)}
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Fade in timeout={600}>
          <Box>
            {/* Header Details */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={7}>
                <Typography variant="h5" fontWeight={800} gutterBottom color="primary.main">
                  {sheet.finalClass?.className}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={sheet.finalClass?.studentName} 
                    size="small" 
                    variant="outlined" 
                    sx={{ fontWeight: 700, borderColor: alpha(theme.palette.divider, 0.2) }} 
                  />
                  <Chip 
                    label={`${getOptionLabel(sheet.finalClass?.grade)} Grade - ${getSubjectLabel(sheet.finalClass?.subject)}`} 
                    size="small" 
                    variant="outlined" 
                    sx={{ fontWeight: 700, borderColor: alpha(theme.palette.divider, 0.2) }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Period: {sheet.periodLabel}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Cycle Number: #{sheet.cycleNumber}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4, opacity: 0.5 }} />

            {/* Daily Records Table */}
            <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventAvailableIcon fontSize="small" color="primary" />
              Daily Attendance Records
            </Typography>
            <TableContainer 
              component={Paper} 
              variant="outlined" 
              sx={{ 
                borderRadius: '16px', 
                overflow: 'hidden',
                borderColor: alpha(theme.palette.divider, 0.1),
                mb: 4
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', py: 1.5 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', py: 1.5 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', py: 1.5 }}>Topic Covered</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', py: 1.5 }} align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sheet.records?.length > 0 ? (
                    sheet.records.map((record: any, index: number) => (
                      <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{format(new Date(record.sessionDate), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{record.durationHours} hrs</TableCell>
                        <TableCell sx={{ fontStyle: record.topicCovered ? 'normal' : 'italic', color: record.topicCovered ? 'inherit' : 'text.disabled' }}>
                          {record.topicCovered || 'Not specified'}
                        </TableCell>
                        <TableCell align="right">
                           <Chip 
                            label={record.status} 
                            size="small" 
                            color={record.status === 'APPROVED' ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.65rem', height: '20px', borderRadius: '4px' }}
                           />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No records found in this sheet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Payment Summary */}
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: '20px',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <PaymentsIcon 
                sx={{ 
                  position: 'absolute', 
                  right: -10, 
                  bottom: -10, 
                  fontSize: 100, 
                  opacity: 0.05, 
                  transform: 'rotate(-15deg)' 
                }} 
              />
              <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentsIcon fontSize="small" color="primary" />
                Authorized Payout Preview
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Sessions</Typography>
                  <Typography variant="h6" fontWeight={800}>{sheet.records?.length || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Payout Strategy</Typography>
                  <Typography variant="body2" fontWeight={800}>Pro-rata (Manual Approval)</Typography>
                </Grid>
              </Grid>
              <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.7, fontStyle: 'italic' }}>
                * Payout will be calculated as (Sessions Taken × Tutor Rate per Session) and authorized immediately upon approval.
              </Typography>
            </Box>
          </Box>
        </Fade>
      </DialogContent>
      
      <DialogActions sx={{ p: 4, pt: 2, gap: 1.5 }}>
        <Button 
          onClick={onClose} 
          variant="text" 
          sx={{ fontWeight: 700, borderRadius: '12px', px: 3, color: 'text.secondary' }}
        >
          Cancel
        </Button>
        {sheet.status === 'PENDING' && (
          <>
            <Button 
              onClick={handleReject} 
              color="error" 
              variant="outlined"
              sx={{ fontWeight: 800, borderRadius: '12px', px: 3, border: '2px solid' }}
            >
              Reject Sheet
            </Button>
            <Button 
              onClick={handleApprove} 
              color="primary" 
              variant="contained"
              sx={{ 
                fontWeight: 800, 
                borderRadius: '12px', 
                px: 4, 
                boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.3)',
                '&:hover': {
                  boxShadow: '0 12px 20px -5px rgba(79, 70, 229, 0.4)',
                }
              }}
            >
              Approve & Authorize
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceSheetReviewModal;

