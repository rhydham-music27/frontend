import React, { useEffect, useState } from 'react';
import { Card, CardContent, Box, Typography, Chip, CircularProgress, alpha } from '@mui/material';
import { useSelector } from 'react-redux';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getTests } from '../../services/testService';
import { ITest } from '../../types';

const formatDate = (value: any) => {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const UpcomingTestsCard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [tests, setTests] = useState<ITest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTests = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const tutorId = (user as any).id || (user as any)._id;
      const res = await getTests({ tutorId, status: 'SCHEDULED', page: 1, limit: 20 });
      const data = (res.data || []) as ITest[];
      const upcoming = data
        .filter((t) => t.testDate)
        .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
        .slice(0, 5);
      setTests(upcoming);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load upcoming tests.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  if (!tests.length) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Box textAlign="center" py={5}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha('#f59e0b', 0.08),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              No upcoming tests
            </Typography>
            <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
              All caught up! ✨
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 2,
                bgcolor: alpha('#f59e0b', 0.08),
                display: 'flex',
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              Upcoming Tests
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${tests.length} test${tests.length === 1 ? '' : 's'}`}
            sx={{
              bgcolor: alpha('#f59e0b', 0.08),
              color: '#d97706',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 26,
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            overflowY: 'auto',
            maxHeight: 404,
            pr: 1,
            '& > *': { flexShrink: 0 },
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
          }}
        >
          {tests.map((test) => {
            const studentName = test.finalClass?.studentName;
            const subject = Array.isArray(test.finalClass?.subject)
              ? (test.finalClass?.subject as any[]).join(', ')
              : (test.finalClass?.subject as any) || '';
            const grade = test.finalClass?.grade;

            const key =
              (test as any).id ||
              (test as any)._id ||
              `${String(test.finalClass?._id || '')}-${String(test.testDate || '')}-${String(test.testTime || '')}`;

            return (
              <Box
                key={key}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: alpha('#f59e0b', 0.12),
                  bgcolor: alpha('#f59e0b', 0.03),
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: alpha('#f59e0b', 0.25),
                    bgcolor: alpha('#f59e0b', 0.05),
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" gap={2} mb={0.5}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {studentName}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                    <AccessTimeIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                      {formatDate(test.testDate)} • {test.testTime}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.82rem' }}>
                  {subject} • {grade}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(UpcomingTestsCard);
