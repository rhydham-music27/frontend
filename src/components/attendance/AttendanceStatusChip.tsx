import React from 'react';
import { Chip } from '@mui/material';
import { ATTENDANCE_STATUS } from '../../constants';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const labelMap: Record<string, string> = {
  [ATTENDANCE_STATUS.PENDING]: 'Pending',
  [ATTENDANCE_STATUS.COORDINATOR_APPROVED]: 'Coordinator Approved',
  [ATTENDANCE_STATUS.PARENT_APPROVED]: 'Parent Approved',
  [ATTENDANCE_STATUS.REJECTED]: 'Rejected',
};

const colorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [ATTENDANCE_STATUS.PENDING]: 'warning',
  [ATTENDANCE_STATUS.COORDINATOR_APPROVED]: 'info',
  [ATTENDANCE_STATUS.PARENT_APPROVED]: 'success',
  [ATTENDANCE_STATUS.REJECTED]: 'error',
};

export default function AttendanceStatusChip({ status }: { status: string }) {
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