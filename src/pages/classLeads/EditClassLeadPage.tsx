import { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import ClassLeadForm from '../../components/classLeads/ClassLeadForm';
import { IClassLead, IClassLeadFormData } from '../../types';
import leadService from '../../services/leadService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';

export default function EditClassLeadPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [classLead, setClassLead] = useState<IClassLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await leadService.getClassLeadById(id as string);
        setClassLead(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load class lead');
      } finally {
        setLoading(false);
      }
    };
    if (id && id !== 'undefined') fetchLead();
  }, [id]);

  const handleSubmit = async (data: Partial<IClassLeadFormData>) => {
    try {
      setSubmitLoading(true);
      setError(null);
      await leadService.updateClassLead(id as string, data);
      setSnack({ open: true, message: 'Lead updated successfully', severity: 'success' });
      navigate(`/class-leads/${id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update lead');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen /> as any;
  if (error) return <Container maxWidth="md" sx={{ py: 3 }}><ErrorAlert error={error} /></Container>;
  if (!classLead) return null;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate('/class-leads')}>Back to List</Button>
        <Typography variant="h4">Edit Class Lead</Typography>
      </Box>
      <Card elevation={2}>
        <CardContent>
          <ClassLeadForm initialData={classLead} onSubmit={handleSubmit as any} loading={submitLoading} error={error} submitButtonText="Update Lead" />
        </CardContent>
      </Card>
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
