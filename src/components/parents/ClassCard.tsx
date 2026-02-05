import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  LinearProgress,
} from '@mui/material';
import { BookOpen } from 'lucide-react';

interface ClassCardProps {
  classId: string;
  subject: string;
  grade: string;
  studentName: string;
  topic: string;
  schedule: string;
  completedSessions: number;
  totalSessions: number;
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
  studentName,
  topic,
  schedule,
  completedSessions,
  totalSessions,
  onMarkClick,
}) => {
  const config = subjectConfig[subject] || defaultConfig;
  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const isCompleted = totalSessions > 0 && completedSessions >= totalSessions;

  return (
    <Card
      sx={{
        borderLeft: `5px solid ${config.color}`,
        background: config.lightBg,
        mb: 2,
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2.5, sm: 2 }, 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          p: { xs: 2, sm: 2.5 } 
        }}
      >
        {/* Icon with gradient background */}
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            borderRadius: '12px',
            background: config.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${config.color}40`,
          }}
        >
          <BookOpen size={24} color="white" />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: config.textColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 0.5,
              fontSize: { xs: '0.9rem', sm: '0.95rem' },
              letterSpacing: '0.01em'
            }}
          >
            {subject} - {grade}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#475569',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 0.75,
              fontWeight: 600,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' }
            }}
          >
            {studentName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              mb: 1,
              fontWeight: 500
            }}
          >
            {topic}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 0.5,
            }}
          >
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                flex: 1,
                backgroundColor: `${config.color}20`,
                '& .MuiLinearProgress-bar': {
                  background: config.gradient,
                  borderRadius: 3,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: config.textColor,
                fontSize: '0.75rem',
                fontWeight: 700,
                minWidth: '40px',
                textAlign: 'right'
              }}
            >
              {Math.round(progressPercentage)}%
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: '#94a3b8',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}
          >
            {completedSessions} / {totalSessions} sessions
          </Typography>
        </Box>

        {/* Right Section / Footer on Mobile */}
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            gap: 1.5,
            alignItems: { xs: 'center', sm: 'flex-end' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
            borderTop: { xs: '1px solid', sm: 'none' },
            borderColor: 'grey.100',
            pt: { xs: 1.5, sm: 0 },
            mt: { xs: 0.5, sm: 0 }
          }}
        >
          <Box
            sx={{
              backgroundColor: config.lightBg,
              border: `1.5px solid ${config.color}`,
              borderRadius: '8px',
              px: { xs: 1.25, sm: 1.5 },
              py: { xs: 0.5, sm: 0.75 },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: config.color,
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                whiteSpace: 'nowrap'
              }}
            >
              {schedule || 'N/A'}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            sx={{
              background: config.gradient,
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.75rem' },
              py: { xs: 0.75, sm: 0.75 },
              px: { xs: 2.5, sm: 2 },
              borderRadius: '8px',
              boxShadow: `0 4px 12px ${config.color}40`,
              '&:hover': {
                boxShadow: `0 6px 16px ${config.color}60`,
                transform: 'scale(1.02)',
              },
            }}
            disabled={isCompleted}
            onClick={() => onMarkClick?.(classId)}
          >
            {isCompleted ? 'Completed' : 'Mark'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClassCard;
