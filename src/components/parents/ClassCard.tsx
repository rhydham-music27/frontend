import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Avatar,
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
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2.5 }}>
        {/* Icon with gradient background */}
        <Box
          sx={{
            flexShrink: 0,
            width: 56,
            height: 56,
            borderRadius: '12px',
            background: config.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${config.color}40`,
          }}
        >
          <BookOpen size={28} color="white" />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: config.textColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 0.5,
              fontSize: '0.95rem',
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
              fontWeight: 500,
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
              mb: 0.75,
            }}
          >
            {topic}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
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
                fontSize: '0.7rem',
                fontWeight: 600,
                minWidth: '35px',
              }}
            >
              {Math.round(progressPercentage)}%
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              fontSize: '0.7rem',
            }}
          >
            {completedSessions}/{totalSessions} sessions
          </Typography>
        </Box>

        {/* Right Section */}
        <Box
          sx={{
            flexShrink: 0,
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'flex-end',
          }}
        >
          <Box
            sx={{
              backgroundColor: config.lightBg,
              border: `2px solid ${config.color}`,
              borderRadius: '8px',
              px: 1.5,
              py: 0.75,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: config.color,
                fontSize: '0.8rem',
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
              fontWeight: 600,
              fontSize: '0.75rem',
              py: 0.75,
              px: 1.5,
              boxShadow: `0 4px 12px ${config.color}40`,
              '&:hover': {
                boxShadow: `0 6px 16px ${config.color}60`,
                transform: 'scale(1.05)',
              },
            }}
            disabled={isCompleted}
            onClick={() => onMarkClick?.(classId)}
          >
            {isCompleted ? 'Class completed' : 'Mark'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClassCard;
