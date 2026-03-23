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
        p: { xs: 3, sm: 4 },
        mb: { xs: 3, sm: 4 },
        borderRadius: { xs: 4, sm: 5 },
        background: '#fff',
        border: '1px solid',
        borderColor: alpha(tierColor, 0.12),
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 10px 30px ${alpha(tierColor, 0.05)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: tierGradient,
        },
      }}
    >
      {/* Background Decorative Element */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          background: alpha(tierColor, 0.03),
          borderRadius: '50%',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header: Tier + Hours Badge */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: 3.5,
              background: tierGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${alpha(tierColor, 0.25)}`,
              position: 'relative',
            }}
          >
            <Trophy size={26} color="#fff" fill="#fff" />
          </Box>
          <Box>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 900, 
                fontSize: { xs: '1.1rem', sm: '1.25rem' }, 
                lineHeight: 1.1, 
                letterSpacing: '-0.03em',
                color: '#1e293b'
              }}
            >
              {currentTierName} Scholar
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: '#64748b', 
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                mt: 0.5,
                display: 'block'
              }}
            >
              {progress < 100 ? `Questing for ${nextTierName} Status` : 'Legendary Educator Status'}
            </Typography>
          </Box>
        </Box>
        <Chip
          icon={<Star size={14} fill="currentColor" />}
          label={`${currentHours} hrs`}
          size="small"
          sx={{
            bgcolor: alpha(tierColor, 0.05),
            color: tierColor,
            fontWeight: 900,
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.75rem',
            height: 32,
            px: 1,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: alpha(tierColor, 0.1),
            '& .MuiChip-icon': { color: tierColor },
          }}
        />
      </Box>

      {/* Progress Section */}
      {progress < 100 ? (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={1.5}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 800, 
                fontSize: { xs: '0.8rem', sm: '0.88rem' },
                color: '#475569'
              }}
            >
              Elite Ascension
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: tierColor, 
                fontWeight: 900, 
                fontSize: { xs: '0.65rem', sm: '0.72rem' },
                letterSpacing: '0.05em'
              }}
            >
              {hoursNeeded} HRS TO GO
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: alpha(tierColor, 0.05),
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: `linear-gradient(90deg, ${tierColor} 0%, ${alpha(tierColor, 0.6)} 100%)`,
                boxShadow: `0 0 10px ${alpha(tierColor, 0.3)}`,
              },
            }}
          />
          <Box 
            mt={2.5} 
            sx={{ 
              p: 2, 
              bgcolor: alpha('#3b82f6', 0.03), 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: alpha('#3b82f6', 0.08),
              display: 'flex', 
              gap: 1.5, 
              alignItems: 'flex-start' 
            }}
          >
            <Zap size={16} className="text-blue-500" style={{ marginTop: 2 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.5, 
                fontSize: { xs: '0.65rem', sm: '0.72rem' },
                color: '#64748b',
                fontWeight: 500
              }}
            >
              Your expertise is valued. Higher tiers unlock <strong style={{color: '#1e293b'}}>premium leads</strong> and <strong style={{color: '#1e293b'}}>priority listing</strong> in the Scholar Database.
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 1,
            p: 3,
            bgcolor: alpha('#fbbf24', 0.05),
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: '1px solid',
            borderColor: alpha('#fbbf24', 0.15),
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="absolute top-0 right-0 p-1 opacity-10">
            <Trophy size={80} />
          </div>
          <Zap size={24} color="#f59e0b" fill="#f59e0b" />
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "'Manrope', sans-serif",
              color: '#475569', 
              fontWeight: 700, 
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              lineHeight: 1.5
            }}
          >
            Ultimate <strong style={{ color: '#d97706', fontWeight: 900 }}>Gold Distinction</strong> Achieved. Your profile currently emanates maximum trust and authority.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TutorTierProgressCard;
