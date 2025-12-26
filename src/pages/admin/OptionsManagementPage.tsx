import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { OptionItem, getOptionTypes } from '@/services/optionsService';
import { useOptions } from '@/hooks/useOptions';
import SnackbarNotification from '@/components/common/SnackbarNotification';
import ErrorAlert from '@/components/common/ErrorAlert';

const OPTION_TYPES = [
  { value: 'SUBJECT', label: 'Subjects' },
  { value: 'BOARD', label: 'Boards' },
  { value: 'CITY', label: 'Cities' },
  { value: 'MODE', label: 'Modes' },
  { value: 'GENDER', label: 'Genders' },
];

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const OptionsManagementPage: React.FC = () => {
  const [currentType, setCurrentType] = useState<string>('SUBJECT');
  const [customTypeInput, setCustomTypeInput] = useState('');
  const [knownTypes, setKnownTypes] = useState(OPTION_TYPES);
  const { options, loading, error: loadError } = useOptions(currentType);

  // For city → areas helper
  const { options: cityOptions } = useOptions('CITY');
  const [selectedCityForArea, setSelectedCityForArea] = useState<string>('');
  const [areaLabel, setAreaLabel] = useState<string>('');
  const [savingArea, setSavingArea] = useState(false);

  const [editingOption, setEditingOption] = useState<OptionItem | null>(null);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' });

  const selectedTypeLabel = useMemo(
    () => OPTION_TYPES.find(t => t.value === currentType)?.label || currentType,
    [currentType]
  );

  useEffect(() => {
    // load known types from backend once
    (async () => {
      try {
        const remoteTypes = await getOptionTypes();
        setKnownTypes((prev) => {
          const existing = new Set(prev.map((t) => t.value));
          const merged = [...prev];
          remoteTypes.forEach((t) => {
            if (!existing.has(t.value)) {
              merged.push(t);
            }
          });
          return merged;
        });
      } catch {
        // ignore; fall back to static OPTION_TYPES
      }
    })();
  }, []);

  useEffect(() => {
    // reset form when type changes
    setEditingOption(null);
    setLabel('');
    setValue('');
    setSortOrder(0);
  }, [currentType]);

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    const next = event.target.value as string;
    if (!next) {
      // "Custom / Other" selected – keep currentType as-is and rely on customTypeInput
      return;
    }
    setCurrentType(next);
    setCustomTypeInput('');
  };

  const handleCustomTypeApply = () => {
    const trimmed = customTypeInput.trim();
    if (!trimmed) return;
    const upper = trimmed.toUpperCase();

    setCurrentType(upper);
    if (!knownTypes.some((t) => t.value === upper)) {
      setKnownTypes((prev) => [...prev, { value: upper, label: upper }]);
    }
  };

  const handleAddAreaForCity = async () => {
    const trimmedLabel = areaLabel.trim();
    if (!selectedCityForArea || !trimmedLabel) {
      setSnackbar({
        open: true,
        message: 'Please select a city and enter an area name',
        severity: 'warning',
      });
      return;
    }

    const city = cityOptions.find(
      (c) => c.value === selectedCityForArea || c.label === selectedCityForArea,
    );
    if (!city) {
      setSnackbar({
        open: true,
        message: 'Selected city not found in options',
        severity: 'error',
      });
      return;
    }

    const areaType = `AREA_${city.value}`;

    try {
      setSavingArea(true);
      const svc = await import('@/services/optionsService');
      await svc.createOrUpdateOption(undefined, {
        type: areaType,
        label: trimmedLabel,
        value: trimmedLabel.toUpperCase().replace(/\s+/g, '_'),
      } as any);

      setAreaLabel('');
      setSnackbar({
        open: true,
        message: `Area added for ${city.label}`,
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to add area for city',
        severity: 'error',
      });
    } finally {
      setSavingArea(false);
    }
  };

  const startCreate = () => {
    setEditingOption(null);
    setLabel('');
    setValue('');
    setSortOrder((options[options.length - 1]?.value ? options.length + 1 : 0));
  };

  const startEdit = (opt: OptionItem) => {
    setEditingOption(opt);
    setLabel(opt.label);
    setValue(opt.value);
    setSortOrder(0);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!label.trim()) {
        setSnackbar({ open: true, message: 'Label is required', severity: 'warning' });
        return;
      }

      const payload: any = {
        type: currentType,
        label: label.trim(),
        value: value.trim() || label.trim().toUpperCase().replace(/\s+/g, '_'),
      };
      if (sortOrder) payload.sortOrder = sortOrder;

      const res = await (await import('@/services/optionsService')).createOrUpdateOption(
        editingOption?._id,
        payload,
      );

      if (!res) return;

      setSnackbar({
        open: true,
        message: editingOption ? 'Option updated' : 'Option created',
        severity: 'success',
      });

      setEditingOption(null);
      setLabel('');
      setValue('');
      setSortOrder(0);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || err?.message || 'Failed to save option',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this option? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      const svc = await import('@/services/optionsService');
      await svc.deleteOption(id);
      setSnackbar({ open: true, message: 'Option deleted', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || err?.message || 'Failed to delete option',
        severity: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Options Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage dropdown options like subjects, boards, cities, etc.
          </Typography>
        </Box>

        <Box minWidth={260} display="flex" flexDirection="column" gap={1}>
          <Select
            fullWidth
            size="small"
            value={knownTypes.some((t) => t.value === currentType) ? currentType : ''}
            onChange={handleTypeChange}
            displayEmpty
          >
            <MenuItem value="">
              <em>Custom / Other type</em>
            </MenuItem>
            {knownTypes.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
          <Box display="flex" gap={1}>
            <TextField
              label="Option type key (e.g. EXTRACURRICULAR)"
              value={customTypeInput}
              onChange={(e) => setCustomTypeInput(e.target.value)}
              size="small"
              fullWidth
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleCustomTypeApply}
            >
              Use
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Current type: <strong>{currentType}</strong>
          </Typography>
        </Box>
      </Box>

      {loadError && (
        <Box mb={2}>
          <ErrorAlert error={loadError} />
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {editingOption ? 'Edit Option' : 'Add Option'}
                </Typography>
                {!editingOption && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={startCreate}
                  >
                    New
                  </Button>
                )}
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  size="small"
                  fullWidth
                  required
                />
                <TextField
                  label="Value (optional, defaults from label)"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Sort Order (optional)"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  size="small"
                  fullWidth
                />

                <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                  {editingOption && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setEditingOption(null);
                        setLabel('');
                        setValue('');
                        setSortOrder(0);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedTypeLabel} Options</Typography>
              </Box>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell width={80} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {options.map((opt) => (
                    <TableRow key={opt._id}>
                      <TableCell>{opt.label}</TableCell>
                      <TableCell>{opt.value}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => startEdit(opt)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(opt._id)}
                          disabled={deletingId === opt._id}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && options.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No options yet for this type.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* City → Areas helper so admins don't have to type AREA_CITYNAME manually */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">City Areas Helper</Typography>
              <Typography variant="body2" color="text.secondary">
                Quickly add areas for a selected city without entering AREA_ keys.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="City"
                  size="small"
                  fullWidth
                  value={selectedCityForArea}
                  onChange={(e) => setSelectedCityForArea(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select city</em>
                  </MenuItem>
                  {cityOptions.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Area name"
                  size="small"
                  fullWidth
                  value={areaLabel}
                  onChange={(e) => setAreaLabel(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box height="100%" display="flex" alignItems="center" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddAreaForCity}
                    disabled={savingArea}
                  >
                    {savingArea ? 'Adding...' : 'Add Area'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Container>
  );
};

export default OptionsManagementPage;
