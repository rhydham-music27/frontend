import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, actions }) => {
  return (
    <Box mb={{ xs: 2.5, sm: 3, md: 4 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          sx={{ 
            mb: { xs: 1.5, sm: 2 },
            '& .MuiBreadcrumbs-separator': {
              mx: { xs: 0.5, sm: 1 },
            },
          }}
          aria-label="breadcrumb"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography 
                key={index} 
                color="text.primary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                {item.label}
              </Typography>
            ) : (
              <MuiLink
                key={index}
                component={Link}
                to={item.path || '#'}
                underline="hover"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {item.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      )}

      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 2 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography 
            variant="h4" 
            fontWeight={700}
            sx={{ 
              mb: subtitle ? 0.5 : 0,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              fontWeight={500}
              sx={{ 
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                mt: { xs: 0.5, sm: 0.25 },
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box 
            display="flex" 
            gap={{ xs: 1, sm: 1.5, md: 2 }} 
            flexWrap="wrap"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;