import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, GraduationCap, Lock, MapPin, Map } from 'lucide-react';
import { SubjectsMultiSelect } from './SubjectsMultiSelect';
import { AreasMultiSelect } from './AreasMultiSelect';
import { PasswordInput } from './PasswordInput';
import type { TutorLeadFormData, TutorLeadFormProps } from '@/types/tutorLead';
import { Gender } from '@/types/enums';
import { validateEmail, validatePhone } from '@/utils/leadValidation';
import { useOptions } from '@/hooks/useOptions';

export const TutorLeadForm = ({ onSubmit, isLoading }: TutorLeadFormProps) => {
  const [formData, setFormData] = useState<TutorLeadFormData>({
    fullName: '',
    gender: Gender.MALE,
    phoneNumber: '',
    email: '',
    qualification: '',
    experience: '',
    subjects: [],
    extracurricularActivities: [],
    password: '',
    confirmPassword: '',
    city: '',
    preferredAreas: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { options: extracurricularOptions } = useOptions('EXTRACURRICULAR');
  const extracurricularLabels = useMemo(
    () => extracurricularOptions.map((o) => o.label),
    [extracurricularOptions]
  );

  const { options: cityOptions } = useOptions('CITY');
  const areaType = formData.city
    ? `AREA_${formData.city.toUpperCase().replace(/\s+/g, '_')}`
    : '';
  const { options: areaOptions } = useOptions(areaType);

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
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#001F54] flex items-center gap-2">
              <User size={20} />
              Personal Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="form-label-text">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className={`${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F54] focus:ring-[#001F54]`}
                />
                {errors.fullName && <p className="form-error-text">{errors.fullName}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="form-label-text">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as typeof formData.gender }))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#001F54] focus:ring-[#001F54]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Gender).map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#001F54] flex items-center gap-2">
              <Phone size={20} />
              Contact Details
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="form-label-text">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                  maxLength={10}
                  className={`${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F54] focus:ring-[#001F54]`}
                />
                {errors.phoneNumber && <p className="form-error-text">{errors.phoneNumber}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="form-label-text">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F54] focus:ring-[#001F54]`}
                />
                {errors.email && <p className="form-error-text">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#001F54] flex items-center gap-2">
              <GraduationCap size={20} />
              Qualifications & Experience
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Qualification */}
              <div className="space-y-2">
                <Label htmlFor="qualification" className="form-label-text">
                  Qualification <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qualification"
                  type="text"
                  placeholder="e.g., B.Tech, M.Sc, B.Ed"
                  value={formData.qualification}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                  className={`${errors.qualification ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F54] focus:ring-[#001F54]`}
                />
                {errors.qualification && <p className="form-error-text">{errors.qualification}</p>}
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="form-label-text">
                  Experience <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="experience"
                  type="text"
                  placeholder="e.g., 2 years, Fresher"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className={`${errors.experience ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F54] focus:ring-[#001F54]`}
                />
                {errors.experience && <p className="form-error-text">{errors.experience}</p>}
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-2 bg-white">
              <Label className="form-label-text">
                Subjects <span className="text-red-500">*</span>
              </Label>
              <SubjectsMultiSelect
                selected={formData.subjects}
                onChange={(subjects) => setFormData(prev => ({ ...prev, subjects }))}
                error={errors.subjects}
              />
              {errors.subjects && <p className="form-error-text">{errors.subjects}</p>}
            </div>

            {/* Extracurricular Activities */}
            <div className="space-y-2 bg-white">
              <Label className="form-label-text">
                Extracurricular activities you can teach/coach
              </Label>
              <div className="flex flex-wrap gap-2">
                {extracurricularLabels.map((activity) => {
                  const selected = formData.extracurricularActivities.includes(activity);
                  return (
                    <Button
                      key={activity}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      className={selected ? 'bg-[#001F54] text-white' : ''}
                      onClick={() => {
                        setFormData((prev) => {
                          const exists = prev.extracurricularActivities.includes(activity);
                          return {
                            ...prev,
                            extracurricularActivities: exists
                              ? prev.extracurricularActivities.filter((a) => a !== activity)
                              : [...prev.extracurricularActivities, activity],
                          };
                        });
                      }}
                    >
                      {activity}
                    </Button>
                  );
                })}
                {extracurricularLabels.length === 0 && (
                  <p className="text-xs text-gray-500">No extracurricular options configured yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#001F54] flex items-center gap-2">
              <MapPin size={20} />
              Location Preferences
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="form-label-text">
                  City <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={handleCityChange}
                >
                  <SelectTrigger className={`${errors.city ? 'border-red-500' : 'border-gray-300'} focus:border-[#001F54] focus:ring-[#001F54]`}>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.label}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="form-error-text">{errors.city}</p>}
              </div>
            </div>

            {/* Preferred Areas */}
            <div className="space-y-2">
              <Label className="form-label-text flex items-center gap-2">
                <Map size={16} />
                Preferred Areas for Offline Classes <span className="text-red-500">*</span>
              </Label>
              <AreasMultiSelect
                areas={areaOptions.map((o) => o.label)}
                selected={formData.preferredAreas}
                onChange={(areas) => setFormData(prev => ({ ...prev, preferredAreas: areas }))}
                disabled={!formData.city}
                error={errors.preferredAreas}
              />
              {errors.preferredAreas && <p className="form-error-text">{errors.preferredAreas}</p>}
              {!formData.city && (
                <p className="form-helper-text">Please select a city first</p>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#001F54] flex items-center gap-2">
              <Lock size={20} />
              Account Security
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Password */}
              <PasswordInput
                label="Password"
                value={formData.password}
                onChange={(password) => setFormData(prev => ({ ...prev, password }))}
                error={errors.password}
                placeholder="Enter password"
              />

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(confirmPassword) => setFormData(prev => ({ ...prev, confirmPassword }))}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full bg-[#001F54] hover:bg-[#001233] text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register Now'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};