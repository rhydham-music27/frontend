import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider, Grid, alpha } from '@mui/material';
import { ITest } from '../../types';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';

interface TestReportCardProps {
    test: ITest;
    showActions?: boolean;
}

const TestReportCard: React.FC<TestReportCardProps> = ({ test }) => {
    const report = (test as any).report || {};

    return (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100' }}>
            <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.1) }}>
                        <AssignmentIcon sx={{ fontSize: 20, color: '#6366f1' }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={800}>{(test as any).title || 'Test Report'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                <EventIcon sx={{ fontSize: 12 }} />
                                {test.testDate ? new Date(test.testDate).toLocaleDateString() : 'N/A'}
                            </Box>
                        </Typography>
                    </Box>
                    <Box ml="auto">
                        <Chip
                            icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
                            label={`${report.marksObtained || 0} / ${(test as any).maxMarks || 0}`}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 700 }}
                        />
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Strengths</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{report.strengths || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Areas of Improvement</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{report.areasOfImprovement || 'Not provided'}</Typography>
                    </Grid>
                </Grid>

                {report.tutorComments && (
                    <Box mt={2} p={1.5} borderRadius={2} bgcolor={alpha('#6366f1', 0.05)}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Tutor's Comments</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>"{report.tutorComments}"</Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default TestReportCard;
