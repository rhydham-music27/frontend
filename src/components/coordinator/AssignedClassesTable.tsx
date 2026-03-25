import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip, 
  alpha, 
  useTheme, 
  Chip, 
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IFinalClass } from '../../types';
import { getSubjectList, getOptionLabel, getLeafSubjectList } from '../../utils/subjectUtils';
import { FINAL_CLASS_STATUS } from '../../constants';

interface AssignedClassesTableProps {
  classes: any[];
  onOpenPayments: (classId: string) => void;
  onEditClass?: (cls: any) => void;
  onViewDetails?: (classId: string) => void;
}

const AssignedClassesTable: React.FC<AssignedClassesTableProps> = ({ classes, onOpenPayments, onEditClass, onViewDetails }) => {
  const theme = useTheme();

  const getStatusChip = (status: string) => {
    let color: any = 'default';
    let label = status;

    if (status === FINAL_CLASS_STATUS.ACTIVE) color = 'success';
    else if (status === FINAL_CLASS_STATUS.COMPLETED) color = 'info';
    else if (status === FINAL_CLASS_STATUS.PAUSED) color = 'warning';
    else if (status === FINAL_CLASS_STATUS.CANCELLED) color = 'error';

    return (
      <Chip 
        label={label} 
        size="small" 
        color={color} 
        variant="filled"
        sx={{ 
          height: 24, 
          fontWeight: 800, 
          fontSize: '0.65rem', 
          textTransform: 'uppercase',
          borderRadius: '6px'
        }} 
      />
    );
  };

  return (
    <TableContainer 
      component={Paper} 
      elevation={0}
      sx={{ 
        borderRadius: '24px', 
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        background: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(12px)',
        overflow: 'hidden'
      }}
    >
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Student / Class</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Subject(s)</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tutor</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Schedule</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Progress</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {classes.map((cls) => {
            const progress = cls.sessionProgress ? parseInt(cls.sessionProgress) : 0;
            const progressColor = progress >= 80 ? 'success' : progress >= 40 ? 'primary' : 'warning';
            
            return (
              <TableRow 
                key={cls.id}
                sx={{ 
                  '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>{cls.studentName}</Typography>
                  <Typography variant="caption" color="text.secondary">{getOptionLabel(cls.grade)} / {getOptionLabel(cls.board)} / {getOptionLabel(cls.mode)}</Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {getLeafSubjectList(cls.subjects || cls.subject).map((s: string) => (
                      <Chip key={s} label={s} size="small" sx={{ height: 20, fontSize: '0.65rem', borderRadius: '4px' }} />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{cls.tutorName || 'Unassigned'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600} sx={{ display: 'block' }}>
                    {cls.schedule?.daysOfWeek?.join(', ') || ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cls.schedule?.timeSlot || 'No time set'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        color={progressColor as any}
                        sx={{ height: 6, borderRadius: 2, bgcolor: alpha(theme.palette.divider, 0.05) }}
                      />
                    </Box>
                    <Typography variant="caption" fontWeight={700}>{progress}%</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {getStatusChip(cls.status)}
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    <Tooltip title="Payments">
                      <IconButton 
                        onClick={(e) => { e.stopPropagation(); onOpenPayments(cls.id); }} 
                        size="small"
                        sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                      >
                        <PaymentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onViewDetails && (
                      <Tooltip title="View Class Details">
                        <IconButton 
                          onClick={(e) => { e.stopPropagation(); onViewDetails(cls.id || cls._id); }} 
                          size="small"
                          sx={{ color: 'info.main', bgcolor: alpha(theme.palette.info.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) } }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onEditClass && (
                      <Tooltip title="Edit Class">
                        <IconButton 
                          onClick={(e) => { e.stopPropagation(); onEditClass(cls); }} 
                          size="small"
                          sx={{ color: 'text.secondary', bgcolor: alpha(theme.palette.action.selected, 0.5), '&:hover': { bgcolor: alpha(theme.palette.action.selected, 1) } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssignedClassesTable;

