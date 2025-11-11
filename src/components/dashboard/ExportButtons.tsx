import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

type ReportType = { value: string; label: string };

type Props = {
  onExportCSV: (reportType: string) => void | Promise<void>;
  onExportPDF: (reportType: string) => void | Promise<void>;
  reportTypes?: ReportType[];
  loading?: boolean;
};

const defaultReports: ReportType[] = [
  { value: 'comprehensive', label: 'Comprehensive Report' },
  { value: 'leads', label: 'Class Leads' },
  { value: 'classes', label: 'Final Classes' },
  { value: 'tutors', label: 'Tutors' },
  { value: 'revenue', label: 'Revenue' },
];

const ExportButtons: React.FC<Props> = ({ onExportCSV, onExportPDF, reportTypes = defaultReports, loading = false }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleExportCSV = async (type: string) => {
    await onExportCSV(type);
    handleMenuClose();
  };

  const handleExportPDF = async (type: string) => {
    await onExportPDF(type);
    handleMenuClose();
  };

  return (
    <Box display="flex" gap={1}>
      <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleMenuOpen} disabled={loading}>
        Export Reports
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {reportTypes.map((r) => (
          <Box key={r.value}>
            <MenuItem onClick={() => handleExportCSV(r.value)}>
              <ListItemIcon>
                <TableChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>CSV - {r.label}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExportPDF(r.value)}>
              <ListItemIcon>
                <PictureAsPdfIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>PDF - {r.label}</ListItemText>
            </MenuItem>
          </Box>
        ))}
      </Menu>
    </Box>
  );
};

export default ExportButtons;
