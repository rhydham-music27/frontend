import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  LinearProgress,
  alpha,
} from '@mui/material';
import { BookOpen } from 'lucide-react';
import { getLeafSubjectLabel } from '../../utils/subjectUtils';

interface ClassCardProps {
  classId: string;
  subject: string;
  grade: string;
  studentName: string;
  topic: string;
  schedule: string;
  completedSessions: number;
  totalSessions: number;
  classesPerMonth?: number;
  onMarkClick?: (classId: string) => void;
}

const subjectConfig: Record<string, {
  color: string;
  gradient: string;
  bgGradient: string;
  lightBg: string;
  textColor: string;
}> = {
  Mathematics: {
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
    bgGradient: '#3B82F6',
    lightBg: '#EFF6FF',
    textColor: '#1E3A8A',
  },
  Science: {
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #6D28D9 100%)',
    bgGradient: '#A855F7',
    lightBg: '#FAF5FF',
    textColor: '#4C1D95',
  },
  Physics: {
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    bgGradient: '#10B981',
    lightBg: '#ECFDF5',
    textColor: '#065F46',
  },
  Chemistry: {
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    bgGradient: '#F59E0B',
    lightBg: '#FFFBEB',
    textColor: '#78350F',
  },
  Biology: {
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    bgGradient: '#EC4899',
    lightBg: '#FDF2F8',
    textColor: '#500724',
  },
  English: {
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    bgGradient: '#06B6D4',
    lightBg: '#ECFDF5',
    textColor: '#164E63',
  },
  History: {
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    bgGradient: '#8B5CF6',
    lightBg: '#F5F3FF',
    textColor: '#3F0F5C',
  },
};

const defaultConfig = {
  color: '#F59E0B',
  gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  bgGradient: '#F59E0B',
  lightBg: '#FFFBEB',
  textColor: '#78350F',
};

export const ClassCard: React.FC<ClassCardProps> = ({
  classId,
  subject,
  grade,
  board,
  studentName,
  topic,
  schedule,
  completedSessions,
  totalSessions,
  classesPerMonth,
  onMarkClick,
}) => {
  // Extract leaf subject name if it's a hierarchical string (e.g., "Board . Class . Subject")
  const leafSubject = getLeafSubjectLabel(subject);
  
  const config = subjectConfig[leafSubject] || defaultConfig;
  const targetSessions = classesPerMonth || totalSessions || 0;
  const progressPercentage = targetSessions > 0 ? (completedSessions / targetSessions) * 100 : 0;
  const isCompleted = targetSessions > 0 && completedSessions >= targetSessions;

  return (
    <Box
      sx={{
        borderRadius: 2,
        bgcolor: '#ffffff',
        mb: 2.5,
        p: { xs: 2.5, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
        border: '1px solid',
        borderColor: alpha('#e2e8f0', 0.6),
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
          borderColor: alpha(config.color, 0.2),
        },
      }}
    >
      {/* Subject Accent Tag */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 6,
          height: '100%',
          background: config.gradient,
        }}
      />

      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        {/* Icon / Subject Indicator */}
        <Box
          sx={{
            flexShrink: 0,
            width: 52,
            height: 52,
            borderRadius: 3.5,
            background: `linear-gradient(135deg, ${alpha(config.color, 0.1)} 0%, ${alpha(config.color, 0.05)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.color,
          }}
        >
          <BookOpen size={24} />
        </Box>

        {/* Info Area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" flexDirection="column" gap={0.25} mb={1}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                letterSpacing: '-0.02em',
              }}
            >
              {leafSubject}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                {grade} {board && `• ${board}`}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.9rem',
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Student:</span> {studentName}
          </Typography>

          {/* Progress Area */}
          <Box sx={{ maxWidth: 300 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Course Progress
              </Typography>
              <Typography variant="caption" sx={{ color: config.textColor, fontWeight: 900 }}>
                {completedSessions} / {targetSessions}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 2,
                bgcolor: alpha(config.color, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: config.gradient,
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>

        {/* Actions Area */}
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: { xs: 'center', sm: 'flex-end' },
            justifyContent: 'space-between',
            width: { xs: '100%', sm: 'auto' },
            gap: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: alpha(config.color, 0.06),
              px: 2,
              py: 1,
              borderRadius: 1.5,
              border: `1px solid ${alpha(config.color, 0.12)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: config.color,
                fontSize: '0.85rem',
                letterSpacing: '-0.01em',
              }}
            >
              {schedule || 'N/A'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => onMarkClick?.(classId)}
            disabled={isCompleted}
            sx={{
              borderRadius: 3.5,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.875rem',
              px: 3,
              py: 1.25,
              background: config.gradient,
              boxShadow: `0 8px 20px ${alpha(config.color, 0.25)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 28px ${alpha(config.color, 0.35)}`,
              },
              '&.Mui-disabled': {
                background: '#f1f5f9',
                color: '#94a3b8',
                boxShadow: 'none',
              }
            }}
          >
            {isCompleted ? 'Marked' : 'Mark Attendance'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ClassCard;

