import React from 'react';
import { Chip } from '@mui/material';
import { PAYMENT_STATUS } from '../../constants';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const labelMap: Record<string, string> = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PAID]: 'Paid',
  [PAYMENT_STATUS.OVERDUE]: 'Overdue',
};

const colorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [PAYMENT_STATUS.PENDING]: 'warning',
  [PAYMENT_STATUS.PAID]: 'success',
  [PAYMENT_STATUS.OVERDUE]: 'error',
};

export default function PaymentStatusChip({ status }: { status: string }) {
  const label = labelMap[status] || status;
  const color = colorMap[status] || 'default';
  
  return (
    <Chip 
      size="small" 
      label={label} 
      color={color}
      icon={<FiberManualRecordIcon sx={{ fontSize: 10 }} />}
      sx={{ 
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: '8px',
        height: 28,
        '& .MuiChip-icon': {
          ml: 1,
        },
      }} 
    />
  );
}