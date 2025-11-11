import React from 'react';
import { IconButton, Tooltip, Switch, FormControlLabel, Box, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  onRefresh: () => void;
  autoRefresh: boolean;
  onAutoRefreshToggle: (enabled: boolean) => void;
  loading?: boolean;
  lastRefreshed?: Date | null;
};

const RefreshButton: React.FC<Props> = ({ onRefresh, autoRefresh, onAutoRefreshToggle, loading = false, lastRefreshed }) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Tooltip title="Refresh data">
        <span>
          <IconButton onClick={onRefresh} disabled={loading} color="primary" sx={{
            ...(loading && { animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }),
          }}>
            <RefreshIcon />
          </IconButton>
        </span>
      </Tooltip>
      <FormControlLabel control={<Switch checked={autoRefresh} onChange={(e) => onAutoRefreshToggle(e.target.checked)} />} label="Auto-refresh" />
      {lastRefreshed && (
        <Typography variant="caption" color="text.secondary">
          Last updated: {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
        </Typography>
      )}
    </Box>
  );
};

export default RefreshButton;
