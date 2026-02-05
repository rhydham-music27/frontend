import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid2,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
  TextField,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getMyPaymentSummary } from '../../services/paymentService';
import { IPayment } from '../../types';

const PaymentsEarningsCard: React.FC = () => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await getMyPaymentSummary();
        setPayments(res.data.payments || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const stats = useMemo(() => {
    const total = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const paid = payments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingArr = payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE');
    const pending = pendingArr.reduce((acc, p) => acc + (p.amount || 0), 0);
    return { total, paid, pending, pendingCount: pendingArr.length };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let list = payments;
    if (selectedMonth) {
        list = list.filter(p => p.createdAt && new Date(p.createdAt).toISOString().slice(0, 7) === selectedMonth);
    }
    if (currentTab === 1) return list.filter(p => p.status === 'PAID');
    if (currentTab === 2) return list.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE');
    return list;
  }, [payments, currentTab, selectedMonth]);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Box p={2}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box>
      <Grid2 container spacing={3} mb={4}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Earnings</Typography>
                  <Typography variant="h4" fontWeight={700}>₹{stats.total.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'success.main', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CheckCircleIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Received</Typography>
                  <Typography variant="h4" fontWeight={700}>₹{stats.paid.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <PendingActionsIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Pending Payouts</Typography>
                  <Typography variant="h4" fontWeight={700}>₹{stats.pending.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Tabs value={currentTab} onChange={(_e, v) => setCurrentTab(v)}>
                    <Tab label="All Payments" />
                    <Tab label="Paid" />
                    <Tab label="Pending" />
                </Tabs>
                <TextField
                    type="month"
                    size="small"
                    label="Filter Month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    sx={{ width: 170 }}
                />
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Service Date / Class</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPayments.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center"><Typography color="text.secondary">No records found.</Typography></TableCell></TableRow>
                        ) : (
                            filteredPayments.map((p) => (
                                <TableRow key={p.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {p.attendanceSheet?.periodLabel 
                                                ? `Monthly: ${p.attendanceSheet.periodLabel}` 
                                                : new Date(p.createdAt).toLocaleDateString()
                                            }
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">{(p.finalClass as any)?.className || 'Class'}</Typography>
                                    </TableCell>
                                    <TableCell><Typography fontWeight={600}>₹{p.amount?.toLocaleString()}</Typography></TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={p.status} 
                                            size="small" 
                                            color={p.status === 'PAID' ? 'success' : (p.status === 'OVERDUE' ? 'error' : 'warning')} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">{p.transactionId || '---'}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentsEarningsCard;
