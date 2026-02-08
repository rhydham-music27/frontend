import { styled } from '@mui/material/styles';
import { Card, CardProps } from '@mui/material';

export const StyledCard = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: '16px',
  border: '1px solid',
  borderColor: theme.palette.divider,
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04), 0px 4px 12px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: theme.palette.background.paper,
  '&:hover': {
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.08), 0px 16px 32px rgba(0, 0, 0, 0.08)',
    transform: 'translateY(-4px)',
    borderColor: theme.palette.primary.main + '33', // 20% opacity
  },
}));

export const GlassCard = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(24px) saturate(200%)',
  WebkitBackdropFilter: 'blur(24px) saturate(200%)',
  border: '1px solid',
  borderColor: 'rgba(226, 232, 240, 0.8)',
  boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 12px 48px rgba(0, 0, 0, 0.12)',
    borderColor: theme.palette.primary.main + '4D', // 30% opacity
  },
}));

export const GradientCard = styled(Card)<CardProps & { gradientColor?: string }>(
  ({ theme, gradientColor = theme.palette.primary.main }) => ({
    borderRadius: '16px',
    background: `linear-gradient(135deg, ${gradientColor} 0%, ${theme.palette.primary.light} 100%)`,
    color: '#ffffff',
    border: 'none',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.16)',
    },
  })
);

export const ElevatedCard = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: '20px',
  background: theme.palette.background.paper,
  border: 'none',
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.06), 0px 8px 24px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.1), 0px 24px 48px rgba(0, 0, 0, 0.12)',
  },
}));

export const ModernCard = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: '16px',
  background: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04), 0px 4px 12px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.08), 0px 16px 32px rgba(0, 0, 0, 0.08)',
    borderColor: theme.palette.primary.main + '4D',
    '&::before': {
      opacity: 1,
    },
  },
}));
