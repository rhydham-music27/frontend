import React from 'react';
import { Box, Paper, Typography, LinearProgress, Chip } from '@mui/material';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { ITutor } from '../../types';

interface TutorTierProgressCardProps {
  tutor: ITutor;
}

const TutorTierProgressCard: React.FC<TutorTierProgressCardProps> = ({ tutor }) => {
  const currentHours = tutor.experienceHours || 0;
  
  // Tier Logic: Bronze < 300 <= Silver < 1000 <= Gold
  // let nextTier = ''; // Removed unused variable
  let hoursNeeded = 0;
  let progress = 0;
  let currentTierName = 'Bronze';
  let nextTierName = 'Silver';
  let tierColor = '#cd7f32'; // Bronze
  let nextTierColor = '#c0c0c0'; // Silver

  if (currentHours < 300) {
    currentTierName = 'Bronze';
    nextTierName = 'Silver';
    hoursNeeded = 300 - currentHours;
    progress = Math.min(100, (currentHours / 300) * 100);
    tierColor = '#cd7f32';
    nextTierColor = '#c0c0c0';
  } else if (currentHours < 1000) {
    currentTierName = 'Silver';
    nextTierName = 'Gold';
    hoursNeeded = 1000 - currentHours;
    progress = Math.min(100, ((currentHours - 300) / (1000 - 300)) * 100);
    tierColor = '#c0c0c0';
    nextTierColor = '#ffd700';
  } else {
    currentTierName = 'Gold';
    nextTierName = 'All Tiers Unlocked';
    hoursNeeded = 0;
    progress = 100;
    tierColor = '#ffd700';
    nextTierColor = '#ffd700';
  }

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: '50%', 
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}
          >
            <Trophy size={24} color={tierColor} fill={tierColor} className="opacity-90" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
              {currentTierName} Tier Tutor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress < 100 ? 'Keep going! You are doing great.' : 'You have reached the top tier!'}
            </Typography>
          </Box>
        </Box>
        <Chip 
          icon={<Star size={16} fill="currentColor" />} 
          label={`${currentHours} Hours`} 
          sx={{ bgcolor: '#fff', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} 
        />
      </Box>

      {progress < 100 ? (
        <Box>
           <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={1}>
             <Typography variant="body2" fontWeight={600} color="text.primary">
               Progress to {nextTierName}
             </Typography>
             <Typography variant="caption" color="text.secondary">
               {hoursNeeded} more hours needed
             </Typography>
           </Box>
           <LinearProgress 
             variant="determinate" 
             value={progress} 
             sx={{ 
               height: 10, 
               borderRadius: 5,
               bgcolor: 'rgba(0,0,0,0.05)',
               '& .MuiLinearProgress-bar': {
                 borderRadius: 5,
                 background: `linear-gradient(90deg, ${tierColor} 0%, ${nextTierColor} 100%)`
               }
             }} 
           />
           <Box mt={2} display="flex" gap={1} alignItems="flex-start" sx={{ opacity: 0.8 }}>
             <TrendingUp size={16} className="mt-0.5 text-blue-600" />
             <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
               Teaching more classes and getting approved attendance automatically boosts your tier. Higher tiers get better visibility and more leads!
             </Typography>
           </Box>
        </Box>
      ) : (
        <Box mt={2} p={2} bgcolor="rgba(255, 215, 0, 0.1)" borderRadius={2} display="flex" alignItems="center" gap={2}>
           <Award size={24} className="text-yellow-600" />
           <Typography variant="body2" color="text.secondary">
             You are a Top Rated Gold Tutor! Your profile is highlighted to parents as a verified expert.
           </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TutorTierProgressCard;
