import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Skeleton, alpha, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

type Props = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: number;
  loading?: boolean;
  onClick?: () => void;
};

const MetricsCard: React.FC<Props> = ({ title, value, subtitle, icon, color = 'primary.main', trend, loading = false, onClick }) => {
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
          borderRadius: '16px',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      elevation={0}
      className="hover-lift"
      onClick={onClick}
      sx={{ 
        height: '100%',
        border: '1px solid #E2E8F0',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'visible', // Changed to visible for potential glow effects
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        '&:hover': onClick ? {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          borderRadius: '24px',
          padding: '2px', // border width
          background: `linear-gradient(135deg, ${resolvedColor}, ${alpha(resolvedColor, 0.1)})`, 
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={{ xs: 1.5, sm: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: alpha(resolvedColor, 0.08),
              color: resolvedColor,
              width: { xs: 48, sm: 56, md: 64 },
              height: { xs: 48, sm: 56, md: 64 },
              borderRadius: '16px',
              '& svg': {
                fontSize: { xs: 24, sm: 28, md: 32 },
              },
            }}
          >
            {icon}
          </Avatar>
          {typeof trend === 'number' && (
            <Box 
              display="flex" 
              alignItems="center" 
              gap={0.5}
              sx={{
                px: { xs: 0.75, sm: 1 },
                py: { xs: 0.375, sm: 0.5 },
                borderRadius: '12px',
                backgroundColor: trend > 0 ? alpha('#24A148', 0.12) : alpha('#DA1E28', 0.12),
              }}
            >
              {trend > 0 ? (
                <TrendingUpIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'success.main' }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'error.main' }} />
              )}
              <Typography 
                variant="caption" 
                fontWeight={600}
                sx={{ 
                  color: trend > 0 ? 'success.main' : 'error.main',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                }}
              >
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>

        <Typography 
          variant="h3" 
          fontWeight={700}
          sx={{ 
            color: 'text.primary',
            mb: { xs: 0.25, sm: 0.5 },
            fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.8rem' },
            lineHeight: 1.2,
            maxWidth: '100%',
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary"
          fontWeight={500}
          sx={{ 
            mb: subtitle ? 0.5 : 0,
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            maxWidth: '100%',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              display: 'block',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              maxWidth: '100%',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
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