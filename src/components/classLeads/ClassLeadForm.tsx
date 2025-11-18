import { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Button, MenuItem, Chip, Autocomplete, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from '@mui/material';
import { BOARD_TYPE, TEACHING_MODE, CLASS_LEAD_STATUS } from '../../constants';
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

const gradeOptions = [
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
];

const cityOptions = ['Bhopal'];

const areasByCity: Record<string, string[]> = {
  Bhopal: ['Arera Colony', 'MP Nagar', 'Kolar Road', 'Hoshangabad Road', 'Berasia Road', 'Ayodhya Bypass', 'Bairagarh', 'Katara Hills', 'Shahpura', 'Jahangirabad', 'Govindpura', 'Ashoka Garden', 'Bawadiya Kalan', 'Raisen Road']

};

const schema = yup.object({
  studentName: yup.string().required().min(2).max(100),
  parentPhone: yup.string().optional(),
  grade: yup.string().required(),
  subject: yup.array().of(yup.string().required()).min(1).required(),
  board: yup.string().oneOf(Object.values(BOARD_TYPE)).required(),
  mode: yup.string().oneOf(Object.values(TEACHING_MODE)).required(),
  location: yup.string().when('mode', {
    is: (mode: string) => mode === TEACHING_MODE.HYBRID,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.optional(),
  }),
  city: yup.string().when('mode', {
    is: (mode: string) => mode === TEACHING_MODE.OFFLINE,
    then: (schema) => schema.required('City is required for offline mode'),
    otherwise: (schema) => schema.optional(),
  }),
  area: yup.string().when('mode', {
    is: (mode: string) => mode === TEACHING_MODE.OFFLINE,
    then: (schema) => schema.required('Area is required for offline mode'),
    otherwise: (schema) => schema.optional(),
  }),
  address: yup.string().when('mode', {
    is: (mode: string) => mode === TEACHING_MODE.OFFLINE,
    then: (schema) => schema.required('Address is required for offline mode').min(5).max(200),
    otherwise: (schema) => schema.optional(),
  }),
  classesPerMonth: yup
    .number()
    .optional()
    .typeError('Number of classes per month must be a number')
    .min(1, 'Number of classes per month must be at least 1'),
  classDurationHours: yup
    .number()
    .optional()
    .typeError('Class duration must be a number')
    .min(0.5, 'Class duration must be at least 0.5 hours'),
  paymentAmount: yup
    .number()
    .optional()
    .typeError('Fees must be a number')
    .min(0, 'Fees cannot be negative'),
  leadSource: yup.string().optional(),
  timing: yup.string().required().min(2).max(100),
  notes: yup.string().max(500).optional(),
});

export default function ClassLeadForm({ initialData, onSubmit, loading, error, submitButtonText = 'Create Lead' }: Props) {
  const defaultValues: IClassLeadFormData = useMemo(() => ({
    studentName: initialData?.studentName || '',
    parentPhone: (initialData as any)?.parentPhone || '',
    grade: initialData?.grade || '',
    subject: Array.isArray(initialData?.subject)
      ? (initialData?.subject as unknown as string[])
      : initialData?.subject
        ? String(initialData.subject).split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    board: initialData?.board || '',
    mode: initialData?.mode || TEACHING_MODE.ONLINE,
    location: initialData?.location || '',
    city: (initialData as any)?.city || '',
    area: (initialData as any)?.area || '',
    address: (initialData as any)?.address || '',
    timing: initialData?.timing || '',
    paymentAmount: (initialData as any)?.paymentAmount ?? undefined,
    classesPerMonth: (initialData as any)?.classesPerMonth ?? undefined,
    classDurationHours: (initialData as any)?.classDurationHours ?? undefined,
    leadSource: (initialData as any)?.leadSource || '',
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
  const selectedCity = watch('city') || '';

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2}>
      <TextField label="Student Name" fullWidth {...register('studentName')} error={!!errors.studentName} helperText={errors.studentName?.message} />
      <TextField label="Parent Phone Number" fullWidth {...register('parentPhone')} error={!!errors.parentPhone} helperText={errors.parentPhone?.message} />
      <TextField
        select
        label="Grade/Class"
        fullWidth
        defaultValue={defaultValues.grade}
        {...register('grade')}
        error={!!errors.grade}
        helperText={errors.grade?.message}
      >
        {gradeOptions.map((g) => (
          <MenuItem key={g} value={g}>
            {g}
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        multiple
        disableCloseOnSelect
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

      <TextField
        label="Number of Classes per Month"
        type="number"
        fullWidth
        {...register('classesPerMonth', { valueAsNumber: true })}
        error={!!errors.classesPerMonth}
        helperText={errors.classesPerMonth?.message}
      />

      <TextField
        label="Class Duration (hours)"
        type="number"
        fullWidth
        {...register('classDurationHours', { valueAsNumber: true })}
        error={!!errors.classDurationHours}
        helperText={errors.classDurationHours?.message}
      />

      <TextField
        label="Fees"
        type="number"
        fullWidth
        {...register('paymentAmount', { valueAsNumber: true })}
        error={!!errors.paymentAmount}
        helperText={errors.paymentAmount?.message}
      />

      <TextField
        select
        label="Lead Source"
        fullWidth
        defaultValue={defaultValues.leadSource || ''}
        {...register('leadSource')}
      >
        <MenuItem value="">Select source</MenuItem>
        <MenuItem value="GOOGLE_PROFILE">Google profile</MenuItem>
        <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
        <MenuItem value="REFERRED">Referred</MenuItem>
        <MenuItem value="OTHER">Other</MenuItem>
      </TextField>

      <TextField
        select
        label="Preferred Tutor"
        fullWidth
        defaultValue={(initialData as any)?.preferredTutorGender || ''}
        {...register('preferredTutorGender')}
      >
        <MenuItem value="">No preference</MenuItem>
        <MenuItem value="MALE">Male</MenuItem>
        <MenuItem value="FEMALE">Female</MenuItem>
      </TextField>

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

      {mode === TEACHING_MODE.HYBRID && (
        <TextField label="Location" fullWidth {...register('location')} error={!!errors.location} helperText={errors.location?.toString()} />
      )}

      {mode === TEACHING_MODE.OFFLINE && (
        <>
          <TextField
            select
            label="City"
            fullWidth
            defaultValue={defaultValues.city}
            {...register('city')}
            error={!!errors.city}
            helperText={errors.city?.toString()}
          >
            {cityOptions.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            options={selectedCity ? areasByCity[selectedCity] || [] : []}
            value={watch('area') || ''}
            onChange={(_, value) => setValue('area', value || '', { shouldValidate: true })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Area"
                error={!!errors.area}
                helperText={errors.area?.toString()}
              />
            )}
            freeSolo={false}
          />

          <TextField
            label="Address (House address / Google Map link)"
            multiline
            rows={2}
            fullWidth
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.toString()}
          />
        </>
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
