import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Skeleton, alpha, useTheme, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

type Props = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  gradient?: string;
  trend?: number;
  loading?: boolean;
  onClick?: () => void;
};

const MetricsCard: React.FC<Props> = ({ title, value, subtitle, icon, color = 'primary.main', gradient, trend, loading = false, onClick }) => {
  const theme = useTheme();

  const resolveColor = (c: string): string => {
    // Supports palette tokens like 'primary.main', or direct CSS colors
    if (typeof c === 'string' && c.includes('.')) {
      const [k1, k2] = c.split('.');
      const paletteAny: any = theme.palette as any;
      const varsAny: any = (theme as any).vars?.palette;
      const fromPalette = paletteAny?.[k1]?.[k2];
      if (typeof fromPalette === 'string') return fromPalette;
      const fromVars = varsAny?.[k1]?.[k2];
      if (typeof fromVars === 'string') return fromVars;
      // final fallback to primary.main to ensure valid color string
      return paletteAny?.primary?.main || '#1976d2';
    }
    return c;
  };

  const resolvedColor = resolveColor(color);
  if (loading) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          height: '100%',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="circular" width={44} height={44} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      elevation={0}
      onClick={onClick}
      sx={{ 
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.paper, 0.8) 
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        '&:hover': onClick ? {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.08)',
          borderColor: alpha(resolvedColor, 0.3),
        } : {},
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: `radial-gradient(circle at top right, ${alpha(resolvedColor, 0.08)}, transparent 70%)`,
          pointerEvents: 'none',
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Avatar 
            sx={{ 
              bgcolor: alpha(resolvedColor, 0.1),
              color: resolvedColor,
              width: 52,
              height: 52,
              borderRadius: '14px',
              transition: 'transform 0.3s ease',
              '.hover-lift:hover &': {
                transform: 'scale(1.1) rotate(5deg)',
              }
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 26 } })}
          </Avatar>
          {typeof trend === 'number' && (
            <Chip
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${Math.abs(trend)}%`}
              size="small"
              sx={{
                bgcolor: trend > 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                color: trend > 0 ? 'success.main' : 'error.main',
                fontWeight: 700,
                borderRadius: '8px',
                '& .MuiChip-icon': {
                    fontSize: 16,
                    color: 'inherit'
                }
              }}
            />
          )}
        </Box>

        <Typography 
          variant="h4" 
          fontWeight={800}
          sx={{ 
            color: 'text.primary',
            mb: 0.5,
            letterSpacing: '-0.02em'
          }}
        >
          {value}
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary"
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              display: 'block',
              mt: 1,
              opacity: 0.8
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
