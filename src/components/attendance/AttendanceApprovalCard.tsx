import React from 'react';
import { Card, CardContent, CardActions, Typography, Box, Button, Grid, Divider, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
    (userRole === 'COORDINATOR' && attendance.status === 'PENDING') ||
    (userRole === 'PARENT' && attendance.status === 'COORDINATOR_APPROVED');

  const fmt = (d?: Date) => (d ? new Date(d).toLocaleString() : '-');

  return (
    <Card elevation={2} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Typography variant="subtitle2">Session Date: {new Date(attendance.sessionDate).toLocaleDateString()}</Typography>
              {attendance.sessionNumber && (
                <Typography variant="subtitle2">Session #: {attendance.sessionNumber}</Typography>
              )}
              <Typography variant="subtitle2">
                Class: {attendance.finalClass.studentName} • {(attendance.finalClass.subject || []).join(', ')}
              </Typography>
              <Typography variant="subtitle2">Tutor: {attendance.tutor.name}</Typography>
              <Box><AttendanceStatusChip status={attendance.status} /></Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} textAlign={{ xs: 'left', md: 'right' }}>
            <Typography variant="body2">Submitted By: {attendance.submittedBy.name}</Typography>
            <Typography variant="caption" color="text.secondary">{fmt(attendance.submittedAt)}</Typography>
          </Grid>
        </Grid>

        <Box mt={1}>
          {attendance.coordinatorApprovedAt && (
            <Typography variant="body2">Coordinator Approved: {fmt(attendance.coordinatorApprovedAt)} by {attendance.coordinatorApprovedBy?.name}</Typography>
          )}
          {attendance.parentApprovedAt && (
            <Typography variant="body2">Parent Approved: {fmt(attendance.parentApprovedAt)} by {attendance.parentApprovedBy?.name}</Typography>
          )}
          {attendance.rejectedAt && (
            <Alert severity="error" sx={{ mt: 1 }}>
              Rejected: {attendance.rejectionReason || 'No reason provided'} • {fmt(attendance.rejectedAt)} by {attendance.rejectedBy?.name}
            </Alert>
          )}
          {attendance.notes && (
            <Typography variant="body2" sx={{ mt: 1 }}>Notes: {attendance.notes}</Typography>
          )}
        </Box>
        <Divider sx={{ mt: 2 }} />
      </CardContent>
      <CardActions>
        <Box display="flex" gap={1} px={2} pb={2}>
          {canApprove && (
            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => onApprove(attendance.id)} disabled={loading}>
              Approve
            </Button>
          )}
          {canApprove && (
            <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => onReject(attendance)} disabled={loading}>
              Reject
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );
}
