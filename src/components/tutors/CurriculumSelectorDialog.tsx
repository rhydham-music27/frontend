import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tabs,
  Tab,
  alpha,
  useTheme,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import { useOptions } from '../../hooks/useOptions';
import { OptionItem } from '../../services/optionsService';

interface CurriculumSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  initialSelectedIds: string[];
  onSave: (ids: string[]) => void;
}

interface TreeItem extends OptionItem {
  children?: TreeItem[];
}

export const CurriculumSelectorDialog: React.FC<CurriculumSelectorDialogProps> = ({
  open,
  onClose,
  initialSelectedIds,
  onSave,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeBoardTab, setActiveBoardTab] = useState(0);

  // Sync initial selection
  useEffect(() => {
    if (open) {
      setSelectedIds(initialSelectedIds);
    }
  }, [open, initialSelectedIds]);

  // Fetch all options
  const { options: boards, loading: loadingBoards } = useOptions('BOARD');
  const { options: grades, loading: loadingGrades } = useOptions('GRADE');
  const { options: subjects, loading: loadingSubjects } = useOptions('SUBJECT');

  const isLoading = loadingBoards || loadingGrades || loadingSubjects;

  // Build the tree structure
  const tree = useMemo(() => {
    if (isLoading) return [];

    const treeData: TreeItem[] = boards.map((board) => ({
      ...board,
      children: grades
        .filter((grade) => {
          const parentId = typeof grade.parent === 'object' ? grade.parent?._id : grade.parent;
          return parentId === board._id;
        })
        .map((grade) => ({
          ...grade,
          children: subjects.filter((subject) => {
            const parentId = typeof subject.parent === 'object' ? subject.parent?._id : subject.parent;
            return parentId === grade._id;
          }),
        })),
    }));

    if (!searchTerm.trim()) return treeData;

    const term = searchTerm.toLowerCase();
    return treeData
      .map((board) => {
        const filteredGrades = board.children?.map((grade) => {
          const filteredSubjects = grade.children?.filter((subject) =>
            subject.label.toLowerCase().includes(term)
          );

          if (grade.label.toLowerCase().includes(term) || (filteredSubjects && filteredSubjects.length > 0)) {
            return { ...grade, children: filteredSubjects };
          }
          return null;
        }).filter(Boolean) as TreeItem[];

        if (board.label.toLowerCase().includes(term) || filteredGrades.length > 0) {
          return { ...board, children: filteredGrades };
        }
        return null;
      })
      .filter(Boolean) as TreeItem[];
  }, [boards, grades, subjects, isLoading, searchTerm]);

  const handleToggleSubject = (subjectId: string) => {
    setSelectedIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleToggleGrade = (grade: TreeItem) => {
    const gradeSubjectIds = grade.children?.map((s) => s._id) || [];
    const allSelected = gradeSubjectIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !gradeSubjectIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...gradeSubjectIds])));
    }
  };

  const getSelectedCountInGrade = (grade: TreeItem) => {
    return grade.children?.filter((s) => selectedIds.includes(s._id)).length || 0;
  };

  const currentBoard = tree[activeBoardTab];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          height: '80vh',
          maxHeight: 800,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SchoolIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>Curriculum Selector</Typography>
          <Chip
            label={`${selectedIds.length} Selected`}
            size="small"
            color="primary"
            variant="filled"
            sx={{ fontWeight: 700, height: 24, fontSize: '0.7rem' }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search subjects, classes or boards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'white',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DialogContent sx={{ p: 0, display: 'flex', flex: 1, overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">Loading curriculum...</Typography>
          </Box>
        ) : tree.length === 0 ? (
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No options matching your search.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flex: 1, width: '100%', overflow: 'hidden' }}>
            {/* Left Rail: Boards */}
            <Box sx={{ width: 200, borderRight: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.divider, 0.02), display: 'flex', flexDirection: 'column' }}>
              <Tabs
                orientation="vertical"
                value={activeBoardTab}
                onChange={(_, v) => setActiveBoardTab(v)}
                sx={{
                  '& .MuiTabs-indicator': { left: 0, width: 4, borderRadius: '0 4px 4px 0' },
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    py: 2,
                    px: 3,
                    minHeight: 0,
                    color: 'text.secondary',
                    '&.Mui-selected': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }
                  }
                }}
              >
                {tree.map((board, idx) => {
                  const totalSelectedInBoard = board.children?.reduce((acc, grade) => acc + getSelectedCountInGrade(grade), 0) || 0;
                  return (
                    <Tab
                      key={board._id}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <span>{board.label}</span>
                          {totalSelectedInBoard > 0 && (
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                              {totalSelectedInBoard}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  );
                })}
              </Tabs>
            </Box>

            {/* Right Pane: Grades & Subjects */}
            <Box sx={{ flex: 1, p: 3, overflowY: 'auto', bgcolor: 'white' }}>
              {currentBoard && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <SchoolIcon fontSize="small" /> {currentBoard.label}
                  </Typography>
                  
                  {currentBoard.children?.map((grade) => {
                    const selectedInGrade = getSelectedCountInGrade(grade);
                    const totalInGrade = grade.children?.length || 0;
                    const allSelected = totalInGrade > 0 && selectedInGrade === totalInGrade;

                    return (
                      <Box key={grade._id} sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={allSelected}
                                indeterminate={selectedInGrade > 0 && !allSelected}
                                onChange={() => handleToggleGrade(grade)}
                              />
                            }
                            label={<Typography variant="subtitle2" fontWeight={800}>{grade.label}</Typography>}
                          />
                          {selectedInGrade > 0 && (
                            <Typography variant="caption" fontWeight={700} color="primary.main">
                              {selectedInGrade} of {totalInGrade} selected
                            </Typography>
                          )}
                        </Box>

                        <Grid container spacing={1.5}>
                          {grade.children?.map((subject) => (
                            <Grid item key={subject._id}>
                              <Chip
                                label={subject.label}
                                size="small"
                                onClick={() => handleToggleSubject(subject._id)}
                                color={selectedIds.includes(subject._id) ? 'primary' : 'default'}
                                variant={selectedIds.includes(subject._id) ? 'filled' : 'outlined'}
                                sx={{
                                  borderRadius: '10px',
                                  px: 1,
                                  height: 32,
                                  fontWeight: 600,
                                  fontSize: '0.8rem',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    bgcolor: selectedIds.includes(subject._id) ? 'primary.dark' : alpha(theme.palette.primary.main, 0.05),
                                    borderColor: 'primary.main',
                                  }
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider />
      
      <DialogActions sx={{ p: 2, px: 3, bgcolor: alpha(theme.palette.divider, 0.02) }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {selectedIds.length} subjects will be added to your profile across {tree.filter(b => b.children?.some(g => getSelectedCountInGrade(g) > 0)).length} boards.
          </Typography>
        </Box>
        <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 3 }}>
          Cancel
        </Button>
        <Button
          onClick={() => onSave(selectedIds)}
          variant="contained"
          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 4, boxShadow: 'none' }}
        >
          Save Selections
        </Button>
      </DialogActions>
    </Dialog>
  );
};
