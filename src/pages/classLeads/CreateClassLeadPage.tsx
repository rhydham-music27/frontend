import { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
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
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Page Header */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mb={3}
        sx={{
          pb: 2.5,
          borderBottom: '1px solid',
          borderColor: 'grey.100',
        }}
      >
        <IconButton
          onClick={() => navigate('/class-leads')}
          sx={{
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200',
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box flex={1}>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            Create New Lead
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the details below to register a new class lead
          </Typography>
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: 'primary.main',
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AddIcon sx={{ color: 'common.white' }} />
        </Box>
      </Box>

      <ClassLeadForm onSubmit={handleSubmit} loading={loading} submitButtonText="Create Lead" />

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
