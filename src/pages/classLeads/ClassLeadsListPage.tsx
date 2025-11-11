import { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, Card, CardContent, IconButton, Tooltip, Pagination, Chip, Stack, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import useClassLeads from '../../hooks/useClassLeads';
import ClassLeadFilters from '../../components/classLeads/ClassLeadFilters';
import ClassLeadStatusChip from '../../components/classLeads/ClassLeadStatusChip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { IClassLead } from '../../types';

export default function ClassLeadsListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [filters, setFilters] = useState<{ status?: string; search?: string; page: number; limit: number }>({ status: undefined, search: '', page: 1, limit: 10 });
  const { leads, loading, error, pagination, refetch, deleteLead } = useClassLeads(filters);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  // Initial fetch is handled inside useClassLeads

  const handleFilterChange = (f: any) => setFilters((prev) => ({ ...prev, ...f, page: 1 }));
  const handleClearFilters = () => setFilters({ status: undefined, search: '', page: 1, limit: 10 });
  const handlePageChange = (_: any, page: number) => setFilters((prev) => ({ ...prev, page }));

  const handleDelete = async (id: string) => {
    await deleteLead(id);
    setSnack({ open: true, message: 'Lead deleted', severity: 'success' });
  };
  const handleView = (id: string) => navigate(`/class-leads/${id}`);
  const handleEdit = (id: string) => navigate(`/class-leads/${id}/edit`);

  const columns: GridColDef[] = [
    { field: 'studentName', headerName: 'Student Name', width: 180 },
    { field: 'grade', headerName: 'Grade', width: 100 },
    { field: 'subject', headerName: 'Subjects', width: 320, sortable: false, renderCell: (p: any) => {
      const r = p?.row || {};
      let subj: any = r.subject ?? r.subjects ?? r.subjectList ?? r.subject_names ?? r.subjectName ?? r.subject_name;
      const toStrings = (arr: any[]) => arr.map((s: any) => String(s)).filter((s) => s.trim().length > 0);
      let list: string[] = [];
      if (Array.isArray(subj)) list = toStrings(subj);
      else if (typeof subj === 'string') {
        const s = subj.trim();
        if (s) {
          if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
            try {
              const parsed = JSON.parse(s);
              if (Array.isArray(parsed)) list = toStrings(parsed);
              else if (parsed && typeof parsed === 'object') {
                const candidates = [parsed.names, parsed.list, parsed.values, parsed.subjects];
                const arr = candidates.find((c) => Array.isArray(c));
                if (arr) list = toStrings(arr as any[]);
              }
            } catch {}
          }
          if (list.length === 0) list = s.includes(',') ? s.split(',').map((x) => x.trim()).filter(Boolean) : [s];
        }
      } else if (typeof subj === 'object' && subj) {
        const candidates = [subj.names, subj.list, subj.values, subj.subjects];
        const arr = candidates.find((c: any) => Array.isArray(c));
        if (arr) list = toStrings(arr as any[]);
      }
      if (list.length === 0) return String(subj);
      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: '100%' }}>
          {list.map((s) => (
            <Chip key={s} label={s} size="small" />
          ))}
        </Box>
      );
    } },
    { field: 'board', headerName: 'Board', width: 120 },
    { field: 'mode', headerName: 'Mode', width: 100 },
    { field: 'timing', headerName: 'Timing', width: 150 },
    { field: 'status', headerName: 'Status', width: 150, renderCell: (p: any) => <ClassLeadStatusChip status={p.value} /> },
    { field: 'createdAt', headerName: 'Created', width: 160, sortable: false, renderCell: (p: any) => {
      const r = p?.row || {};
      let val: any = r.createdAt ?? r.created_at ?? r.createdOn ?? r.created ?? r.createdAtMs ?? r.created_at_ms ?? r.createdAtMillis ?? r.created_at_millis
        ?? r.updatedAt ?? r.updated_at ?? r.updatedOn ?? r.updated ?? r.updatedAtMs ?? r.updated_at_ms ?? r.updatedAtMillis ?? r.updated_at_millis;
      if (val == null) return '';
      // Handle Firestore Timestamp-like objects or objects with toDate()
      if (typeof val === 'object') {
        if (val instanceof Date) {
          return isNaN(val.getTime()) ? '-' : val.toLocaleDateString();
        }
        if (typeof val.toDate === 'function') {
          const d = val.toDate();
          return isNaN(d?.getTime?.()) ? '-' : d.toLocaleDateString();
        }
        if (typeof val.seconds === 'number') {
          const d = new Date(val.seconds * 1000);
          return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
        }
        if (typeof val._seconds === 'number') {
          const d = new Date(val._seconds * 1000);
          return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
        }
        if (val.$date) {
          const d = new Date(val.$date);
          return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
        }
      }
      // Handle numeric strings and numbers (epoch seconds vs ms)
      if (typeof val === 'string' && /^\d+$/.test(val)) val = Number(val);
      if (typeof val === 'number') {
        const ms = val < 1e12 ? val * 1000 : val;
        const d = new Date(ms);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
      }
      const d = new Date(String(val));
      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
    } },
    { field: 'actions', headerName: 'Actions', width: 150, sortable: false, renderCell: (p: any) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="View"><IconButton size="small" onClick={() => handleView(p.row.id || p.row._id)}><VisibilityIcon /></IconButton></Tooltip>
        <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(p.row.id || p.row._id)}><EditIcon /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(p.row.id || p.row._id)}><DeleteIcon /></IconButton></Tooltip>
      </Box>
    ) },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Class Leads</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/class-leads/new')}>Create New Lead</Button>
      </Box>

      <ErrorAlert error={error} />
      <ClassLeadFilters filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />

      <Card sx={{ p: 2 }}>
        {loading ? (
          <LoadingSpinner />
        ) : isXs ? (
          <Stack spacing={1.25}>
            {(leads as IClassLead[]).map((lead: any) => (
              <Card key={lead.id || lead._id} variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1} gap={1}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{lead.studentName}</Typography>
                      <Typography variant="body2" color="text.secondary">Grade {lead.grade}</Typography>
                    </Box>
                    <ClassLeadStatusChip status={lead.status} />
                  </Box>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Mode</Typography>
                      <div>{lead.mode || '-'}</div>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Board</Typography>
                      <div>{lead.board || '-'}</div>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Timing</Typography>
                      <div>{lead.timing || '-'}</div>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Subjects</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}>
                        {(() => {
                          const r: any = lead || {};
                          let subj: any = r.subject ?? r.subjects ?? r.subjectList ?? r.subject_names ?? r.subjectName ?? r.subject_name;
                          let list: string[] = [];
                          const toStrings = (arr: any[]) => arr.map((s: any) => String(s)).filter((s) => s.trim().length > 0);
                          if (Array.isArray(subj)) list = toStrings(subj);
                          else if (typeof subj === 'string') {
                            const s = subj.trim();
                            if (s) {
                              if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
                                try {
                                  const parsed = JSON.parse(s);
                                  if (Array.isArray(parsed)) list = toStrings(parsed);
                                  else if (parsed && typeof parsed === 'object') {
                                    const candidates = [parsed.names, parsed.list, parsed.values, parsed.subjects];
                                    const arr = candidates.find((c) => Array.isArray(c));
                                    if (arr) list = toStrings(arr as any[]);
                                  }
                                } catch {}
                              }
                              if (list.length === 0) list = s.includes(',') ? s.split(',').map((x) => x.trim()).filter(Boolean) : [s];
                            }
                          } else if (typeof subj === 'object' && subj) {
                            const candidates = [subj.names, subj.list, subj.values, subj.subjects];
                            const arr = candidates.find((c: any) => Array.isArray(c));
                            if (arr) list = toStrings(arr as any[]);
                          }
                          return (list.length ? list : [String(subj || '-')]).map((s) => (<Chip key={s} label={s} size="small" />));
                        })()}
                      </Box>
                    </Grid>
                  </Grid>
                  <Box display="flex" justifyContent="flex-end" gap={1} mt={1.25}>
                    <Button size="small" variant="outlined" onClick={() => handleView(lead.id || lead._id)}>View</Button>
                    <Button size="small" variant="outlined" onClick={() => handleEdit(lead.id || lead._id)}>Edit</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(lead.id || lead._id)}>Delete</Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <DataGrid 
            rows={leads as IClassLead[]} 
            columns={columns} 
            getRowId={(r: any) => r.id || r._id} 
            paginationMode="server" 
            rowCount={pagination.total} 
            pageSizeOptions={[filters.limit]} 
            initialState={{ pagination: { paginationModel: { pageSize: filters.limit, page: filters.page - 1 } } }} 
            onPaginationModelChange={(m: any) => setFilters((prev) => ({ ...prev, page: (m.page || 0) + 1 }))} 
            disableRowSelectionOnClick 
            autoHeight 
            sx={{ border: 'none' }} 
          />
        )}
      </Card>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination count={pagination.pages} page={filters.page} onChange={handlePageChange} color="primary" />
      </Box>

      <SnackbarNotification open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} />
    </Container>
  );
}
