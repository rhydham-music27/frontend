import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2D68C4', // Smart Blue - professional and trustworthy
      light: '#5C8FD8',
      dark: '#1E4A8C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00B7EB', // Bright Sky - vibrant and motivating
      light: '#33C9F0',
      dark: '#0095C1',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Modern emerald green
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444', // Modern red
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B', // Modern amber
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#318CE7', // Brilliant Azure
      light: '#60A5EB',
      dark: '#2370C3',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC', // Subtle gray background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B', // Slate 800
      secondary: '#536878', // Blue Slate
      disabled: '#94A3B8', // Slate 400
    },
    divider: '#E2E8F0', // Slate 200
    action: {
      active: '#2D68C4',
      hover: 'rgba(45, 104, 196, 0.08)',
      selected: 'rgba(45, 104, 196, 0.12)',
      disabled: '#CBD5E1',
      disabledBackground: '#F1F5F9',
    },
  },
  typography: {
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.9375rem',
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      color: '#64748B',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 2,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.04), 0px 1px 3px rgba(0, 0, 0, 0.06)',
    '0px 2px 4px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.04), 0px 8px 12px rgba(0, 0, 0, 0.06)',
    '0px 6px 8px rgba(0, 0, 0, 0.04), 0px 12px 16px rgba(0, 0, 0, 0.08)',
    '0px 8px 12px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.08)',
    '0px 10px 16px rgba(0, 0, 0, 0.04), 0px 20px 32px rgba(0, 0, 0, 0.08)',
    '0px 12px 20px rgba(0, 0, 0, 0.04), 0px 24px 40px rgba(0, 0, 0, 0.08)',
    '0px 16px 24px rgba(0, 0, 0, 0.04), 0px 32px 48px rgba(0, 0, 0, 0.1)',
    '0px 20px 32px rgba(0, 0, 0, 0.04), 0px 40px 64px rgba(0, 0, 0, 0.1)',
    '0px 24px 40px rgba(0, 0, 0, 0.04), 0px 48px 80px rgba(0, 0, 0, 0.12)',
    '0px 32px 48px rgba(0, 0, 0, 0.04), 0px 64px 96px rgba(0, 0, 0, 0.12)',
    '0px 40px 64px rgba(0, 0, 0, 0.04), 0px 80px 120px rgba(0, 0, 0, 0.14)',
    '0px 48px 80px rgba(0, 0, 0, 0.04), 0px 96px 144px rgba(0, 0, 0, 0.14)',
    '0px 56px 96px rgba(0, 0, 0, 0.04), 0px 112px 168px rgba(0, 0, 0, 0.16)',
    '0px 64px 112px rgba(0, 0, 0, 0.04), 0px 128px 192px rgba(0, 0, 0, 0.16)',
    '0px 72px 128px rgba(0, 0, 0, 0.04), 0px 144px 216px rgba(0, 0, 0, 0.18)',
    '0px 80px 144px rgba(0, 0, 0, 0.04), 0px 160px 240px rgba(0, 0, 0, 0.18)',
    '0px 88px 160px rgba(0, 0, 0, 0.04), 0px 176px 264px rgba(0, 0, 0, 0.2)',
    '0px 96px 176px rgba(0, 0, 0, 0.04), 0px 192px 288px rgba(0, 0, 0, 0.2)',
    '0px 104px 192px rgba(0, 0, 0, 0.04), 0px 208px 312px rgba(0, 0, 0, 0.22)',
    '0px 112px 208px rgba(0, 0, 0, 0.04), 0px 224px 336px rgba(0, 0, 0, 0.22)',
    '0px 120px 224px rgba(0, 0, 0, 0.04), 0px 240px 360px rgba(0, 0, 0, 0.24)',
    '0px 128px 240px rgba(0, 0, 0, 0.04), 0px 256px 384px rgba(0, 0, 0, 0.24)',
    '0px 136px 256px rgba(0, 0, 0, 0.04), 0px 272px 408px rgba(0, 0, 0, 0.26)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(45, 104, 196, 0.2)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: 'rgba(45, 104, 196, 0.04)',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04), 0px 4px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid #E2E8F0',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: '12px',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.04), 0px 8px 12px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.04), 0px 12px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#94A3B8',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
                borderColor: '#2D68C4',
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
        filled: {
          border: '1px solid transparent',
        },
        outlined: {
          borderWidth: '1.5px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9375rem',
          minHeight: '48px',
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
        },
        head: {
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#64748B',
          backgroundColor: '#F8FAFC',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '20px',
          boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.12), 0px 8px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          fontSize: '0.8125rem',
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.16)',
        },
        arrow: {
          color: '#1E293B',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontSize: '0.9375rem',
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: '#ECFDF5',
          color: '#065F46',
          border: '1px solid #A7F3D0',
        },
        standardError: {
          backgroundColor: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #FECACA',
        },
        standardWarning: {
          backgroundColor: '#FFFBEB',
          color: '#92400E',
          border: '1px solid #FDE68A',
        },
        standardInfo: {
          backgroundColor: '#EFF6FF',
          color: '#1E40AF',
          border: '1px solid #BFDBFE',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.9375rem',
          fontWeight: 500,
          '&.Mui-focused': {
            color: '#2D68C4',
            fontWeight: 600,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: '10px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          height: '6px',
          backgroundColor: '#E2E8F0',
        },
        bar: {
          borderRadius: '8px',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#2D68C4',
        },
      },
    },
  },
});

export default theme;
