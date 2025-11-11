import { Chip, alpha } from '@mui/material';
import { CLASS_LEAD_STATUS } from '../../constants';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function ClassLeadStatusChip({ status }: { status: string }) {
  const getStatusColor = (s: string): 'default' | 'info' | 'primary' | 'secondary' | 'success' | 'error' => {
    switch (s) {
      case CLASS_LEAD_STATUS.ANNOUNCED:
        return 'info';
      case CLASS_LEAD_STATUS.DEMO_SCHEDULED:
        return 'primary';
      case CLASS_LEAD_STATUS.DEMO_COMPLETED:
        return 'secondary';
      case CLASS_LEAD_STATUS.CONVERTED:
        return 'success';
      case CLASS_LEAD_STATUS.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (t) => t.toUpperCase());

  const color = getStatusColor(status);

  return (
    <Chip 
      label={getStatusLabel(status)} 
      color={color}
      size="small"
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