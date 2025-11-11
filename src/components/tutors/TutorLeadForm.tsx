import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Autocomplete,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import LockIcon from '@mui/icons-material/Lock';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapIcon from '@mui/icons-material/Map';
import type { TutorLeadFormData, TutorLeadFormProps } from '@/types/tutorLead';
import { Gender, City, Subject } from '../../types/enums';
import { validateEmail, validatePhone } from '@/utils/leadValidation';
import { mockCityAreas } from '@/pages/TutorLeadRegistrationMockData';

export const TutorLeadForm = ({ onSubmit, isLoading }: TutorLeadFormProps) => {
  const [formData, setFormData] = useState<TutorLeadFormData>({
    fullName: '',
    gender: Gender.MALE,
    phoneNumber: '',
    email: '',
    qualification: '',
    experience: '',
    subjects: [],
    password: '',
    confirmPassword: '',
    city: '',
    preferredAreas: [],
    pincode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }

    if (formData.subjects.length === 0) {
      newErrors.subjects = 'Please select at least one subject';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.city) {
      newErrors.city = 'Please select a city';
    }

    if (formData.preferredAreas.length === 0) {
      newErrors.preferredAreas = 'Please select at least one area';
    }

    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleCityChange = (city: string) => {
    setFormData(prev => ({ 
      ...prev, 
      city, 
      preferredAreas: [] // Reset areas when city changes
    }));
    // Update available areas based on selected city
    const areas = mockCityAreas[city as keyof typeof mockCityAreas] || [];
    setAvailableAreas([...areas]);
  };

  return (
    <Card elevation={6}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Box mb={3} display="flex" alignItems="center" gap={1}>
            <PersonIcon fontSize="small" />
            <Typography variant="h6">Personal Information</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(errors.gender)}>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as typeof formData.gender }))}
                >
                  {Object.values(Gender).map((gender) => (
                    <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                  ))}
                </Select>
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>

          <Box mt={4} mb={1} display="flex" alignItems="center" gap={1}>
            <PhoneIcon fontSize="small" />
            <Typography variant="h6">Contact Details</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                inputProps={{ maxLength: 10 }}
                error={Boolean(errors.phoneNumber)}
                helperText={errors.phoneNumber}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
            </Grid>
          </Grid>

          <Box mt={4} mb={1} display="flex" alignItems="center" gap={1}>
            <SchoolIcon fontSize="small" />
            <Typography variant="h6">Qualifications & Experience</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="qualification"
                label="Qualification"
                placeholder="e.g., B.Tech, M.Sc, B.Ed"
                value={formData.qualification}
                onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                error={Boolean(errors.qualification)}
                helperText={errors.qualification}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="experience"
                label="Experience"
                placeholder="e.g., 2 years, Fresher"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                error={Boolean(errors.experience)}
                helperText={errors.experience}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={Object.values(Subject)}
                value={formData.subjects}
                onChange={(_, value) => setFormData(prev => ({ ...prev, subjects: value }))}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subjects"
                    error={Boolean(errors.subjects)}
                    helperText={errors.subjects}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box mt={4} mb={1} display="flex" alignItems="center" gap={1}>
            <LocationCityIcon fontSize="small" />
            <Typography variant="h6">Location Preferences</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(errors.city)}>
                <InputLabel id="city-label">City</InputLabel>
                <Select
                  labelId="city-label"
                  id="city"
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value as string)}
                >
                  {Object.values(City).map((city) => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
                {errors.city && <FormHelperText>{errors.city}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="pincode"
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                inputProps={{ maxLength: 6 }}
                error={Boolean(errors.pincode)}
                helperText={errors.pincode}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={availableAreas}
                value={formData.preferredAreas}
                onChange={(_, value) => setFormData(prev => ({ ...prev, preferredAreas: value }))}
                disabled={!formData.city}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Preferred Areas in City"
                    error={Boolean(errors.preferredAreas)}
                    helperText={errors.preferredAreas || (!formData.city ? 'Please select a city first' : '')}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box mt={4} mb={1} display="flex" alignItems="center" gap={1}>
            <LockIcon fontSize="small" />
            <Typography variant="h6">Account Security</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                error={Boolean(errors.password)}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
              />
            </Grid>
          </Grid>

          <Box pt={3}>
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register Now'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
;