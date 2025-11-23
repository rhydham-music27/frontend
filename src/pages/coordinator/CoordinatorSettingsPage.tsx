import React, { useState } from 'react';
import { Container, Box, Typography, Card, CardContent, FormControlLabel, Switch, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { getCoordinatorByUserId, updateCoordinator } from '../../services/coordinatorService';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants';

const CoordinatorSettingsPage: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinatorId, setCoordinatorId] = useState<string | null>(null);
  const [sameDayOnly, setSameDayOnly] = useState<boolean>(true);
  const [allowReschedule, setAllowReschedule] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCoordinatorByUserId(user.id as string);
      const coord = data as any;
      const id = coord?.id || coord?._id;
      setCoordinatorId(id || null);
      const controls = coord?.settings?.attendanceControls || {};
      setSameDayOnly(typeof controls.sameDayOnly === 'boolean' ? controls.sameDayOnly : true);
      setAllowReschedule(
        typeof controls.allowTutorReschedule === 'boolean' ? controls.allowTutorReschedule : true
      );
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load coordinator settings');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSave = async () => {
    if (!coordinatorId) return;
    setSaving(true);
    setError(null);
    try {
      await api.patch(API_ENDPOINTS.COORDINATORS_SETTINGS(coordinatorId), {
        attendanceControls: {
          sameDayOnly,
          allowTutorReschedule: allowReschedule,
        },
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Coordinator Settings
      </Typography>
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <LoadingSpinner />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {error && <ErrorAlert error={error} />}
              <FormControlLabel
                control={
                  <Switch
                    checked={sameDayOnly}
                    onChange={(e) => setSameDayOnly(e.target.checked)}
                    color="primary"
                  />
                }
                label="Allow tutors to mark attendance only for the same day"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={allowReschedule}
                    onChange={(e) => setAllowReschedule(e.target.checked)}
                    color="primary"
                  />
                }
                label="Allow tutors to create one-time reschedules for their classes"
              />
              <Box mt={2}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || !coordinatorId}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CoordinatorSettingsPage;
