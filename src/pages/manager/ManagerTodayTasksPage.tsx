import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import leadService from '../../services/leadService';
import { CLASS_LEAD_STATUS } from '../../constants';
import { IClassLead } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const ManagerTodayTasksPage: React.FC = () => {
  const [leads, setLeads] = useState<IClassLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch recent leads and then filter on the client to anything not CONVERTED
      const res = await leadService.getClassLeads({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
      const all = res.data || [];
      const openLeads = all.filter((l) => l.status !== CLASS_LEAD_STATUS.CONVERTED);
      setLeads(openLeads);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load leads for today\'s tasks';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return counts;
  }, [leads]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={2} flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 1.5, sm: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} gutterBottom>
            Today&apos;s Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and follow up on all leads that have not yet been converted.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchLeads}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Box mb={2}>
          <ErrorAlert error={error} onClose={() => setError(null)} />
        </Box>
      )}

      {loading && !leads.length && (
        <Box mt={4} display="flex" justifyContent="center">
          <LoadingSpinner />
        </Box>
      )}

      {!loading && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AssignmentIcon color="primary" />
                    <Typography variant="subtitle1">Open Leads</Typography>
                  </Box>
                  <Chip label={leads.length} color="primary" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  All leads that have not reached the CONVERTED status.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <WarningAmberIcon color="warning" />
                    <Typography variant="subtitle1">By Status</Typography>
                  </Box>
                </Box>
                {Object.keys(countsByStatus).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No open leads by status.
                  </Typography>
                ) : (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {Object.entries(countsByStatus).map(([status, count]) => (
                      <Chip key={status} label={`${status}: ${count}`} size="small" />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {!loading && leads.length === 0 && !error && (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary">
            No open leads
          </Typography>
          <Typography variant="body2">
            Great job! All leads have been converted or closed.
          </Typography>
        </Box>
      )}

      {!loading && leads.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Showing {leads.length} open leads
            </Typography>
            <List dense>
              {leads.map((lead) => {
                const leadId = (lead as any).id || (lead as any)._id;
                // Get student display name based on student type
                const getStudentDisplayName = () => {
                  const studentType = (lead as any).studentType;
                  if (studentType === 'GROUP') {
                    const studentDetails = (lead as any).studentDetails || [];
                    const studentNames = studentDetails
                      .map((student: any) => student.name)
                      .filter(Boolean)
                      .join(', ');
                    return studentNames || `${(lead as any).numberOfStudents || 0} students`;
                  } else {
                    return lead.studentName || 'Unnamed Lead';
                  }
                };
                
                return (
                  <ListItem key={leadId} disablePadding>
                    <ListItemButton onClick={() => navigate(`/class-leads/${leadId}`)}>
                      <ListItemText
                        primary={getStudentDisplayName()}
                        secondary={`${lead.grade || 'N/A'} · ${Array.isArray(lead.subject) ? lead.subject.join(', ') : lead.subject || 'N/A'} · Status: ${lead.status}${lead.parentEmail ? ` · Parent: ${lead.parentEmail}` : ''}`}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ManagerTodayTasksPage;
