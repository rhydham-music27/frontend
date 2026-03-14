import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Grow,
  Fade,
  Avatar,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getAllAttendanceSheets, approveAttendanceSheet, rejectAttendanceSheet } from '../../services/coordinatorService';
import AttendanceSheetReviewModal from '../../components/coordinator/AttendanceSheetReviewModal';

const AttendanceSheetApprovalsPage: React.FC = () => {
  const theme = useTheme();
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSheets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllAttendanceSheets();
      if (response.success) {
        setSheets(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch attendance sheets');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching sheets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const handleReview = (sheet: any) => {
    setSelectedSheet(sheet);
    setModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await approveAttendanceSheet(id);
      if (response.success) {
        fetchSheets();
      } else {
        alert(response.message || 'Approval failed');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during approval');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const response = await rejectAttendanceSheet(id, reason);
      if (response.success) {
        fetchSheets();
      } else {
        alert(response.message || 'Rejection failed');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during rejection');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Chip 
            label="Approved" 
            color="success" 
            size="small" 
            sx={{ fontWeight: 800, borderRadius: '6px', textTransform: 'uppercase', fontSize: '0.65rem' }} 
          />
        );
      case 'PENDING':
        return (
          <Chip 
            label="Pending" 
            color="warning" 
            size="small" 
            sx={{ fontWeight: 800, borderRadius: '6px', textTransform: 'uppercase', fontSize: '0.65rem' }} 
          />
        );
      case 'REJECTED':
        return (
          <Chip 
            label="Rejected" 
            color="error" 
            size="small" 
            sx={{ fontWeight: 800, borderRadius: '6px', textTransform: 'uppercase', fontSize: '0.65rem' }} 
          />
        );
      default:
        return (
          <Chip 
            label={status} 
            size="small" 
            sx={{ fontWeight: 800, borderRadius: '6px', textTransform: 'uppercase', fontSize: '0.65rem' }} 
          />
        );
    }
  };

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Container maxWidth="xl" sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: isDarkMode 
            ? 'linear-gradient(225deg, #4338CA 0%, #111827 100%)' 
            : 'linear-gradient(225deg, #4F46E5 0%, #3730A3 100%)',
          color: 'white',
          pt: { xs: 5, md: 7 },
          pb: { xs: 10, md: 12 },
          px: { xs: 3, md: 5 },
          borderRadius: { xs: 0, md: '32px' },
          mt: 3,
          mb: -6,
          overflow: 'hidden',
          boxShadow: '0 20px 40px -20px rgba(79, 70, 229, 0.4)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            zIndex: 0
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ maxWidth: '600px' }}>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.03em' }}>
              Attendance Approvals
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, mb: 4, lineHeight: 1.5 }}>
              Review submitted attendance sheets and authorize payouts for your assigned tutors.
            </Typography>
            
            <Box display="flex" gap={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: alpha('#fff', 0.1), px: 2, py: 1, borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                <HistoryEduIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" fontWeight={700}>
                  {sheets.filter(s => s.status === 'PENDING').length} Pending Review
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box display="flex" gap={2}>
            <Tooltip title="Refresh Sheets">
              <IconButton 
                onClick={fetchSheets} 
                disabled={loading}
                sx={{ 
                  color: 'white', 
                  bgcolor: alpha('#fff', 0.1), 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#fff', 0.2),
                  '&:hover': { bgcolor: alpha('#fff', 0.2) } 
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ position: 'relative', zIndex: 2, px: { xs: 0, md: 5 } }}>
        <Fade in timeout={800}>
          <Box>
            {error && (
              <Alert severity="error" variant="filled" sx={{ mb: 4, borderRadius: '16px' }}>
                {error}
              </Alert>
            )}

            {loading && sheets.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={10}>
                <CircularProgress thickness={5} size={60} />
              </Box>
            ) : sheets.length === 0 ? (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: '32px',
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.1)
                }}
              >
                <Avatar sx={{ width: 80, height: 80, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 3, mx: 'auto' }}>
                  <HistoryEduIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  No Sheets to Review
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Everything is up to date! New attendance sheets will appear here once tutors submit them.
                </Typography>
              </Paper>
            ) : (
              <TableContainer 
                component={Paper} 
                elevation={0}
                sx={{ 
                  borderRadius: '24px', 
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.1),
                  background: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(12px)',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)'
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 2.5 }}>Class / Student</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 2.5 }}>Cycle Details</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 2.5 }}>Sessions</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 2.5 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 2.5 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sheets.map((sheet, index) => (
                      <Grow in timeout={500 + index * 100} key={sheet._id}>
                        <TableRow 
                          hover
                          sx={{ 
                            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                              {sheet.finalClass?.className || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              {sheet.finalClass?.studentName || 'Unknown Student'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>{sheet.periodLabel}</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              Cycle #{sheet.cycleNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${sheet.totalSessionsTaken || 0} Sessions`} 
                              size="small" 
                              sx={{ 
                                fontWeight: 800, 
                                borderRadius: '6px', 
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                border: 'none'
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            {getStatusChip(sheet.status)}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Review Full Sheet">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleReview(sheet)}
                                  sx={{ 
                                    color: 'primary.main', 
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } 
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {String(sheet.status) === 'PENDING' && (
                                <>
                                  <Tooltip title="Approve & Payout">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={async () => {
                                        if (window.confirm('Approve this sheet and create a one-time payout for sessions recorded so far?')) {
                                          await handleApprove(sheet._id);
                                        }
                                      }}
                                      sx={{ 
                                        bgcolor: alpha(theme.palette.success.main, 0.08),
                                        '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) } 
                                      }}
                                    >
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject Sheet">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={async () => {
                                        const reason = window.prompt('Enter rejection reason:');
                                        if (reason && reason.trim()) {
                                          await handleReject(sheet._id, reason);
                                        }
                                      }}
                                      sx={{ 
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) } 
                                      }}
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Grow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Fade>
      </Box>

      <AttendanceSheetReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sheet={selectedSheet}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Container>
  );
};

export default AttendanceSheetApprovalsPage;
