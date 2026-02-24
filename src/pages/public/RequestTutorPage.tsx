import { useState } from 'react';
import { Container, Box, Typography, Card, CardContent, TextField, MenuItem, Button, Alert, Grid, SelectChangeEvent, Checkbox, ListItemText } from '@mui/material';
import { useOptions } from '@/hooks/useOptions';

interface FormState {
  studentName: string;
  studentGender: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  grade: string;
  subjects: string[];
  board: string;
  mode: string;
  city: string;
  area: string;
  address: string;
  timing: string;
  preferredTutorGender: string;
  notes: string;
}

export default function RequestTutorPage() {
  const [form, setForm] = useState<FormState>({
    studentName: '',
    studentGender: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    grade: '',
    subjects: [],
    board: 'CBSE',
    mode: 'OFFLINE',
    city: '',
    area: '',
    address: '',
    timing: '',
    preferredTutorGender: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch root options
  const { options: boardOptions } = useOptions('BOARD');
  const { options: modeOptions } = useOptions('TEACHING_MODE');
  
  // Find board ID to fetch dependent grades
  const selectedBoardOption = boardOptions.find(b => b.value === form.board);
  const { options: gradeOptions } = useOptions('GRADE', selectedBoardOption ? selectedBoardOption._id : null);

  // Find grade ID to fetch dependent subjects
  const selectedGradeOption = gradeOptions.find(g => g.value === form.grade);
  const { options: subjectOptions } = useOptions('SUBJECT', selectedGradeOption ? selectedGradeOption._id : null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectsChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value;
    const values = Array.isArray(value) ? (value as string[]) : String(value).split(',');
    
    if (values.includes('SELECT_ALL')) {
      if (form.subjects.length === subjectOptions.length) {
        setForm((prev) => ({ ...prev, subjects: [] }));
      } else {
        setForm((prev) => ({ ...prev, subjects: subjectOptions.map((opt) => opt.value) }));
      }
    } else {
      setForm((prev) => ({ ...prev, subjects: values }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const payload = {
        studentName: form.studentName,
        studentGender: form.studentGender || undefined,
        parentName: form.parentName || undefined,
        parentEmail: form.parentEmail || undefined,
        parentPhone: form.parentPhone || undefined,
        grade: form.grade,
        subject: form.subjects,
        board: form.board,
        mode: form.mode,
        city: form.city || undefined,
        area: form.area || undefined,
        address: form.address || undefined,
        timing: form.timing,
        preferredTutorGender: form.preferredTutorGender || undefined,
        notes: form.notes || undefined,
      };

      const baseUrl = (process.env.REACT_APP_API_BASE_URL as string) || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/public/leads/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to submit request');
      }

      setSuccess('Thank you! Your tutoring request has been submitted. Our team will contact you shortly.');
      setForm({
        studentName: '',
        studentGender: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        grade: '',
        subjects: [],
        board: '',
        mode: '',
        city: '',
        area: '',
        address: '',
        timing: '',
        preferredTutorGender: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while submitting your request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={3} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Request a Home Tutor (Single Student)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Parents can fill this form to raise a new class lead for one student. Our team will follow up with you.
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Student Name"
                  name="studentName"
                  value={form.studentName}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Student Gender"
                  name="studentGender"
                  value={form.studentGender}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Parent Name"
                  name="parentName"
                  value={form.parentName}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Parent Email"
                  name="parentEmail"
                  type="email"
                  value={form.parentEmail}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Parent Phone"
                  name="parentPhone"
                  value={form.parentPhone}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Mode"
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                >
                  {modeOptions.length > 0 ? (
                      modeOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))
                  ) : (
                      <MenuItem value="OFFLINE">Offline</MenuItem>
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Board"
                  name="board"
                  value={form.board}
                  onChange={(e) => {
                    const newBoard = e.target.value;
                    setForm(prev => ({ 
                      ...prev, 
                      board: newBoard, 
                      grade: '', // Reset grade when board changes
                      subjects: [] // Reset subjects when board (and thus grade keys) changes
                    }));
                  }}
                  required
                  fullWidth
                  size="small"
                >
                  {boardOptions.length > 0 ? (
                    boardOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="CBSE">CBSE</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                 <TextField
                  select
                  label="Grade / Class"
                  name="grade"
                  value={form.grade}
                  onChange={(e) => {
                    const newGrade = e.target.value;
                    setForm(prev => ({ 
                      ...prev, 
                      grade: newGrade,
                      subjects: [] // Reset subjects when grade changes
                    }));
                  }}
                  required
                  fullWidth
                  size="small"
                  disabled={!form.board}
                >
                   {/* We need to fetch grades based on board. 
                       Since useOptions hook is rigid in this scope (declared at top), 
                       we might need a cleaner way or just use a new hook instance here. 
                       BUT hooks can't be conditional. 
                       So we will declare the hooks at the top level with dynamic dependency. */}
                   {gradeOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                   ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  SelectProps={{
                    multiple: true,
                    value: form.subjects,
                    onChange: handleSubjectsChange,
                    renderValue: (selected) => {
                        const selectedLabels = (selected as string[])
                            .filter(val => val !== 'SELECT_ALL')
                            .map(val => 
                                subjectOptions.find(opt => opt.value === val)?.label || val
                            );
                        return selectedLabels.join(', ');
                    }
                  }}
                  label="Subjects"
                  name="subjects"
                  required
                  fullWidth
                  size="small"
                  disabled={!form.grade}
                >
                  {subjectOptions.length > 0 && (
                    <MenuItem value="SELECT_ALL">
                      <Checkbox checked={form.subjects.length === subjectOptions.length && subjectOptions.length > 0} />
                      <ListItemText primary={form.subjects.length === subjectOptions.length ? 'Unselect All' : 'Select All'} />
                    </MenuItem>
                  )}
                  {subjectOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Checkbox checked={form.subjects.indexOf(opt.value) > -1} />
                      <ListItemText primary={opt.label} />
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>



              <Grid item xs={12} md={6}>
                <TextField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Area / Locality"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Full Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Preferred Class Time"
                  name="timing"
                  value={form.timing}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mon-Fri, 6-7 PM"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Preferred Tutor Gender"
                  name="preferredTutorGender"
                  value={form.preferredTutorGender}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                    <MenuItem value="">No preference</MenuItem>
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Anything else we should know?"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
            </Grid>

            <Box mt={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
                fullWidth
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
