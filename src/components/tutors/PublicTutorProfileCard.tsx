import React from 'react';
import { User, GraduationCap, Briefcase, Star } from 'lucide-react';
import { ITutor } from '../../types';

interface PublicTutorProfileCardProps {
  tutor: ITutor;
}

const PublicTutorProfileCard: React.FC<PublicTutorProfileCardProps> = ({ tutor }) => {
  const { user } = tutor;
  const totalHours = (tutor as any).experienceHours ?? 0;
  const classesAssigned = (tutor as any).classesAssigned ?? 0;
  const classesCompleted = (tutor as any).classesCompleted ?? 0;
  const activeClasses = Math.max(0, classesAssigned - classesCompleted);

  const profilePhotoDoc = (tutor.documents || []).find((d) => d.documentType === 'PROFILE_PHOTO');
  const profileImageUrl = profilePhotoDoc?.documentUrl;

  const personalDetails = {
    profilePhoto: profileImageUrl,
    fullName: user?.name || '',
    tutorId: tutor.teacherId || '',
    tier: (tutor as any).tier || 'BRONZE',
    isAvailable: tutor.isAvailable,
  };

  const education = {
    highestQualification: (tutor as any).qualifications?.[0] || '',
    currentInstitution: (tutor as any).currentInstitution || '',
  };

  const workExperience = {
    teachingExperience: `${totalHours} Hours`,
    subjects: (tutor as any).subjects || [],
    extracurricularActivities: (tutor as any).extracurricularActivities || [],
  };

  const locationPreferences = {
    teachingMode: (tutor as any).preferredMode || '',
    preferredLocations: (tutor as any).preferredLocations || [],
    preferredCities: (tutor as any).preferredCities || [],
  };

  const tutorData = {
    personalDetails,
    education,
    workExperience,
    locationPreferences,
    totalTeachingHours: totalHours,
    activeClasses,
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
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
            <div className={`absolute -bottom-2 -right-2 ${personalDetails.isAvailable ? 'bg-green-500' : 'bg-red-500'} rounded-xl px-2 py-0.5 shadow-lg`}>
              <span className="text-[10px] font-bold">{personalDetails.isAvailable ? 'Active' : 'Unavailable'}</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold uppercase">{personalDetails.fullName}</h1>
            <p className="text-blue-300 text-sm">{education.highestQualification}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="text-xs opacity-75">Tutor ID:</span>
                <span className="font-mono text-sm font-semibold">{personalDetails.tutorId}</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-yellow-500/30">
                <span className="text-xs opacity-75">Tier:</span>
                <span className="text-sm font-bold text-yellow-500">{personalDetails.tier}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2 text-center">
              <div className="text-xl font-bold">{tutorData.totalTeachingHours}</div>
              <div className="text-xs opacity-75">Total Hours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2 text-center">
              <div className="text-xl font-bold">{tutorData.activeClasses}</div>
              <div className="text-xs opacity-75">Active Classes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Education & Extra Info */}
        <div className="space-y-5">
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

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Expertise & Activities
            </h2>
            <div className="space-y-4">
              {workExperience.extracurricularActivities.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 font-semibold">Extracurricular Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {workExperience.extracurricularActivities.map((act: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-100 italic">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Work & Location */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Teaching Preferences
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <p className="text-xs text-green-600 font-medium mb-1">Teaching Experience</p>
                <p className="text-lg font-bold text-green-900">{workExperience.teachingExperience}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 font-semibold">Subjects Offered</p>
                <div className="flex flex-wrap gap-2">
                  {workExperience.subjects.map((subject: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1 font-semibold">Mode of Teaching</p>
                <p className="text-sm font-bold text-gray-800 uppercase">{locationPreferences.teachingMode}</p>
              </div>

              {(locationPreferences.teachingMode === 'OFFLINE' || locationPreferences.teachingMode === 'HYBRID') && locationPreferences.preferredLocations.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 font-semibold">Preferred Areas for Home Tuition</p>
                  <div className="flex flex-wrap gap-2">
                    {locationPreferences.preferredLocations.map((loc: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-100 italic">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {locationPreferences.preferredCities.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 font-semibold">Home Tuition available in</p>
                  <div className="flex flex-wrap gap-2">
                    {locationPreferences.preferredCities.map((city: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-lg border border-orange-100">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTutorProfileCard;
