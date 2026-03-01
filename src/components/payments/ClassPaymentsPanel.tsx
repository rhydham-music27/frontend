import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

interface PaymentCycle {
  month: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
}

interface ClassPaymentsPanelProps {
  payments: PaymentCycle[];
  onGenerateAdvance: () => void;
  onMarkPaid: (cycleId: string) => void;
  onSendReminder: (cycleId: string) => void;
}

const ClassPaymentsPanel: React.FC<ClassPaymentsPanelProps> = ({ payments, onGenerateAdvance, onMarkPaid, onSendReminder }) => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Payments</Typography>
        <Button variant="contained" color="primary" onClick={onGenerateAdvance}>Generate Advance</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Paid Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((cycle, idx) => (
              <TableRow key={idx}>
                <TableCell>{cycle.month}</TableCell>
                <TableCell>{cycle.amount}</TableCell>
                <TableCell>{cycle.status}</TableCell>
                <TableCell>{cycle.dueDate}</TableCell>
                <TableCell>{cycle.paidDate || '-'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => onMarkPaid(String(idx))} disabled={cycle.status === 'Paid'}>Mark Paid</Button>
                  <Button size="small" onClick={() => onSendReminder(String(idx))}>Send Reminder</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClassPaymentsPanel;
