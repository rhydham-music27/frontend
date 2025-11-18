import { useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ClassLeadForm from '../../components/classLeads/ClassLeadForm';
import { IClassLeadFormData } from '../../types';
import leadService from '../../services/leadService';
import SnackbarNotification from '../../components/common/SnackbarNotification';

export default function CreateClassLeadPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (data: IClassLeadFormData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await leadService.createClassLead(data);
      setSnack({ open: true, message: 'Lead created successfully', severity: 'success' });
      const createdId = (res as any)?.data?.id || (res as any)?.data?._id;
      if (createdId) {
        navigate(`/class-leads/${createdId}`);
      } else {
        navigate('/class-leads');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate('/class-leads')}>Back to List</Button>
        <Typography variant="h4">Create New Class Lead</Typography>
      </Box>
      <Card elevation={2}>
        <CardContent>
          <ClassLeadForm onSubmit={handleSubmit} loading={loading} error={error} submitButtonText="Create Lead" />
        </CardContent>
      </Card>
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
