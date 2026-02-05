
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

interface PublicLead {
  _id: string;
  leadId?: string;
  status: string;
  createdAt: string;

  studentType: 'SINGLE' | 'GROUP';
  studentName?: string;
  studentGender?: string;
  numberOfStudents?: number;
  studentDetails?: { name: string; gender: string }[];

  grade: string;
  subject: string[] | string;
  board: string;
  mode: string;
  
  city?: string;
  area?: string;
  location?: string;
  
  timing?: string;
  classesPerMonth?: number;
  classDurationHours?: number;
  
  preferredTutorGender?: string;
  notes?: string;
  
  tutorFees?: number;
  paymentAmount?: number;
}

const PublicLeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // ... (state and useEffect remain same) ...
  const [lead, setLead] = useState<PublicLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await axios.get(`/api/public/leads/${id}`);
        if (response.data && response.data.success) {
            setLead(response.data.data);
        } else {
            setError('Failed to load lead details.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lead not found or link expired.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLead();
  }, [id]);

  const handleShareWhatsApp = () => {
    if (!lead) return;
    const subjects = Array.isArray(lead.subject) ? lead.subject.join(', ') : lead.subject;
    const loc = lead.location || (lead.city ? `${lead.area}, ${lead.city}` : 'Online');
    const link = window.location.href;

    const text = `*New Tuition Opportunity!* 🎓
    
*Details:* ${subjects} for ${lead.grade} (${lead.board})
*Mode:* ${lead.mode}
${lead.studentType === 'GROUP' ? `*Group:* ${lead.numberOfStudents} Students` : ''}
*Location:* ${loc}
*Timing:* ${lead.timing || 'Flexible'}
${lead.tutorFees ? `*Payout:* ₹${lead.tutorFees}/month` : ''}

Check full details here: ${link}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // ... (loading/error states remain same) ...

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5"><CircularProgress /></Box>;
  if (error || !lead) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5"><Alert severity="error">{error || 'Lead not found'}</Alert></Box>;

  const subjects = Array.isArray(lead.subject) ? lead.subject.join(', ') : lead.subject;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
      <Container maxWidth="sm">
         <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box component="img" src="/1.jpg" alt="Logo" sx={{ height: 60, width: 60, borderRadius: '50%', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} color="primary">Your Shikshak</Typography>
            <Typography variant="subtitle1" color="text.secondary">Premier Tuition Services</Typography>
         </Box>

         <Card elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #0F62FE 0%, #0043CE 100%)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip label={lead.leadId || 'NEW'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
                    <Chip label={lead.status?.replace(/_/g, ' ')} size="small" sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }} />
                </Stack>
                <Typography variant="h4" fontWeight={800} gutterBottom>{subjects}</Typography>
                <Stack direction="row" spacing={1} justifyContent="center" mt={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    <Chip label={lead.grade} sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700 }} />
                    <Chip label={lead.board} variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} />
                    {lead.studentType === 'GROUP' && <Chip label="GROUP CLASS" color="warning" sx={{ fontWeight: 700 }} />}
                </Stack>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                    {/* Student Info */}
                    <Grid item xs={12}>
                        <Box bgcolor="grey.50" p={2} borderRadius={2} border="1px dashed" borderColor="grey.300">
                             <Typography variant="subtitle2" color="primary.main" gutterBottom fontWeight={600}>Student Details</Typography>
                             {lead.studentType === 'GROUP' ? (
                                <Stack spacing={1}>
                                    <ViewRow label="Type">Group of {lead.numberOfStudents} Students</ViewRow>
                                    {lead.studentDetails?.map((s, i) => (
                                        <Typography key={i} variant="body2" color="text.secondary">• {s.name} ({s.gender === 'M' ? 'Male' : 'Female'})</Typography>
                                    ))}
                                </Stack>
                             ) : (
                                <Stack spacing={1}>
                                    <ViewRow label="Name">{lead.studentName || 'Student'}</ViewRow>
                                    <ViewRow label="Gender">{lead.studentGender === 'M' ? 'Male' : 'Female'}</ViewRow>
                                </Stack>
                             )}
                        </Box>
                    </Grid>

                    {/* Mode & Location */}
                    <Grid item xs={6}>
                        <Stack spacing={1} alignItems="center" bgcolor="grey.50" p={2} borderRadius={2} height="100%">
                            <SchoolIcon color="action" />
                            <Typography variant="caption" color="text.secondary">Mode</Typography>
                            <Typography fontWeight={600}>{lead.mode}</Typography>
                        </Stack>
                    </Grid>
                    <Grid item xs={6}>
                         <Stack spacing={1} alignItems="center" bgcolor="grey.50" p={2} borderRadius={2} height="100%">
                            <LocationOnIcon color="action" />
                            <Typography variant="caption" color="text.secondary">Location</Typography>
                            <Typography fontWeight={600} align="center" variant="body2">
                                {lead.location ? lead.location : (lead.city ? `${lead.area}, ${lead.city}` : 'Remote/Online')}
                            </Typography>
                        </Stack>
                    </Grid>

                    {/* Timing & Duration */}
                    <Grid item xs={12}>
                        <Box p={2} border="1px solid" borderColor="divider" borderRadius={2}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Schedule</Typography>
                            <Stack spacing={1.5}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <AccessTimeIcon fontSize="small" color="primary" />
                                    <Typography variant="body2" fontWeight={500}>{lead.timing || 'Flexible Timing'}</Typography>
                                </Box>
                                {(lead.classesPerMonth || lead.classDurationHours) && (
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 3.5 }}>
                                        {lead.classesPerMonth ? `${lead.classesPerMonth} Classes/Month` : ''}
                                        {lead.classesPerMonth && lead.classDurationHours ? ' • ' : ''}
                                        {lead.classDurationHours ? `${lead.classDurationHours} hrs/class` : ''}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    </Grid>
                    
                    {/* Tutor Preference */}
                    {lead.preferredTutorGender && (
                         <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={2} p={2} border="1px solid" borderColor="divider" borderRadius={2}>
                                <PersonIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tutor Preference</Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {lead.preferredTutorGender === 'MALE' ? 'Male Tutor' : lead.preferredTutorGender === 'FEMALE' ? 'Female Tutor' : 'Any Gender'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    )}

                    {/* Fees Section */}
                    {lead.tutorFees && (
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="#E8F5E9" borderRadius={2} border="1px solid #C8E6C9">
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CurrencyRupeeIcon color="success" />
                                    <Typography variant="subtitle2" color="success.dark" fontWeight={600}>Fees</Typography>
                                </Box>
                                <Typography variant="h6" color="success.dark" fontWeight={700}>₹{lead.tutorFees.toLocaleString()}/mo</Typography>
                            </Box>
                        </Grid>
                    )}
                    
                    {lead.notes && (
                        <Grid item xs={12}>
                             <Typography variant="caption" color="text.secondary" gutterBottom>Additional Notes</Typography>
                             <Typography variant="body2" bgcolor="amber.50" p={2} borderRadius={2} color="text.primary" sx={{ border: '1px dashed #ffc107' }}>
                                {lead.notes}
                             </Typography>
                        </Grid>
                    )}
                </Grid>

                <Box mt={4}>
                    <Button variant="contained" color="success" size="large" fullWidth startIcon={<WhatsAppIcon />} onClick={handleShareWhatsApp} sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}>
                        Share via WhatsApp
                    </Button>
                </Box>
            </CardContent>
         </Card>
      </Container>
    </Box>
  );
};

const ViewRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">{label}:</Typography>
        <Typography variant="body2" fontWeight={600}>{children}</Typography>
    </Box>
);

export default PublicLeadDetails;
