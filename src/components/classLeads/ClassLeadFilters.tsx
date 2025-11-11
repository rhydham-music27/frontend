import { Box, TextField, MenuItem, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { CLASS_LEAD_STATUS } from '../../constants';

type Filters = { status?: string; search?: string };

export default function ClassLeadFilters({ filters, onFilterChange, onClearFilters }: { filters: Filters; onFilterChange: (f: Filters) => void; onClearFilters: () => void }) {
  return (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
      <TextField
        label="Search by student name"
        size="small"
        value={filters.search || ''}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value, page: 1 } as any)}
        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
      />
      <TextField
        select
        label="Status"
        size="small"
        sx={{ minWidth: 180 }}
        value={filters.status || ''}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined, page: 1 } as any)}
      >
        <MenuItem value="">All Statuses</MenuItem>
        {Object.values(CLASS_LEAD_STATUS).map((s) => (
          <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" startIcon={<ClearIcon />} onClick={onClearFilters}>Clear Filters</Button>
    </Box>
  );
}
