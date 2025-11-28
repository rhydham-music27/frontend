import React, { useEffect, useState } from 'react';
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar } from '@mui/material';
import { User, Phone, Mail, Calendar, MapPin, GraduationCap, Briefcase, BookOpen, Clock, FileText, CheckCircle } from 'lucide-react';
import { ITutor } from '../../types';
import { getMyProfile, uploadDocument } from '../../services/tutorService';

const MUIProfileCard: React.FC = () => {
  const [tutor, setTutor] = useState<ITutor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMyProfile();
        setTutor(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load tutor profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading && !tutor) {
    return (
      <div className="flex justify-center mb-12">
        <CircularProgress size={28} />
      </div>
    );
  }

  if (error || !tutor) return null;

  const { user } = tutor;
  const rating = tutor.ratings ?? 0;
  const totalHours = (tutor as any).experienceHours ?? 0;

  const profilePhotoDoc = (tutor.documents || []).find((d) => d.documentType === 'PROFILE_PHOTO');
  const profileImageUrl = profilePhotoDoc?.documentUrl;

  const initials = (user?.name || '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleOpenAvatarModal = () => {
    setUploadError(null);
    setSelectedFile(null);
    setAvatarModalOpen(true);
  };

  const handleCloseAvatarModal = () => {
    if (uploadingAvatar) return;
    setAvatarModalOpen(false);
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) setUploadError(null);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      setUploadError('Please select an image file to upload.');
      return;
    }
    try {
      setUploadingAvatar(true);
      setUploadError(null);
      const res = await uploadDocument((tutor as any).id, 'PROFILE_PHOTO', selectedFile);
      setTutor(res.data);
      setAvatarModalOpen(false);
      setSelectedFile(null);
    } catch (e: any) {
      setUploadError(e?.response?.data?.message || e?.message || 'Failed to upload profile image.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Map backend data to match reference structure
  const personalDetails = {
    profilePhoto: profileImageUrl,
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    alternateNumber: (tutor as any).alternatePhone || '',
    dateOfBirth: (tutor as any).dateOfBirth || '',
    gender: (tutor as any).gender || '',
    tutorId: tutor.teacherId || user?.email || '',
    whatsappNumber: user?.phone || '',
  };

  const education = {
    highestQualification: (tutor as any).qualifications?.[0] || '',
    currentInstitution: (tutor as any).currentInstitution || '',
  };

  const workExperience = {
    teachingExperience: `${totalHours} Hours`,
    employerName: (tutor as any).employerName || '',
    currentlyEmployed: (tutor as any).currentlyEmployed || false,
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
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={handleOpenAvatarModal}>
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
              <div className="text-2xl font-bold">
                {tutorData.rating >= 4.5 ? 'Tier 1' : tutorData.rating >= 4.0 ? 'Tier 2' : 'Tier 3'}
              </div>
              <div className="text-xs opacity-75">Tutor Tier</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2 text-center">
              <div className="text-xl font-bold">{tutorData.totalTeachingHours}</div>
              <div className="text-xs opacity-75">Total Hours</div>
            </div>
          </div>
        </div>
      </div>

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

            {personalDetails.alternateNumber && (
              <div className="flex items-start gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Alternate Contact</p>
                  <p className="text-sm font-medium text-gray-900">{personalDetails.alternateNumber}</p>
                </div>
              </div>
            )}

            {personalDetails.dateOfBirth && (
              <div className="flex items-start gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-900">{personalDetails.dateOfBirth}</p>
                </div>
              </div>
            )}

            {personalDetails.gender && (
              <div className="flex items-start gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Gender</p>
                  <p className="text-sm font-medium text-gray-900">{personalDetails.gender}</p>
                </div>
              </div>
            )}
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

            {workExperience.currentlyEmployed && workExperience.employerName && (
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Currently Employed At</p>
                  <p className="text-sm font-medium text-gray-900">{workExperience.employerName}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {workExperience.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {workExperience.classesCanTeach.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Classes Can Teach</p>
                <div className="flex flex-wrap gap-2">
                  {workExperience.classesCanTeach.map((cls, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {workExperience.educationBoards.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Education Boards</p>
                <div className="flex flex-wrap gap-2">
                  {workExperience.educationBoards.map((board, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg"
                    >
                      {board}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {workExperience.extracurricularActivities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-medium text-gray-500 mb-2">Extracurricular Activities</p>
            <div className="flex flex-wrap gap-2">
              {workExperience.extracurricularActivities.map((activity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-lg"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Location Preferences
          </h2>
          <div className="space-y-4">
            {locationPreferences.fullAddress && (
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Full Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {locationPreferences.fullAddress}
                  </p>
                  {locationPreferences.pinCode && (
                    <p className="text-xs text-gray-600 mt-0.5">PIN: {locationPreferences.pinCode}</p>
                  )}
                </div>
              </div>
            )}

            {locationPreferences.teachingMode && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium mb-1">Teaching Mode</p>
                <p className="text-lg font-bold text-blue-900">{locationPreferences.teachingMode}</p>
              </div>
            )}

            {locationPreferences.preferredLocations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Preferred Locations</p>
                <div className="flex flex-wrap gap-2">
                  {locationPreferences.preferredLocations.map((location, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {locationPreferences.availableTimeSlots.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Available Time Slots
            </h2>
            <div className="space-y-2">
              {locationPreferences.availableTimeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-all"
                >
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">{slot}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarModalOpen} onClose={handleCloseAvatarModal} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Update Profile Picture</DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center gap-4 mt-4">
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#2563eb',
                fontSize: '2.5rem',
              }}
              src={profileImageUrl}
            >
              {initials || (user?.name || 'T')[0]}
            </Avatar>

            <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50">
              <p className="text-sm font-medium text-gray-900 mb-1">Select an image to upload</p>
              <p className="text-xs text-gray-500 mb-3">JPG, PNG up to 5MB. Your picture helps coordinators and parents recognise you.</p>
              <Button variant="outlined" component="label" size="small">
                Choose File
                <input hidden type="file" accept="image/*" onChange={handleAvatarFileChange} />
              </Button>
            </div>

            {uploadError && (
              <p className="text-sm text-red-600 text-center">{uploadError}</p>
            )}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseAvatarModal} disabled={uploadingAvatar}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUploadAvatar} disabled={uploadingAvatar || !selectedFile}>
            {uploadingAvatar ? 'Uploading...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MUIProfileCard;
