import { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, TextField, Button, MenuItem, Chip, Autocomplete, 
  FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, 
  Typography, IconButton, Grid, Paper, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { BOARD_TYPE, TEACHING_MODE } from '../../constants';
import { useOptions } from '@/hooks/useOptions';
import { IClassLead, IClassLeadFormData, StudentType } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

type Props = {
  initialData?: IClassLead;
  onSubmit: SubmitHandler<IClassLeadFormData>;
  loading?: boolean;
  error?: string | null;
  submitButtonText?: string;
};

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

const schema = yup.object({
  studentType: yup.string().oneOf(['SINGLE', 'GROUP']).required('Please select student type'),
  studentName: yup.string().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema.required('Student name is required').min(2).max(100),
    otherwise: (schema) => schema.optional()
  }),
  studentGender: yup.string().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema.required('Student gender is required').oneOf(['M', 'F'], 'Please select gender'),
    otherwise: (schema) => schema.optional()
  }),
  parentEmail: yup.string().optional().email('Invalid email address'),
  parentPhone: yup.string().optional(),
  grade: yup.string().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema.required('Grade is required'),
    otherwise: (schema) => schema.required('Grade is required for group')
  }),
  subject: yup.array().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema.of(yup.string().required()).min(1, 'At least one subject is required').required(),
    otherwise: (schema) => schema.of(yup.string().required()).min(1, 'At least one subject is required for group').required()
  }),
  board: yup.string().oneOf(Object.values(BOARD_TYPE)).required(),
  mode: yup.string().oneOf(Object.values(TEACHING_MODE)).required(),
  numberOfStudents: yup.number().when('studentType', {
    is: 'GROUP',
    then: (schema) => schema.required('Number of students is required').min(1, 'At least one student required').max(10, 'Maximum 10 students allowed'),
    otherwise: (schema) => schema.optional()
  }),
  studentDetails: yup.array().when('studentType', {
    is: 'GROUP',
    then: (schema) => schema.of(
      yup.object({
        name: yup.string().required('Student name is required'),
        gender: yup.string().required('Student gender is required').oneOf(['M', 'F'], 'Please select gender'),
        fees: yup.number().required('Fees are required').min(0, 'Fees cannot be negative'),
        tutorFees: yup.number().required('Tutor fees are required').min(0, 'Tutor fees cannot be negative')
      })
    ).min(1, 'At least one student is required'),
    otherwise: (schema) => schema.optional()
  }),
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
  paymentAmount: yup.number().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema
      .typeError('Fees must be a number')
      .min(0, 'Fees cannot be negative')
      .required('Fees are required for single student'),
    otherwise: (schema) => schema.optional()
  }),
  tutorFees: yup.number().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema
      .typeError('Tutor fees must be a number')
      .min(0, 'Tutor fees cannot be negative')
      .required('Tutor fees are required for single student'),
    otherwise: (schema) => schema.optional()
  }),
  leadSource: yup.string().optional(),
  timing: yup.string().required().min(2).max(100),
  notes: yup.string().max(500).optional(),
});

