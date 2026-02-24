import { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box, TextField, Button, MenuItem, Chip, Autocomplete,
  FormControl, FormLabel, RadioGroup, Radio, FormControlLabel,
  Typography, IconButton, Grid, Paper, InputAdornment, Card, CardContent, Checkbox
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import ClassIcon from '@mui/icons-material/Class';
import NoteIcon from '@mui/icons-material/Note';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
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
  parentName: yup.string().optional().min(3, 'Name must be at least 3 characters'),
  parentEmail: yup.string().optional().email('Invalid email address'),
  parentPhone: yup.string().optional(),
  grade: yup.string().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema.required('Grade is required'),
    otherwise: (schema) => schema.optional()  // Optional for GROUP, comes from studentDetails
  }),
  subject: yup.array().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema.of(yup.string().required()).min(1, 'At least one subject is required').required(),
    otherwise: (schema) => schema.optional()
  }),
  board: yup.string().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema.required('Board is required'),
    otherwise: (schema) => schema.optional()
  }),
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
        tutorFees: yup.number().required('Tutor fees are required').min(0, 'Tutor fees cannot be negative'),
        parentName: yup.string().optional(),
        parentEmail: yup.string().email('Invalid email address').optional(),
        parentPhone: yup.string().optional(),
        board: yup.string().required('Board is required for student'),
        grade: yup.string().required('Grade is required for student'),
        subject: yup.array().of(yup.string().required()).min(1, 'At least one subject is required')
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
  weekdays: yup.array().of(yup.string()).optional(),
  notes: yup.string().max(500).optional(),
});


