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
};

const MetricsCard: React.FC<Props> = ({ title, value, subtitle, icon, color = 'primary.main', trend, loading = false }) => {
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
      sx={{ 
        height: '100%',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: resolvedColor,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={{ xs: 1.5, sm: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: alpha(resolvedColor, 0.1),
              color: resolvedColor,
              width: { xs: 40, sm: 44, md: 48 },
              height: { xs: 40, sm: 44, md: 48 },
              '& svg': {
                fontSize: { xs: 20, sm: 22, md: 24 },
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
                borderRadius: '8px',
                backgroundColor: trend > 0 ? alpha('#24A148', 0.1) : alpha('#DA1E28', 0.1),
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
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            lineHeight: 1.2,
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
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
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