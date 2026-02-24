import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { OptionItem, getOptionTypes } from '@/services/optionsService';
import { useOptions } from '@/hooks/useOptions';
import SnackbarNotification from '@/components/common/SnackbarNotification';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const OPTION_TYPES = [
  { value: 'CURRICULUM', label: 'Curriculum (Hierarchy)' },
  { value: 'CITY', label: 'Cities' },
  { value: 'EXTRACURRICULAR_ACTIVITY', label: 'Extracurricular Activities' },
];

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

// --- Sub-Component: Column List ---
// Renders a single column in the hierarchy (e.g. Board List or Class List)
interface OptionColumnProps {
  title: string;
  type: string;
  parentId?: string;
  selectedId?: string;
  onSelect: (item: OptionItem) => void;
  disabled?: boolean;
  onSaveError: (msg: string) => void;
  onSaveSuccess: (msg: string) => void;
}

const OptionColumn: React.FC<OptionColumnProps> = ({ 
  title, type, parentId, selectedId, onSelect, disabled, onSaveError, onSaveSuccess 
}) => {
  const theme = useTheme();
  // Fetch options for this column. Only fetch if not disabled (meaning parent is selected if required)
  const { options: fetchedOptions, loading: fetchedLoading, refetch } = useOptions(type, parentId);
  
  // If disabled (e.g. no parent selected), force empty list so we don't show "All items"
  const options = disabled ? [] : fetchedOptions;
  const loading = disabled ? false : fetchedLoading;
  
  // Local state for inline creation/editing
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [extraValue, setExtraValue] = useState(''); // for metadata.Link
  const [saving, setSaving] = useState(false);
  
  // Deletion Multi-step Confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletionStep, setDeletionStep] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Save Confirmation
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  useEffect(() => {
     // If disabled (e.g. parent deselected), clear local editing state
     if (disabled) {
        setIsAdding(false);
        setEditingId(null);
     }
  }, [disabled]);

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // If editing, show confirmation first
    if (editingId && !confirmSaveOpen) {
      setConfirmSaveOpen(true);
      return;
    }

    try {
      setSaving(true);
      const svc = await import('@/services/optionsService');
      const payload: any = {
         type,
         label: trimmed,
         value: trimmed.toUpperCase().replace(/\s+/g, '_'),
         parent: parentId, // Link to the parent from the previous column
         metadata: type === 'CITY' ? { whatsappLink: extraValue.trim() } : {}
      };

      await svc.createOrUpdateOption(editingId || undefined, payload);
      
      onSaveSuccess(editingId ? 'Updated successfully' : 'Created successfully');
      setInputValue('');
      setExtraValue('');
      setIsAdding(false);
      setEditingId(null);
      setConfirmSaveOpen(false);
      refetch();
    } catch (err: any) {
      onSaveError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, item: OptionItem) => {
    e.stopPropagation();
    setEditingId(item._id);
    setInputValue(item.label);
    setExtraValue(item.metadata?.whatsappLink || '');
    setIsAdding(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    setDeletionStep(1);
    setConfirmDeleteOpen(true);
  };

  const performDeleteAction = async () => {
    if (deletionStep < 3) {
      setDeletionStep(prev => prev + 1);
      return;
    }

    if (!deletingId) return;
    try {
      setDeletingLoading(true);
      const svc = await import('@/services/optionsService');
      await svc.deleteOption(deletingId);
      onSaveSuccess('Deleted successfully');
      setConfirmDeleteOpen(false);
      setDeletingId(null);
      setDeletionStep(1);
      refetch();
    } catch (err: any) {
      onSaveError(err?.message || 'Failed to delete');
    } finally {
      setDeletingLoading(false);
    }
  };

  const getDeleteTitle = () => {
    if (deletionStep === 1) return "First Confirmation";
    if (deletionStep === 2) return "Second Confirmation (Impact)";
    return "FINAL CONFIRMATION";
  };

  const getDeleteMessage = () => {
    if (deletionStep === 1) return `Are you sure you want to delete this ${title.toLowerCase()}?`;
    if (deletionStep === 2) return `Warning: Deleting this item will also remove all its children (if any) in the hierarchy. This is very destructive. Are you REALLY sure?`;
    return `FINAL WARNING: Once deleted, this data and all associated connections cannot be recovered. Click confirm one last time to proceed.`;
  };

  const isFormOpen = isAdding || !!editingId;

  return (
    <Paper 
      elevation={0}
      sx={{ 
        height: '65vh', 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: disabled ? alpha(theme.palette.action.disabledBackground, 0.1) : 'background.paper',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
          {title}
        </Typography>
        <IconButton 
          size="small" 
          color="primary" 
          disabled={disabled || isFormOpen}
          onClick={() => { 
             setIsAdding(true); 
             setInputValue(''); 
             setExtraValue(''); // Reset link field for new city
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Inline Form */}
      {isFormOpen && (
         <Box p={2} borderBottom="1px solid" borderColor="divider" bgcolor="action.hover">
            <TextField 
               autoFocus
               fullWidth 
               size="small" 
               placeholder="Enter Name" 
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               sx={{ mb: 1, bgcolor: 'white' }}
            />
            {type.toUpperCase() === 'CITY' && (
               <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="WhatsApp Group Link" 
                  value={extraValue}
                  onChange={(e) => setExtraValue(e.target.value)}
                  sx={{ mb: 1, bgcolor: 'white' }}
               />
            )}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
               <Button size="small" onClick={() => { setIsAdding(false); setEditingId(null); setExtraValue(''); }}>Cancel</Button>
               <Button size="small" variant="contained" disabled={saving || !inputValue.trim()} onClick={handleSave}>
                  {saving ? '...' : 'Save'}
               </Button>
            </Stack>
         </Box>
      )}

      {/* List */}
      <List sx={{ flexGrow: 1, overflowY: 'auto', py: 0 }}>
        {loading ? (
           <Box display="flex" justifyContent="center" p={4}><CircularProgress size={20}/></Box>
        ) : options.length === 0 ? (
           <Box p={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                 {disabled ? 'Select parent first' : 'No items found'}
              </Typography>
           </Box>
        ) : (
            options.map((opt) => (
             <ListItem 
               key={opt._id} 
               disablePadding
               sx={{ 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  '&.Mui-selected': {
                     bgcolor: alpha(theme.palette.primary.main, 0.1),
                     '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                     borderLeft: `4px solid ${theme.palette.primary.main}`
                  }
               }}
               secondaryAction={
                 <Box>
                    <IconButton size="small" onClick={(e) => handleStartEdit(e, opt)}>
                       <EditIcon fontSize="small" sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => handleDelete(e, opt._id)} color="error">
                       <DeleteIcon fontSize="small" sx={{ fontSize: 16 }} />
                    </IconButton>
                    {selectedId === opt._id && (
                       <ArrowForwardIosIcon fontSize="small" sx={{ fontSize: 12, ml: 1, color: 'primary.main' }} />
                    )}
                 </Box>
               }
             >
               <ListItemButton
                 selected={selectedId === opt._id}
                 onClick={() => !disabled && onSelect(opt)}
               >
                 <ListItemText 
                    primary={opt.label} 
                    primaryTypographyProps={{ fontWeight: selectedId === opt._id ? 600 : 400 }}
                 />
               </ListItemButton>
             </ListItem>
           ))
        )}
      </List>
      
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => { setConfirmDeleteOpen(false); setDeletionStep(1); }}
        onConfirm={performDeleteAction}
        title={getDeleteTitle()}
        message={getDeleteMessage()}
        severity={deletionStep === 3 ? "error" : "warning"}
        loading={deletingLoading}
        confirmText={deletionStep === 3 ? "DELETE FOREVER" : "Confirm Step " + deletionStep}
      />

      <ConfirmDialog
        open={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={handleSave}
        title="Confirm Update"
        message="Are you sure you want to update this curriculum item? This may affect existing class records."
        severity="warning"
        loading={saving}
      />
    </Paper>
  );
};


const OptionsManagementPage: React.FC = () => {
  // State
  const [currentType, setCurrentType] = useState<string>('CURRICULUM');
  const [knownTypes, setKnownTypes] = useState(OPTION_TYPES);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' });

  // --- Curriculum State ---
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  // --- City Hierarchy State ---
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedCityValue, setSelectedCityValue] = useState<string>('');

  // --- Flat List State (Legacy) --- 
  // Re-using the same generic `useOptions` for flat lists (City etc)
  // const [selectedFlatListId, setSelectedFlatListId] = useState<string>(''); // Not really used, flat lists are flat
  
  // Legacy Data Hook for non-Curriculum/City tabs
  const { options: flatOptions, refetch: flatRefetch } = useOptions(
     (currentType === 'CURRICULUM' || currentType === 'CITY') ? '' : currentType
  );
  
  // -- Flat List Editing State --
  const [editingOption, setEditingOption] = useState<OptionItem | null>(null);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState(''); // Code
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [savingFlat, setSavingFlat] = useState(false);
  const [confirmDeleteFlatOpen, setConfirmDeleteFlatOpen] = useState(false);
  const [deletingFlatId, setDeletingFlatId] = useState<string | null>(null);
  const [deletingFlatLoading, setDeletingFlatLoading] = useState(false);

  // Load backend types
  useEffect(() => {
    (async () => {
      try {
        const remoteTypes = await getOptionTypes();
        setKnownTypes((prev) => {
          const existing = new Set(prev.map((t) => t.value));
          // Filter out BOARD/GRADE/CLASS/SUBJECT/CHAPTER from the tabs list since they are now in Curriculum
          const hiddenTypes = new Set(['BOARD', 'GRADE', 'CLASS', 'SUBJECT', 'CHAPTER']);
          
          const merged = [...prev];
          remoteTypes.forEach((t) => {
            // Only add if not customized and not hidden
            if (!existing.has(t.value) && !hiddenTypes.has(t.value)) {
              merged.push(t);
            }
          });
          return merged;
        });
      } catch { /* ignore */ }
    })();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentType(newValue);
    resetFlatForm();
    setSelectedCityId('');
    setSelectedCityValue('');
  };
  
  const resetFlatForm = () => {
      setEditingOption(null);
      setLabel('');
      setValue('');
      setSortOrder(0);
   };

  const handleAddNewType = () => {
    const trimmed = newTypeInput.trim();
    if (!trimmed) return;
    const upper = trimmed.toUpperCase().replace(/\s+/g, '_');
    if (!knownTypes.some(t => t.value === upper)) {
      setKnownTypes(prev => [...prev, { value: upper, label: trimmed }]);
    }
    setCurrentType(upper);
    setIsAddingType(false);
    setNewTypeInput('');
  };

  const handleSaveFlat = async () => {
    try {
      setSavingFlat(true);
      if (!label.trim()) return;
      const svc = await import('@/services/optionsService');
      const payload: any = {
        type: currentType,
        label: label.trim(),
        value: value.trim() || label.trim().toUpperCase().replace(/\s+/g, '_'),
        sortOrder
      };
      await svc.createOrUpdateOption(editingOption?._id, payload);
      setSnackbar({ open: true, message: 'Saved successfully', severity: 'success' });
      resetFlatForm();
      flatRefetch();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setSavingFlat(false);
    }
  };
  
  const handleDeleteFlat = async (id: string) => {
     setDeletingFlatId(id);
     setConfirmDeleteFlatOpen(true);
  };

  const performDeleteFlat = async () => {
    if (!deletingFlatId) return;
    try {
       setDeletingFlatLoading(true);
       const svc = await import('@/services/optionsService');
       await svc.deleteOption(deletingFlatId);
       setConfirmDeleteFlatOpen(false);
       setDeletingFlatId(null);
       flatRefetch();
       setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
    } catch(err: any) {
       setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
       setDeletingFlatLoading(false);
    }
  };

  // --- Curriculum Actions ---
  const handleBoardSelect = (item: OptionItem) => {
     setSelectedBoardId(item._id);
     setSelectedClassId('');
     setSelectedSubjectId('');
  };
  const handleClassSelect = (item: OptionItem) => {
     setSelectedClassId(item._id);
     setSelectedSubjectId('');
  };
  const handleSubjectSelect = (item: OptionItem) => {
     setSelectedSubjectId(item._id);
  };
  
  const showSnackbar = (msg: string, severity: 'success'|'error' = 'success') => 
     setSnackbar({ open: true, message: msg, severity });

  return (
    <Container maxWidth="xl" sx={{ pb: 5 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4A148C 0%, #311B92 100%)',
          color: 'white',
          pt: { xs: 4, md: 5 },
          pb: 0,
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 3 },
          mt: 3,
          mb: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Options Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
              Use the Curriculum Hierarchy to manage Board structure, or other tabs for general lists.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CategoryIcon />}
            onClick={() => setIsAddingType(true)}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
          >
            Add Type
          </Button>
        </Box>

        {/* Scrollable Tabs */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Tabs
            value={currentType}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                minWidth: 'auto',
                px: 3,
              },
              '& .Mui-selected': { color: '#fff !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#fff', height: 4, borderRadius: '4px 4px 0 0' }
            }}
          >
            {knownTypes.map((t) => (
              <Tab key={t.value} label={t.label} value={t.value} />
            ))}
          </Tabs>
        </Box>
        <Box sx={{
          position: 'absolute',
          top: -30, right: -30,
          width: 250, height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Box>

      {/* --- CONTENT AREA --- */}

      {currentType === 'CURRICULUM' || currentType === 'CITY' ? (
         // MILLER COLUMNS VIEW
         <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Grid container spacing={2} sx={{ minWidth: 1000, flexWrap: 'nowrap' }}>
               {currentType === 'CURRICULUM' ? (
                  <>
                     {/* 1. BOARDS */}
                     <Grid item xs={3}>
                        <OptionColumn 
                           title="Boards" 
                           type="BOARD" 
                           selectedId={selectedBoardId}
                           onSelect={handleBoardSelect}
                           onSaveError={(m) => showSnackbar(m, 'error')}
                           onSaveSuccess={(m) => showSnackbar(m, 'success')}
                        />
                     </Grid>
                     {/* 2. CLASSES */}
                     <Grid item xs={3}>
                        <OptionColumn 
                           title="Classes" 
                           type="GRADE" 
                           parentId={selectedBoardId}
                           selectedId={selectedClassId}
                           disabled={!selectedBoardId}
                           onSelect={handleClassSelect}
                           onSaveError={(m) => showSnackbar(m, 'error')}
                           onSaveSuccess={(m) => showSnackbar(m, 'success')}
                        />
                     </Grid>
                     {/* 3. SUBJECTS */}
                     <Grid item xs={3}>
                        <OptionColumn 
                           title="Subjects" 
                           type="SUBJECT" 
                           parentId={selectedClassId}
                           selectedId={selectedSubjectId}
                           disabled={!selectedClassId}
                           onSelect={handleSubjectSelect}
                           onSaveError={(m) => showSnackbar(m, 'error')}
                           onSaveSuccess={(m) => showSnackbar(m, 'success')}
                        />
                     </Grid>
                     {/* 4. CHAPTERS */}
                     <Grid item xs={3}>
                        <OptionColumn 
                           title="Chapters" 
                           type="CHAPTER" 
                           parentId={selectedSubjectId}
                           selectedId={undefined} // Leaf node
                           disabled={!selectedSubjectId}
                           onSelect={() => {}} 
                           onSaveError={(m) => showSnackbar(m, 'error')}
                           onSaveSuccess={(m) => showSnackbar(m, 'success')}
                        />
                     </Grid>
                  </>
               ) : (
                  <>
                     {/* 1. CITIES */}
                     <Grid item xs={6}>
                        <OptionColumn 
                           title="Cities" 
                           type="CITY" 
                           selectedId={selectedCityId}
                           onSelect={(item) => {
                              setSelectedCityId(item._id);
                              setSelectedCityValue(item.value);
                           }}
                           onSaveError={(m) => showSnackbar(m, 'error')}
                           onSaveSuccess={(m) => showSnackbar(m, 'success')}
                        />
                     </Grid>
                     {/* 2. AREAS */}
                     <Grid item xs={6}>
                        <OptionColumn 
                           title="Areas" 
                           type={selectedCityValue ? `AREA_${selectedCityValue}` : 'NONE'}
                           parentId={selectedCityId}
                           disabled={!selectedCityId}
                           onSelect={() => {}} 
                           onSaveError={(m) => showSnackbar(m, 'error')}
                           onSaveSuccess={(m) => showSnackbar(m, 'success')}
                        />
                     </Grid>
                  </>
               )}
            </Grid>
         </Box>
      ) : (
         // FLAT LIST VIEW (Legacy for Categories, Modes, etc)
         <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
               <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>{editingOption ? 'Edit' : 'Add New'}</Typography>
                  <Stack spacing={2}>
                     <TextField label="Label" value={label} onChange={e=>setLabel(e.target.value)} fullWidth />
                     <TextField label="Code" value={value} onChange={e=>setValue(e.target.value)} fullWidth />
                     <Stack direction="row" spacing={1}>
                        {editingOption && <Button onClick={resetFlatForm} fullWidth>Cancel</Button>}
                        <Button variant="contained" onClick={handleSaveFlat} disabled={savingFlat} fullWidth>Save</Button>
                     </Stack>
                  </Stack>
               </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
               <Paper>
                  <List>
                     {flatOptions.map(o => (
                        <ListItem key={o._id} divider>
                           <ListItemText primary={o.label} secondary={o.value} />
                           <ListItemSecondaryAction>
                              <IconButton onClick={() => { 
                                 setEditingOption(o); 
                                 setLabel(o.label); 
                                 setValue(o.value); 
                              }}><EditIcon /></IconButton>
                              <IconButton onClick={() => handleDeleteFlat(o._id)}><DeleteIcon /></IconButton>
                           </ListItemSecondaryAction>
                        </ListItem>
                     ))}
                  </List>
               </Paper>
            </Grid>
         </Grid>
      )}

      {/* Add Type Dialog */}
      <Dialog open={isAddingType} onClose={() => setIsAddingType(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Option Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Type Key"
            fullWidth
            value={newTypeInput}
            onChange={(e) => setNewTypeInput(e.target.value)}
            placeholder="e.g. LANGUAGES"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingType(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddNewType} disabled={!newTypeInput.trim()}>Add & Switch</Button>
        </DialogActions>
      </Dialog>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />

      <ConfirmDialog
        open={confirmDeleteFlatOpen}
        onClose={() => setConfirmDeleteFlatOpen(false)}
        onConfirm={performDeleteFlat}
        title="Delete Option"
        message="Are you sure you want to delete this option? This action cannot be undone."
        severity="error"
        loading={deletingFlatLoading}
      />
    </Container>
  );
};

export default OptionsManagementPage;
