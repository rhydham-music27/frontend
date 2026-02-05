import { useEffect, useMemo, useState } from 'react';
import { 
  Container,
  Box, 
  Typography, 
  Grid, 
  TextField, 
  MenuItem, 
  Button, 
  Stack, 
  Divider, 
  Autocomplete, 
  Tabs, 
  Tab, 
  Paper,
  InputAdornment,
  alpha,
  useTheme
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import PaymentStatusChip from '../../components/payments/PaymentStatusChip';
import PaymentUpdateModal from '../../components/payments/PaymentUpdateModal';
import CreatePaymentModal from '../../components/payments/CreatePaymentModal';
import usePayments from '../../hooks/usePayments';
import { getPaymentFilters, createManualPayment } from '../../services/paymentService';
import { IPayment } from '../../types';
import { useOptions } from '../../hooks/useOptions';
import { PAYMENT_TYPE } from '../../constants';
// Icons
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';

export default function PaymentsListPage() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [filters, setFilters] = useState<{ status?: string; tutorId?: string; finalClassId?: string; fromDate?: string; toDate?: string; page: number; limit: number; paymentType?: string }>({ page: 1, limit: 10, paymentType: PAYMENT_TYPE.FEES_COLLECTED });
  const { payments, loading, error, pagination, updateStatus, statistics, fetchStatistics, refetch } = usePayments(filters);
  const { options: paymentStatusOptions } = useOptions('PAYMENT_STATUS');
  
  const [selected, setSelected] = useState<IPayment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [classOptions, setClassOptions] = useState<{ _id: string; label: string }[]>([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    getPaymentFilters().then((res) => {
      if (res.data?.classes) setClassOptions(res.data.classes);
    }).catch(console.error);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    let type = PAYMENT_TYPE.FEES_COLLECTED as string;
    if (newValue === 1) type = PAYMENT_TYPE.TUTOR_PAYOUT;
    if (newValue === 2) type = PAYMENT_TYPE.MISCELLANEOUS;
    
    setFilters(prev => ({
      ...prev,
      page: 1,
      paymentType: type,
    }));
  };

  useEffect(() => {
    fetchStatistics({ fromDate: filters.fromDate, toDate: filters.toDate, tutorId: filters.tutorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.fromDate, filters.toDate, filters.tutorId]);

  const handleUpdateClick = (p: IPayment) => { setSelected(p); setModalOpen(true); };
  
  const handleUpdateSubmit = async (payload: { status: string; paymentMethod?: string; transactionId?: string; notes?: string }) => {
    if (!selected) return;
    try {
        const paymentId = selected.id || (selected as any)._id;
        await updateStatus(paymentId, payload);
        setSnack({ open: true, message: 'Payment updated', severity: 'success' });
        setModalOpen(false);
        setSelected(null);
    } catch(e: any) {
        setSnack({ open: true, message: e.message || 'Update failed', severity: 'error' });
    }
  };

  const handleCreateSubmit = async (payload: any) => {
    try {
      await createManualPayment(payload);
      setSnack({ open: true, message: 'Payment created successfully', severity: 'success' });
      setFilters(f => ({ ...f, page: 1 })); // Refresh list
      fetchStatistics({ fromDate: filters.fromDate, toDate: filters.toDate, tutorId: filters.tutorId });
    } catch (e: any) {
      throw e; // Modal will handle error display
    }
  };

  const handleRefresh = () => {
    refetch();
    fetchStatistics({ fromDate: filters.fromDate, toDate: filters.toDate, tutorId: filters.tutorId });
  };

  // Precompute display-friendly fields for the desktop DataGrid
  const tableRows = useMemo(() => {
    return payments.map((p: IPayment | any) => {
      const fc = p.finalClass || {};
      const name = fc.className || fc.studentName || '-';
      const subject = Array.isArray(fc.subject)
        ? fc.subject.join(', ')
        : (fc.subject || '');
      
      let classLabel = subject ? `${name} • ${subject}` : name;
      
      // If payment is for a monthly sheet, append the period
      if (p.attendanceSheet?.periodLabel) {
        classLabel = `${classLabel} (${p.attendanceSheet.periodLabel})`;
      }

      const dateRaw = p.paymentDate || p.dueDate || p.createdAt;
      const dateLabel = dateRaw ? new Date(dateRaw).toLocaleDateString() : '-';

      const tutorLabel = p.tutor?.name || p.tutorName || p.tutorEmail || 'General';
      const amountLabel = typeof p.amount === 'number' ? `${p.currency || 'INR'} ${p.amount}` : '-';

      const dueRaw = p.dueDate;
      const dueLabel = dueRaw ? new Date(dueRaw).toLocaleDateString() : '-';

      return {
        ...p,
        dateDisplay: dateLabel,
        tutorDisplay: tutorLabel,
        classDisplay: classLabel,
        amountDisplay: amountLabel,
        dueDisplay: dueLabel,
      };
    });
  }, [payments]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'dateDisplay',
      headerName: 'Date',
      width: 140,
      renderCell: (p) => <Typography variant="body2" fontWeight={500}>{p.value}</Typography>
    },
    {
      field: 'tutorDisplay',
      headerName: 'Tutor',
      width: 180,
    },
    {
      field: 'classDisplay',
      headerName: 'Class',
      width: 220,
      renderCell: (p) => <Typography variant="body2" noWrap title={p.value} sx={{ maxWidth: 200 }}>{p.value}</Typography>
    },
    {
      field: 'amountDisplay',
      headerName: 'Amount',
      width: 140,
      renderCell: (p) => <Typography variant="body2" fontWeight={700} color={p.row.paymentType === PAYMENT_TYPE.FEES_COLLECTED ? 'success.main' : 'error.main'}>{p.value}</Typography>
    },
    { field: 'status', headerName: 'Status', width: 140, renderCell: (p: any) => <PaymentStatusChip status={p?.value} paymentType={p?.row?.paymentType} /> },
    { field: 'paymentMethod', headerName: 'Method', width: 140 },
    { field: 'transactionId', headerName: 'Txn ID', width: 160 },
    { field: 'notes', headerName: 'Notes', width: 200, renderCell: (p) => <Typography variant="body2" noWrap title={p.value}>{p.value || '-'}</Typography> },
    {
      field: 'dueDisplay',
      headerName: 'Due',
      width: 140,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (p: any) => (
        <Button size="small" variant="text" startIcon={<EditIcon />} onClick={() => p?.row && handleUpdateClick(p.row)}>Edit</Button>
      ),
    },
  ], []);


  return (
    <Container maxWidth="xl" sx={{ pb: 5 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #00695C 0%, #004D40 100%)',
          color: 'white',
          pt: { xs: 4, md: 5 },
          pb: 0,
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mt: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, mb: 2 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Financial Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
             Overview of fees collected, tutor payouts, and transaction history.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ position: { md: 'absolute' }, top: 40, right: 32, zIndex: 1, mb: { xs: 2, md: 0 } }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ 
              color: 'white', 
              borderColor: alpha('#fff', 0.5),
              fontWeight: 700,
              '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) }
            }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{ 
              bgcolor: 'white', 
              color: '#004D40',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: alpha('#fff', 0.9) }
            }}
          >
            Create Payment
          </Button>
        </Stack>

        {/* Quick Stats Bar */}
        <Grid container spacing={2} sx={{ position: 'relative', zIndex: 1, mt: 4, mb: 1 }}>
          {[
            { label: 'Monthly fees collected', value: statistics?.monthly?.feesCollected, color: '#4caf50' },
            { label: 'Monthly tutor payout', value: statistics?.monthly?.tutorPayouts, color: '#f44336' },
            { label: 'Monthly service charge', value: statistics?.monthly?.serviceCharge, color: '#03a9f4' },
            { label: 'Miscellaneous expenses', value: statistics?.miscellaneous, color: '#ff9800' },
            { label: 'Net profit', value: statistics?.netProfit, color: '#ffffff', isProfit: true },
          ].map((stat, i) => (
            <Grid item xs={6} sm={4} md={2.4} key={i}>
              <Box sx={{ 
                bgcolor: stat.isProfit ? 'rgba(255,255,255,0.15)' : 'transparent',
                p: 1.5, 
                borderRadius: 2,
                border: stat.isProfit ? '1px solid rgba(255,255,255,0.3)' : 'none'
              }}>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>{stat.label}</Typography>
                <Typography variant="h6" fontWeight={700}>₹{stat.value?.toLocaleString() ?? '0'}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Tabs Integrated in Hero */}
        <Box sx={{ position: 'relative', zIndex: 1, mt: 2 }}>
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange}
             sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                minWidth: 'auto',
                px: 3,
                pb: 2,
              },
              '& .Mui-selected': { color: '#fff !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 4, borderRadius: '4px 4px 0 0' }
            }}
          >
            <Tab icon={<CallReceivedIcon fontSize="small" />} iconPosition="start" label="Received (Fees)" />
            <Tab icon={<CallMadeIcon fontSize="small" />} iconPosition="start" label="Sent (Payouts)" />
            <Tab icon={<DescriptionIcon fontSize="small" />} iconPosition="start" label="Miscellaneous" />
          </Tabs>
        </Box>

         {/* Background Shapes */}
         <Box sx={{
          position: 'absolute',
          top: -30, right: -30,
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>



      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
             <TextField 
               select 
               fullWidth
               label="Status" 
               size="small" 
               value={filters.status || ''} 
               onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))}
               InputProps={{
                 startAdornment: <InputAdornment position="start"><FilterListIcon fontSize="small" /></InputAdornment>
               }}
             >
                <MenuItem value="">All Statuses</MenuItem>
                {paymentStatusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={classOptions}
              getOptionLabel={(option) => option.label}
              value={classOptions.find((c) => c._id === filters.finalClassId) || null}
              onChange={(_, newVal) => setFilters((f) => ({ ...f, finalClassId: newVal?._id, page: 1 }))}
              renderInput={(params) => <TextField {...params} label="Filter by Class" size="small" InputProps={{ ...params.InputProps, startAdornment: <><InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>{params.InputProps.startAdornment}</> }} />}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField type="date" fullWidth label="From Date" size="small" InputLabelProps={{ shrink: true }} value={filters.fromDate || ''} onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value || undefined, page: 1 }))} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField type="date" fullWidth label="To Date" size="small" InputLabelProps={{ shrink: true }} value={filters.toDate || ''} onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value || undefined, page: 1 }))} />
          </Grid>
          <Grid item xs={12} md={2} display="flex" justifyContent="flex-end">
             <Button variant="outlined" color="inherit" fullWidth onClick={() => setFilters({ page: 1, limit: 10 })}>Reset</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* DataGrid */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}><LoadingSpinner /></Box>
        ) : isXs ? (
          <Stack spacing={0} divider={<Divider />}>
            {payments.map((p: IPayment | any) => (
              <Box key={(p as any).id || (p as any)._id} p={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={600}>{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</Typography>
                    <PaymentStatusChip status={p.status} paymentType={p.paymentType} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                     <Box>
                       <Typography variant="body2" color="text.secondary">{p.finalClass?.studentName || (p.tutor?.name ? `Tutor: ${p.tutor.name}` : 'General')}</Typography>
                       <Typography variant="caption" color="text.secondary">{(p.finalClass?.subject || []).join(', ') || p.paymentType}</Typography>
                     </Box>
                     <Typography variant="h6" color={p.paymentType === PAYMENT_TYPE.FEES_COLLECTED ? 'success.main' : 'error.main'}>
                        {p.currency} {p.amount}
                     </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                     <Typography variant="caption" sx={{ bgcolor: alpha(theme.palette.common.black, 0.05), px: 1, py: 0.5, borderRadius: 1 }}>{p.transactionId || 'No Txn ID'}</Typography>
                     <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => handleUpdateClick(p)}>Edit</Button>
                  </Box>
                  {p.notes && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>Note: {p.notes}</Typography>
                    </Box>
                  )}
              </Box>
            ))}
          </Stack>
        ) : (
          <DataGrid
            rows={tableRows}
            columns={columns}
            getRowId={(r: any) => r.id || r._id}
            paginationMode="server"
            rowCount={pagination.total}
            pageSizeOptions={[filters.limit]}
            initialState={{ pagination: { paginationModel: { pageSize: filters.limit, page: filters.page - 1 } } }}
            onPaginationModelChange={(m: any) => setFilters((prev) => ({ ...prev, page: (m.page || 0) + 1 }))}
            disableRowSelectionOnClick
            autoHeight
            sx={{ 
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                fontWeight: 700,
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }
            }}
          />
        )}
        <ErrorAlert error={error} />
      </Paper>

      <PaymentUpdateModal open={modalOpen} onClose={() => setModalOpen(false)} payment={selected} onUpdate={handleUpdateSubmit} />
      <CreatePaymentModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateSubmit} />
      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
