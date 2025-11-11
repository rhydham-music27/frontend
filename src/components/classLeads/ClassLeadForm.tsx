import { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Button, MenuItem, Chip, Autocomplete, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from '@mui/material';
import { BOARD_TYPE, TEACHING_MODE } from '../../constants';
import { IClassLead, IClassLeadFormData } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

type Props = {
  initialData?: IClassLead;
  onSubmit: SubmitHandler<IClassLeadFormData>;
  loading?: boolean;
  error?: string | null;
  submitButtonText?: string;
};

const subjectsOptions = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Social Science',
  'Computer Science',
];

const schema = yup.object({
  studentName: yup.string().required().min(2).max(100),
  grade: yup.string().required(),
  subject: yup.array().of(yup.string().required()).min(1).required(),
  board: yup.string().oneOf(Object.values(BOARD_TYPE)).required(),
  mode: yup.string().oneOf(Object.values(TEACHING_MODE)).required(),
  location: yup.string().when('mode', {
    is: (mode: string) => mode === TEACHING_MODE.OFFLINE || mode === TEACHING_MODE.HYBRID,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.optional(),
  }),
  timing: yup.string().required().min(2).max(100),
  notes: yup.string().max(500).optional(),
});

export default function ClassLeadForm({ initialData, onSubmit, loading, error, submitButtonText = 'Create Lead' }: Props) {
  const defaultValues: IClassLeadFormData = useMemo(() => ({
    studentName: initialData?.studentName || '',
    grade: initialData?.grade || '',
    subject: Array.isArray(initialData?.subject)
      ? (initialData?.subject as unknown as string[])
      : initialData?.subject
      ? String(initialData.subject).split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    board: initialData?.board || '',
    mode: initialData?.mode || TEACHING_MODE.ONLINE,
    location: initialData?.location || '',
    timing: initialData?.timing || '',
    notes: (initialData as any)?.notes || '',
  }), [initialData]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<IClassLeadFormData>({
    resolver: yupResolver(schema as any),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      const next = defaultValues;
      Object.entries(next).forEach(([k, v]) => setValue(k as keyof IClassLeadFormData, v as any));
    }
  }, [initialData, defaultValues, setValue]);

  const mode = watch('mode');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2}>
      <TextField label="Student Name" fullWidth {...register('studentName')} error={!!errors.studentName} helperText={errors.studentName?.message} />
      <TextField label="Grade/Class" fullWidth {...register('grade')} error={!!errors.grade} helperText={errors.grade?.message} />

      <Autocomplete
        multiple
        freeSolo
        options={subjectsOptions}
        defaultValue={defaultValues.subject}
        onChange={(_, value) => setValue('subject', value as string[], { shouldValidate: true })}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option + index} />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} label="Subjects" error={!!errors.subject} helperText={errors.subject?.message as string} />
        )}
      />

      <TextField select label="Board" fullWidth defaultValue={defaultValues.board} {...register('board')} error={!!errors.board} helperText={errors.board?.toString()}>
        {Object.values(BOARD_TYPE).map((b) => (
          <MenuItem key={b} value={b}>{b}</MenuItem>
        ))}
      </TextField>

      <FormControl>
        <FormLabel>Teaching Mode</FormLabel>
        <RadioGroup row value={mode} onChange={(_, v) => setValue('mode', v as any, { shouldValidate: true })}>
          {Object.values(TEACHING_MODE).map((m) => (
            <FormControlLabel key={m} value={m} control={<Radio />} label={m} />
          ))}
        </RadioGroup>
      </FormControl>

      {(mode === TEACHING_MODE.OFFLINE || mode === TEACHING_MODE.HYBRID) && (
        <TextField label="Location" fullWidth {...register('location')} error={!!errors.location} helperText={errors.location?.toString()} />
      )}

      <TextField label="Preferred Timing" placeholder="e.g., Weekdays 5-7 PM" fullWidth {...register('timing')} error={!!errors.timing} helperText={errors.timing?.message} />

      <TextField label="Additional Notes" multiline rows={3} fullWidth {...register('notes')} error={!!errors.notes} helperText={errors.notes?.message} />

      {error && <ErrorAlert error={error} />}

      <Button type="submit" variant="contained" color="primary" disabled={!!loading}>
        {loading ? <LoadingSpinner /> : submitButtonText}
      </Button>
    </Box>
  );
}
