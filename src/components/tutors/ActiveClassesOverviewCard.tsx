import React, { useEffect, useState } from 'react';
import { Card, CardContent, Box, Typography, Grid2, LinearProgress, CircularProgress } from '@mui/material';
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
      <Card>
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
      <Card>
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

  if (!classes.length) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <ClassIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No active classes at the moment.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box mb={2} display="flex" alignItems="center" gap={1.5}>
          <ClassIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Active Classes Overview
          </Typography>
        </Box>

        <Grid2 container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          {classes.map((cls) => {
            const progress = getProgress(cls);
            const subjects = Array.isArray(cls.subject) ? cls.subject.join(', ') : (cls.subject as any) || '';

            return (
              <Grid2 key={cls.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  sx={{
                    borderRadius: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    background: 'linear-gradient(135deg, #0f172a, #020617)',
                    color: 'common.white',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: 'rgba(255,255,255,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ClassIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box minWidth={0}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {cls.studentName}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }} noWrap>
                        {subjects} • {cls.grade}
                      </Typography>
                    </Box>
                  </Box>

                  <Box mb={1} display="flex" justifyContent="space-between">
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Progress
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 6,
                      borderRadius: 999,
                      backgroundColor: 'rgba(148,163,184,0.4)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        backgroundColor: '#4ade80',
                      },
                    }}
                  />

                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.75 }}>
                    {cls.completedSessions}/{cls.totalSessions} sessions
                  </Typography>
                </Box>
              </Grid2>
            );
          })}
        </Grid2>
      </CardContent>
    </Card>
  );
};

export default React.memo(ActiveClassesOverviewCard);
