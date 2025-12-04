import React from 'react';
import { Avatar } from '@mui/material';
import { User, Phone, Mail, Calendar, MapPin, GraduationCap, Briefcase, BookOpen, Clock, FileText, CheckCircle, Star } from 'lucide-react';
import { ITutor, IPublicTutorReview } from '../../types';

interface PublicTutorProfileCardProps {
  tutor: ITutor;
  reviews?: IPublicTutorReview[];
}

const PublicTutorProfileCard: React.FC<PublicTutorProfileCardProps> = ({ tutor, reviews = [] }) => {
  const { user } = tutor;
  const rating = tutor.ratings ?? 0;
  const totalHours = (tutor as any).experienceHours ?? 0;
  const classesAssigned = (tutor as any).classesAssigned ?? 0;
  const classesCompleted = (tutor as any).classesCompleted ?? 0;
  const activeClasses = Math.max(0, classesAssigned - classesCompleted);

  const profilePhotoDoc = (tutor.documents || []).find((d) => d.documentType === 'PROFILE_PHOTO');
  const profileImageUrl = profilePhotoDoc?.documentUrl;

  const initials = (user?.name || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const personalDetails = {
    profilePhoto: profileImageUrl,
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    tutorId: tutor.teacherId || user?.email || '',
    whatsappNumber: user?.phone || '',
  };

  const education = {
    highestQualification: (tutor as any).qualifications?.[0] || '',
    currentInstitution: (tutor as any).currentInstitution || '',
  };

  const workExperience = {
    teachingExperience: `${totalHours} Hours`,
    subjects: (tutor as any).subjects || [],
    classesCanTeach: (tutor as any).classesCanTeach || [],
    educationBoards: (tutor as any).educationBoards || [],
    extracurricularActivities: (tutor as any).extracurricularActivities || [],
  };

  const locationPreferences = {
    fullAddress: (tutor as any).fullAddress || '',
    pinCode: (tutor as any).pinCode || '',
    teachingMode: (tutor as any).preferredMode || '',
    preferredLocations: (tutor as any).preferredLocations || [],
    availableTimeSlots: (tutor as any).availableTimeSlots || [],
  };

  const documents = {
    aadhar: (tutor.documents || []).some((d) => d.documentType === 'AADHAR' && d.verifiedAt),
    panCard: (tutor.documents || []).some((d) => d.documentType === 'PAN_CARD' && d.verifiedAt),
    collegeId: (tutor.documents || []).some((d) => d.documentType === 'COLLEGE_ID' && d.verifiedAt),
    bankStatement: (tutor.documents || []).some((d) => d.documentType === 'BANK_STATEMENT' && d.verifiedAt),
    qualificationCert: (tutor.documents || []).some((d) => d.documentType === 'QUALIFICATION_CERT' && d.verifiedAt),
  };

  const tutorData = {
    personalDetails,
    education,
    workExperience,
    locationPreferences,
    documents,
    rating,
    totalTeachingHours: totalHours,
    activeClasses,
  };

  return (
    <div className="space-y-6">
      {/* Header card (copied style from MUIProfileCard, but read-only) */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-xl">
              {personalDetails.profilePhoto ? (
                <img
                  src={personalDetails.profilePhoto}
                  alt={personalDetails.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <User className="w-16 h-16" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-xl px-2 py-0.5 shadow-lg">
              <span className="text-[10px] font-bold">Active</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold">{personalDetails.fullName}</h1>
            <p className="text-blue-300 text-sm">{education.highestQualification}</p>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <span className="text-xs opacity-75">Tutor ID:</span>
              <span className="font-mono text-sm font-semibold">{personalDetails.tutorId}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2 text-center">
              <div className="text-xl font-bold">{tutorData.totalTeachingHours}</div>
              <div className="text-xs opacity-75">Total Hours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2 text-center">
              <div className="text-xl font-bold">{rating.toFixed(1)}</div>
              <div className="text-xs opacity-75">Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2 text-center">
              <div className="text-xl font-bold">{tutorData.activeClasses}</div>
              <div className="text-xs opacity-75">Active Classes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal details + education */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email Address</p>
                <p className="text-sm font-medium text-gray-900">{personalDetails.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">WhatsApp Number</p>
                <p className="text-sm font-medium text-gray-900">{personalDetails.whatsappNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Education
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">Highest Qualification</p>
              <p className="text-lg font-bold text-blue-900">{education.highestQualification}</p>
            </div>

            {education.currentInstitution && (
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Current Institution</p>
                  <p className="text-sm font-medium text-gray-900">{education.currentInstitution}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Work & Teaching Experience */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Work & Teaching Experience
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">Teaching Experience</p>
              <p className="text-lg font-bold text-green-900">{workExperience.teachingExperience}</p>
            </div>
          </div>

          <div>
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {workExperience.subjects.map((subject: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents summary */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Documents
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(documents).map(([key, value]) => (
            <div
              key={key}
              className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center mb-2">
                {value ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <FileText className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-xs text-center font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-xs text-center text-green-600 font-medium mt-1">
                {value ? 'Verified' : 'Pending'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews section */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Reviews from Parents & Students
          </h2>
          <div className="space-y-4">
            {reviews.map((rev) => {
              const name = rev.studentName || 'Student';
              const initials = name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              const date = new Date(rev.createdAt);
              const dateLabel = date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              return (
                <div
                  key={rev.id}
                  className="flex gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      {name ? initials : 'S'}
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-500">
                      {rev.submitterRole === 'PARENT' ? 'Parent' : 'Student'}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-500">{dateLabel}</p>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rev.overallRating ? 'text-yellow-500' : 'text-gray-300'}`}
                          fill={i < rev.overallRating ? 'currentColor' : 'none'}
                        />
                      ))}
                      <p className="ml-1 text-xs text-gray-600">{rev.overallRating.toFixed(1)}/5</p>
                    </div>
                    {rev.comments && (
                      <p className="text-sm text-gray-700 leading-snug">{rev.comments}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTutorProfileCard;
