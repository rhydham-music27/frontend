import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Box,
    InputAdornment,
    CircularProgress,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import classPlanService, { IClassPlan } from '../../services/classPlanService';
import SnackbarNotification from '../common/SnackbarNotification';

interface ClassPlanModalProps {
    open: boolean;
    onClose: () => void;
    classId: string;
    className: string;
}

const ClassPlanModal: React.FC<ClassPlanModalProps> = ({ open, onClose, classId, className }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [plan, setPlan] = useState<IClassPlan | null>(null);
    const [monthlyFee, setMonthlyFee] = useState<number | ''>('');
    const [sessionsPerMonth, setSessionsPerMonth] = useState<number | ''>('');
    const [perSessionFee, setPerSessionFee] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (open && classId) {
            loadPlan();
        }
    }, [open, classId]);

    useEffect(() => {
        if (monthlyFee && sessionsPerMonth) {
            setPerSessionFee(Number(monthlyFee) / Number(sessionsPerMonth));
        } else {
            setPerSessionFee(0);
        }
    }, [monthlyFee, sessionsPerMonth]);

    const loadPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await classPlanService.getPlanByClassId(classId);
            if (res.data) {
                setPlan(res.data);
                setMonthlyFee(res.data.monthlyFee);
                setSessionsPerMonth(res.data.sessionsPerMonth);
            } else {
                setPlan(null);
                setMonthlyFee('');
                setSessionsPerMonth('');
            }
        } catch (e: any) {
            setError('Failed to load class plan');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!monthlyFee || !sessionsPerMonth) {
            setError('Please fill in all fields');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (plan) {
                // Update existing plan directly via PATCH if needed, OR just create new one via POST which handles archiving old
                // The controller logic for POST /class-plans archives old active plan and creates new one.
                // Let's use POST to ensure we follow that logic, or we can use PATCH to update current plan if we just want to edit.
                // Given "create a class plan schema", it implies defining the plan.
                // Let's use createOrUpdatePlan which hits POST /class-plans
                await classPlanService.createOrUpdatePlan({
                    classId,
                    monthlyFee: Number(monthlyFee),
                    sessionsPerMonth: Number(sessionsPerMonth),
                });
            } else {
                await classPlanService.createOrUpdatePlan({
                    classId,
                    monthlyFee: Number(monthlyFee),
                    sessionsPerMonth: Number(sessionsPerMonth),
                });
            }
            setNotification({ message: 'Class plan saved successfully', severity: 'success' });
            setTimeout(() => {
                onClose();
                setNotification(null);
            }, 1500);
            loadPlan(); // reload to get updated data
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to save class plan');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Manage Plan: {className}</Typography>
                        <IconButton onClick={onClose} disabled={saving}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box component="form" noValidate autoComplete="off">
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Set the monthly fee and sessions. Parents pay the full monthly plan.
                            </Typography>

                            {error && (
                                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                                    {error}
                                </Typography>
                            )}

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Monthly Fee"
                                        type="number"
                                        value={monthlyFee}
                                        onChange={(e) => setMonthlyFee(Number(e.target.value))}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Sessions per Month"
                                        type="number"
                                        value={sessionsPerMonth}
                                        onChange={(e) => setSessionsPerMonth(Number(e.target.value))}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box bgcolor="action.hover" p={2} borderRadius={1}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Calculated Per Session Fee
                                        </Typography>
                                        <Typography variant="h5" color="primary.main" fontWeight="bold">
                                            ₹{perSessionFee.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            = {monthlyFee || 0} / {sessionsPerMonth || 1}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving || loading}>
                        {saving ? 'Saving...' : 'Save Plan'}
                    </Button>
                </DialogActions>
            </Dialog>
            <SnackbarNotification
                open={!!notification}
                message={notification?.message || ''}
                severity={notification?.severity || 'success'}
                onClose={() => setNotification(null)}
            />
        </>
    );
};

export default ClassPlanModal;
