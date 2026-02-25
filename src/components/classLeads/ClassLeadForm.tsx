import { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box, TextField, Button, MenuItem, Chip, Autocomplete,
  FormControl, FormLabel, RadioGroup, Radio, FormControlLabel,
  Typography, IconButton, Grid, Paper, InputAdornment, Card, CardContent, Checkbox,
  Divider, alpha, Stack
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
import GroupsIcon from '@mui/icons-material/Groups';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimerIcon from '@mui/icons-material/Timer';

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

/* ─── Reusable Section Header ─────────────────────────────────────────────── */
function SectionHeader({ step, icon, title, subtitle }: { step: number; icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <Box display="flex" alignItems="center" gap={2} mb={3}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'common.white',
          fontWeight: 800,
          fontSize: '0.85rem',
          flexShrink: 0,
        }}
      >
        {step}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" alignItems="center" gap={1}>
          {icon}
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
            {title}
          </Typography>
        </Box>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ─── Section Card Wrapper ────────────────────────────────────────────────── */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.100',
        boxShadow: '0 2px 12px -4px rgba(0,0,0,0.06)',
        overflow: 'visible',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 6px 20px -6px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
        {children}
      </CardContent>
    </Card>
  );
}

const schema = yup.object({
  studentType: yup.string().oneOf(['SINGLE', 'GROUP']).required('Please select student type'),
  studentName: yup.string().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema.required('Student name is required').min(2).max(100),
    otherwise: (schema) => schema.optional()
  }),
  studentGender: yup.string().when('studentType', {
    is: 'SINGLE',
    then: (schema) => schema.required('Student gender is required').oneOf(['M', 'F', 'OTHER'], 'Please select gender'),
    otherwise: (schema) => schema.optional()
  }),
  parentName: yup.string().optional().min(3, 'Name must be at least 3 characters'),
  parentEmail: yup.string().optional().email('Invalid email address'),
  parentPhone: yup
    .string()
    .optional()
    .transform((v) => (typeof v === 'string' ? v.replace(/\D/g, '') : v))
    .test('phone-10-digits', 'Phone number must be 10 digits', (v) => !v || v.length === 10),
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
        gender: yup.string().required('Student gender is required').oneOf(['M', 'F', 'OTHER'], 'Please select gender'),
        fees: yup.number().required('Fees are required').min(0, 'Fees cannot be negative'),
        tutorFees: yup.number().required('Tutor fees are required').min(0, 'Tutor fees cannot be negative'),
        parentName: yup.string().optional(),
        parentEmail: yup.string().email('Invalid email address').optional(),
        parentPhone: yup
          .string()
          .optional()
          .transform((v) => (typeof v === 'string' ? v.replace(/\D/g, '') : v))
          .test('phone-10-digits', 'Phone number must be 10 digits', (v) => !v || v.length === 10),
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
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 2,
        bgcolor: 'grey.50',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'grey.100',
        borderLeft: '4px solid',
        borderLeftColor: 'primary.main',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.light',
          borderLeftColor: 'primary.main',
          bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.02),
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 800,
            }}
          >
            {index + 1}
          </Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Student {index + 1}
          </Typography>
        </Box>
        {index > 0 && (
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              remove(index);
              setValue('numberOfStudents', (numberOfStudents || 1) - 1);
            }}
            sx={{
              bgcolor: 'error.50',
              '&:hover': { bgcolor: 'error.100' },
            }}
          >
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
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
            }}
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
            <MenuItem value="OTHER">Other</MenuItem>
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
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Parent Phone"
            fullWidth
            size="small"
            {...register(`studentDetails.${index}.parentPhone`)}
            inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
            }}
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
    if (selectedGrade && selectedBoard) {
      // Keep it simple and trust the user to re-select if options change.
    }
  }, [selectedBoard]);


  const mode = watch('mode');
  const selectedCity = watch('city') || '';
  const areaType = selectedCity ? `AREA_${selectedCity.toUpperCase().replace(/\s+/g, '_')}` : '';
  const { options: areaOptionItems } = useOptions(areaType);
  const areaLabels = useMemo(() => areaOptionItems.map((o) => o.label), [areaOptionItems]);

  const handleFormSubmit: SubmitHandler<IClassLeadFormData> = (formData) => {
    const payload: IClassLeadFormData = { ...formData };

    if ((payload as any).preferredTutorGender === '') {
      delete (payload as any).preferredTutorGender;
    }

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

  /* ─── Compute which step we are at for numbering ──────────────────────── */
  let stepCounter = 0;
  const nextStep = () => ++stepCounter;

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} display="flex" flexDirection="column" gap={3}>

      {/* ───────────── 1. Student Type ───────────── */}
      <SectionCard>
        <SectionHeader
          step={nextStep()}
          icon={<PersonIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
          title="Student Type"
          subtitle="Choose whether this lead is for a single student or a group"
        />
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
            <FormControlLabel
              value="SINGLE"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon sx={{ fontSize: 18, color: studentType === 'SINGLE' ? 'primary.main' : 'text.disabled' }} />
                  <Typography variant="body2" fontWeight={studentType === 'SINGLE' ? 700 : 400}>Single Student</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="GROUP"
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <GroupsIcon sx={{ fontSize: 18, color: studentType === 'GROUP' ? 'primary.main' : 'text.disabled' }} />
                  <Typography variant="body2" fontWeight={studentType === 'GROUP' ? 700 : 400}>Group of Students</Typography>
                </Box>
              }
            />
          </RadioGroup>
          {errors.studentType && (
            <Typography color="error" variant="caption">{errors.studentType.message}</Typography>
          )}
        </FormControl>
      </SectionCard>

      {/* ───────────── 2. Curriculum (SINGLE only) ───────────── */}
      {studentType === 'SINGLE' && (
        <SectionCard>
          <SectionHeader
            step={nextStep()}
            icon={<SchoolIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
            title="Curriculum"
            subtitle="Select the board to populate grade and subject options"
          />
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
        </SectionCard>
      )}

      {/* ───────────── 3. Student / Group Details ───────────── */}
      {studentType === 'SINGLE' && (
        <SectionCard>
          <SectionHeader
            step={nextStep()}
            icon={<PersonIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
            title="Student Information"
            subtitle="Enter the student's personal and academic details"
          />
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Student Name"
                fullWidth
                {...register('studentName')}
                error={!!errors.studentName}
                helperText={errors.studentName?.message}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                }}
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
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Grade / Class"
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
        </SectionCard>
      )}

      {studentType === 'GROUP' && (
        <SectionCard>
          <SectionHeader
            step={nextStep()}
            icon={<GroupsIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
            title="Group Information"
            subtitle="Add details for each student in the group"
          />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Number of Students"
                type="number"
                fullWidth
                {...register('numberOfStudents', { valueAsNumber: true })}
                error={!!errors.numberOfStudents}
                helperText={errors.numberOfStudents?.message}
                inputProps={{ min: 1, max: 10 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><GroupsIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2.5 }} />

          <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
            Student Details
          </Typography>
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
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              append({ name: '', gender: 'M', fees: 0, tutorFees: 0, board: '', grade: '', subject: [], parentName: '', parentEmail: '', parentPhone: '' });
              setValue('numberOfStudents', (numberOfStudents || 0) + 1);
            }}
            disabled={(numberOfStudents || 0) >= 10}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, mb: 3 }}
          >
            Add Student (Max 10)
          </Button>

          {/* Totals summary */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, rgba(15,98,254,0.04) 0%, rgba(15,98,254,0.08) 100%)',
              border: '1px solid',
              borderColor: 'primary.100',
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Fees
                </Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main">₹{totalFees.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tutor Payout
                </Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main">₹{totalTutorFees.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Net Revenue
                </Typography>
                <Typography variant="h6" fontWeight={800} color="success.main">₹{(totalFees - totalTutorFees).toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </Box>
        </SectionCard>
      )}

      {/* ───────────── 4. Class Requirements ───────────── */}
      <SectionCard>
        <SectionHeader
          step={nextStep()}
          icon={<ClassIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
          title="Class Requirements"
          subtitle="Mode, schedule, duration, and frequency"
        />
        <Grid container spacing={2.5}>
          {/* Teaching Mode */}
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 600 }}>Teaching Mode</FormLabel>
              <RadioGroup row value={mode} onChange={(_, v) => setValue('mode', v as any, { shouldValidate: true })}>
                {Object.values(TEACHING_MODE).map((m) => (
                  <FormControlLabel
                    key={m}
                    value={m}
                    control={<Radio size="small" />}
                    label={
                      <Typography variant="body2" fontWeight={mode === m ? 600 : 400}>
                        {m}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Preferred Timing */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'grey.100',
                borderRadius: 2.5,
                p: 2.5,
                bgcolor: 'grey.50',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccessTimeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={700}>Preferred Timing</Typography>
              </Box>

              {/* Days of Week Selection */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={1} fontWeight={600}>
                  Days
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.75}>
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                    const currentWeekdays = watch('weekdays') || [];
                    const isSelected = currentWeekdays.includes(day);
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
                            const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
                            newWeekdays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
                          }
                          setValue('weekdays', newWeekdays, { shouldValidate: true });
                        }}
                        clickable
                        sx={{
                          fontWeight: isSelected ? 700 : 500,
                          borderRadius: '20px',
                          transition: 'all 0.15s ease',
                          minWidth: 44,
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* Time Selection */}
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                defaultValue=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;

                  const [hStr, mStr] = val.split(':');
                  let h = parseInt(hStr);
                  const m = parseInt(mStr);

                  const duration = watch('classDurationHours') || 1;
                  const startDate = new Date();
                  startDate.setHours(h, m, 0);
                  const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

                  const formatTime = (date: Date) => {
                    let hours = date.getHours();
                    const minutes = date.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    const strTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm;
                    return strTime;
                  };

                  const startTimeStr = formatTime(startDate);
                  const endTimeStr = formatTime(endDate);
                  const timeRange = `${startTimeStr} - ${endTimeStr}`;

                  setValue('timing', timeRange, { shouldValidate: true });
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                End time auto-calculated from duration ({watch('classDurationHours') || 1} hr)
              </Typography>
              {errors.timing && <Typography variant="caption" color="error">{errors.timing.message}</Typography>}
            </Paper>
          </Grid>

          {/* Classes per Month & Duration */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Classes per Month"
              type="number"
              fullWidth
              {...register('classesPerMonth', { valueAsNumber: true })}
              error={!!errors.classesPerMonth}
              helperText={errors.classesPerMonth?.message}
              InputProps={{
                startAdornment: <InputAdornment position="start"><CalendarMonthIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
              }}
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
              InputProps={{
                startAdornment: <InputAdornment position="start"><TimerIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ───────────── 5. Location (Conditional) ───────────── */}
      {(mode === TEACHING_MODE.OFFLINE || mode === TEACHING_MODE.HYBRID) && (
        <SectionCard>
          <SectionHeader
            step={nextStep()}
            icon={<PlaceIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
            title="Location Details"
            subtitle={mode === TEACHING_MODE.OFFLINE ? "Offline tuition location" : "Hybrid mode location"}
          />
          <Grid container spacing={2}>
            {mode === TEACHING_MODE.HYBRID && (
              <Grid item xs={12}>
                <TextField
                  label="Location"
                  fullWidth
                  {...register('location')}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PlaceIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                  }}
                />
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
        </SectionCard>
      )}

      {/* ───────────── 6. Financials (Single Student) ───────────── */}
      {studentType === 'SINGLE' && (
        <SectionCard>
          <SectionHeader
            step={nextStep()}
            icon={<CurrencyRupeeIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
            title="Financials"
            subtitle="Student fees and tutor payout for this lead"
          />
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
        </SectionCard>
      )}

      {/* ───────────── 7. Contact Information ───────────── */}
      <SectionCard>
        <SectionHeader
          step={nextStep()}
          icon={<ContactPhoneIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
          title="Contact Information"
          subtitle={studentType === 'SINGLE' ? "Parent or guardian contact details" : "Primary contact details"}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label={studentType === 'SINGLE' ? "Parent Name" : "Primary Name"}
              fullWidth
              {...register('parentName')}
              error={!!errors.parentName}
              helperText={errors.parentName?.message}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
              }}
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
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Phone"
              fullWidth
              {...register('parentPhone')}
              error={!!errors.parentPhone}
              helperText={errors.parentPhone?.message}
              inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ───────────── 8. Additional Info ───────────── */}
      <SectionCard>
        <SectionHeader
          step={nextStep()}
          icon={<NoteIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
          title="Additional Information"
          subtitle="Source, tutor preferences, and internal notes"
        />
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
              <MenuItem value="OTHER">Other</MenuItem>
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
              placeholder="Add any special requirements or notes about this lead..."
            />
          </Grid>
        </Grid>
      </SectionCard>

      {error && <ErrorAlert error={error} />}

      {/* ───────────── Sticky Submit Bar ───────────── */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          p: 2,
          zIndex: 10,
          borderTop: '1px solid',
          borderColor: 'grey.100',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -4px 20px -4px rgba(0,0,0,0.08)',
        }}
      >
        <Button
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!!loading}
          disableElevation
          startIcon={!loading && <SaveIcon />}
          sx={{
            py: 1.5,
            fontWeight: 700,
            fontSize: '1rem',
            borderRadius: 2.5,
            textTransform: 'none',
            boxShadow: '0 4px 14px -4px rgba(15,98,254,0.4)',
            '&:hover': {
              boxShadow: '0 6px 20px -4px rgba(15,98,254,0.5)',
            },
          }}
        >
          {loading ? <LoadingSpinner /> : submitButtonText}
        </Button>
      </Box>
    </Box>
  );
}
