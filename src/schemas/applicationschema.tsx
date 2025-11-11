import { z } from 'zod';
import { Gender, City, Subject } from '@/types/enums';

// Tutor Lead Registration Schema
export const tutorLeadRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  gender: z.nativeEnum(Gender),
  phoneNumber: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => /^\d{10}$/.test(v), 'Phone number must be 10 digits'),
  email: z.string().email('Invalid email format'),
  qualification: z.string().min(1, 'Qualification is required'),
  experience: z.string().min(1, 'Experience is required'),
  subjects: z.array(z.nativeEnum(Subject)).min(1, 'Select at least one subject'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6),
  city: z.nativeEnum(City, { error: 'Please select a city' }),
  preferredAreas: z.array(z.string()).min(1, 'Select at least one area'),
  pincode: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => /^\d{6}$/.test(v), 'Pincode must be 6 digits'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

// Home Tutor Registration Schema (profile completion)
export const homeTutorRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.literal('teacher'),
  provider: z.literal('local'),
  profile: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    phoneNumber: z
      .string()
      .optional()
      .transform((v) => (v ? v.replace(/\D/g, '') : v))
      .refine((v) => (v ? /^\d{10}$/.test(v) : true), 'Phone number must be 10 digits'),
    avatar: z.string().optional(),
    dateOfBirth: z
      .string()
      .optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  }),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  tutorLead: z.object({
    gender: z.nativeEnum(Gender).optional(),
    qualification: z.string().optional(),
    experience: z.string().optional(),
    subjects: z.array(z.string()).optional(),
    preferredAreas: z.array(z.string()).optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),
    phoneNumber: z.string().optional(),
  }).optional(),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type TutorLeadRegistrationInput = z.infer<typeof tutorLeadRegistrationSchema>;
export type HomeTutorRegistrationInput = z.infer<typeof homeTutorRegistrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;