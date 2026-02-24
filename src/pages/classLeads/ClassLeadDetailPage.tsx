import { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Button, Grid, Divider, Chip, IconButton, Menu, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ShareIcon from '@mui/icons-material/Share';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import { CLASS_LEAD_STATUS, DEMO_STATUS, USER_ROLES } from '../../constants';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useErrorDialog } from '../../hooks/useErrorDialog';
import ErrorDialog from '../../components/common/ErrorDialog';

export default function ClassLeadDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector(selectCurrentUser);
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
  const [managers, setManagers] = useState<{ id: string, name: string }[]>([]);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);
  const [coordinators, setCoordinators] = useState<{ id: string, name: string }[]>([]);
  const [approveWithCoordinatorOpen, setApproveWithCoordinatorOpen] = useState(false);
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<string>('');
  const [approvingDemo, setApprovingDemo] = useState(false);
  const { error: dialogError, showError, clearError, handleError } = useErrorDialog();

  const fetchFilters = async () => {
    try {
      const res = await leadService.getLeadFilterOptions();
      setManagers(res.data.managers || []);
      setCoordinators(res.data.coordinators || []);
    } catch (err) {
      console.error('Failed to fetch filters', err);
    }
  };

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

  useEffect(() => {
    if (id && id !== 'undefined') {
      refetchAll();
      fetchFilters();
    }
  }, [id]);

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

  const handleReassignOpen = () => {
    if (!classLead) return;
    const creatorId = (classLead as any).createdBy?._id || (classLead as any).createdBy?.id || classLead.createdBy;
    setSelectedManagerId(typeof creatorId === 'string' ? creatorId : '');
    setReassignModalOpen(true);
    handleMenuClose();
  };

  const handleReassignClose = () => {
    setReassignModalOpen(false);
    setSelectedManagerId('');
  };

  const handleReassignSubmit = async () => {
    if (!id || !selectedManagerId) return;
    setReassigning(true);
    try {
      await leadService.reassignLead(id, selectedManagerId);
      await refetchAll();
      handleReassignClose();
      setSnack({ open: true, message: 'Lead reassigned successfully', severity: 'success' });
    } catch (err) {
      console.error('Failed to reassign lead', err);
      setSnack({ open: true, message: 'Failed to reassign lead', severity: 'error' });
    } finally {
      setReassigning(false);
    }
  };

  const handleApproveDemo = async () => {
    setApproveWithCoordinatorOpen(true);
  };

  const handleApproveDemoWithCoordinator = async () => {
    if (!id) return;
    if (!selectedCoordinatorId) {
      setSnack({ open: true, message: 'Coordinator is required to convert to final class', severity: 'error' });
      return;
    }
    setApprovingDemo(true);
    try {
      await demoService.updateDemoStatus(id as string, DEMO_STATUS.APPROVED, undefined, undefined, selectedCoordinatorId);
      await refetchAll();
      setApproveWithCoordinatorOpen(false);
      setSelectedCoordinatorId('');
      setSnack({ open: true, message: 'Demo approved and lead converted successfully', severity: 'success' });
    } catch (e: any) {
      handleError(e);
    } finally {
      setApprovingDemo(false);
    }
  };

  const handleApproveDemoCancel = () => {
    setApproveWithCoordinatorOpen(false);
    setSelectedCoordinatorId('');
  };

  const handleRejectDemo = async () => {
    if (!id) return;
    const reason = window.prompt('Enter rejection reason (optional):') || undefined;
    try {
      await demoService.updateDemoStatus(id as string, DEMO_STATUS.REJECTED, undefined, reason);
      await refetchAll();
      setSnack({ open: true, message: 'Demo rejected', severity: 'success' });
    } catch (e: any) {
      handleError(e);
    }
  };

  const handleMarkPaymentReceived = async () => {
    if (!id) return;
    try {
      await leadService.updateClassLeadStatus(id, CLASS_LEAD_STATUS.PAYMENT_RECEIVED);
      await refetchAll();
      setSnack({ open: true, message: 'Payment marked as received', severity: 'success' });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to update payment status';
      setSnack({ open: true, message: msg, severity: 'error' });
    }
  };

  if (loading) return <LoadingSpinner fullScreen /> as any;
  if (error) return <Container maxWidth="lg" sx={{ py: 3 }}><ErrorAlert error={error} /></Container>;
  if (!classLead) return null;

  const isManagerOrAdmin = user?.role === USER_ROLES.MANAGER || user?.role === USER_ROLES.ADMIN;
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const demoStatus = (classLead as any)?.demoDetails?.demoStatus as string | undefined;
  const canApproveOrRejectDemo = isManagerOrAdmin && demoStatus === DEMO_STATUS.COMPLETED;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Reassign Modal */}
      <Menu
        anchorEl={null}
        open={reassignModalOpen}
        onClose={handleReassignClose}
        PaperProps={{
          sx: { p: 2, minWidth: 300, borderRadius: 3 }
        }}
        anchorReference="anchorPosition"
        anchorPosition={{ top: window.innerHeight / 2, left: window.innerWidth / 2 }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Reassign Manager</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Select a new manager for <strong>{classLead?.studentName}</strong>:
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Target Manager</InputLabel>
          <Select
            value={selectedManagerId}
            label="Target Manager"
            onChange={(e) => setSelectedManagerId(e.target.value)}
          >
            {managers.map((mgr) => (
              <MenuItem key={mgr.id} value={mgr.id}>{mgr.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box display="flex" gap={1} justifyContent="flex-end">
          <Button onClick={handleReassignClose} size="small">Cancel</Button>
          <Button
            variant="contained"
            size="small"
            disabled={reassigning || !selectedManagerId || selectedManagerId === ((classLead as any)?.createdBy?._id || (classLead as any)?.createdBy?.id || classLead?.createdBy)}
            onClick={handleReassignSubmit}
          >
            {reassigning ? 'Reassigning...' : 'Confirm'}
          </Button>
        </Box>
      </Menu>

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
            {classLead.status === CLASS_LEAD_STATUS.REJECTED && (
              <MenuItem onClick={handlePostAnnouncement}><AnnouncementIcon fontSize="small" />&nbsp;Repost Lead</MenuItem>
            )}
            {(classLead.status === CLASS_LEAD_STATUS.ANNOUNCED || announcement) && (
              <MenuItem onClick={handleViewInterestedTutors}>View Interested Tutors</MenuItem>
            )}
            {isAdmin && (
              <>
                <Divider />
                <MenuItem onClick={handleReassignOpen}>
                  Reassign Manager
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Student Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Student Name{(classLead as any).studentType === 'GROUP' ? 's' : ''}:</strong>{' '}
                    {(classLead as any).studentType === 'GROUP'
                      ? (classLead as any).studentDetails?.map((student: any, index: number) => (
                        <span key={index}>
                          {student.name}
                          {index < (classLead as any).studentDetails.length - 1 && ', '}
                        </span>
                      )) || 'No students'
                      : classLead.studentName || 'N/A'
                    }
                  </Typography>
                </Grid>
                {(classLead as any).parentEmail && (
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Parent Email:</strong> {(classLead as any).parentEmail}</Typography>
                  </Grid>
                )}
                {(classLead as any).parentPhone && (
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Parent Phone:</strong> {(classLead as any).parentPhone}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}><Typography><strong>Grade:</strong> {classLead.grade}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Board:</strong> {classLead.board}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><strong>Mode:</strong> {classLead.mode}</Typography></Grid>

                {/* Location details */}
                {classLead.mode === 'HYBRID' && classLead.location && (
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Location:</strong> {classLead.location}</Typography>
                  </Grid>
                )}
                {classLead.mode === 'OFFLINE' && (
                  <>
                    {(classLead as any).city && (
                      <Grid item xs={12} sm={6}>
                        <Typography><strong>City:</strong> {(classLead as any).city}</Typography>
                      </Grid>
                    )}
                    {(classLead as any).area && (
                      <Grid item xs={12} sm={6}>
                        <Typography><strong>Area:</strong> {(classLead as any).area}</Typography>
                      </Grid>
                    )}
                    {(classLead as any).address && (
                      <Grid item xs={12}>
                        <Typography><strong>Address:</strong> {(classLead as any).address}</Typography>
                      </Grid>
                    )}
                  </>
                )}

                <Grid item xs={12} sm={6}><Typography><strong>Timing:</strong> {classLead.timing}</Typography></Grid>

                {/* Class metadata */}
                {(classLead as any).classesPerMonth != null && (
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Classes per Month:</strong> {(classLead as any).classesPerMonth}</Typography>
                  </Grid>
                )}
                {(classLead as any).classDurationHours != null && (
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Class Duration (hours):</strong> {(classLead as any).classDurationHours}</Typography>
                  </Grid>
                )}
                {(classLead as any).preferredTutorGender && (
                  <Grid item xs={12} sm={6}>
                    <Typography>
                      <strong>Preferred Tutor:</strong>{' '}
                      {((classLead as any).preferredTutorGender === 'MALE' && 'Male') ||
                        ((classLead as any).preferredTutorGender === 'FEMALE' && 'Female') ||
                        ((classLead as any).preferredTutorGender === 'NO_PREFERENCE' && 'No preference') ||
                        (classLead as any).preferredTutorGender}
                    </Typography>
                  </Grid>
                )}
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

                {/* Group student details */}
                {(classLead as any).studentType === 'GROUP' && (() => {
                  const details = (classLead as any).studentDetails?.length > 0
                    ? (classLead as any).studentDetails
                    : (classLead as any).groupClass?.students;

                  if (!details || details.length === 0) return null;

                  return (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}><strong>Student Details</strong></Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {details.map((student: any, index: number) => (
                          <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Student {index + 1}: {student.name}
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2">
                                  <strong>Fees:</strong> ₹{student.fees || 0}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2">
                                  <strong>Tutor Fees:</strong> ₹{student.tutorFees || 0}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2">
                                  <strong>Service Charge:</strong> ₹{(student.fees || 0) - (student.tutorFees || 0)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                        <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom><strong>Total Summary</strong></Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2">
                                <strong>Total Fees:</strong> ₹{details.reduce((sum: number, s: any) => sum + (s.fees || 0), 0) || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2">
                                <strong>Total Tutor Fees:</strong> ₹{details.reduce((sum: number, s: any) => sum + (s.tutorFees || 0), 0) || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2">
                                <strong>Total Service Charge:</strong> ₹{
                                  (details.reduce((sum: number, s: any) => sum + (s.fees || 0), 0) || 0) -
                                  (details.reduce((sum: number, s: any) => sum + (s.tutorFees || 0), 0) || 0)
                                }
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })()}

                {/* Single student fees */}
                {(classLead as any).studentType === 'SINGLE' && (classLead as any).paymentAmount != null && (
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Fees:</strong> ₹{(classLead as any).paymentAmount}</Typography>
                  </Grid>
                )}
                {(classLead as any).studentType === 'SINGLE' && (classLead as any).tutorFees != null && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography><strong>Tutor Fees:</strong> ₹{(classLead as any).tutorFees}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Service Charge:</strong> ₹{((classLead as any).paymentAmount || 0) - ((classLead as any).tutorFees || 0)}
                      </Typography>
                    </Grid>
                  </>
                )}
                {(classLead as any).notes && <Grid item xs={12}><Typography><strong>Notes:</strong> {(classLead as any).notes}</Typography></Grid>}
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h6">Status & Timeline</Typography>
                <ClassLeadStatusChip status={classLead.status} />
                {!!(classLead as any).paymentReceived && (
                  <Chip icon={<CheckCircleIcon />} label="Payment Received" color="success" size="small" />
                )}
              </Box>
              <StatusTimeline classLead={classLead} demoHistory={demoHistory} announcement={announcement} />
            </CardContent>
          </Card>

          {/* Demo Details Card */}
          {classLead.demoDetails && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Demo Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Status:</strong> <Chip size="small" label={classLead.demoDetails.demoStatus} color="primary" variant="outlined" /></Typography>
                  </Grid>
                  {classLead.demoDetails.demoDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography><strong>Date:</strong> {new Date(classLead.demoDetails.demoDate).toLocaleDateString()}</Typography>
                    </Grid>
                  )}
                  {classLead.demoDetails.demoTime && (
                    <Grid item xs={12} sm={6}>
                      <Typography><strong>Time:</strong> {classLead.demoDetails.demoTime}</Typography>
                    </Grid>
                  )}
                  {(classLead.demoDetails as any).duration && (
                    <Grid item xs={12} sm={6}>
                      <Typography><strong>Duration:</strong> {(classLead.demoDetails as any).duration}</Typography>
                    </Grid>
                  )}
                  {(classLead.demoDetails as any).attendanceStatus && (
                    <Grid item xs={12} sm={6}>
                      <Typography>
                        <strong>Attendance:</strong>{' '}
                        <Chip
                          size="small"
                          label={(classLead.demoDetails as any).attendanceStatus}
                          color={(classLead.demoDetails as any).attendanceStatus === 'PRESENT' ? 'success' : 'error'}
                        />
                      </Typography>
                    </Grid>
                  )}
                  {(classLead.demoDetails as any).topicCovered && (
                    <Grid item xs={12}>
                      <Typography><strong>Topic Covered:</strong> {(classLead.demoDetails as any).topicCovered}</Typography>
                    </Grid>
                  )}
                  {classLead.demoDetails.feedback && (
                    <Grid item xs={12}>
                      <Typography><strong>Feedback:</strong> {classLead.demoDetails.feedback}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
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
                {classLead.status === CLASS_LEAD_STATUS.REJECTED && (
                  <Button variant="contained" onClick={() => setOpenAnnouncement(true)} startIcon={<AnnouncementIcon />}>Repost Lead</Button>
                )}
                <Button variant="outlined" disabled={!announcement} onClick={() => setOpenInterested(true)}>View Interested Tutors</Button>
                {canApproveOrRejectDemo && (
                  <>
                    <Button variant="contained" color="primary" onClick={handleApproveDemo}>Approve & Convert</Button>
                    <Button variant="outlined" color="error" onClick={handleRejectDemo}>Reject Demo</Button>
                  </>
                )}
                {(classLead.status === CLASS_LEAD_STATUS.CONVERTED || (classLead as any).status === 'WON') && !(classLead as any).paymentReceived && (
                  <Button variant="contained" color="success" onClick={handleMarkPaymentReceived} startIcon={<CheckCircleIcon />}>Payment Received</Button>
                )}
                {isAdmin && (
                  <Button variant="outlined" color="secondary" onClick={handleReassignOpen}>Reassign Manager</Button>
                )}
                <Button variant="outlined" color="error" onClick={handleDelete} startIcon={<DeleteIcon />}>Delete Lead</Button>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Public Share</Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  onClick={() => {
                    const url = `${window.location.origin}/leads/public/${id}`;
                    const text = `Check out this new tuition opportunity: ${url}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                >
                  Share on WhatsApp
                </Button>
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

      {/* Approve Demo with Coordinator Selection Modal */}
      <Menu
        anchorEl={null}
        open={approveWithCoordinatorOpen}
        onClose={handleApproveDemoCancel}
        PaperProps={{
          sx: { p: 2, minWidth: 350, borderRadius: 3 }
        }}
        anchorReference="anchorPosition"
        anchorPosition={{ top: window.innerHeight / 2, left: window.innerWidth / 2 }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Approve Demo & Convert to Final Class</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Select a coordinator to manage this class:
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Assign Coordinator</InputLabel>
          <Select
            value={selectedCoordinatorId}
            label="Assign Coordinator"
            onChange={(e) => setSelectedCoordinatorId(e.target.value)}
          >
            {coordinators.map((coord) => (
              <MenuItem key={coord.id} value={coord.id}>
                {coord.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleApproveDemoCancel}
            disabled={approvingDemo}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApproveDemoWithCoordinator}
            disabled={approvingDemo || !selectedCoordinatorId}
          >
            {approvingDemo ? 'Processing...' : 'Approve & Convert'}
          </Button>
        </Box>
      </Menu>

      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />

      <ErrorDialog
        open={showError}
        onClose={clearError}
        error={dialogError}
        title="Demo Update Error"
      />
    </Container>
  );
}
