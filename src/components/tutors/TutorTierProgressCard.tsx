import React from 'react';
import { Box, Paper, Typography, LinearProgress, Chip, alpha } from '@mui/material';
import { Trophy, Star, TrendingUp, Award, Zap } from 'lucide-react';
import { ITutor } from '../../types';

interface TutorTierProgressCardProps {
  tutor: ITutor;
}

const TutorTierProgressCard: React.FC<TutorTierProgressCardProps> = ({ tutor }) => {
  const currentHours = tutor.experienceHours || 0;

  let hoursNeeded = 0;
  let progress = 0;
  let currentTierName = 'Bronze';
  let nextTierName = 'Silver';
  let tierColor = '#cd7f32';
  let nextTierColor = '#c0c0c0';
  let tierGradient = 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)';
  let tierEmoji = '🥉';
  let bgGradient = 'linear-gradient(135deg, rgba(205,127,50,0.04) 0%, rgba(205,127,50,0.01) 100%)';

  if (currentHours < 300) {
    currentTierName = 'Bronze';
    nextTierName = 'Silver';
    hoursNeeded = 300 - currentHours;
    progress = Math.min(100, (currentHours / 300) * 100);
    tierColor = '#cd7f32';
    nextTierColor = '#c0c0c0';
    tierGradient = 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)';
    tierEmoji = '🥉';
    bgGradient = 'linear-gradient(135deg, rgba(205,127,50,0.04) 0%, rgba(205,127,50,0.01) 100%)';
  } else if (currentHours < 1000) {
    currentTierName = 'Silver';
    nextTierName = 'Gold';
    hoursNeeded = 1000 - currentHours;
    progress = Math.min(100, ((currentHours - 300) / (1000 - 300)) * 100);
    tierColor = '#94a3b8';
    nextTierColor = '#ffd700';
    tierGradient = 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
    tierEmoji = '🥈';
    bgGradient = 'linear-gradient(135deg, rgba(148,163,184,0.04) 0%, rgba(148,163,184,0.01) 100%)';
  } else {
    currentTierName = 'Gold';
    nextTierName = 'All Tiers Unlocked';
    hoursNeeded = 0;
    progress = 100;
    tierColor = '#fbbf24';
    nextTierColor = '#fbbf24';
    tierGradient = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
    tierEmoji = '🥇';
    bgGradient = 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(251,191,36,0.02) 100%)';
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3 },
        borderRadius: { xs: 2.5, sm: 3 },
        background: bgGradient,
        border: '1px solid',
        borderColor: alpha(tierColor, 0.15),
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: tierGradient,
        },
      }}
    >
      {/* Header: Tier + Hours Badge */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }}>
          <Box
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 36, sm: 42 },
              borderRadius: 2.5,
              background: tierGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 14px ${alpha(tierColor, 0.3)}`,
            }}
          >
            <Trophy size={20} color="#fff" fill="#fff" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: { xs: '0.92rem', sm: '1.05rem' }, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              {tierEmoji} {currentTierName} Tier
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.65rem', sm: '0.72rem' } }}>
              {progress < 100 ? 'Keep going! You are doing great.' : 'You\'ve reached the top tier!'}
            </Typography>
          </Box>
        </Box>
        <Chip
          icon={<Star size={14} fill="currentColor" />}
          label={`${currentHours} hrs`}
          size="small"
          sx={{
            bgcolor: '#fff',
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 28,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid',
            borderColor: alpha(tierColor, 0.15),
            '& .MuiChip-icon': { color: tierColor },
          }}
        />
      </Box>

      {/* Progress Section */}
      {progress < 100 ? (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={0.75}>
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: { xs: '0.75rem', sm: '0.82rem' } }}>
              Progress to {nextTierName}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.62rem', sm: '0.7rem' } }}>
              {hoursNeeded} more hours
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(tierColor, 0.08),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${tierColor} 0%, ${nextTierColor} 100%)`,
              },
            }}
          />
          <Box mt={1.5} display="flex" gap={0.75} alignItems="flex-start" sx={{ opacity: 0.7 }}>
            <TrendingUp size={14} color="#3b82f6" style={{ marginTop: 2 }} />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: { xs: '0.62rem', sm: '0.7rem' } }}>
              Teaching more classes and getting approved attendance boosts your tier. Higher tiers get better visibility and more leads!
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 1,
            p: { xs: 1.5, sm: 2 },
            bgcolor: alpha('#fbbf24', 0.08),
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            border: '1px solid',
            borderColor: alpha('#fbbf24', 0.15),
          }}
        >
          <Zap size={20} color="#f59e0b" fill="#f59e0b" />
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.82rem' } }}>
            You are a <strong style={{ color: '#d97706' }}>Top Rated Gold Tutor</strong>! Your profile is highlighted to parents as a verified expert.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TutorTierProgressCard;
