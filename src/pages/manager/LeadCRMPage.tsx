import React, { useEffect, useState, useRef } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Chip, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  useTheme,
  alpha,
  Divider,
  Button,
  Breadcrumbs,
  Link,
  Avatar,
  TextField,
  useMediaQuery,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LeadIcon from '@mui/icons-material/ContactMail';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import InfoIcon from '@mui/icons-material/Info';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCRMLeads, updateClassLeadStatus, getLeadFilterOptions, reassignLead } from '../../services/leadService';
import { IClassLead, IUser } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { USER_ROLES } from '../../constants';

const COLUMN_CONFIG = [
  { key: 'new', label: 'New', color: '#3B82F6', description: 'Newly created leads' },
  { key: 'announced', label: 'Announced', color: '#F59E0B', description: 'Announced to tutors (0 interest)' },
  { key: 'interested', label: 'Interested', color: '#8B5CF6', description: 'Tutors showing interest' },
  { key: 'demoScheduled', label: 'Demo Scheduled', color: '#10B981', description: 'Demos are scheduled' },
  { key: 'demoCompleted', label: 'Demo Completed', color: '#EC4899', description: 'Demos done, approval pending' },
  { key: 'won', label: 'Won', color: '#059669', description: 'Leads converted to classes' },
];

const getPriority = (date: string | Date) => {
  const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
  if (days > 7) return { label: 'High Priority', color: '#EF4444', icon: <PriorityHighIcon /> };
  if (days > 3) return { label: 'Medium Priority', color: '#F59E0B', icon: <InfoIcon /> };
  return { label: 'Normal', color: '#6B7280', icon: null };
};

const getDaysInStage = (date: string | Date) => {
  const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
  return days === 0 ? 'Today' : `${days} days ago`;
};

