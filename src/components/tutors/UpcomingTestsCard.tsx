import React, { useEffect, useState } from 'react';
import { Card, CardContent, Box, Typography, Chip, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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

  if (!tests.length) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <EmojiEventsIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No upcoming tests.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <EmojiEventsIcon color="warning" />
            <Typography variant="subtitle1" fontWeight={600}>
              Upcoming Tests
            </Typography>
          </Box>
          <Chip
            size="small"
            color="warning"
            label={`${tests.length} test${tests.length === 1 ? '' : 's'}`}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            overflowY: 'auto',
            maxHeight: 404,
            pr: 2,
            '& > *': {
              flexShrink: 0,
            },
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
              borderRadius: '10px',
              margin: '4px 0',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '10px',
              '&:hover': {
                background: '#555',
              },
            },
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
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  backgroundColor: 'grey.50',
                }}
              >
                <Box display="flex" justifyContent="space-between" gap={2} mb={0.5}>
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {studentName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(test.testDate)} • {test.testTime}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
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
