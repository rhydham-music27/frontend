import { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Button, Grid, Divider, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { useNavigate, useParams } from 'react-router-dom';
import leadService from '../../services/leadService';
import demoService from '../../services/demoService';
import announcementService from '../../services/announcementService';
import { IAnnouncement, IClassLead, IDemoHistory, ITutorComparison } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import ClassLeadStatusChip from '../../components/classLeads/ClassLeadStatusChip';
import StatusTimeline from '../../components/classLeads/StatusTimeline';
import AnnouncementModal from '../../components/classLeads/AnnouncementModal';
import InterestedTutorsModal from '../../components/classLeads/InterestedTutorsModal';
import DemoAssignmentModal from '../../components/classLeads/DemoAssignmentModal';
import { CLASS_LEAD_STATUS } from '../../constants';

export default function ClassLeadDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [classLead, setClassLead] = useState<IClassLead | null>(null);
  const [demoHistory, setDemoHistory] = useState<IDemoHistory[]>([]);
  const [announcement, setAnnouncement] = useState<IAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAnnouncement, setOpenAnnouncement] = useState(false);
  const [openInterested, setOpenInterested] = useState(false);
  const [openDemoAssign, setOpenDemoAssign] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<ITutorComparison | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const refetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const leadRes = await leadService.getClassLeadById(id as string);
      setClassLead(leadRes.data);
      const demoRes = await demoService.getDemoHistory(id as string);
      setDemoHistory(demoRes.data);
      try {
        const annRes = await announcementService.getAnnouncementByLeadId(id as string);
        setAnnouncement(annRes.data);
      } catch {
        setAnnouncement(null);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id && id !== 'undefined') refetchAll(); }, [id]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => navigate(`/class-leads/${id}/edit`);
  const handleDelete = async () => {
    const ok = window.confirm('Delete this lead?');
    if (!ok) return;
    await leadService.deleteClassLead(id as string);
    navigate('/class-leads');
  };

  const handlePostAnnouncement = () => { setOpenAnnouncement(true); handleMenuClose(); };
  const handleViewInterestedTutors = () => { setOpenInterested(true); handleMenuClose(); };
  const handleSelectTutor = (t: ITutorComparison) => { setSelectedTutor(t); setOpenInterested(false); setOpenDemoAssign(true); };
  const handleDemoAssignSuccess = async () => { await refetchAll(); setSnack({ open: true, message: 'Demo assigned successfully', severity: 'success' }); };

  if (loading) return <LoadingSpinner fullScreen /> as any;
  if (error) return <Container maxWidth="lg" sx={{ py: 3 }}><ErrorAlert error={error} /></Container>;
  if (!classLead) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate('/class-leads')}>Back</Button>
          <Typography variant="h4">Class Lead Details</Typography>
        </Box>
        <Box>
          <IconButton onClick={handleMenuOpen}><MoreVertIcon /></IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleEdit}><EditIcon fontSize="small" />&nbsp;Edit</MenuItem>
            <MenuItem onClick={handleDelete}><DeleteIcon fontSize="small" />&nbsp;Delete</MenuItem>
            {classLead.status === CLASS_LEAD_STATUS.NEW && !announcement && (
              <MenuItem onClick={handlePostAnnouncement}><AnnouncementIcon fontSize="small" />&nbsp;Post Announcement</MenuItem>
            )}
            {(classLead.status === CLASS_LEAD_STATUS.ANNOUNCED || announcement) && (
              <MenuItem onClick={handleViewInterestedTutors}>View Interested Tutors</MenuItem>
            )}
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Student Information</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}><Typography><strong>Name:</strong> {classLead.studentName}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Grade:</strong> {classLead.grade}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Mode:</strong> {classLead.mode}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Board:</strong> {classLead.board}</Typography></Grid>
                {classLead.location && <Grid item xs={12} sm={6}><Typography><strong>Location:</strong> {classLead.location}</Typography></Grid>}
                <Grid item xs={12} sm={6}><Typography><strong>Timing:</strong> {classLead.timing}</Typography></Grid>
                <Grid item xs={12}>
                  <Typography><strong>Subjects:</strong></Typography>
                  <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(() => {
                      const r: any = classLead as any;
                      let subj: any = r.subject ?? r.subjects ?? r.subjectList ?? r.subject_names ?? r.subjectName ?? r.subject_name;
                      if (subj == null) return null;
                      let list: string[] = [];
                      if (Array.isArray(subj)) list = subj.map((s: any) => String(s));
                      else {
                        const s = String(subj).trim();
                        list = s ? (s.includes(',') ? s.split(',').map((x) => x.trim()).filter(Boolean) : [s]) : [];
                      }
                      return list.map((s) => (<Chip key={s} label={s} size="small" />));
                    })()}
                  </Box>
                </Grid>
                {(classLead as any).notes && <Grid item xs={12}><Typography><strong>Notes:</strong> {(classLead as any).notes}</Typography></Grid>}
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h6">Status & Timeline</Typography>
                <ClassLeadStatusChip status={classLead.status} />
              </Box>
              <StatusTimeline classLead={classLead} demoHistory={demoHistory} announcement={announcement} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Actions</Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button variant="outlined" onClick={handleEdit} startIcon={<EditIcon />}>Edit Lead</Button>
                {classLead.status === CLASS_LEAD_STATUS.NEW && !announcement && (
                  <Button variant="contained" onClick={() => setOpenAnnouncement(true)} startIcon={<AnnouncementIcon />}>Post Announcement</Button>
                )}
                <Button variant="outlined" disabled={!announcement} onClick={() => setOpenInterested(true)}>View Interested Tutors</Button>
                <Button variant="outlined" color="error" onClick={handleDelete} startIcon={<DeleteIcon />}>Delete Lead</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AnnouncementModal open={openAnnouncement} onClose={() => setOpenAnnouncement(false)} classLead={classLead} onSuccess={refetchAll} />
      <InterestedTutorsModal open={openInterested} onClose={() => setOpenInterested(false)} announcementId={announcement?.id || ''} onSelectTutor={handleSelectTutor} />
      {selectedTutor && (
        <DemoAssignmentModal open={openDemoAssign} onClose={() => setOpenDemoAssign(false)} classLead={classLead} selectedTutor={selectedTutor} onSuccess={handleDemoAssignSuccess} />
      )}

      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