function GroupStudentRow({ index, control, register, setValue, watch, errors, remove, numberOfStudents }: any) {
  const selectedBoard = watch(`studentDetails.${index}.board`);
  const selectedGrade = watch(`studentDetails.${index}.grade`);

  const { options: boardOptions } = useOptions('BOARD');
  const selectedBoardOption = useMemo(() => boardOptions.find((b) => b.value === selectedBoard), [boardOptions, selectedBoard]);
  const { options: gradeOptions } = useOptions('GRADE', selectedBoardOption ? selectedBoardOption._id : null);
  const selectedGradeOption = useMemo(() => gradeOptions.find((g) => g.value === selectedGrade), [gradeOptions, selectedGrade]);
  const { options: subjectOptions } = useOptions('SUBJECT', selectedGradeOption ? selectedGradeOption._id : null);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2">Student {index + 1}</Typography>
        {index > 0 && (
          <IconButton size="small" color="error" onClick={() => {
            remove(index);
            setValue('numberOfStudents', (numberOfStudents || 1) - 1);
          }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Student Name"
            fullWidth
            size="small"
            {...register(`studentDetails.${index}.name` as const)}
            error={!!errors.studentDetails?.[index]?.name}
            helperText={errors.studentDetails?.[index]?.name?.message}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Gender"
            fullWidth
            size="small"
            defaultValue="M"
            {...register(`studentDetails.${index}.gender` as const)}
            error={!!errors.studentDetails?.[index]?.gender}
          >
            <MenuItem value="M">Male</MenuItem>
            <MenuItem value="F">Female</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name={`studentDetails.${index}.board`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                select
                label="Board"
                fullWidth
                size="small"
                value={value || ''}
                onChange={(e) => {
                  onChange(e.target.value);
                  setValue(`studentDetails.${index}.grade`, '', { shouldValidate: true });
                  setValue(`studentDetails.${index}.subject`, [], { shouldValidate: true });
                }}
                error={!!errors.studentDetails?.[index]?.board}
              >
                {boardOptions.length > 0 ? boardOptions.map((b) => (
                  <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                )) : Object.values(BOARD_TYPE).map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name={`studentDetails.${index}.grade`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                select
                label="Grade"
                fullWidth
                size="small"
                value={value || ''}
                onChange={(e) => {
                  onChange(e.target.value);
                  setValue(`studentDetails.${index}.subject`, [], { shouldValidate: true });
                }}
                error={!!errors.studentDetails?.[index]?.grade}
                disabled={!selectedBoard}
              >
                {gradeOptions.map((g) => (
                  <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Controller
            name={`studentDetails.${index}.subject`}
            control={control}
            render={({ field: { value = [], onChange } }) => (
              <Autocomplete
                multiple
                size="small"
                options={subjectOptions.length > 0 ? [{ label: 'Select All', value: 'SELECT_ALL' }, ...subjectOptions] : []}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                value={
                  (value || []).map((val: string) => {
                    const opt = subjectOptions.find(o => o.value === val);
                    return opt ? opt : { label: val, value: val };
                  })
                }
                onChange={(_, newValue) => {
                  if (newValue.some(v => (typeof v === 'string' ? v : v.value) === 'SELECT_ALL')) {
                    if ((value || []).length === subjectOptions.length) {
                      onChange([]);
                    } else {
                      onChange(subjectOptions.map(o => o.value));
                    }
                  } else {
                    onChange(newValue.map(v => typeof v === 'string' ? v : v.value));
                  }
                }}
                disabled={!selectedGrade}
                renderOption={(props, option, { selected }) => {
                  const { key, ...rest } = props as any;
                  const isSelectAll = (typeof option === 'string' ? option : option.label) === 'Select All';
                  const allSelected = (value || []).length === subjectOptions.length && subjectOptions.length > 0;
                  return (
                    <li key={key} {...rest}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={isSelectAll ? allSelected : selected}
                      />
                      {typeof option === 'string' ? option : option.label}
                    </li>
                  );
                }}
                renderTags={(val, getTagProps) =>
                  val.map((option: any, i: number) => (
                    <Chip size="small" variant="outlined" label={typeof option === 'string' ? option : option.label} {...getTagProps({ index: i })} key={i} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subjects"
                    error={!!errors.studentDetails?.[index]?.subject}
                  />
                )}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Parent Name"
            fullWidth
            size="small"
            {...register(`studentDetails.${index}.parentName`)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Parent Email"
            fullWidth
            size="small"
            {...register(`studentDetails.${index}.parentEmail`)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Parent Phone"
            fullWidth
            size="small"
            {...register(`studentDetails.${index}.parentPhone`)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Fees"
            type="number"
            fullWidth
            size="small"
            {...register(`studentDetails.${index}.fees` as const, { valueAsNumber: true })}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Tutor Fees"
            type="number"
            fullWidth
            size="small"
            {...register(`studentDetails.${index}.tutorFees` as const, { valueAsNumber: true })}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function ClassLeadForm({ initialData, onSubmit, loading, error, submitButtonText = 'Create Lead' }: Props) {
  // Compute default values BEFORE useForm
  const defaultValues: IClassLeadFormData = useMemo(() => {
    const initialStudentType = (initialData as any)?.studentType || 'SINGLE';
    return {
      studentType: initialStudentType,
      studentName: initialData?.studentName || '',
      studentGender: (initialData as any)?.studentGender || 'M',
      parentName: (initialData as any)?.parentName || '',
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
      weekdays: (initialData as any)?.weekdays || [],
      paymentAmount: initialStudentType === 'SINGLE' ? ((initialData as any)?.paymentAmount ?? undefined) : undefined,
      tutorFees: initialStudentType === 'SINGLE' ? ((initialData as any)?.tutorFees ?? undefined) : undefined,
      classesPerMonth: (initialData as any)?.classesPerMonth ?? undefined,
      classDurationHours: (initialData as any)?.classDurationHours ?? undefined,
      leadSource: (initialData as any)?.leadSource || '',
      notes: (initialData as any)?.notes || '',
      numberOfStudents: (initialData as any)?.numberOfStudents ?? 1,
      studentDetails: (initialData as any)?.studentDetails?.length > 0
        ? (initialData as any).studentDetails
        : (initialData as any)?.groupClass?.students || [
          { name: '', gender: 'M' as 'M' | 'F', fees: 0, tutorFees: 0, board: '', grade: '', subject: [], parentName: '', parentEmail: '', parentPhone: '' }
        ],
    };
  }, [initialData]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<IClassLeadFormData>({
    resolver: yupResolver(schema as any),
    defaultValues: defaultValues,
  });



  // Watch values for hierarchy
  const selectedBoard = watch('board');
  const selectedGrade = watch('grade');

  // Fetch Options
  const { options: boardOptions } = useOptions('BOARD');

  // Dependent Options
  const selectedBoardOption = useMemo(() => boardOptions.find(b => b.value === selectedBoard), [boardOptions, selectedBoard]);
  const { options: gradeOptions } = useOptions('GRADE', selectedBoardOption ? selectedBoardOption._id : null);

  const selectedGradeOption = useMemo(() => gradeOptions.find(g => g.value === selectedGrade), [gradeOptions, selectedGrade]);
  const { options: subjectOptions } = useOptions('SUBJECT', selectedGradeOption ? selectedGradeOption._id : null);

  const { options: cityOptionItems } = useOptions('CITY');
  const cityLabels = useMemo(() => cityOptionItems.map((o) => o.label), [cityOptionItems]);

  // Reset form when initialData changes (e.g., when editing an existing lead)
  useEffect(() => {
    if (initialData) {
      reset(defaultValues);
    }
  }, [initialData, reset]);

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
          append({ name: '', gender: 'M' as 'M' | 'F', fees: 0, tutorFees: 0, board: '', grade: '', subject: [], parentName: '', parentEmail: '', parentPhone: '' });
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

  // Reset logic for hierarchy
  useEffect(() => {
    // Optional: Reset grade/subjects if board changes significantly.
    // Currently we rely on user interaction to change fields.
    // But strictly speaking if I change Board from CBSE to ICSE, 
    // the currently selected Grade (e.g. "CBSE_10") might be invalid for ICSE ("ICSE_10").
    // So we SHOULD reset.
    if (selectedGrade && selectedBoard) {
      // Helper check: does current selectedGrade string start with selectedBoard? 
      // Or better, is it in the new gradeOptions?
      // gradeOptions are fetched async, so checking here might be tricky if they aren't loaded yet.
      // A simple heuristic: if Board changes, reset Grade.
      // But we need to avoid resetting on initial load.
      // Using a ref to track "mounted" or "previousBoard" would be better.
      // For now, let's keep it simple and trust the user to re-select if options change.
    }
  }, [selectedBoard]);


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
    } else {
      // For GROUP, populate top-level fields from studentDetails and aggregated totals
      if (payload.studentDetails && payload.studentDetails.length > 0) {
        const firstStudent = payload.studentDetails[0];
        payload.grade = firstStudent.grade || payload.grade;
        payload.subject = firstStudent.subject || payload.subject;
        payload.board = firstStudent.board || payload.board;
        payload.paymentAmount = totalFees;
        payload.tutorFees = totalTutorFees;
      }
    }

    onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} display="flex" flexDirection="column" gap={3}>

      {/* 1. Student Type */}
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PersonIcon color="primary" />
            <Typography variant="h6">Student Type</Typography>
          </Box>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={studentType}
              onChange={(e) => {
                setValue('studentType', e.target.value as StudentType);
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
        </CardContent>
      </Card>

      {/* 2. Curriculum (Only for SINGLE) */}
      {studentType === 'SINGLE' && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SchoolIcon color="primary" />
              <Typography variant="h6">Curriculum</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Board"
                  fullWidth
                  value={watch('board')}
                  onChange={(e) => {
                    setValue('board', e.target.value, { shouldValidate: true });
                    setValue('grade', '', { shouldValidate: true });
                    setValue('subject', [], { shouldValidate: true });
                  }}
                  error={!!errors.board}
                  helperText={errors.board?.message}
                >
                  {boardOptions.length > 0 ? (
                    boardOptions.map((b) => (
                      <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                    ))
                  ) : (
                    Object.values(BOARD_TYPE).map((b) => (
                      <MenuItem key={b} value={b}>{b}</MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 3. Student / Group Details */}
      {studentType === 'SINGLE' && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PersonIcon color="primary" />
              <Typography variant="h6">Student Information</Typography>
            </Box>
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
                  value={watch('studentGender') || 'M'}
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
                  value={watch('grade')}
                  onChange={(e) => {
                    setValue('grade', e.target.value, { shouldValidate: true });
                    setValue('subject', [], { shouldValidate: true });
                  }}
                  error={!!errors.grade}
                  helperText={errors.grade?.message}
                  disabled={!selectedBoard}
                >
                  {gradeOptions.map((g) => (
                    <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={subjectOptions.length > 0 ? [{ label: 'Select All', value: 'SELECT_ALL' }, ...subjectOptions] : []}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  value={
                    (watch('subject') || []).map((val: string) => {
                      const opt = subjectOptions.find(o => o.value === val);
                      return opt ? opt : { label: val, value: val };
                    })
                  }
                  onChange={(_, newValue) => {
                    if (newValue.some(v => (typeof v === 'string' ? v : v.value) === 'SELECT_ALL')) {
                      const currentSubjects = watch('subject') || [];
                      if (currentSubjects.length === subjectOptions.length) {
                        setValue('subject', [], { shouldValidate: true });
                      } else {
                        const allValues = subjectOptions.map(o => o.value);
                        setValue('subject', allValues, { shouldValidate: true });
                      }
                    } else {
                      const values = newValue.map(v => typeof v === 'string' ? v : v.value);
                      setValue('subject', values, { shouldValidate: true });
                    }
                  }}
                  disabled={!selectedGrade}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...rest } = props as any;
                    const isSelectAll = (typeof option === 'string' ? option : option.label) === 'Select All';
                    const allSelected = (watch('subject') || []).length === subjectOptions.length && subjectOptions.length > 0;
                    return (
                      <li key={key} {...rest}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={isSelectAll ? allSelected : selected}
                        />
                        {typeof option === 'string' ? option : option.label}
                      </li>
                    );
                  }}
                  renderTags={(value: readonly any[], getTagProps) =>
                    value.map((option: any, index: number) => (
                      <Chip variant="outlined" label={typeof option === 'string' ? option : option.label} {...getTagProps({ index })} key={index} />
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
          </CardContent>
        </Card>
      )}

      {studentType === 'GROUP' && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PersonIcon color="primary" />
              <Typography variant="h6">Group Information</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
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
            </Grid>
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>Students Details</Typography>
              {fields.map((field, index) => (
                <GroupStudentRow
                  key={field.id}
                  index={index}
                  control={control}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                  remove={remove}
                  numberOfStudents={numberOfStudents}
                />
              ))}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => {
                append({ name: '', gender: 'M', fees: 0, tutorFees: 0, board: '', grade: '', subject: [], parentName: '', parentEmail: '', parentPhone: '' });
                setValue('numberOfStudents', (numberOfStudents || 0) + 1);
              }}
                disabled={(numberOfStudents || 0) >= 10}>
                Add Student (Max 10)
              </Button>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.100' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">Total Fees</Typography>
                    <Typography variant="h6" color="primary">₹{totalFees.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">Total Tutor Payout</Typography>
                    <Typography variant="h6" color="primary">₹{totalTutorFees.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">Net Company Revenue</Typography>
                    <Typography variant="h6" color="success.main">₹{(totalFees - totalTutorFees).toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 4. Class Details */}
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ClassIcon color="primary" />
            <Typography variant="h6">Class Requirements</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem' }}>Teaching Mode</FormLabel>
                <RadioGroup row value={mode} onChange={(_, v) => setValue('mode', v as any, { shouldValidate: true })}>
                  {Object.values(TEACHING_MODE).map((m) => (
                    <FormControlLabel key={m} value={m} control={<Radio size="small" />} label={<Typography variant="body2">{m}</Typography>} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Preferred Timing</Typography>

                {/* Days of Week Selection */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary" display="block" mb={1}>Days</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                      const currentWeekdays = watch('weekdays') || [];
                      const isSelected = currentWeekdays.includes(day);
                      // Display label in Title Case for better UI
                      const displayLabel = day.charAt(0) + day.slice(1).toLowerCase().substring(0, 2);
                      return (
                        <Chip
                          key={day}
                          label={displayLabel}
                          size="small"
                          color={isSelected ? "primary" : "default"}
                          variant={isSelected ? "filled" : "outlined"}
                          onClick={() => {
                            let newWeekdays = [...currentWeekdays];
                            if (isSelected) {
                              newWeekdays = newWeekdays.filter(d => d !== day);
                            } else {
                              newWeekdays.push(day);
                              // Sort by day order
                              const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
                              newWeekdays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
                            }
                            setValue('weekdays', newWeekdays, { shouldValidate: true });
                          }}
                          clickable
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Time Selection */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Start Time"
                      type="time"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }} // 5 min
                      defaultValue=""
                      onChange={(e) => {
                        const val = e.target.value; // "14:30"
                        if (!val) return;

                        const [hStr, mStr] = val.split(':');
                        let h = parseInt(hStr);
                        const m = parseInt(mStr);

                        // Calculate End Time based on duration
                        const duration = watch('classDurationHours') || 1;
                        const startDate = new Date();
                        startDate.setHours(h, m, 0);
                        const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

                        // Format Strings
                        const formatTime = (date: Date) => {
                          let hours = date.getHours();
                          const minutes = date.getMinutes();
                          const ampm = hours >= 12 ? 'PM' : 'AM';
                          hours = hours % 12;
                          hours = hours ? hours : 12; // the hour '0' should be '12'
                          const strTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm;
                          return strTime;
                        };

                        const startTimeStr = formatTime(startDate);
                        const endTimeStr = formatTime(endDate);
                        const timeRange = `${startTimeStr} - ${endTimeStr}`;

                        setValue('timing', timeRange, { shouldValidate: true });
                      }}
                    />
                  </Grid>
                </Grid>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  * End time calculated from Duration ({watch('classDurationHours') || 1} hr) based on selected Start Time
                </Typography>
                {errors.timing && <Typography variant="caption" color="error">{errors.timing.message}</Typography>}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Classes per Month"
                type="number"
                fullWidth
                {...register('classesPerMonth', { valueAsNumber: true })}
                error={!!errors.classesPerMonth}
                helperText={errors.classesPerMonth?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Class Duration (hours)"
                type="number"
                fullWidth
                {...register('classDurationHours', { valueAsNumber: true })}
                inputProps={{ step: 0.5 }}
                error={!!errors.classDurationHours}
                helperText={errors.classDurationHours?.message}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 5. Location (Conditional) */}
      {(mode === TEACHING_MODE.OFFLINE || mode === TEACHING_MODE.HYBRID) && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PlaceIcon color="primary" />
              <Typography variant="h6">Location Details</Typography>
            </Box>
            <Grid container spacing={2}>
              {mode === TEACHING_MODE.HYBRID && (
                <Grid item xs={12}>
                  <TextField label="Location" fullWidth {...register('location')} error={!!errors.location} helperText={errors.location?.message} />
                </Grid>
              )}
              {mode === TEACHING_MODE.OFFLINE && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="City"
                      fullWidth
                      defaultValue={defaultValues.city}
                      {...register('city')}
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    >
                      {cityLabels.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={selectedCity ? areaLabels : []}
                      value={watch('area') || ''}
                      onChange={(_, value) => setValue('area', value || '', { shouldValidate: true })}
                      renderInput={(params) => (
                        <TextField {...params} label="Area" error={!!errors.area} helperText={errors.area?.message} />
                      )}
                      freeSolo={false}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Address / Google Map Link"
                      multiline
                      rows={2}
                      fullWidth
                      {...register('address')}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 6. Financials (Single Student) */}
      {studentType === 'SINGLE' && (
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CurrencyRupeeIcon color="primary" />
              <Typography variant="h6">Financials</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Student Fees"
                  type="number"
                  fullWidth
                  {...register('paymentAmount', { valueAsNumber: true })}
                  error={!!errors.paymentAmount}
                  helperText={errors.paymentAmount?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tutor Payout"
                  type="number"
                  fullWidth
                  {...register('tutorFees', { valueAsNumber: true })}
                  error={!!errors.tutorFees}
                  helperText={errors.tutorFees?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 7. Contact Information */}
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ContactPhoneIcon color="primary" />
            <Typography variant="h6">Contact Information</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label={studentType === 'SINGLE' ? "Parent Name" : "Primary Name"}
                fullWidth
                {...register('parentName')}
                error={!!errors.parentName}
                helperText={errors.parentName?.message}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register('parentEmail')}
                error={!!errors.parentEmail}
                helperText={errors.parentEmail?.message}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Phone"
                fullWidth
                {...register('parentPhone')}
                error={!!errors.parentPhone}
                helperText={errors.parentPhone?.message}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 8. Additional Info */}
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <NoteIcon color="primary" />
            <Typography variant="h6">Additional Information</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Preferred Tutor Gender"
                fullWidth
                defaultValue={(initialData as any)?.preferredTutorGender || ''}
                {...register('preferredTutorGender')}
              >
                <MenuItem value="">No preference</MenuItem>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Internal Notes / Remarks"
                multiline
                rows={3}
                fullWidth
                {...register('notes')}
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <ErrorAlert error={error} />}

      <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', p: 2, zIndex: 10, boxShadow: 3 }}>
        <Button size="large" type="submit" variant="contained" color="primary" fullWidth disabled={!!loading} startIcon={!loading && <AddIcon />}>
          {loading ? <LoadingSpinner /> : submitButtonText}
        </Button>
      </Box>
    </Box>
  );
}
