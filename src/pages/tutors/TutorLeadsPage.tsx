import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Chip, Grid2, CircularProgress, Button } from '@mui/material';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import CampaignIcon from '@mui/icons-material/Campaign';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import { getMyTutorLeads } from '../../services/leadService';
import { IClassLead, ApiResponse } from '../../types';

const TutorLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<IClassLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: ApiResponse<IClassLead[]> = await getMyTutorLeads();
      setLeads(res.data || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load assigned leads.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  return (
    <Container maxWidth="xl" disableGutters>
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={{ xs: 3, sm: 4 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 2 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
          >
            My Leads
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            View all class leads that have been assigned to you.
          </Typography>
        </Box>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={32} />
        </Box>
      )}

      {!loading && error && (
        <Box mb={3}>
          <ErrorAlert error={error} />
          <Box mt={1.5} display="flex" justifyContent="center">
            <Button variant="outlined" onClick={loadLeads}>
              Retry
            </Button>
          </Box>
        </Box>
      )}

      {!loading && !error && leads.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={<CampaignIcon color="primary" />}
              title="No Assigned Leads"
              description="You don't have any class leads assigned to you yet. Once a manager assigns you to a lead, it will appear here."
            />
          </CardContent>
        </Card>
      )}

      {!loading && !error && leads.length > 0 && (
        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          {leads.map((lead) => {
            const subjects = Array.isArray(lead.subject) ? lead.subject.join(', ') : (lead.subject as any) || '';
            const locationLine = [lead.area, lead.city, lead.location].filter(Boolean).join(' • ');
            const timing = lead.timing || '';

            return (
              <Grid2 key={lead.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    boxShadow: 'none',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                          {lead.studentName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {lead.grade} • {lead.board}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={lead.status}
                      />
                    </Box>

                    <Box display="flex" flexDirection="column" gap={0.75} mb={1.5}>
                      <Box display="flex" alignItems="center" gap={0.75}>
                        <SchoolIcon fontSize="small" color="action" />
                        <Typography variant="body2">{subjects}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.75}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">{timing || 'Timing not set'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.75}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">{locationLine || 'Location not specified'}</Typography>
                      </Box>
                    </Box>

                    {lead.classesPerMonth != null && lead.classDurationHours != null && (
                      <Box display="flex" gap={1} flexWrap="wrap" mb={1.5}>
                        <Chip
                          size="small"
                          label={`${lead.classesPerMonth} classes/month`}
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`${lead.classDurationHours} hr/session`}
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {lead.paymentAmount != null && (
                      <Typography variant="body2" color="text.secondary">
                        Approx. Fee: ₹{lead.paymentAmount}
                      </Typography>
                    )}

                    {lead.tutorFees != null && (
                      <Typography variant="body2" color="text.secondary">
                        Your Fee: ₹{lead.tutorFees}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid2>
            );
          })}
        </Grid2>
      )}
    </Container>
  );
};

export default TutorLeadsPage;
