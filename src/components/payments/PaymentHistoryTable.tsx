import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import PaymentStatusChip from './PaymentStatusChip';
import { IPayment } from '../../types';

interface Props {
  payments: IPayment[];
  showTutor?: boolean;
  showClass?: boolean;
}

const fmt = (d?: Date) => (d ? new Date(d).toLocaleDateString() : '-');
const fmtCurrency = (amount: number, currency: string) => new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

export default function PaymentHistoryTable({ payments, showTutor = true, showClass = true }: Props) {
  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            {showTutor && <TableCell>Tutor</TableCell>}
            {showClass && <TableCell>Class</TableCell>}
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Payment Method</TableCell>
            <TableCell>Transaction ID</TableCell>
            <TableCell>Due Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography color="text.secondary">No payment records found.</Typography>
              </TableCell>
            </TableRow>
          )}
          {payments.map((p) => (
            <TableRow key={p.id} hover>
              <TableCell>{fmt(p.paymentDate || p.createdAt)}</TableCell>
              {showTutor && <TableCell>{p.tutor?.name}</TableCell>}
              {showClass && <TableCell>{p.finalClass?.studentName} • {(p.finalClass?.subject || []).join(', ')}</TableCell>}
              <TableCell>{fmtCurrency(p.amount, p.currency)}</TableCell>
              <TableCell><PaymentStatusChip status={p.status} /></TableCell>
              <TableCell>{p.paymentMethod || '-'}</TableCell>
              <TableCell>{p.transactionId || '-'}</TableCell>
              <TableCell>{fmt(p.dueDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