export default function ClassLeadForm({ initialData, onSubmit, loading, error, submitButtonText = 'Create Lead' }: Props) {
  const { options: subjectOptions } = useOptions('SUBJECT');
  const subjectLabels = useMemo(() => subjectOptions.map((o) => o.label), [subjectOptions]);
  const { options: cityOptionItems } = useOptions('CITY');
  const cityLabels = useMemo(() => cityOptionItems.map((o) => o.label), [cityOptionItems]);
  const defaultValues: IClassLeadFormData = useMemo(() => {
    const initialStudentType = (initialData as any)?.studentType || 'SINGLE';
    return {
      studentType: initialStudentType,
      studentName: initialData?.studentName || '',
      studentGender: (initialData as any)?.studentGender || '',
      parentEmail: (initialData as any)?.parentEmail || '',
      parentPhone: (initialData as any)?.parentPhone || '',
      grade: initialData?.grade || '',
      subject: Array.isArray(initialData?.subject)
        ? (initialData?.subject as unknown as string[])
        : initialData?.subject
          ? String(initialData.subject).split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      board: initialData?.board || '',
      mode: initialData?.mode || TEACHING_MODE.ONLINE,
      location: initialData?.location || '',
      city: (initialData as any)?.city || '',
      area: (initialData as any)?.area || '',
      address: (initialData as any)?.address || '',
      timing: initialData?.timing || '',
      paymentAmount: initialStudentType === 'SINGLE' ? ((initialData as any)?.paymentAmount ?? undefined) : undefined,
      tutorFees: initialStudentType === 'SINGLE' ? ((initialData as any)?.tutorFees ?? undefined) : undefined,
      classesPerMonth: (initialData as any)?.classesPerMonth ?? undefined,
      classDurationHours: (initialData as any)?.classDurationHours ?? undefined,
      leadSource: (initialData as any)?.leadSource || '',
      notes: (initialData as any)?.notes || '',
      numberOfStudents: (initialData as any)?.numberOfStudents ?? 1,
      studentDetails: (initialData as any)?.studentDetails || [
        { name: '', gender: 'M' as 'M' | 'F', fees: 0, tutorFees: 0 }
      ],
    };
  }, [initialData]);

  const { 
    control,
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<IClassLeadFormData>({
    resolver: yupResolver(schema as any),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'studentDetails',
  });

  const studentType = watch('studentType');
  const watchStudentDetails = watch('studentDetails');
  const numberOfStudents = watch('numberOfStudents');

  // Update student details array when number of students changes
  useEffect(() => {
    if (studentType === 'GROUP') {
      const currentLength = watchStudentDetails?.length || 0;
      const diff = (numberOfStudents || 1) - currentLength;
      
      if (diff > 0) {
        // Add new student fields
        for (let i = 0; i < diff; i++) {
          append({ name: '', gender: 'M' as 'M' | 'F', fees: 0, tutorFees: 0 });
        }
      } else if (diff < 0) {
        // Remove extra student fields
        for (let i = 0; i < -diff; i++) {
          remove(currentLength - i - 1);
        }
      }
    }
  }, [numberOfStudents, studentType, append, remove, watchStudentDetails?.length]);

  // Calculate total fees and tutor fees for group
  const totalFees = useMemo(() => {
    if (studentType !== 'GROUP' || !watchStudentDetails?.length) return 0;
    return watchStudentDetails.reduce((sum, student) => sum + (Number(student.fees) || 0), 0);
  }, [watchStudentDetails, studentType]);

  const totalTutorFees = useMemo(() => {
    if (studentType !== 'GROUP' || !watchStudentDetails?.length) return 0;
    return watchStudentDetails.reduce((sum, student) => sum + (Number(student.tutorFees) || 0), 0);
  }, [watchStudentDetails, studentType]);
  
  // Reset fees when switching between single and group
  useEffect(() => {
    if (studentType === 'GROUP') {
      setValue('paymentAmount', undefined, { shouldValidate: true });
      setValue('tutorFees', undefined, { shouldValidate: true });
    }
  }, [studentType, setValue]);

  useEffect(() => {
    if (initialData) {
      const next = defaultValues;
      Object.entries(next).forEach(([k, v]) => setValue(k as keyof IClassLeadFormData, v as any));
    }
  }, [initialData, defaultValues, setValue]);

  const mode = watch('mode');
  const selectedCity = watch('city') || '';
  const areaType = selectedCity ? `AREA_${selectedCity.toUpperCase().replace(/\s+/g, '_')}` : '';
  const { options: areaOptionItems } = useOptions(areaType);
  const areaLabels = useMemo(() => areaOptionItems.map((o) => o.label), [areaOptionItems]);

  const handleFormSubmit: SubmitHandler<IClassLeadFormData> = (formData) => {
    const payload: IClassLeadFormData = { ...formData };

    if (payload.studentType === 'SINGLE') {
      // Group-only fields should not be sent for single-student leads
      delete (payload as any).studentDetails;
      delete (payload as any).numberOfStudents;
    }

    onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} display="flex" flexDirection="column" gap={3}>
      {/* Student Type Selection */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Student Type</Typography>
        <FormControl component="fieldset">
          <RadioGroup 
            row 
            value={studentType} 
            onChange={(e) => {
              setValue('studentType', e.target.value as StudentType);
              // Reset form when changing student type
              if (e.target.value === 'SINGLE') {
                setValue('studentDetails', []);
              } else {
                setValue('studentName', '');
                setValue('grade', '');
                setValue('subject', []);
                setValue('numberOfStudents', 1);
              }
            }}
          >
            <FormControlLabel value="SINGLE" control={<Radio />} label="Single Student" />
            <FormControlLabel value="GROUP" control={<Radio />} label="Group of Students" />
          </RadioGroup>
          {errors.studentType && (
            <Typography color="error" variant="caption">{errors.studentType.message}</Typography>
          )}
        </FormControl>
      </Paper>
      {/* Single Student Fields */}
      {studentType === 'SINGLE' && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Student Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField 
                label="Student Name" 
                fullWidth 
                {...register('studentName')} 
                error={!!errors.studentName} 
                helperText={errors.studentName?.message} 
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Gender"
                fullWidth
                {...register('studentGender')}
                error={!!errors.studentGender}
                helperText={errors.studentGender?.message}
              >
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Grade/Class"
                fullWidth
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
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                freeSolo
                options={subjectLabels}
                value={watch('subject') || []}
                onChange={(_, value) => setValue('subject', value as string[], { shouldValidate: true })}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option + index} />
                  ))
                }
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Subjects" 
                    error={!!errors.subject} 
                    helperText={errors.subject?.message as string} 
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Group Student Fields */}
      {studentType === 'GROUP' && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Group Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Number of Students"
                type="number"
                fullWidth
                {...register('numberOfStudents', { valueAsNumber: true })}
                error={!!errors.numberOfStudents}
                helperText={errors.numberOfStudents?.message}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Grade/Class"
                fullWidth
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
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="subject"
                control={control}
                render={({ field: { value = [], onChange } }) => (
                  <Autocomplete
                    multiple
                    options={subjectLabels}
                    value={value}
                    onChange={(_, newValue) => {
                      onChange(newValue);
                    }}
                    renderTags={(value: string[], getTagProps) =>
                      value.map((option: string, index: number) => (
                        <Chip 
                          variant="outlined" 
                          label={option} 
                          {...getTagProps({ index })} 
                          key={`${option}-${index}`} 
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subjects"
                        error={!!errors.subject}
                        helperText={errors.subject?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>Students Details</Typography>
            {fields.map((field, index) => (
              <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2">Student {index + 1}</Typography>
                  {index > 0 && (
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => {
                        remove(index);
                        setValue('numberOfStudents', (numberOfStudents || 1) - 1);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Student Name"
                      fullWidth
                      {...register(`studentDetails.${index}.name` as const)}
                      error={!!errors.studentDetails?.[index]?.name}
                      helperText={errors.studentDetails?.[index]?.name?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      label="Gender"
                      fullWidth
                      {...register(`studentDetails.${index}.gender` as const)}
                      error={!!errors.studentDetails?.[index]?.gender}
                      helperText={errors.studentDetails?.[index]?.gender?.message}
                    >
                      <MenuItem value="M">Male</MenuItem>
                      <MenuItem value="F">Female</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Fees (₹)"
                      type="number"
                      fullWidth
                      {...register(`studentDetails.${index}.fees` as const, { valueAsNumber: true })}
                      error={!!errors.studentDetails?.[index]?.fees}
                      helperText={errors.studentDetails?.[index]?.fees?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Tutor Fees (₹)"
                      type="number"
                      fullWidth
                      {...register(`studentDetails.${index}.tutorFees` as const, { valueAsNumber: true })}
                      error={!!errors.studentDetails?.[index]?.tutorFees}
                      helperText={errors.studentDetails?.[index]?.tutorFees?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={() => {
                append({ name: '', gender: 'M', fees: 0, tutorFees: 0 });
                setValue('numberOfStudents', (numberOfStudents || 0) + 1);
              }}
              disabled={(numberOfStudents || 0) >= 10}
              sx={{ mt: 1 }}
            >
              Add Another Student (Max 10)
            </Button>

            {/* Totals */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    Total Fees: <strong>₹{totalFees.toLocaleString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    Total Tutor Payout: <strong>₹{totalTutorFees.toLocaleString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Net Profit: <strong>₹{(totalFees - totalTutorFees).toLocaleString()}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Contact Information */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Contact Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField 
              label={studentType === 'SINGLE' ? "Parent Email" : "Primary Contact Email"} 
              type="email" 
              fullWidth 
              {...register('parentEmail')} 
              error={!!errors.parentEmail} 
              helperText={errors.parentEmail?.message} 
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              label={studentType === 'SINGLE' ? "Parent Phone Number" : "Primary Contact Phone"} 
              fullWidth 
              {...register('parentPhone')} 
              error={!!errors.parentPhone} 
              helperText={errors.parentPhone?.message} 
            />
          </Grid>
        </Grid>
      </Paper>


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

      {studentType === 'SINGLE' && (
        <>
          <TextField
            label="Fees"
            type="number"
            fullWidth
            {...register('paymentAmount', { valueAsNumber: true })}
            error={!!errors.paymentAmount}
            helperText={errors.paymentAmount?.message}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />

          <TextField
            label="Tutor Fees"
            type="number"
            fullWidth
            {...register('tutorFees', { valueAsNumber: true })}
            error={!!errors.tutorFees}
            helperText={errors.tutorFees?.message}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </>
      )}

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
            {cityLabels.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            options={selectedCity ? areaLabels : []}
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
