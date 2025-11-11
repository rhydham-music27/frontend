import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton } from '@mui/material';
import { IManagerPerformanceSummary, ICoordinatorPerformanceSummary } from '../../types';

interface RolePerformanceTableProps {
  managerData: IManagerPerformanceSummary | null | undefined;
  coordinatorData: ICoordinatorPerformanceSummary | null | undefined;
  loading?: boolean;
  title?: string;
}

const formatNumber = (n: number | undefined | null, digits: number = 1) =>
  typeof n === 'number' ? n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '-';

const formatCurrency = (n: number | undefined | null) =>
  typeof n === 'number' ? `₹${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-';

const EmptyState: React.FC = () => (
  <Box p={2} textAlign="center" color="text.secondary">No data available</Box>
);

const LoadingTable: React.FC<{ rows: number }>= ({ rows }) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}><Skeleton width={160} /></TableCell>
          <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }} align="right"><Skeleton width={80} /></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton width={180} /></TableCell>
            <TableCell align="right"><Skeleton width={60} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const RolePerformanceTable: React.FC<RolePerformanceTableProps> = ({ managerData, coordinatorData, loading = false, title = 'Role Performance Summary' }) => {
  return (
    <Box>
      <Typography variant="h6" mb={2}>{title}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Manager Performance</Typography>
              {loading ? (
                <LoadingTable rows={7} />
              ) : managerData ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>Metric</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }} align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow><TableCell>Active Managers</TableCell><TableCell align="right">{managerData.activeManagers?.toLocaleString() ?? '-'}</TableCell></TableRow>
                      <TableRow><TableCell>Total Leads Created</TableCell><TableCell align="right">{managerData.totals.totalLeads.toLocaleString()}</TableCell></TableRow>
                      <TableRow><TableCell>Total Classes Converted</TableCell><TableCell align="right">{managerData.totals.totalClasses.toLocaleString()}</TableCell></TableRow>
                      <TableRow><TableCell>Total Revenue Generated</TableCell><TableCell align="right">{formatCurrency(managerData.totals.totalRevenue)}</TableCell></TableRow>
                      <TableRow><TableCell>Avg Leads per Manager</TableCell><TableCell align="right">{formatNumber(managerData.averages.perManagerLeads)}</TableCell></TableRow>
                      <TableRow><TableCell>Avg Classes per Manager</TableCell><TableCell align="right">{formatNumber(managerData.averages.perManagerClasses)}</TableCell></TableRow>
                      <TableRow><TableCell>Avg Revenue per Manager</TableCell><TableCell align="right">{formatCurrency(managerData.averages.perManagerRevenue)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Coordinator Performance</Typography>
              {loading ? (
                <LoadingTable rows={3} />
              ) : coordinatorData ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>Metric</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }} align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow><TableCell>Total Classes Handled</TableCell><TableCell align="right">{coordinatorData.totalClasses.toLocaleString()}</TableCell></TableRow>
                      <TableRow><TableCell>Average Performance Score</TableCell><TableCell align="right">{formatNumber(coordinatorData.avgScore)}</TableCell></TableRow>
                      <TableRow><TableCell>Avg Capacity Utilization</TableCell><TableCell align="right">{formatNumber(coordinatorData.avgCapacityUtilization)}%</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RolePerformanceTable;
