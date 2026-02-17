import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Box, Typography, Tabs, Tab, Dialog, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TablePagination, TextField, TableSortLabel, MenuItem, Select, InputAdornment, IconButton, Link as MuiLink, Avatar } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import VerificationStatusChip from '../../components/tutors/VerificationStatusChip';
import DocumentViewer from '../../components/tutors/DocumentViewer';
import VerificationModal from '../../components/tutors/VerificationModal';
import useTutors from '../../hooks/useTutors';
import { ITutor, IDocument } from '../../types';
import { getPendingVerifications, updateVerificationStatus, getSubjects, getVerifiers } from '../../services/tutorService';

export default function TutorVerificationPage() {
  const [tab, setTab] = useState(1);
  const [pending, setPending] = useState<ITutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<ITutor | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ open: boolean; title: string; message: string; action: () => void; severity: 'info' | 'error' | 'warning' }>({ open: false, title: '', message: '', action: () => { }, severity: 'info' });
  const [actionLoading, setActionLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [filters, setFilters] = useState({
    teacherId: '',
    name: '',
    email: '',
    phone: '',
    preferredMode: '',
    status: '',
    verifier: '',
    subjects: ''
  });

  const [sort, setSort] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [verifiersList, setVerifiersList] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      // Check cache first
      const cached = localStorage.getItem('tutor_subjects_cache');
      const cacheTimestamp = localStorage.getItem('tutor_subjects_ts');

      const now = Date.now();
      if (cached && cacheTimestamp && (now - parseInt(cacheTimestamp) < 24 * 60 * 60 * 1000)) {
        setSubjectsList(JSON.parse(cached));
      } else {
        try {
          const res = await getSubjects();
          if (res.data) {
            setSubjectsList(res.data);
            localStorage.setItem('tutor_subjects_cache', JSON.stringify(res.data));
            localStorage.setItem('tutor_subjects_ts', String(now));
          }
        } catch (e) {
          console.error("Failed to fetch subjects", e);
        }
      }
    };

    const fetchVerifiers = async () => {
      // Check cache first
      const cached = localStorage.getItem('tutor_verifiers_cache');
      const cacheTimestamp = localStorage.getItem('tutor_verifiers_ts');

      const now = Date.now();
      if (cached && cacheTimestamp && (now - parseInt(cacheTimestamp) < 24 * 60 * 60 * 1000)) {
        setVerifiersList(JSON.parse(cached));
      } else {
        try {
          const res = await getVerifiers();
          if (res.data) {
            setVerifiersList(res.data);
            localStorage.setItem('tutor_verifiers_cache', JSON.stringify(res.data));
            localStorage.setItem('tutor_verifiers_ts', String(now));
          }
        } catch (e) {
          console.error("Failed to fetch verifiers", e);
        }
      }
    };

    fetchSubjects();
    fetchVerifiers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  // Note: API is 1-indexed for page, Material UI is 0-indexed
  const { tutors, loading: loadingTutors, error: tutorsError, pagination, refetch } = useTutors({
    page: page + 1,
    limit: rowsPerPage,
    verificationStatus: debouncedFilters.status || undefined,
    teacherId: debouncedFilters.teacherId || undefined,
    name: debouncedFilters.name || undefined,
    email: debouncedFilters.email || undefined,
    phone: debouncedFilters.phone || undefined,
    preferredMode: debouncedFilters.preferredMode || undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    subjects: debouncedFilters.subjects ? [debouncedFilters.subjects] : undefined
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPendingVerifications();
      setPending(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch pending verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleViewDoc = (doc: IDocument) => {
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  // Unused handlers removed
  // const handleViewDocs = (t: ITutor) => { ... }
  // const handleReview = (t: ITutor) => { ... }

  const handleVerifySubmit = (payload: { status: string; verificationNotes?: string; whatsappCommunityJoined?: boolean }) => {
    if (!selectedTutor) return;

    setConfirmConfig({
      open: true,
      title: payload.status === 'VERIFIED' ? 'Approve Tutor' : 'Reject Tutor',
      message: `Are you sure you want to ${payload.status === 'VERIFIED' ? 'approve' : 'reject'} verification for ${selectedTutor.user.name}?`,
      severity: payload.status === 'VERIFIED' ? 'info' : 'error',
      action: async () => {
        try {
          setActionLoading(true);
          await updateVerificationStatus(selectedTutor.id, payload.status, payload.verificationNotes, payload.whatsappCommunityJoined);
          setSnack({ open: true, message: 'Verification updated', severity: 'success' });
          setVerifyOpen(false);
          setSelectedTutor(null);
          setConfirmConfig(c => ({ ...c, open: false }));
          await fetchPending();
          await refetch();
        } catch (e: any) {
          setSnack({ open: true, message: e.message || 'Verification update failed', severity: 'error' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4A148C 0%, #311B92 100%)', // Deep Purple theme
          color: 'white',
          py: { xs: 4, md: 5 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, mb: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Tutor Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            Oversee tutor verifications, track performance stats, and manage tutor profiles.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
              '& .Mui-selected': { color: '#fff !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 4 }
            }}
          >
            <Tab label={`Pending Verifications (${pending.length})`} />
            <Tab label="All Tutors" />
          </Tabs>
        </Box>

        {/* Abstract shapes */}
        <Box sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -50,
          left: 100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          width: '100%',
          overflowX: 'auto',
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main', '& th': { color: 'white', fontWeight: 700 } }}>
              <TableCell sx={{ color: 'inherit' }}>
                <TableSortLabel
                  active={sort.sortBy === 'teacherId'}
                  direction={sort.sortBy === 'teacherId' ? sort.sortOrder : 'asc'}
                  onClick={() => handleSort('teacherId')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: 'inherit' },
                    '&.MuiTableSortLabel-root:hover': { color: 'inherit' },
                    '&.Mui-active': { color: 'inherit', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } },
                  }}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'inherit' }}>
                <TableSortLabel
                  active={sort.sortBy === 'name'}
                  direction={sort.sortBy === 'name' ? sort.sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: 'inherit' },
                    '&.MuiTableSortLabel-root:hover': { color: 'inherit' },
                    '&.Mui-active': { color: 'inherit', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } },
                  }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'inherit' }}>Contact Info</TableCell>
              <TableCell sx={{ color: 'inherit' }}>Mode/Locs</TableCell>
              <TableCell sx={{ color: 'inherit' }}>
                <TableSortLabel
                  active={sort.sortBy === 'classesAssigned'}
                  direction={sort.sortBy === 'classesAssigned' ? sort.sortOrder : 'asc'}
                  onClick={() => handleSort('classesAssigned')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: 'inherit' },
                    '&.MuiTableSortLabel-root:hover': { color: 'inherit' },
                    '&.Mui-active': { color: 'inherit', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } },
                  }}
                >
                  Stats
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'inherit' }}>
                <TableSortLabel
                  active={sort.sortBy === 'experienceHours'}
                  direction={sort.sortBy === 'experienceHours' ? sort.sortOrder : 'asc'}
                  onClick={() => handleSort('experienceHours')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: 'inherit' },
                    '&.MuiTableSortLabel-root:hover': { color: 'inherit' },
                    '&.Mui-active': { color: 'inherit', '& .MuiTableSortLabel-icon': { color: 'inherit !important' } },
                  }}
                >
                  Exp
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'inherit' }}>Subjects</TableCell>
              <TableCell sx={{ color: 'inherit' }}>Status</TableCell>
              <TableCell sx={{ color: 'inherit' }}>Verifier</TableCell>
              <TableCell align="right" sx={{ color: 'inherit' }}>Actions</TableCell>
            </TableRow>
            {/* Filter Row */}
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Filter ID"
                  value={filters.teacherId}
                  onChange={(e) => handleFilterChange('teacherId', e.target.value)}
                  InputProps={{
                    sx: { fontSize: '0.8125rem' },
                    endAdornment: filters.teacherId && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => clearFilter('teacherId')}><ClearIcon sx={{ fontSize: '0.8rem' }} /></IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Filter Name"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  InputProps={{
                    sx: { fontSize: '0.8125rem' },
                    endAdornment: filters.name && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => clearFilter('name')}><ClearIcon sx={{ fontSize: '0.8rem' }} /></IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Email/Phone"
                  value={filters.email || filters.phone}
                  onChange={(e) => {
                    handleFilterChange('email', e.target.value);
                    handleFilterChange('phone', e.target.value);
                  }}
                  InputProps={{
                    sx: { fontSize: '0.8125rem' }
                  }}
                />
              </TableCell>
              <TableCell>
                <Select
                  variant="standard"
                  value={filters.preferredMode}
                  onChange={(e) => handleFilterChange('preferredMode', e.target.value as string)}
                  displayEmpty
                  sx={{ fontSize: '0.8125rem', width: '100%' }}
                >
                  <MenuItem value=""><em>Any Mode</em></MenuItem>
                  <MenuItem value="ONLINE">Online</MenuItem>
                  <MenuItem value="OFFLINE">Offline</MenuItem>
                  <MenuItem value="BOTH">Both</MenuItem>
                </Select>
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell>
                <Select
                  variant="standard"
                  value={filters.subjects}
                  onChange={(e) => handleFilterChange('subjects', e.target.value as string)}
                  displayEmpty
                  sx={{ fontSize: '0.8125rem', width: '100%' }}
                >
                  <MenuItem value=""><em>Any Subject</em></MenuItem>
                  {subjectsList.map((subj) => (
                    <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  variant="standard"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value as string)}
                  displayEmpty
                  sx={{ fontSize: '0.8125rem', width: '100%' }}
                >
                  <MenuItem value=""><em>Any Status</em></MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="UNDER_REVIEW">Review</MenuItem>
                  <MenuItem value="VERIFIED">Verified</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  variant="standard"
                  value={filters.verifier}
                  onChange={(e) => handleFilterChange('verifier', e.target.value as string)}
                  displayEmpty
                  sx={{ fontSize: '0.8125rem', width: '100%' }}
                >
                  <MenuItem value=""><em>Any Verifier</em></MenuItem>
                  {verifiersList.map((v) => (
                    <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {tab === 0 && (
              <>
                {loading ? (
                  <TableRow><TableCell colSpan={6} align="center"><LoadingSpinner /></TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={10} align="center"><ErrorAlert error={error} /></TableCell></TableRow>
                ) : pending.length === 0 ? (
                  <TableRow><TableCell colSpan={10} align="center">No tutors pending verification.</TableCell></TableRow>
                ) : (
                  pending.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{t.teacherId || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            component={RouterLink}
                            to={`/tutor-profile/${t.id || (t as any)._id}`}
                            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {t.user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">DOCS: {t.documents?.length || 0}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{t.user.email}</Typography>
                        <Typography variant="caption" color="text.secondary">{t.user.phone || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{t.preferredMode || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 120 }} title={(t.preferredLocations || []).join(', ')}>
                          {(t.preferredLocations || []).join(', ')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{t.classesAssigned} Classes</Typography>
                        <Typography variant="caption" color="text.secondary">{t.demosApproved} Demos</Typography>
                      </TableCell>
                      <TableCell>{t.experienceHours} hrs</TableCell>
                      <TableCell sx={{ maxWidth: 120 }}>
                        <Typography variant="body2" noWrap title={(t.subjects || []).join(', ')}>
                          {(t.subjects || []).slice(0, 2).join(', ')}{(t.subjects?.length || 0) > 2 ? '...' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell><VerificationStatusChip status={t.verificationStatus} /></TableCell>
                      <TableCell>
                        {t.verifiedBy ? (
                          <MuiLink component={RouterLink} to={`/manager-profile/${(t.verifiedBy as any).id || (t.verifiedBy as any)._id}`} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                            {t.verifiedBy.name}
                          </MuiLink>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            component={RouterLink}
                            to={`/tutors/verify/${t.id}`}
                          >
                            Details
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )
                }
              </>
            )}

            {tab === 1 && (
              <>
                {loadingTutors ? (
                  <TableRow><TableCell colSpan={10} align="center"><LoadingSpinner /></TableCell></TableRow>
                ) : (
                  <>
                    {tutors.map((t) => (
                      <TableRow key={t.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{t.teacherId || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar src={t.documents?.find(d => d.documentType === 'PROFILE_PHOTO')?.documentUrl}>
                              {(t.user?.name || 'T').charAt(0).toUpperCase()}
                            </Avatar>
                            <MuiLink
                              variant="subtitle2"
                              component={RouterLink}
                              to={`/tutors/verify/${t.id}`}
                              sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                              {t.user?.name || 'Unknown Tutor'}
                            </MuiLink>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{t.user?.email}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.user?.phone || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{t.preferredMode || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 120 }} title={(t.preferredLocations || []).join(', ')}>
                            {(t.preferredLocations || []).join(', ')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{t.classesAssigned} Classes</Typography>
                          <Typography variant="caption" color="text.secondary">{t.demosApproved} Demos</Typography>
                        </TableCell>
                        <TableCell>{t.experienceHours} hrs</TableCell>
                        <TableCell sx={{ maxWidth: 120 }}>
                          <Typography variant="body2" noWrap title={(t.subjects || []).join(', ')}>
                            {(t.subjects || []).slice(0, 2).join(', ')}{(t.subjects?.length || 0) > 2 ? '...' : ''}
                          </Typography>
                        </TableCell>
                        <TableCell><VerificationStatusChip status={t.verificationStatus} /></TableCell>
                        <TableCell>
                          {t.verifiedBy ? (
                            <MuiLink component={RouterLink} to={`/manager-profile/${(t.verifiedBy as any).id || (t.verifiedBy as any)._id}`} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                              {t.verifiedBy.name}
                            </MuiLink>
                          ) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            component={RouterLink}
                            to={`/tutors/verify/${t.id}`}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {tutorsError && (
                      <TableRow><TableCell colSpan={10} align="center"><ErrorAlert error={tutorsError} /></TableCell></TableRow>
                    )}
                  </>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {tab === 1 && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      <Dialog open={docsOpen} onClose={() => setDocsOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedTutor && (
            <DocumentViewer
              documents={selectedTutor.documents || []}
              onView={handleViewDoc}
              canDelete={false}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={viewerOpen} onClose={() => setViewerOpen(false)} maxWidth="lg" fullWidth>
        <DialogContent>
          {selectedDoc && (selectedDoc.documentUrl.toLowerCase().endsWith('.pdf') ? (
            <iframe src={selectedDoc.documentUrl} title="document" style={{ width: '100%', height: '80vh', border: 'none' }} />
          ) : (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={selectedDoc.documentUrl} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
          ))}
        </DialogContent>
      </Dialog>

      <VerificationModal open={verifyOpen} onClose={() => setVerifyOpen(false)} tutor={selectedTutor} onSubmit={handleVerifySubmit} />
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />

      <ConfirmDialog
        open={confirmConfig.open}
        onClose={() => setConfirmConfig(c => ({ ...c, open: false }))}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        message={confirmConfig.message}
        severity={confirmConfig.severity}
        loading={actionLoading}
      />
    </Container>
  );
}
