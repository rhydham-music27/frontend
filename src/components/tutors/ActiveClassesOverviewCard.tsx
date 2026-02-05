import React, { useEffect, useState } from 'react';
import { Card, CardContent, Box, Typography,  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress } from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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

  if (loading) {
    return (
      <Card sx={{ borderRadius: 4 }}>
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
      <Card sx={{ borderRadius: 4 }}>
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
    <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
      <CardContent>
        <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <ClassIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Active Classes Breakdown
            </Typography>
          </Box>
          <Chip label={`${classes.length} Active`} color="primary" variant="outlined" size="small" />
        </Box>

        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          {classes.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">No active classes found.</Typography>
            </Box>
          ) : (
            classes.map((cls) => {
              const progress = getProgress(cls);
              const coordinatorName = (cls.coordinator as any)?.name || 'Not Assigned';
              const subjects = (cls.subject || []).join(', ');
              return (
                <Box 
                  key={cls.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 3, 
                    border: '1px solid', 
                    borderColor: 'grey.100',
                    bgcolor: 'grey.50'
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
                        color="success" 
                        variant="filled"
                        sx={{ textTransform: 'capitalize', fontSize: '0.65rem', height: 20 }}
                    />
                  </Box>
                  
                  <Box mb={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Progress</Typography>
                      <Typography variant="caption" fontWeight={700}>{progress}%</Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.200' }}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Coordinator</Typography>
                      <Typography variant="body2" fontWeight={600}>{coordinatorName}</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Sessions</Typography>
                      <Typography variant="body2" fontWeight={700}>{cls.completedSessions} / {cls.totalSessions}</Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student & Class</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Coordinator</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Sessions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No active classes found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => {
                  const progress = getProgress(cls);
                  const coordinatorName = (cls.coordinator as any)?.name || 'Not Assigned';
                  return (
                    <TableRow key={cls.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>{cls.studentName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(cls.subject || []).join(', ')} • Grade {cls.grade}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                            label={cls.status} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell sx={{ width: 200 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight={600}>{progress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{coordinatorName}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
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
