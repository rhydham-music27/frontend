import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Container, 
    Paper, 
    Grid, 
    Chip, 
    Button, 
    Divider, 
    Skeleton, 
    Alert,
    useTheme,
    alpha,
    Stack,
    IconButton
} from '@mui/material';
import { 
    CalendarMonth, 
    AccessTime, 
    LocationOn, 
    School, 
    Person, 
    Groups, 
    ChevronLeft,
    Share,
    CheckCircle,
    ThumbUp,
    WhatsApp,
    SupportAgent
} from '@mui/icons-material';
import { getPublicLeadById } from '../../services/leadService';
import { getAnnouncementByLeadId } from '../../services/announcementService';

import PublicNavbar from '../../components/layout/PublicNavbar';

const PublicLeadDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const [lead, setLead] = useState<any>(null);
    const [announcementId, setAnnouncementId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLead = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await getPublicLeadById(id);
                if (response && response.success) {
                    const leadData = (response.data as any)?.data || response.data;
                    setLead(leadData);

                    // Try to fetch associated announcement
                    try {
                        const annRes = await getAnnouncementByLeadId(leadData._id);
                        if (annRes.success && annRes.data) {
                            setAnnouncementId((annRes.data as any).id || (annRes.data as any)._id);
                        }
                    } catch (err) {
                        console.error("Failed to fetch announcement", err);
                    }
                } else {
                    setError('Failed to load lead details');
                }
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load lead details');
            } finally {
                setLoading(false);
            }
        };

        fetchLead();
    }, [id]);

    const handleExpressInterest = () => {
        if (announcementId) {
            localStorage.setItem('pendingInterestAnnouncementId', announcementId);
            navigate('/login');
        } else {
            window.location.href = '/login';
        }
    };

    const handleWhatsAppShare = () => {
        const url = window.location.href;
        const text = `Check out this teaching opportunity at Your Shikshak: ${lead?.subject ? (Array.isArray(lead.subject) ? lead.subject.map((s:any)=>s.label || s.name).join(', ') : lead.subject.label || lead.subject.name) : 'Teaching Lead'}\n\nView details here: ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f8faff' }}>
                <PublicNavbar />
                <Container maxWidth="lg" sx={{ py: 8 }}>
                    <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 8 }} />
                </Container>
            </Box>
        );
    }

    if (error || !lead) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f8faff' }}>
                <PublicNavbar />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 20 }}>
                    <Alert severity="error" sx={{ borderRadius: 4, px: 4 }}>{error || 'Lead not found'}</Alert>
                </Box>
            </Box>
        );
    }

    const subjects = Array.isArray(lead.subject) 
        ? lead.subject.map((s: any) => {
            if (typeof s === 'string') return s;
            return s?.name || s?.label || s?._id || 'N/A';
        }).join(', ') 
        : (typeof lead.subject === 'object' && lead.subject !== null 
            ? (lead.subject as any).name || (lead.subject as any).label || (lead.subject as any)._id || 'N/A' 
            : String(lead.subject || '-'));

    const sectionStyle = {
        p: 4,
        borderRadius: 6,
        bgcolor: alpha('#fff', 0.4),
        border: '1px solid rgba(255, 255, 255, 0.5)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            bgcolor: alpha('#fff', 0.7),
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px -12px rgba(0,0,0,0.05)'
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f8faff 0%, #eff6ff 100%)',
            pb: 12,
        }}>
            <PublicNavbar />
            <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 } }}>
                
                <Box sx={{ mb: 5, textAlign: 'center' }}>
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            fontFamily: "'Manrope', sans-serif", 
                            fontWeight: 800, 
                            color: '#0f172a',
                            letterSpacing: '-0.03em',
                            fontSize: { xs: '2rem', md: '2.75rem' }
                        }}
                    >
                        Your Shikshak Class Requirement
                    </Typography>
                    <Box sx={{ 
                        width: 80, 
                        height: 4, 
                        bgcolor: 'primary.main', 
                        borderRadius: 2, 
                        mx: 'auto', 
                        mt: 2,
                        boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`
                    }} />
                </Box>

                {/* Main Content Card */}
                <Paper elevation={0} sx={{ 
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.03)'
                }}>
                    <Grid container>
                        {/* Left Section: Hero & Academic */}
                        <Grid item xs={12} md={8} sx={{ p: { xs: 4, md: 8 }, borderRight: { md: '1px solid rgba(0,0,0,0.04)' } }}>
                            <Box sx={{ mb: 8 }}>
                                <Typography variant="overline" sx={{ letterSpacing: 4, color: 'primary.main', fontWeight: 900, fontSize: '0.75rem' }}>
                                    LEAD ID: #{lead.leadId || lead._id?.slice(-6).toUpperCase()}
                                </Typography>
                                <Typography variant="h1" sx={{ 
                                    fontFamily: "'Manrope', sans-serif",
                                    fontWeight: 800,
                                    fontSize: { xs: '2.5rem', md: '3.75rem' },
                                    color: '#0f172a',
                                    mt: 2,
                                    mb: 3,
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.02em'
                                }}>
                                    {subjects}
                                </Typography>

                                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 5 }}>
                                    <Chip 
                                        label={lead.grade?.name || lead.grade || 'Grade N/A'} 
                                        sx={{ fontWeight: 700, px: 1, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', borderRadius: 2 }} 
                                    />
                                    <Chip 
                                        label={lead.board?.name || lead.board || 'Board N/A'} 
                                        variant="outlined"
                                        sx={{ fontWeight: 700, px: 1, borderColor: alpha(theme.palette.primary.main, 0.2), color: 'primary.main', borderRadius: 2 }} 
                                    />
                                    <Chip 
                                        icon={<School style={{ fontSize: 16 }} />}
                                        label={lead.mode || 'Online'} 
                                        sx={{ fontWeight: 700, px: 1, bgcolor: '#0f172a', color: 'white', borderRadius: 2 }} 
                                    />
                                </Stack>

                                <Typography variant="body1" sx={{ 
                                    color: 'text.secondary', 
                                    fontSize: '1.2rem', 
                                    maxWidth: '640px', 
                                    lineHeight: 1.7,
                                    fontFamily: "'Inter', sans-serif" 
                                }}>
                                    Join our network of elite educators. This opportunity requires a dedicated professional to provide high-impact learning sessions in <strong>{subjects}</strong> for {lead.studentType?.toLowerCase() || 'a student'}.
                                </Typography>
                            </Box>

                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#0f172a', fontFamily: "'Manrope', sans-serif" }}>Requirement Details</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={sectionStyle}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: '#eff6ff', color: 'primary.main', display: 'flex' }}>
                                                <CalendarMonth fontSize="small" />
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>Class Schedule</Typography>
                                        </Stack>
                                        <Stack spacing={1.5}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Timing</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                    {lead.timing || 'To be decided'}
                                                    {lead.classDurationHours ? ` (${lead.classDurationHours} hrs/session)` : ''}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Frequency</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                    {lead.classesPerMonth ? `${lead.classesPerMonth} sessions / month` : 'Flexible frequency'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={sectionStyle}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: '#fef2f2', color: '#dc2626', display: 'flex' }}>
                                                <Person fontSize="small" />
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>Requirements</Typography>
                                        </Stack>
                                        <Stack spacing={1.5}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tutor Preference</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                    {lead.preferredTutorGender === 'MALE' ? 'Male Tutor' : lead.preferredTutorGender === 'FEMALE' ? 'Female Tutor' : 'Any Gender'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Student Arrangement</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                    {lead.studentType === 'GROUP' ? `Group Class (${lead.numberOfStudents} students)` : 'Individual One-on-One'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Right Section: Commercials & Action */}
                        <Grid item xs={12} md={4} sx={{ 
                            p: { xs: 4, md: 6 }, 
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ 
                                    mb: 6, 
                                    p: 5, 
                                    borderRadius: 8, 
                                    background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                                    color: 'white',
                                    boxShadow: '0 32px 64px -16px rgba(6, 95, 70, 0.35)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{ 
                                        position: 'absolute', 
                                        top: -20, 
                                        right: -20, 
                                        width: 100, 
                                        height: 100, 
                                        borderRadius: '50%', 
                                        background: 'rgba(255,255,255,0.05)' 
                                    }} />
                                    
                                    <Typography variant="subtitle2" sx={{ opacity: 0.8, letterSpacing: 2, mb: 2, fontWeight: 700, fontSize: '0.7rem' }}>EXPECTED MONTHLY FEES</Typography>
                                    <Stack direction="row" alignItems="baseline" spacing={1}>
                                        <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                                            ₹{lead.feesPerMonth || (lead.tutorFees ? lead.tutorFees : 'TBD')}
                                        </Typography>
                                        <Typography variant="h6" sx={{ opacity: 0.8 }}>/mo</Typography>
                                    </Stack>
                                    
                                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircle sx={{ fontSize: 18, color: '#34d399' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#d1fae5' }}>Verified Budget Information</Typography>
                                    </Box>
                                </Box>

                                <Stack spacing={4} sx={{ mb: 8, px: 2 }}>
                                    <Stack direction="row" spacing={2.5} alignItems="center">
                                        <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'white', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex' }}>
                                            <LocationOn fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.2 }}>LOCATION</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{lead.area || lead.city || lead.location || 'Remote / Online'}</Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={2.5} alignItems="center">
                                        <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'white', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex' }}>
                                            <AccessTime fontSize="small" color="inherit" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.2 }}>POSTED ON</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}</Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>

                            <Box sx={{ px: 1 }}>
                                <Stack spacing={2}>
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        size="large"
                                        startIcon={<ThumbUp />}
                                        disabled={!announcementId}
                                        onClick={handleExpressInterest}
                                        sx={{ 
                                            py: 2, 
                                            borderRadius: 4, 
                                            fontWeight: 800, 
                                            fontSize: '1.15rem',
                                            textTransform: 'none',
                                            background: announcementId ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#e2e8f0',
                                            boxShadow: announcementId ? '0 20px 40px -12px rgba(37, 99, 235, 0.45)' : 'none',
                                            '&:hover': {
                                                transform: announcementId ? 'translateY(-2px)' : 'none',
                                                boxShadow: announcementId ? '0 24px 48px -12px rgba(37, 99, 235, 0.55)' : 'none',
                                                background: announcementId ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#e2e8f0',
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {announcementId ? 'Express Interest' : 'Under Review'}
                                    </Button>

                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        size="large"
                                        startIcon={<WhatsApp />}
                                        onClick={handleWhatsAppShare}
                                        sx={{ 
                                            py: 1.8, 
                                            borderRadius: 4, 
                                            fontWeight: 800, 
                                            fontSize: '1.1rem',
                                            textTransform: 'none',
                                            color: '#16a34a',
                                            borderColor: '#16a34a',
                                            '&:hover': {
                                                bgcolor: alpha('#16a34a', 0.04),
                                                borderColor: '#15803d',
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Share on WhatsApp
                                    </Button>

                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        size="large"
                                        startIcon={<SupportAgent />}
                                        href="tel:+919110045450"
                                        sx={{ 
                                            py: 1.8, 
                                            borderRadius: 4, 
                                            fontWeight: 800, 
                                            fontSize: '1.1rem',
                                            textTransform: 'none',
                                            bgcolor: '#0f172a',
                                            '&:hover': {
                                                bgcolor: '#1e293b',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.3)'
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Contact Support
                                    </Button>
                                </Stack>

                                <Typography variant="caption" align="center" display="block" sx={{ 
                                    mt: 3, 
                                    color: announcementId ? 'text.secondary' : 'error.main', 
                                    fontWeight: 700, 
                                    letterSpacing: 0.2 
                                }}>
                                    {announcementId 
                                        ? 'YOUR APPLICATION WILL BE SHARED WITH THE STUDENT IMMEDIATELY.' 
                                        : 'THIS LEAD IS UNDER REVIEW AND NOT AVAILABLE FOR EXPRESSING INTEREST.'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Footer Branding */}
                <Box sx={{ mt: 10, textAlign: 'center', pb: 4 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="overline" sx={{ letterSpacing: 4, color: 'primary.main', fontWeight: 900, fontSize: '0.75rem' }}>
                            LEAD ID: #{lead.leadId || lead._id?.slice(-6).toUpperCase()}
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default PublicLeadDetails;
