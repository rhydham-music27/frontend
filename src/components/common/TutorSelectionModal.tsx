import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import tutorService from '../../services/tutorService';
import { ITutor } from '../../types';

interface TutorSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tutorId: string, tutorName: string) => void;
  excludeTutorId?: string;
}

export default function TutorSelectionModal({
  open,
  onClose,
  onSelect,
  excludeTutorId,
}: TutorSelectionModalProps) {
  const [tutors, setTutors] = useState<ITutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchTutors();
    }
  }, [open]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tutorService.getTutors({
        verificationStatus: 'VERIFIED',
        limit: 100,
      });
      setTutors(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter((t) => {
    if (excludeTutorId && (t.id === excludeTutorId || t.user?.id === excludeTutorId)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.user?.name?.toLowerCase().includes(s) ||
      t.user?.email?.toLowerCase().includes(s) ||
      t.subject?.some((sub: string) => sub.toLowerCase().includes(s))
    );
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select New Tutor</DialogTitle>
      <DialogContent sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, email or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {filteredTutors.length === 0 ? (
              <Box p={4} textAlign="center">
                <Typography color="text.secondary">No tutors found</Typography>
              </Box>
            ) : (
              filteredTutors.map((tutor) => (
                <Box key={tutor.id}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => onSelect(tutor.user.id, tutor.user.name)}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight={600}>
                              {tutor.user.name}
                            </Typography>
                            <Chip
                              label={tutor.tier || 'BRONZE'}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.625rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {tutor.subject?.join(', ')}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                              <Typography variant="caption" fontWeight={500}>
                                {tutor.ratings || 0} ({tutor.totalRatings || 0} reviews)
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                • {tutor.classesCompleted || 0} classes completed
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider component="li" />
                </Box>
              ))
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
