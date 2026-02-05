import { Card, CardContent, Typography, Box, Button, Grid, Divider, Alert, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttendanceStatusChip from './AttendanceStatusChip';
import { IAttendance } from '../../types';

interface Props {
  attendance: IAttendance;
  userRole: 'COORDINATOR' | 'PARENT';
  onApprove: (attendanceId: string) => void;
  onReject: (attendance: IAttendance) => void;
  loading?: boolean;
}

export default function AttendanceApprovalCard({ attendance, userRole, onApprove, onReject, loading = false }: Props) {
  const canApprove =
    userRole === 'COORDINATOR' && attendance.status === 'PENDING';

  const fmt = (d?: Date) => (d ? new Date(d).toLocaleString() : '-');

  return (
    <Card 
      elevation={0} 
      sx={{ 
        mb: 2, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': { 
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        } 
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
           <Box>
              <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                   {attendance.finalClass.studentName}
                </Typography>
                <AttendanceStatusChip status={attendance.status} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                 <SchoolIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                 {(attendance.finalClass.subject || []).join(', ')} • {attendance.finalClass.grade}
              </Typography>
           </Box>
           <Box textAlign="right">
              <Chip 
                icon={<CalendarTodayIcon sx={{ fontSize: '0.8rem !important' }} />} 
                label={new Date(attendance.sessionDate).toLocaleDateString()} 
                size="small" 
                sx={{ bgcolor: 'action.hover', fontWeight: 600 }} 
              />
           </Box>
        </Box>

        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

        <Grid container spacing={3}>
           <Grid item xs={12} md={7}>
              <Box mb={2}>
                 <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
                    SESSION DETAILS
                 </Typography>
                 <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                       <PersonIcon fontSize="small" color="action" />
                       <Typography variant="body2">
                          <Box component="span" color="text.secondary">Tutor: </Box>
                          {attendance.tutor.name}
                       </Typography>
                    </Box>
                    {attendance.topicCovered && (
                        <Box display="flex" alignItems="flex-start" gap={1.5}>
                           <CheckCircleIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                           <Typography variant="body2">
                              <Box component="span" color="text.secondary">Topic: </Box>
                              {attendance.topicCovered}
                           </Typography>
                        </Box>
                    )}
                 </Box>
              </Box>
           </Grid>
           
           <Grid item xs={12} md={5}>
              <Box mb={2} sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 2 }}>
                 <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom display="block">
                    SUBMISSION INFO
                 </Typography>
                 <Box display="flex" flexDirection="column" gap={0.5}>
                    <Typography variant="body2" fontSize="0.8125rem">
                       Submitted by <strong>{attendance.submittedBy.name}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                       <AccessTimeIcon fontSize="inherit" />
                       {fmt(attendance.submittedAt)}
                    </Typography>
                 </Box>
              </Box>
           </Grid>
        </Grid>

        {/* Approval Chains */}
        {(attendance.coordinatorApprovedAt || attendance.parentApprovedAt || attendance.rejectedAt || attendance.notes) && (
            <Box mt={1} p={1.5} bgcolor="action.hover" borderRadius={2}>
                {attendance.coordinatorApprovedAt && (
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                        <Typography variant="caption" color="text.secondary">
                             Coordinator approved on {new Date(attendance.coordinatorApprovedAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                )}
                 {attendance.parentApprovedAt && (
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                        <Typography variant="caption" color="text.secondary">
                             Parent approved on {new Date(attendance.parentApprovedAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                )}
                {attendance.rejectedAt && (
                    <Alert severity="error" icon={<CancelIcon fontSize="inherit" />} sx={{ py: 0, px: 1, '& .MuiAlert-message': { py: 0.5, fontSize: '0.8125rem' } }}>
                        Rejected: {attendance.rejectionReason}
                    </Alert>
                )}
                 {attendance.notes && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        <Box component="span" fontWeight={600}>Notes:</Box> {attendance.notes}
                    </Typography>
                )}
            </Box>
        )}

        {/* Approval buttons removed - daily approval no longer needed */}
        {false && canApprove ? (
           <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
              <Button 
                variant="outlined" 
                color="error" 
                size="small" 
                startIcon={<CancelIcon />} 
                onClick={() => onReject(attendance)} 
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: 'error.main' }}
              >
                Reject
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                size="small" // Intentionally using default 'success' color here or could use primary if preferred
                startIcon={<CheckCircleIcon />} 
                onClick={() => onApprove(attendance.id)} 
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: 'none', color: 'white' }}
              >
                Approve
              </Button>
           </Box>
        ) : null}

      </CardContent>
    </Card>
  );
}
