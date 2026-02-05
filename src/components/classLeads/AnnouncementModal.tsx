import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';
import { IClassLead } from '../../types';
import { CLASS_LEAD_STATUS } from '../../constants';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import announcementService from '../../services/announcementService';

export default function AnnouncementModal({ open, onClose, classLead, onSuccess }: { open: boolean; onClose: () => void; classLead: IClassLead; onSuccess: () => void; }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRejected = (classLead as any)?.status === CLASS_LEAD_STATUS.REJECTED;

  const handlePost = async () => {
    try {
      setLoading(true);
      setError(null);
      const leadId = (classLead as any)?.id || (classLead as any)?._id;
      await announcementService.postAnnouncement(leadId);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isRejected ? 'Repost Lead' : 'Post Announcement'}</DialogTitle>
      <DialogContent>
        <Box>
          <Typography variant="body1" mb={2}>
            {isRejected
              ? 'Are you sure you want to repost this class lead to the class opportunities channel?'
              : 'Are you sure you want to post this class lead to the announcement channel?'}
          </Typography>
          <Alert severity="info">All active tutors will be notified about this opportunity.</Alert>
          <Box bgcolor={(theme) => theme.palette.background.paper} p={2} borderRadius={1} mt={2}>
            <Typography variant="subtitle2">
            Student{(classLead as any).studentType === 'GROUP' ? 's' : ''}: {(classLead as any).studentType === 'GROUP' 
              ? (classLead as any).studentDetails?.map((student: any, index: number) => (
                  <span key={index}>
                    {student.name}
                    {index < (classLead as any).studentDetails.length - 1 && ', '}
                  </span>
                )) || 'No students'
              : classLead.studentName || 'N/A'
            }
          </Typography>
            <Typography>Grade: {classLead.grade}</Typography>
            <Typography>Subjects: {Array.isArray(classLead.subject) ? (classLead.subject as any).join(', ') : classLead.subject}</Typography>
            <Typography>Mode: {classLead.mode}</Typography>
          </Box>
          <ErrorAlert error={error} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handlePost} disabled={loading || !((classLead as any)?.id || (classLead as any)?._id)}>
          {loading ? <LoadingSpinner /> : isRejected ? 'Repost Lead' : 'Post Announcement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
