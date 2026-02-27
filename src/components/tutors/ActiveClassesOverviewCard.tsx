import React, { useEffect, useState } from 'react';
import { Card, CardContent, Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress, alpha } from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getMyClasses } from '../../services/finalClassService';
import { FINAL_CLASS_STATUS } from '../../constants';
import { IFinalClass } from '../../types';

const ActiveClassesOverviewCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [classes, setClasses] = useState<IFinalClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const tutorId = (user as any).id || (user as any)._id;
      const resp = await getMyClasses(tutorId, FINAL_CLASS_STATUS.ACTIVE, 1, 50);
      setClasses(resp.data || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load active classes.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getProgress = (cls: IFinalClass) => {
    if ((cls as any).progressPercentage != null) {
      return Math.round((cls as any).progressPercentage as number);
    }
    if (!cls.totalSessions) return 0;
    return Math.round((cls.completedSessions / cls.totalSessions) * 100);
  };

  const getProgressColor = (p: number) => {
    if (p >= 75) return '#10b981';
    if (p >= 40) return '#6366f1';
    return '#f59e0b';
  };

  const cardSx = {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'grey.100',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s',
    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  };

  if (loading) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1}>
            <ErrorOutlineIcon color="error" />
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box mb={2.5} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 2,
                bgcolor: alpha('#10b981', 0.08),
                display: 'flex',
              }}
            >
              <ClassIcon sx={{ fontSize: 20, color: '#10b981' }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              Active Classes Breakdown
            </Typography>
          </Box>
          <Chip
            label={`${classes.length} Active`}
            size="small"
            sx={{
              bgcolor: alpha('#10b981', 0.08),
              color: '#059669',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 26,
            }}
          />
        </Box>

        {/* Mobile view */}
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          {classes.length === 0 ? (
            <Box textAlign="center" py={5}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: alpha('#10b981', 0.08),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <MenuBookIcon sx={{ fontSize: 24, color: '#10b981' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                No active classes found
              </Typography>
            </Box>
          ) : (
            classes.map((cls) => {
              const progress = getProgress(cls);
              const pColor = getProgressColor(progress);
              const coordinatorName = (cls.coordinator as any)?.name || 'Not Assigned';
              const subjects = (cls.subject || []).join(', ');
              return (
                <Box
                  key={cls.id}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: alpha(pColor, 0.12),
                    bgcolor: alpha(pColor, 0.02),
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: alpha(pColor, 0.25),
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{cls.studentName}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {subjects} • Grade {cls.grade}
                      </Typography>
                    </Box>
                    <Chip
                      label={cls.status}
                      size="small"
                      sx={{
                        bgcolor: alpha('#10b981', 0.08),
                        color: '#059669',
                        textTransform: 'capitalize',
                        fontSize: '0.62rem',
                        height: 20,
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Box mb={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Progress</Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color: pColor }}>{progress}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: alpha(pColor, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: pColor,
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>Coordinator</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{coordinatorName}</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>Sessions</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>{cls.completedSessions} / {cls.totalSessions}</Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {/* Desktop table view */}
        <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {['Student & Class', 'Status', 'Progress', 'Coordinator', 'Sessions'].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i === 4 ? 'right' : 'left'}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: 'text.secondary',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      borderBottom: '2px solid',
                      borderColor: 'grey.100',
                      py: 1.5,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">No active classes found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => {
                  const progress = getProgress(cls);
                  const pColor = getProgressColor(progress);
                  const coordinatorName = (cls.coordinator as any)?.name || 'Not Assigned';
                  return (
                    <TableRow
                      key={cls.id}
                      sx={{
                        '&:hover': { bgcolor: alpha('#6366f1', 0.02) },
                        transition: 'background 0.2s',
                        '& td': { borderColor: 'grey.50' },
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.88rem' }}>{cls.studentName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(cls.subject || []).join(', ')} • Grade {cls.grade}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cls.status}
                          size="small"
                          sx={{
                            bgcolor: alpha('#10b981', 0.08),
                            color: '#059669',
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ width: 200 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{
                                height: 5,
                                borderRadius: 3,
                                bgcolor: alpha(pColor, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: pColor,
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight={700} sx={{ color: pColor, minWidth: 30 }}>
                            {progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{coordinatorName}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                          {cls.completedSessions} / {cls.totalSessions}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default React.memo(ActiveClassesOverviewCard);
