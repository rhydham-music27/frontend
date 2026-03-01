import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, CircularProgress, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import paymentService from '../../services/paymentService';

const CoordinatorPaymentsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await paymentService.getPaymentsByClass(classId);
      if (res.success) {
        setPayments(res.data.payments || []);
        setStatistics(res.data.statistics || {});
      } else setError(res.message || 'Failed to load payments');
    } catch (e: any) {
      setError(e?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [classId]);

  if (loading) return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Payments — Class {classId}</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total Payments</Typography>
              <Typography variant="h6">{statistics?.totalAmount ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Pending</Typography>
              <Typography variant="h6">{statistics?.pendingCount ?? payments.filter(p => p.status === 'PENDING').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Overdue</Typography>
              <Typography variant="h6">{statistics?.overdueCount ?? payments.filter(p => p.isOverdue).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.createdAt || p.date || Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell>{p.amount} {p.currency || ''}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => paymentService.downloadPaymentReceipt(p.id)}>Receipt</Button>
                      <Button size="small" onClick={() => paymentService.sendPaymentReminder(p.id)} sx={{ ml: 1 }}>Remind</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CoordinatorPaymentsPage;
