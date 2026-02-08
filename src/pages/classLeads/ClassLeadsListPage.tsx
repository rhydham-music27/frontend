import { useEffect, useState, useMemo } from 'react';
import { Container, Box, Typography, Button, Paper, IconButton, Tooltip, Pagination, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Select, MenuItem, InputAdornment, Card, CardContent, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useClassLeads from '../../hooks/useClassLeads';
import { usePermissionCheck } from '../../hooks/useManagerPermissions';
import { getLeadFilterOptions } from '../../services/leadService';
import ClassLeadStatusChip from '../../components/classLeads/ClassLeadStatusChip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDialog from '../../components/common/ErrorDialog';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import GroupStudentsModal from '../../components/classLeads/GroupStudentsModal';
import { IClassLead } from '../../types';

export default function ClassLeadsListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { isAuthorized: canCreateLeads } = usePermissionCheck('canCreateLeads');
  
  const [filters, setFilters] = useState({
    studentName: '',
    grade: '',
    subject: '',
    board: '',
    mode: '',
    status: '',
    search: '',
    timing: '',
    createdByName: '',
    area: '',
  });

  const [filterOptions, setFilterOptions] = useState<{ grades: string[]; subjects: string[]; boards: string[]; areas: string[]; creators: string[]; status?: string[] }>({
    grades: [],
    subjects: [],
    boards: [],
    areas: [],
    creators: [],
    status: [],
  });

  useEffect(() => {
    getLeadFilterOptions().then((res: any) => {
      if (res.success && res.data) {
        setFilterOptions(res.data);
      }
    }).catch(console.error);
  }, []);

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sort, setSort] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ 
    open: false, message: '', severity: 'success' 
  });

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [selectedLeadStudents, setSelectedLeadStudents] = useState<any[]>([]);
  const [selectedLeadName, setSelectedLeadName] = useState('');

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const { leads, loading, error, pagination, deleteLead, updateStatus } = useClassLeads({
    page,
    limit: rowsPerPage,
    status: debouncedFilters.status || undefined,
    studentName: debouncedFilters.studentName || undefined,
    grade: debouncedFilters.grade || undefined,
    subject: debouncedFilters.subject || undefined,
    board: debouncedFilters.board || undefined,
    mode: debouncedFilters.mode || undefined,
    search: debouncedFilters.search || undefined,
    createdByName: debouncedFilters.createdByName || undefined,
    area: debouncedFilters.area || undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    // Add missing filters to hook if needed, but for now timing is local search 
    // or I should update backend to support timing filter too.
  });

  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilter = (field: string) => {
    handleFilterChange(field, '');
  };

  const handleSort = (columnId: string) => {
    const isAsc = sort.sortBy === columnId && sort.sortOrder === 'asc';
    setSort({
      sortBy: columnId,
      sortOrder: isAsc ? 'desc' : 'asc'
    });
  };

  const handleStudentNameClick = (lead: IClassLead) => {
    if (lead.studentType === 'GROUP') {
      setSelectedLeadStudents(lead.associatedStudents || (lead as any).studentDetails || []);
      setSelectedLeadName(lead.studentName || 'Group Lead');
      setGroupModalOpen(true);
    } else {
      const studentId = lead.associatedStudents?.[0]?.studentId || (lead as any).studentId;
      if (studentId) {
        navigate(`/admin/student-profile/${studentId}`);
      } else {
        setSnack({ open: true, message: 'No student profile associated with this lead', severity: 'info' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    await deleteLead(id);
    setSnack({ open: true, message: 'Lead deleted', severity: 'success' });
  };

  const handleMarkPaymentReceived = async (leadId: string) => {
    try {
      await updateStatus(leadId, 'PAYMENT_RECEIVED');
      setSnack({ open: true, message: 'Payment marked as received', severity: 'success' });
    } catch (e: any) {
      setSnack({ open: true, message: e?.response?.data?.message || 'Failed to update payment status', severity: 'error' });
    }
  };

  const handleAddressClick = (lead: IClassLead) => {
    const fullAddress = `${lead.address || ''} ${lead.area ? `, ${lead.area}` : ''} ${lead.city ? `, ${lead.city}` : ''}`.trim();
    setSelectedAddress(fullAddress || 'No address details available');
    setAddressModalOpen(true);
  };

  const formattedLeads = useMemo(() => {
    let list = (leads as IClassLead[]).map(lead => {
      const r: any = lead || {};
      let subjVal: any = r.subject ?? r.subjects ?? r.subjectList ?? r.subject_names ?? r.subjectName ?? r.subject_name;
      let subjectList: string[] = [];
      const toStrings = (arr: any[]) => arr.map((s: any) => String(s)).filter((s) => s.trim().length > 0);
      
      if (Array.isArray(subjVal)) subjectList = toStrings(subjVal);
      else if (typeof subjVal === 'string' && subjVal) {
        if (subjVal.startsWith('[') || subjVal.startsWith('{')) {
          try {
            const p = JSON.parse(subjVal);
            if (Array.isArray(p)) subjectList = toStrings(p);
          } catch {}
        }
        if (subjectList.length === 0) subjectList = subjVal.split(',').map(x => x.trim()).filter(Boolean);
      }
      
      return { ...lead, displaySubjects: subjectList };
    });

    // Local timing filter since backend doesn't support it yet
    if (filters.timing) {
      list = list.filter(l => l.timing?.toLowerCase().includes(filters.timing.toLowerCase()));
    }

    return list;
  }, [leads, filters.timing]);

  const renderFilterInput = (field: keyof typeof filters, placeholder: string) => (
    <TextField
      size="small"
      variant="standard"
      placeholder={placeholder}
      value={filters[field]}
      onChange={(e) => handleFilterChange(field, e.target.value)}
      InputProps={{
        sx: { fontSize: '0.75rem' },
        endAdornment: filters[field] && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => clearFilter(field)}><ClearIcon sx={{ fontSize: '0.8rem' }} /></IconButton>
          </InputAdornment>
        )
      }}
    />
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', // distinct green theme for Leads
          color: 'white',
          py: { xs: 4, md: 5 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Class Leads
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            Manage and track potential student enrollments, from simple inquiries to converted classes.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Tooltip 
            title={user?.role === 'MANAGER' && !canCreateLeads ? 'You do not have permission to create class leads' : ''}
            arrow
          >
            <span>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => navigate('/class-leads/new')}
                disabled={user?.role === 'MANAGER' && !canCreateLeads}
                sx={{
                  bgcolor: 'white',
                  color: '#1B5E20',
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255,255,255,0.5)',
                    color: 'rgba(27,94,32,0.5)',
                    cursor: 'not-allowed',
                  }
                }}
              >
                Create New Lead
              </Button>
            </span>
          </Tooltip>
        </Box>
        
        {/* Abstract shapes */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -40,
          left: 40,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>

      {/* Removed inline ErrorAlert, now using ErrorDialog */}

      {isXs ? (
        <Stack spacing={2} mb={3}>
           {/* Mobile Filter Bar */}
           <Card sx={{ p: 2 }}>
             <TextField
               fullWidth
               size="small"
               placeholder="Global Search..."
               value={filters.search}
               onChange={(e) => handleFilterChange('search', e.target.value)}
             />
           </Card>
           {loading ? <LoadingSpinner /> : formattedLeads.map((lead) => (
             <Card key={lead.id} variant="outlined">
               <CardContent>
                 <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      sx={{ 
                        cursor: 'pointer', 
                        color: 'text.primary',
                        transition: 'color 0.2s',
                        '&:hover': { color: 'primary.main', textDecoration: 'underline' } 
                      }}
                      onClick={() => handleStudentNameClick(lead)}
                    >
                      {lead.studentName}
                    </Typography>
                    <ClassLeadStatusChip status={lead.status} />
                 </Box>
                 <Typography variant="body2" color="text.secondary">Grade: {lead.grade}</Typography>
                 <Typography variant="body2" color="text.secondary">Mode: {lead.mode} | Board: {lead.board}</Typography>
                 <Typography variant="body2" color="text.secondary">
                    Address: {lead.mode === 'OFFLINE' ? `${lead.address || ''} ${lead.area ? `, ${lead.area}` : ''} ${lead.city ? `, ${lead.city}` : ''}`.trim() : 'Zoom'}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">Timing: {lead.timing}</Typography>
                 <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {lead.displaySubjects.map((s: string) => <Chip key={s} label={s} size="small" />)}
                 </Box>
                 <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption">By: {(lead.createdBy as any)?.name || '-'}</Typography>
                    <Box>
                      {(lead.status === 'CONVERTED' || (lead as any).status === 'WON') && !(lead as any).paymentReceived && (
                        <Tooltip title="Mark Payment Received">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleMarkPaymentReceived(lead.id)}
                          >
                            <CheckCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton onClick={() => navigate(`/class-leads/${lead.id}`)}><VisibilityIcon /></IconButton>
                      <IconButton onClick={() => navigate(`/class-leads/${lead.id}/edit`)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(lead.id)}><DeleteIcon /></IconButton>
                    </Box>
                 </Box>
               </CardContent>
             </Card>
           ))}
        </Stack>
      ) : (
        <TableContainer 
          component={Paper} 
          elevation={0} 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'secondary.main', '& th': { color: 'white', fontWeight: 700 } }}>
                <TableCell sx={{ color: 'inherit' }}>
                  <TableSortLabel
                    active={sort.sortBy === 'studentName'}
                    direction={sort.sortBy === 'studentName' ? sort.sortOrder : 'asc'}
                    onClick={() => handleSort('studentName')}
                    sx={{ 
                      '&.MuiTableSortLabel-root': { color: 'inherit' },
                      '&.MuiTableSortLabel-root:hover': { color: 'inherit' },
                      '&.Mui-active': { color: 'inherit', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } },
                    }}
                  >
                    Student Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: 'inherit' }}>
                  <TableSortLabel
                    active={sort.sortBy === 'grade'}
                    direction={sort.sortBy === 'grade' ? sort.sortOrder : 'asc'}
                    onClick={() => handleSort('grade')}
                    sx={{ 
                      '&.MuiTableSortLabel-root': { color: 'inherit' },
                      '&.MuiTableSortLabel-root:hover': { color: 'inherit' },
                      '&.Mui-active': { color: 'inherit', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } },
                    }}
                  >
                    Grade
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: 'inherit' }}>Subjects</TableCell>
                <TableCell sx={{ color: 'inherit' }}>Board</TableCell>
                <TableCell sx={{ color: 'inherit' }}>Mode</TableCell>
                <TableCell sx={{ color: 'inherit' }}>Area</TableCell>
                <TableCell sx={{ color: 'inherit' }}>Timing</TableCell>
                <TableCell sx={{ color: 'inherit' }}>Status</TableCell>
                {isAdmin && <TableCell sx={{ color: 'inherit' }}>Created By</TableCell>}
                <TableCell sx={{ color: 'inherit' }}>
                  <TableSortLabel
                    active={sort.sortBy === 'createdAt'}
                    direction={sort.sortBy === 'createdAt' ? sort.sortOrder : 'asc'}
                    onClick={() => handleSort('createdAt')}
                    sx={{ 
                      '&.MuiTableSortLabel-root': { color: 'inherit' },
                      '&.MuiTableSortLabel-root:hover': { color: 'inherit' },
                      '&.Mui-active': { color: 'inherit', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } },
                    }}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ color: 'inherit' }}>Actions</TableCell>
              </TableRow>
              {/* Filter Row */}
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell>{renderFilterInput('studentName', 'Filter Name')}</TableCell>
                <TableCell>
                  <Select
                    variant="standard"
                    value={filters.grade}
                    onChange={(e) => handleFilterChange('grade', e.target.value as string)}
                    displayEmpty
                    sx={{ fontSize: '0.8125rem', width: '100%' }}
                  >
                    <MenuItem value=""><em>All Grades</em></MenuItem>
                    {filterOptions.grades.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    variant="standard"
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value as string)}
                    displayEmpty
                    sx={{ fontSize: '0.8125rem', width: '100%' }}
                  >
                    <MenuItem value=""><em>All Subjects</em></MenuItem>
                    {filterOptions.subjects.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    variant="standard"
                    value={filters.board}
                    onChange={(e) => handleFilterChange('board', e.target.value as string)}
                    displayEmpty
                    sx={{ fontSize: '0.8125rem', width: '100%' }}
                  >
                    <MenuItem value=""><em>Any Board</em></MenuItem>
                    {filterOptions.boards.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    variant="standard"
                    value={filters.mode}
                    onChange={(e) => handleFilterChange('mode', e.target.value as string)}
                    displayEmpty
                    sx={{ fontSize: '0.8125rem', width: '100%' }}
                  >
                    <MenuItem value=""><em>Any Mode</em></MenuItem>
                    <MenuItem value="ONLINE">Online</MenuItem>
                    <MenuItem value="OFFLINE">Offline</MenuItem>
                    <MenuItem value="HYBRID">Hybrid</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    variant="standard"
                    value={filters.area}
                    onChange={(e) => handleFilterChange('area', e.target.value as string)}
                    displayEmpty
                    sx={{ fontSize: '0.8125rem', width: '100%' }}
                  >
                    <MenuItem value=""><em>All Areas</em></MenuItem>
                    {filterOptions.areas.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>{renderFilterInput('timing', 'Filter Timing')}</TableCell>
                <TableCell>
                  <Select
                    variant="standard"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value as string)}
                    displayEmpty
                    sx={{ fontSize: '0.8125rem', width: '100%' }}
                  >
                    <MenuItem value=""><em>Any Status</em></MenuItem>
                    <MenuItem value="NEW">New</MenuItem>
                    <MenuItem value="ANNOUNCED">Announced</MenuItem>
                    <MenuItem value="DEMO_SCHEDULED">Demo Scheduled</MenuItem>
                    <MenuItem value="DEMO_COMPLETED">Demo Completed</MenuItem>
                    <MenuItem value="CONVERTED">Converted</MenuItem>
                    {filterOptions.status?.map((s: string) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <Select
                      variant="standard"
                      value={filters.createdByName}
                      onChange={(e) => handleFilterChange('createdByName', e.target.value as string)}
                      displayEmpty
                      sx={{ fontSize: '0.8125rem', width: '100%' }}
                    >
                      <MenuItem value=""><em>All Managers</em></MenuItem>
                      {filterOptions.creators.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </TableCell>
                )}
                <TableCell />
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 3 }}><LoadingSpinner /></TableCell></TableRow>
              ) : formattedLeads.length === 0 ? (
                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 3 }}><Typography color="text.secondary">No leads found</Typography></TableCell></TableRow>
              ) : (
                formattedLeads.map((lead) => (
                  <TableRow key={lead.id} hover>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{ 
                          cursor: 'pointer', 
                          color: 'text.primary',
                          transition: 'color 0.2s',
                          '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                        }}
                        onClick={() => handleStudentNameClick(lead)}
                      >
                        {lead.studentName}
                      </Typography>
                      {lead.studentType === 'GROUP' && <Chip label="Group" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.65rem' }} />}
                    </TableCell>
                    <TableCell>{lead.grade}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {lead.displaySubjects.map((s: string) => <Chip key={s} label={s} size="small" variant="outlined" />)}
                      </Box>
                    </TableCell>
                    <TableCell>{lead.board}</TableCell>
                    <TableCell><Chip label={lead.mode} size="small" color={lead.mode === 'ONLINE' ? 'primary' : 'secondary'} variant="outlined" /></TableCell>
                    <TableCell>
                      {lead.mode === 'OFFLINE' ? (
                        <Typography 
                          variant="body2" 
                          color="primary" 
                          sx={{ fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => handleAddressClick(lead)}
                        >
                          {lead.area || 'View Address'}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Zoom</Typography>
                      )}
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{lead.timing}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ClassLeadStatusChip status={lead.status} />
                        {!!(lead as any).paymentReceived ? (
                          <Tooltip title="Payment Received">
                            <CheckCircleIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
                          </Tooltip>
                        ) : (
                          (lead.status === 'CONVERTED' || (lead as any).status === 'WON') && (
                            <Tooltip title="Mark Payment Received">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleMarkPaymentReceived(lead.id)}
                              >
                                <CheckCircleOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )
                        )}
                      </Box>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Typography variant="caption" display="block">{(lead.createdBy as any)?.name || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">{(lead.createdBy as any)?.role || ''}</Typography>
                      </TableCell>
                    )}
                    <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/class-leads/${lead.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/class-leads/${lead.id}/edit`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(lead.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination 
          count={pagination.pages} 
          page={page} 
          onChange={(_, p) => setPage(p)} 
          color="primary" 
        />
      </Box>

      <SnackbarNotification 
        open={snack.open} 
        message={snack.message} 
        severity={snack.severity} 
        onClose={() => setSnack((s) => ({ ...s, open: false }))} 
      />

      <GroupStudentsModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        students={selectedLeadStudents}
        leadName={selectedLeadName}
      />

      <Dialog open={addressModalOpen} onClose={() => setAddressModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Full Address</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
            {selectedAddress}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <ErrorDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        error={error}
        title="Unable to Load Leads"
      />
    </Container>
  );
}

