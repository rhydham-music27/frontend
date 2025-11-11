import { styled } from '@mui/material/styles';
import { Card, CardProps } from '@mui/material';

export const StyledCard = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: '16px',
  border: '1px solid #E2E8F0',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04), 0px 4px 12px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
  '&:hover': {
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08), 0px 8px 24px rgba(0, 0, 0, 0.08)',
    transform: 'translateY(-2px)',
  },
}));

export const GlassCard = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.12)',
  },
}));

export const GradientCard = styled(Card)<CardProps & { gradientColor?: string }>(({ theme, gradientColor = theme.palette.primary.main }) => ({
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${gradientColor} 0%, ${theme.palette.primary.light} 100%)`,
  color: '#ffffff',
  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.16)',
  },
}));