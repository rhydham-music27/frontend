import { Chip } from '@mui/material';
import { PAYMENT_STATUS, PAYMENT_TYPE } from '../../constants';
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

export default function PaymentStatusChip({ status, paymentType }: { status: string; paymentType?: string }) {
  let label = labelMap[status] || status;
  const isPayout = paymentType === PAYMENT_TYPE.TUTOR_PAYOUT;
  
  if (status === PAYMENT_STATUS.PAID) {
    label = isPayout ? 'Payout Sent' : 'Fees Received';
  } else if (status === PAYMENT_STATUS.PENDING) {
    label = isPayout ? 'Pending Payout' : 'Pending Fee';
  } else if (status === PAYMENT_STATUS.OVERDUE) {
    label = isPayout ? 'Payout Overdue' : 'Fee Overdue';
  }

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