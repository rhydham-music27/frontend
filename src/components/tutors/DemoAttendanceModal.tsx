import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    Typography,
} from '@mui/material';
import { IDemoHistory } from '../../types';

interface DemoAttendanceModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        attendanceStatus: 'PRESENT' | 'ABSENT';
        topicCovered: string;
        duration: string;
        feedback: string;
    }) => Promise<void>;
    demo: IDemoHistory | null;
}

const DemoAttendanceModal: React.FC<DemoAttendanceModalProps> = ({
    open,
    onClose,
    onSubmit,
    demo,
}) => {
    const [attendanceStatus, setAttendanceStatus] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
    const [topicCovered, setTopicCovered] = useState('');
    const [duration, setDuration] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onSubmit({
                attendanceStatus,
                topicCovered,
                duration,
                feedback,
            });
            onClose();
        } catch (error) {
            console.error('Failed to submit demo attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Mark Demo Completed</DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={3}>
                    <Typography variant="body2" color="text.secondary">
                        Please provide details about the demo session with <strong>{demo?.classLead?.studentName}</strong>.
                    </Typography>

                    <FormControl>
                        <FormLabel id="attendance-status-label">Student Attendance</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="attendance-status-label"
                            name="attendance-status"
                            value={attendanceStatus}
                            onChange={(e) => setAttendanceStatus(e.target.value as 'PRESENT' | 'ABSENT')}
                        >
                            <FormControlLabel value="PRESENT" control={<Radio />} label="Present" />
                            <FormControlLabel value="ABSENT" control={<Radio />} label="Absent" />
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        label="Topic Covered"
                        fullWidth
                        required
                        value={topicCovered}
                        onChange={(e) => setTopicCovered(e.target.value)}
                        placeholder="e.g. Algebra Basics, Newton's Laws"
                        helperText="Briefly describe what was taught during the demo."
                    />

                    <TextField
                        label="Duration"
                        fullWidth
                        required
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 1 hour, 45 mins"
                    />

                    <TextField
                        label="Feedback / Notes"
                        fullWidth
                        multiline
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Any additional observations or feedback about the student..."
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !topicCovered || !duration}
                >
                    {loading ? 'Submitting...' : 'Submit & Complete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DemoAttendanceModal;
