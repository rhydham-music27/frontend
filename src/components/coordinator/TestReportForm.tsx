import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Button, Typography } from '@mui/material';
import { ITestReport } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

interface Props {
  onSubmit: SubmitHandler<ITestReport>;
  loading?: boolean;
  error?: string | null;
  submitButtonText?: string;
}

const schema = yup.object({
  feedback: yup.string().required('Feedback is required').min(10, 'Minimum 10 characters').max(2000, 'Maximum 2000 characters'),
  strengths: yup.string().required('Strengths are required').min(10, 'Minimum 10 characters').max(1000, 'Maximum 1000 characters'),
  areasOfImprovement: yup
    .string()
    .required('Areas of improvement are required')
    .min(10, 'Minimum 10 characters')
    .max(1000, 'Maximum 1000 characters'),
  studentPerformance: yup
    .string()
    .required('Student performance is required')
    .min(10, 'Minimum 10 characters')
    .max(1000, 'Maximum 1000 characters'),
  recommendations: yup
    .string()
    .required('Recommendations are required')
    .min(10, 'Minimum 10 characters')
    .max(1000, 'Maximum 1000 characters'),
});

const TestReportForm: React.FC<Props> = ({ onSubmit, loading = false, error = null, submitButtonText = 'Submit Test Report' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ITestReport>({
    resolver: yupResolver(schema),
    defaultValues: {
      feedback: '',
      strengths: '',
      areasOfImprovement: '',
      studentPerformance: '',
      recommendations: '',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={3}>
      {error && <ErrorAlert error={error} />}
      <Typography variant="h6">Please provide detailed feedback about the test session</Typography>

      <TextField
        label="Overall Feedback"
        multiline
        rows={4}
        fullWidth
        placeholder="Provide comprehensive feedback about the test session, student's approach, and overall performance"
        {...register('feedback')}
        error={!!errors.feedback}
        helperText={errors.feedback?.message}
      />

      <TextField
        label="Student's Strengths"
        multiline
        rows={3}
        fullWidth
        placeholder="Highlight the student's strong areas, concepts they understood well, and positive aspects"
        {...register('strengths')}
        error={!!errors.strengths}
        helperText={errors.strengths?.message}
      />

      <TextField
        label="Areas of Improvement"
        multiline
        rows={3}
        fullWidth
        placeholder="Identify areas where the student needs more practice or clarification"
        {...register('areasOfImprovement')}
        error={!!errors.areasOfImprovement}
        helperText={errors.areasOfImprovement?.message}
      />

      <TextField
        label="Student Performance Assessment"
        multiline
        rows={3}
        fullWidth
        placeholder="Assess the student's performance level, understanding of concepts, and problem-solving ability"
        {...register('studentPerformance')}
        error={!!errors.studentPerformance}
        helperText={errors.studentPerformance?.message}
      />

      <TextField
        label="Recommendations"
        multiline
        rows={3}
        fullWidth
        placeholder="Provide recommendations for future learning, topics to focus on, and study strategies"
        {...register('recommendations')}
        error={!!errors.recommendations}
        helperText={errors.recommendations?.message}
      />

      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
        {loading ? <LoadingSpinner /> : submitButtonText}
      </Button>
    </Box>
  );
};

export default TestReportForm;
