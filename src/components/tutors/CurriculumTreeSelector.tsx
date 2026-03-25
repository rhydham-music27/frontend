import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  alpha,
  useTheme,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useOptions } from '../../hooks/useOptions';
import { CurriculumSelectorDialog } from './CurriculumSelectorDialog';

interface CurriculumTreeSelectorProps {
  selectedSubjectIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export const CurriculumTreeSelector: React.FC<CurriculumTreeSelectorProps> = ({
  selectedSubjectIds,
  onChange,
  error,
  disabled = false,
}) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch all options for labeling the summary
  const { options: boards, loading: loadingBoards } = useOptions('BOARD');
  const { options: grades, loading: loadingGrades } = useOptions('GRADE');
  const { options: subjects, loading: loadingSubjects } = useOptions('SUBJECT');

  const isLoading = loadingBoards || loadingGrades || loadingSubjects;

  const handleSave = (newIds: string[]) => {
    onChange(newIds);
    setDialogOpen(false);
  };

  const groupedSelections = useMemo(() => {
    interface Group {
      label: string;
      ids: string[];
    }
    const groups: Record<string, Group> = {};

    selectedSubjectIds.forEach(id => {
      const subject = subjects.find(s => s._id === id);
      if (!subject) return;

      const gradeId = typeof subject.parent === 'object' ? subject.parent?._id : subject.parent;
      const grade = grades.find(g => g._id === gradeId);
      const boardId = grade ? (typeof grade.parent === 'object' ? grade.parent?._id : grade.parent) : null;
      const board = boards.find(b => b._id === boardId);

      const parentLabel = board && grade ? `${board.label} • ${grade.label}` : grade ? grade.label : 'Other';
      
      if (!groups[parentLabel]) {
        groups[parentLabel] = { label: parentLabel, ids: [] };
      }
      groups[parentLabel].ids.push(id);
    });

    return Object.values(groups) as Group[];
  }, [selectedSubjectIds, subjects, grades, boards]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        p: 2, 
        borderRadius: 2, 
        bgcolor: 'white', 
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.02)}`,
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="caption" color="text.secondary">Loading curriculum data...</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Teaching Portfolio ({selectedSubjectIds.length})
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={selectedSubjectIds.length > 0 ? <EditIcon sx={{ fontSize: '14px !important' }} /> : <AddCircleOutlineIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => setDialogOpen(true)}
                disabled={disabled}
                sx={{ 
                  borderRadius: '8px', 
                  textTransform: 'none', 
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  py: 0.5
                }}
              >
                {selectedSubjectIds.length > 0 ? 'Modify Selection' : 'Choose Subjects'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {groupedSelections.length > 0 ? (
                groupedSelections.map((group: { label: string; ids: string[] }, idx: number) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', borderBottom: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2), whiteSpace: 'nowrap' }}>
                      {group.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
                      {group.ids.map((id: string) => subjects.find(s => s._id === id)?.label || id).join(', ')}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ py: 2, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', border: `1px dashed ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontStyle="italic">
                    No subjects selected yet. Click the button above to start.
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
          {error}
        </Typography>
      )}

      <CurriculumSelectorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialSelectedIds={selectedSubjectIds}
        onSave={handleSave}
      />
    </Box>
  );
};