const LeadCard: React.FC<{ lead: IClassLead; managers: { id: string, name: string }[]; onRefresh: () => void; onReassign: (lead: IClassLead) => void }> = ({ lead, managers, onRefresh, onReassign }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoveTo = async (status: string) => {
    try {
      await updateClassLeadStatus(lead.id, status);
      onRefresh();
    } catch (err) {
      console.error('Failed to update status', err);
    }
    handleMenuClose();
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 1.5, 
        borderRadius: 2.5, 
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
          borderColor: theme.palette.primary.main,
          transform: 'translateY(-4px)',
          '& .MuiTypography-subtitle2': {
            color: 'primary.dark'
          }
        }
      }}
      onClick={() => navigate(`/class-leads/${lead.id}`)}
    >
      <CardContent sx={{ p: '14px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                fontSize: '0.8rem', 
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                border: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2)
              }}
            >
              {(lead.studentName || 'Student').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </Avatar>
            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={700} 
                color="primary.main" 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  fontSize: '0.85rem',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }} 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/class-leads/${lead.id}`);
                }}
              >
                {lead.studentName}
              </Typography>
               <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
                  {getDaysInStage(lead.createdAt)}
                </Typography>
                {isAdmin && (lead as any).createdBy?.name && (
                  <Chip 
                    label={`Mgr: ${(lead as any).createdBy.name}`}
                    size="small"
                    sx={{ 
                      height: 16, 
                      fontSize: '0.6rem', 
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: 'secondary.main',
                      border: 'none',
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                )}
               </Box>
            </Box>
          </Box>
          <IconButton 
            size="small" 
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              handleMenuClick(event);
            }} 
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => navigate(`/class-leads/${lead.id}`)}>View Details</MenuItem>
            <Divider />
            <MenuItem onClick={() => handleMoveTo('ANNOUNCED')}>Move to Announced</MenuItem>
            <MenuItem onClick={() => handleMoveTo('DEMO_SCHEDULED')}>Move to Scheduled</MenuItem>
            <MenuItem onClick={() => handleMoveTo('CONVERTED')}>Move to Won</MenuItem>
            {isAdmin && (
              <>
                <Divider />
                <MenuItem onClick={(e) => { e.stopPropagation(); onReassign(lead); handleMenuClose(); }}>
                  Reassign Manager
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>

        <Box display="flex" gap={0.5} flexWrap="wrap" mb={1.5}>
          {getPriority(lead.createdAt).icon && (
            <Tooltip title={getPriority(lead.createdAt).label}>
              <Chip 
                label="Prio"
                size="small"
                sx={{ 
                  height: 22, 
                  fontSize: '0.7rem', 
                  fontWeight: 800,
                  bgcolor: alpha(getPriority(lead.createdAt).color, 0.1),
                  color: getPriority(lead.createdAt).color,
                  border: '1px solid',
                  borderColor: alpha(getPriority(lead.createdAt).color, 0.2),
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </Tooltip>
          )}
          {Array.isArray(lead.subject) ? (lead.subject as string[]).slice(0, 2).map((s: string) => (
            <Chip 
              key={s} 
              label={s} 
              size="small" 
              sx={{ 
                height: 22, 
                fontSize: '0.7rem', 
                fontWeight: 600,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                color: 'primary.main',
                border: 'none'
              }} 
            />
          )) : (
            <Chip 
              label={lead.subject} 
              size="small" 
              sx={{ 
                height: 22, 
                fontSize: '0.7rem', 
                fontWeight: 600,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                color: 'primary.main',
                border: 'none'
              }} 
            />
          )}
          <Chip 
            label={lead.grade} 
            size="small" 
            sx={{ 
              height: 22, 
              fontSize: '0.7rem', 
              fontWeight: 600,
              bgcolor: 'primary.main', 
              color: 'white',
              border: 'none'
            }} 
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
          <Box display="flex" alignItems="center" color="text.secondary">
            <SchoolIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} />
            <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.65rem' }}>{lead.mode}</Typography>
          </Box>
          <Box display="flex" alignItems="center" color="text.secondary">
            <AccessTimeIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} />
            <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.65rem' }}>{lead.timing}</Typography>
          </Box>
          <Box display="flex" alignItems="center" color="text.secondary">
            <PersonIcon sx={{ fontSize: 13, mr: 0.5, color: 'text.disabled' }} />
            <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.65rem' }}>#{lead.leadId || lead.id.slice(-6).toUpperCase()}</Typography>
          </Box>
        </Box>

        <Box mt={2} pt={1.5} borderTop="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.disabled', letterSpacing: 0.5 }}>
            {format(new Date(lead.createdAt), 'MMM dd, yyyy').toUpperCase()}
          </Typography>
          {(lead as any).interestCount > 0 && (
             <Tooltip title={`${(lead as any).interestCount} Tutors Interested`}>
                <Chip 
                  label={`${(lead as any).interestCount} Interests`} 
                  size="small" 
                  sx={{ 
                    height: 24, 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'secondary.main',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.secondary.main, 0.2)
                  }}
                />
             </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const ManagerLeadCRMPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const [searchParams] = useSearchParams();
  const highlightColumnRaw = searchParams.get('column');
  const highlightColumn = highlightColumnRaw === 'demoPending' ? 'demoCompleted' : highlightColumnRaw;
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  const [groups, setGroups] = useState<Record<string, IClassLead[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [managerFilter, setManagerFilter] = useState<string>('All');
  const [managers, setManagers] = useState<{ id: string, name: string }[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [leadToReassign, setLeadToReassign] = useState<IClassLead | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);

  const fetchFilters = async () => {
    try {
      const res = await getLeadFilterOptions();
      if (res.data) {
        if (res.data.managers) setManagers(res.data.managers);
        if (res.data.grades) setAvailableGrades(res.data.grades);
        if (res.data.subjects) setAvailableSubjects(res.data.subjects);
      }
    } catch (err) {
      console.error('Failed to fetch filters', err);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const managerId = managerFilter !== 'All' ? managerFilter : undefined;
      const res = await getCRMLeads(managerId);
      const raw = (res as any)?.data || {};
      const normalized: Record<string, IClassLead[]> = { ...raw };
      if (normalized.demoPending && !normalized.demoCompleted) {
        normalized.demoCompleted = normalized.demoPending;
      }
      if (normalized.demoCompleted && !normalized.demoPending) {
        normalized.demoPending = normalized.demoCompleted;
      }
      setGroups(normalized);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch CRM data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [managerFilter]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [groups]);

  const scrollBoard = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getFilteredLeads = (columnKey: string) => {
    const leads = (groups[columnKey] || []).filter(l => !!l && typeof l === 'object');
    const sQuery = (searchQuery || '').toLowerCase();
    
    return leads.filter(lead => {
      const studentName = lead.studentName || '';
      const leadId = lead.leadId || '';
      const id = lead.id || '';
      const creatorName = (lead as any).createdBy?.name || '';

      const matchesSearch = 
        studentName.toLowerCase().includes(sQuery) ||
        leadId.toLowerCase().includes(sQuery) ||
        id.toLowerCase().includes(sQuery) ||
        creatorName.toLowerCase().includes(sQuery);
      
      const matchesGrade = gradeFilter === 'All' || lead.grade === gradeFilter;
      
      const matchesSubject = subjectFilter === 'All' || 
        (Array.isArray(lead.subject) 
          ? (lead.subject as string[]).some(s => s === subjectFilter)
          : lead.subject === subjectFilter);

      return matchesSearch && matchesGrade && matchesSubject;
    });
  };

  const allGrades = ['All', ...availableGrades];
  const allSubjects = ['All', ...availableSubjects];

  const handleReassignOpen = (lead: IClassLead) => {
    setLeadToReassign(lead);
    const creatorId = (lead as any).createdBy?._id || (lead as any).createdBy?.id || lead.createdBy;
    setSelectedManagerId(typeof creatorId === 'string' ? creatorId : '');
    setReassignModalOpen(true);
  };

  const handleReassignClose = () => {
    setReassignModalOpen(false);
    setLeadToReassign(null);
    setSelectedManagerId('');
  };

  const handleReassignSubmit = async () => {
    if (!leadToReassign || !selectedManagerId) return;
    setReassigning(true);
    try {
      await reassignLead(leadToReassign.id, selectedManagerId);
      await fetchLeads();
      handleReassignClose();
    } catch (err) {
      console.error('Failed to reassign lead', err);
    } finally {
      setReassigning(false);
    }
  };

  if (loading && Object.keys(groups).length === 0) return <LoadingSpinner />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F1F5F9' }}>
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
          Select a new manager for <strong>{leadToReassign?.studentName}</strong>:
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
            disabled={reassigning || !selectedManagerId || selectedManagerId === ((leadToReassign as any)?.createdBy?._id || (leadToReassign as any)?.createdBy?.id || leadToReassign?.createdBy)}
            onClick={handleReassignSubmit}
          >
            {reassigning ? 'Reassigning...' : 'Confirm'}
          </Button>
        </Box>
      </Menu>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: 'white',
          pt: { xs: 4, md: 5 },
          pb: { xs: 8, md: 9 },
          px: { xs: 2, md: 4 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 2 }}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}
          >
            <Link 
              underline="hover" 
              color="inherit" 
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/manager-today-tasks')}
            >
              <DashboardIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Dashboard
            </Link>
            <Typography color="white" sx={{ display: 'flex', alignItems: 'center' }}>
              <LeadIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Lead CRM
            </Typography>
          </Breadcrumbs>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                Lead Tracker CRM
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, maxWidth: 600 }}>
                {isAdmin 
                  ? "Monitor all manager leads through the CRM funnel to oversee team performance."
                  : "Manage and track your leads through the sales funnel with real-time interest tracking."}
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                placeholder="Search leads..."
                size="small"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />,
                  sx: { 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    borderRadius: 2,
                    color: 'white',
                    width: { xs: 200, md: 300 },
                    '& fieldset': { border: 'none' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                    '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.15)' }
                  }
                }}
              />
              <Button 
                  variant="contained" 
                  startIcon={<RefreshIcon />} 
                  onClick={fetchLeads}
                  disabled={loading}
                  sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      height: 40
                  }}
              >
                {loading ? 'Refreshing...' : 'Refresh Board'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ mt: -6, pb: 4 }}>

        <Box mb={3} display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon fontSize="small" />
            Filters:
          </Typography>
          <Box display="flex" gap={1}>
            <Typography variant="caption" sx={{ color: 'text.disabled', alignSelf: 'center', ml: 1 }}>Grade:</Typography>
            <Box display="flex" gap={0.5} overflow="auto" sx={{ maxWidth: '40vw', pb: 0.5 }}>
              {allGrades.slice(0, 8).map(grade => (
                <Chip 
                  key={grade} 
                  label={grade} 
                  size="small" 
                  onClick={() => setGradeFilter(grade)}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: gradeFilter === grade ? 'primary.main' : 'white',
                    color: gradeFilter === grade ? 'white' : 'text.primary',
                    border: '1px solid',
                    borderColor: gradeFilter === grade ? 'primary.main' : 'divider',
                    '&:hover': { bgcolor: gradeFilter === grade ? 'primary.dark' : 'rgba(0,0,0,0.04)' }
                  }}
                />
              ))}
            </Box>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 20, alignSelf: 'center' }} />
          <Box display="flex" gap={1}>
            <Typography variant="caption" sx={{ color: 'text.disabled', alignSelf: 'center' }}>Subject:</Typography>
            <Box display="flex" gap={0.5} overflow="auto" sx={{ maxWidth: '40vw', pb: 0.5 }}>
              {allSubjects.slice(0, 8).map(subject => (
                <Chip 
                  key={subject} 
                  label={subject} 
                  size="small" 
                  onClick={() => setSubjectFilter(subject)}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: subjectFilter === subject ? 'primary.main' : 'white',
                    color: subjectFilter === subject ? 'white' : 'text.primary',
                    border: '1px solid',
                    borderColor: subjectFilter === subject ? 'primary.main' : 'divider',
                    '&:hover': { bgcolor: subjectFilter === subject ? 'primary.dark' : 'rgba(0,0,0,0.04)' }
                  }}
                />
              ))}
            </Box>
          </Box>

        {isAdmin && (
            <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 20, alignSelf: 'center' }} />
            <Box sx={{ minWidth: 200 }}>
                <FormControl size="small" fullWidth>
                    <InputLabel id="manager-select-label">Filter by Manager</InputLabel>
                    <Select
                        labelId="manager-select-label"
                        id="manager-select"
                        value={managerFilter}
                        label="Filter by Manager"
                        onChange={(e) => setManagerFilter(e.target.value)}
                        sx={{ bgcolor: 'white' }}
                    >
                        <MenuItem value="All">All Managers</MenuItem>
                        {managers.map((mgr) => (
                            <MenuItem key={mgr.id} value={mgr.id}>
                                {mgr.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            </>
        )}
        </Box>
        {error && <Box mb={3}><ErrorAlert error={error} /></Box>}

        <Box sx={{ position: 'relative' }}>
          {/* Navigation Arrows */}
          {showLeftArrow && (
            <IconButton 
              onClick={() => scrollBoard('left')}
              sx={{ 
                position: 'absolute', 
                left: -20, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                zIndex: 10,
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': { bgcolor: 'white', transform: 'translateY(-50%) scale(1.1)' }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}

          {showRightArrow && (
            <IconButton 
              onClick={() => scrollBoard('right')}
              sx={{ 
                position: 'absolute', 
                right: -20, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                zIndex: 10,
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': { bgcolor: 'white', transform: 'translateY(-50%) scale(1.1)' }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}

        <Grid 
          container 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          spacing={2} 
          sx={{ 
            flexWrap: 'nowrap', 
            overflowX: 'auto', 
            pb: 2, 
            minHeight: 700,
            scrollSnapType: isLargeScreen ? 'none' : 'x mandatory',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          {COLUMN_CONFIG.map((col) => (
            <Grid 
              item 
              key={col.key} 
              sx={{ 
                minWidth: { xs: 280, sm: 300, md: 320, xl: '16.66%' },
                width: { xl: 'calc(100% / 6)' },
                flexShrink: 0,
                flexGrow: 1,
                scrollSnapAlign: 'start'
              }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  bgcolor: alpha(col.color, 0.02), 
                  borderRadius: 4, 
                  border: '1px solid', 
                  borderColor: highlightColumn === col.key ? col.color : 'divider',
                  display: 'flex', 
                  flexDirection: 'column',
                  boxShadow: highlightColumn === col.key ? `0 8px 32px ${alpha(col.color, 0.15)}` : '0 4px 6px -1px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s'
                }}
              >
                <Box p={1.75} sx={{ position: 'relative' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} display="flex" alignItems="center" gap={1} sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 3, bgcolor: col.color, boxShadow: `0 0 8px ${alpha(col.color, 0.5)}` }} />
                        {col.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block', fontWeight: 500, fontSize: '0.65rem' }}>
                        {col.description}
                      </Typography>
                    </Box>
                    <Chip 
                      label={getFilteredLeads(col.key).length} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(col.color, 0.1), 
                        color: col.color, 
                        fontWeight: 800,
                        height: 20,
                        fontSize: '0.7rem',
                        borderRadius: 1,
                        px: 0.5
                      }} 
                    />
                  </Box>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      width: '100%', 
                      height: 3, 
                      bgcolor: alpha(col.color, 0.2),
                      borderRadius: '0 0 0 0'
                    }} 
                  />
                </Box>
                
                <Box p={2} sx={{ flexGrow: 1, maxHeight: 650, overflowY: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 10 } }}>
                  {getFilteredLeads(col.key).length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center', opacity: 0.4 }}>
                      <LeadIcon sx={{ fontSize: 48, mb: 1, color: 'text.disabled' }} />
                      <Typography variant="body2" fontWeight={500}>
                        {groups[col.key]?.length === 0 ? 'No leads in this stage' : 'No matching leads'}
                      </Typography>
                    </Box>
                  ) : (
                    getFilteredLeads(col.key).map((lead) => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        managers={managers}
                        onRefresh={fetchLeads} 
                        onReassign={handleReassignOpen}
                      />
                    ))
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default ManagerLeadCRMPage;
