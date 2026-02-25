import { useEffect, useState } from 'react';
import { Container, Box, Typography, IconButton, TextField, MenuItem, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useParams } from 'react-router-dom';
import ClassLeadForm from '../../components/classLeads/ClassLeadForm';
import { IClassLead, IClassLeadFormData } from '../../types';
import leadService from '../../services/leadService';
import { CLASS_LEAD_STATUS } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDialog from '../../components/common/ErrorDialog';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { useErrorDialog } from '../../hooks/useErrorDialog';

export default function EditClassLeadPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [classLead, setClassLead] = useState<IClassLead | null>(null);
  const [loading, setLoading] = useState(true);
  const { error, showError, clearError, handleError } = useErrorDialog();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const res = await leadService.getClassLeadById(id as string);
        setClassLead(res.data);
        setStatus(res.data.status);
      } catch (e: any) {
        handleError(e);
      } finally {
        setLoading(false);
      }
    };
    if (id && id !== 'undefined') fetchLead();
  }, [id]);

  const handleSubmit = async (data: Partial<IClassLeadFormData>) => {
    try {
      setSubmitLoading(true);
      await leadService.updateClassLead(id as string, data);
      if (classLead && status && status !== classLead.status) {
        await leadService.updateClassLeadStatus(id as string, status);
      }
      setSnack({ open: true, message: 'Lead updated successfully', severity: 'success' });
      navigate(`/class-leads/${id}`);
    } catch (e: any) {
      handleError(e);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen /> as any;
  if (!classLead) return null;

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
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Edit Lead
            </Typography>
            {classLead?.studentName && (
              <Chip
                label={classLead.studentName}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: '8px' }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Update lead details and status
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
          <EditIcon sx={{ color: 'common.white', fontSize: 20 }} />
        </Box>
      </Box>

      {/* Status Selector - pulled into header area */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2.5,
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.100',
        }}
      >
        <TextField
          select
          label="Lead Status"
          fullWidth
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
            },
          }}
        >
          {Object.values(CLASS_LEAD_STATUS).map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
      </Box>

      <ClassLeadForm initialData={classLead} onSubmit={handleSubmit as any} loading={submitLoading} submitButtonText="Update Lead" />

      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
      <ErrorDialog
        open={showError}
        onClose={clearError}
        error={error}
        title="Unable to Load Lead"
      />
    </Container>
  );
}
