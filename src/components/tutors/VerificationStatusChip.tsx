import React from 'react';
import { Chip } from '@mui/material';
import { VERIFICATION_STATUS } from '../../constants';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const labelMap: Record<string, string> = {
  [VERIFICATION_STATUS.PENDING]: 'Pending',
  [VERIFICATION_STATUS.UNDER_REVIEW]: 'Under Review',
  [VERIFICATION_STATUS.VERIFIED]: 'Verified',
  [VERIFICATION_STATUS.REJECTED]: 'Rejected',
};

const colorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [VERIFICATION_STATUS.PENDING]: 'default',
  [VERIFICATION_STATUS.UNDER_REVIEW]: 'info',
  [VERIFICATION_STATUS.VERIFIED]: 'success',
  [VERIFICATION_STATUS.REJECTED]: 'error',
};

export default function VerificationStatusChip({ status }: { status: string }) {
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