import { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardContent, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ClassLeadForm from '../../components/classLeads/ClassLeadForm';
import { IClassLeadFormData } from '../../types';
import leadService from '../../services/leadService';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { usePermissionCheck } from '../../hooks/useManagerPermissions';
import useAuth from '../../hooks/useAuth';
import PermissionDeniedDialog from '../../components/common/PermissionDeniedDialog';
import ErrorDialog from '../../components/common/ErrorDialog';
import { useErrorDialog } from '../../hooks/useErrorDialog';

export default function CreateClassLeadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { error, showError, clearError, handleError } = useErrorDialog();
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const { isAuthorized, errorMessage } = usePermissionCheck('canCreateLeads');

  useEffect(() => {
    // Show permission dialog on page load if manager doesn't have permission
    if (user?.role === 'MANAGER' && !isAuthorized) {
      setShowPermissionDialog(true);
    }
  }, [user?.role, isAuthorized]);

  const handleSubmit = async (data: IClassLeadFormData) => {
    if (!isAuthorized) {
      setShowPermissionDialog(true);
      return;
    }

    try {
      setLoading(true);
      const res = await leadService.createClassLead(data);
      setSnack({ open: true, message: 'Lead created successfully', severity: 'success' });
      const createdId = (res as any)?.data?.id || (res as any)?.data?._id;
      if (createdId) {
        navigate(`/class-leads/${createdId}`);
      } else {
        navigate('/class-leads');
      }
    } catch (e: any) {
      handleError(e);
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
          <ClassLeadForm onSubmit={handleSubmit} loading={loading} submitButtonText="Create Lead" />
        </CardContent>
      </Card>
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
      <ErrorDialog
        open={showError}
        onClose={clearError}
        error={error}
        title="Unable to Create Lead"
      />
      <PermissionDeniedDialog 
        open={showPermissionDialog} 
        onClose={() => setShowPermissionDialog(false)}
        message={errorMessage || 'You do not have permission to create leads.'}
        navigateOnClose={true}
      />
    </Container>
  );
}
