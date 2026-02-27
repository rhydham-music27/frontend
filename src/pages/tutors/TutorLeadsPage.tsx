import React from 'react';
import { Box, Container, Typography, Chip, alpha } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CompletedLeadsTable from '../../components/tutors/CompletedLeadsTable';

const TutorLeadsPage: React.FC = () => {
  return (
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 0 }, pb: { xs: 10, sm: 0 } }}>
      {/* ─── Premium Header ──────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: { xs: 3, sm: 4 },
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          p: { xs: 2.5, sm: 3.5 },
          mb: { xs: 2.5, sm: 4 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '50%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box position="relative" zIndex={1} display="flex" alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              My Demos History
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha('#fff', 0.6),
                mt: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.88rem' },
                maxWidth: 500,
              }}
            >
              View details and status of all your assigned demo sessions.
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              p: 1.25,
              borderRadius: 2.5,
              bgcolor: alpha('#fff', 0.08),
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha('#fff', 0.1)}`,
            }}
          >
            <HistoryIcon sx={{ fontSize: 22, color: alpha('#fff', 0.7) }} />
          </Box>
        </Box>
      </Box>

      <CompletedLeadsTable />
    </Container>
  );
};

export default TutorLeadsPage;
