import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar, Grid, Chip, Divider, Box, Tooltip } from '@mui/material';
import {
  User, Phone, Mail, Calendar, MapPin, GraduationCap, Briefcase, Clock,
  FileText, CheckCircle, Star, Award, BookOpen, Languages, Sparkles,
  BarChart2, ShieldCheck, Info, Heart, ExternalLink, CreditCard, Wallet, Handshake,
  ShieldAlert
} from 'lucide-react';
import { ITutor } from '../../types';
import { getMyProfile, uploadDocument, getTutorById, updateVerificationFeeStatus } from '../../services/tutorService';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';


interface MUIProfileCardProps {
  tutorId?: string;
}

const MUIProfileCard: React.FC<MUIProfileCardProps> = ({ tutorId }) => {
  const { user: currentUser } = useAuth();
  const [tutor, setTutor] = useState<ITutor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // --- Verification Fee Logic ---
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [feeAction, setFeeAction] = useState<'PAY_NOW' | 'DEDUCT' | 'ADMIN_MARK_PAID' | null>(null);
  const [feeFile, setFeeFile] = useState<File | null>(null);
  const [submittingFee, setSubmittingFee] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);

  const isManager = Boolean(currentUser && currentUser.role === 'MANAGER');
  const isTutorSelf = Boolean(!tutorId && currentUser && currentUser.role === 'TUTOR');
  const VERIFICATION_FEE_AMOUNT = 500; // Matches backend constant

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = tutorId ? await getTutorById(tutorId) : await getMyProfile();
        setTutor(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load tutor profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [tutorId]);

  const handleShareProfile = async () => {
    if (!tutor) return;
    const teacherId = tutor.teacherId || '';
    if (!teacherId) return;
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
    const url = `${origin}/ourtutor/${teacherId}`;
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } else {
        window.prompt('Copy this profile link', url);
      }
    } catch {
      window.prompt('Copy this profile link', url);
    }
  };

  if (loading && !tutor) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress size={40} thickness={4} />
      </div>
    );
  }

  if (error || !tutor) return (
    <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
      <p className="text-red-600 font-medium">{error || 'Tutor not found'}</p>
    </div>
  );

  const { user } = tutor;
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
      const res = await uploadDocument((tutor as any).id || tutor._id, 'PROFILE_PHOTO', selectedFile);
      setTutor(res.data);
      setAvatarModalOpen(false);
      setSelectedFile(null);
    } catch (e: any) {
      setUploadError(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        'Failed to upload profile image.'
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  type DocumentStatus = 'not_uploaded' | 'pending' | 'approved';
  const computeStatusForType = (backendType: string): DocumentStatus => {
    const allDocs = (tutor.documents || []).filter((d) => d.documentType === backendType);
    if (!allDocs.length) return 'not_uploaded';
    const anyApproved = allDocs.some((d) => d.verifiedAt);
    if (anyApproved) return 'approved';
    return 'pending';
  };

  const docLabels = {
    'PROFILE_PHOTO': 'Profile Photo',
    'EXPERIENCE_PROOF': 'Experience Proof',
    'AADHAAR': 'Aadhar Card',
    'CERTIFICATE': 'Qualification Certificate',
    // 'DEGREE': 'Degree Document', // Removed
  };

  const handleOpenDocumentModal = (type: string) => {
    setSelectedDocumentType(type);
    setSelectedDocumentFile(null);
    setDocumentUploadError(null);
    setDocumentModalOpen(true);
  };

  const handleCloseDocumentModal = () => {
    if (uploadingDocument) return;
    setDocumentModalOpen(false);
    setSelectedDocumentFile(null);
  };

  const handleUploadDocumentFile = async () => {
    if (!selectedDocumentFile || !selectedDocumentType) {
      setDocumentUploadError('Please select a file.');
      return;
    }
    try {
      setUploadingDocument(true);
      setDocumentUploadError(null);
      // Map frontend types to backend types if needed, or ensure they match
      // In this case, 'DEGREE' was removed, others match enum in backend if consistent
      const res = await uploadDocument((tutor as any).id || tutor._id, selectedDocumentType, selectedDocumentFile);
      setTutor(res.data);
      handleCloseDocumentModal();
    } catch (e: any) {
      setDocumentUploadError(e?.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDocument(false);
    }
  };

  // --- Verification Fee Logic ---


  const handleOpenFeeModal = () => {
    setFeeModalOpen(true);
    setFeeAction(null);
    setFeeFile(null);
    setFeeError(null);
  };



  const handleFeeSubmit = async () => {
    if (!tutor || !feeAction) return;
    try {
      setSubmittingFee(true);
      setFeeError(null);

      if ((feeAction === 'PAY_NOW' || feeAction === 'DEDUCT') && !isTutorSelf) {
        setFeeError('Only tutors can update their own verification fee status.');
        return;
      }

      if (feeAction === 'ADMIN_MARK_PAID' && !isManager) {
        setFeeError('Only managers can mark verification fee as paid manually.');
        return;
      }


      const feeStatus = (feeAction === 'PAY_NOW' || feeAction === 'ADMIN_MARK_PAID') ? 'PAID' : 'DEDUCT_FROM_FIRST_MONTH';

      const res = await updateVerificationFeeStatus(
        (tutor as any).id || tutor._id,
        feeStatus,
        feeFile || undefined
      );

      setTutor(res.data);
      setFeeModalOpen(false);
      setFeeAction(null);
      setFeeFile(null);
    } catch (e: any) {
      setFeeError(e?.response?.data?.message || 'Failed to update verification fee status.');
    } finally {
      setSubmittingFee(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:shadow-blue-500/10 border border-white/5">
        {/* Animated Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar & Tier */}
            <div className="flex flex-col items-center gap-6">
              <div
                className={`group relative w-36 h-36 md:w-48 md:h-48 rounded-[2rem] overflow-hidden ring-8 ring-white/5 shadow-2xl transition-all duration-500 ${isTutorSelf ? 'cursor-pointer hover:ring-blue-500/30' : ''}`}
                onClick={isTutorSelf ? handleOpenAvatarModal : undefined}
              >
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={user?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
                    <User className="w-16 h-16 text-white/90" />
                  </div>
                )}
                {isTutorSelf && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                    <div className="text-center group-hover:scale-110 transition-transform">
                      <Sparkles className="text-blue-400 w-10 h-10 mb-2 mx-auto drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      <span className="text-white text-[10px] font-black tracking-widest uppercase">Update Photo</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                <span className="text-xs font-black tracking-[0.2em] uppercase text-white/70">
                  Tier: <span className={tutor.tier?.includes('GOLD') ? 'text-amber-400' : tutor.tier?.includes('SILVER') ? 'text-slate-300' : 'text-orange-400'}>
                    {tutor.tier?.split('(')[1]?.replace(')', '') || 'Bronze'}
                  </span>
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{user?.name}</h1>
                  {tutor.verificationStatus === 'VERIFIED' && (
                    <div className="p-2 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <ShieldCheck className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="w-12 h-[2px] bg-blue-500/50 rounded-full" />
                  <p className="text-blue-300 font-bold text-lg tracking-wide uppercase opacity-90">
                    {tutor.qualifications?.[0] || "Professional Educator"}
                  </p>
                </div>
                <p className="text-slate-400 font-medium text-lg max-w-2xl leading-relaxed italic border-l-4 border-blue-500/30 pl-4 py-1">
                  "{tutor.bio || "Dedicated to empowering students through personalized and innovative teaching methodologies."}"
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                <div className="bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 transition-colors hover:bg-white/10">
                  <Award className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-black text-white tracking-widest uppercase">{tutor.teacherId || 'TUT-XXXX'}</span>
                </div>
                <div className="bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 transition-colors hover:bg-white/10">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-black text-white">{tutor.experienceHours || 0}</span>
                  <span className="text-[10px] font-bold text-white/40 border-l border-white/10 pl-3">TOTAL HOURS</span>
                </div>
                {!tutorId && (
                  <Button
                    startIcon={<ExternalLink size={18} />}
                    variant="contained"
                    size="large"
                    onClick={handleShareProfile}
                    sx={{
                      borderRadius: '18px',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      fontWeight: 800,
                      textTransform: 'none',
                      px: 4,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    {shareCopied ? 'Copied!' : 'Share Profile'}
                  </Button>
                )}
              </div>
            </div>

            {/* Availability Toggle / Status */}
            <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 min-w-[200px]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Status</span>
                <div className={`w-3 h-3 rounded-full animate-pulse ${tutor.isAvailable ? 'bg-green-50' : 'bg-red-50'}`} />
              </div>
              <div className="text-center space-y-2">
                <p className={`text-xl font-black ${tutor.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {tutor.isAvailable ? 'ACTIVE' : 'OFF DUTY'}
                </p>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                <p className="text-xs text-white/40">Join community: {tutor.whatsappCommunityJoined ? '✅ Joined' : '❌ Pending'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Grid container spacing={4}>
        {/* 2. STATS OVERVIEW - FULL WIDTH INSIDE GRID */}
        <Grid item xs={12}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: 'Classes Assigned', value: tutor.classesAssigned, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Completed', value: tutor.classesCompleted, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Demos Taken', value: tutor.demosTaken, icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Teaching Hours', value: tutor.experienceHours || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Interest', value: tutor.interestCount, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className={`p-4 rounded-2xl ${stat.bg} mb-4 group-hover:rotate-12 transition-all duration-500 ${stat.color}`}>
                  <stat.icon size={28} />
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </Grid>

        {/* 3. LEFT COLUMN: PERSONAL & CONTACT */}
        <Grid item xs={12} lg={4} className="space-y-6">
          {/* Contact Details */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Phone className="text-blue-500" size={20} /> Contact Profile
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Email Address', value: user?.email, icon: Mail },
                { label: 'WhatsApp Number', value: user?.phone, icon: Phone },
                { label: 'Alternate Phone', value: tutor?.alternatePhone, icon: Phone },
                { label: 'Current City', value: user?.city, icon: MapPin },
                { label: 'Gender', value: user?.gender?.toLowerCase(), icon: User, capitalize: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</p>
                    <p className={`text-sm font-semibold text-slate-700 ${item.capitalize ? 'capitalize' : ''}`}>
                      {item.value || 'Not provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Verification Status Card */}
          <section className={`rounded-3xl shadow-sm p-6 border ${tutor.verificationStatus === 'VERIFIED' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className={tutor.verificationStatus === 'VERIFIED' ? 'text-green-600' : 'text-amber-600'} /> Verification Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-500">Global Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase ${tutor.verificationStatus === 'VERIFIED' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                  {tutor.verificationStatus}
                </span>
              </div>
              {tutor.verifiedAt && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Verified On:</span>
                  <span className="text-slate-700 font-mono italic">{new Date(tutor.verifiedAt).toLocaleDateString()}</span>
                </div>
              )}
              {tutor.verificationNotes && (
                <div className="mt-4 p-3 rounded-xl bg-white/50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Info size={12} /> Remarks
                  </p>
                  <p className="text-xs text-slate-600 italic">"{tutor.verificationNotes}"</p>
                </div>
              )}
            </div>
          </section>
        </Grid>

        {/* 4. MAIN COLUMN: TEACHING & EXPERIENCE */}
        <Grid item xs={12} lg={8} className="space-y-6">
          {/* Professional Credentials */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <BookOpen className="text-blue-500" size={24} /> Academic & Expertise
              </h3>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl">
                <Briefcase className="text-slate-400" size={16} />
                <span className="text-sm font-bold text-slate-600">{tutor.yearsOfExperience || 0}+ Years Practical Experience</span>
              </div>
            </div>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Languages Known</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.languagesKnown?.length ? tutor.languagesKnown.map((lang, idx) => (
                        <Chip key={idx} icon={<Languages size={14} />} label={lang} className="bg-blue-50 text-blue-700 font-bold rounded-xl" />
                      )) : <span className="text-slate-400 text-xs italic">Not specified</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.skills?.length ? tutor.skills.map((skill, idx) => (
                        <Chip key={idx} icon={<Sparkles size={14} />} label={skill} className="bg-indigo-50 text-indigo-700 font-bold rounded-xl" />
                      )) : <span className="text-slate-400 text-xs italic">Not specified</span>}
                    </div>
                  </div>
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Qualifications</p>
                    <div className="space-y-2">
                      {tutor.qualifications?.length ? tutor.qualifications.map((q, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                          <GraduationCap className="text-blue-500" size={18} />
                          <span className="text-sm font-bold text-slate-700">{q}</span>
                        </div>
                      )) : <span className="text-slate-400 text-xs italic">Not provided</span>}
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>
          </section>

          {/* Preferences Section */}
          <section className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white/90">
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
              <Sparkles className="text-blue-400" size={24} /> Service Preferences
            </h3>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6} className="space-y-8">
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Teaching Subjects</p>
                  <div className="flex flex-wrap gap-3">
                    {tutor.subject?.map((sub: string, i: number) => (
                      <span key={i} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors border border-white/5">{sub}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Teaching Mode</p>
                  <div className="bg-blue-600 inline-block px-6 py-3 rounded-2xl font-black tracking-widest text-shadow-sm">
                    {tutor.preferredMode || 'NOT SELECTED'}
                  </div>
                </div>
              </Grid>

              <Grid item xs={12} md={6} className="space-y-8">
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Preferred Cities/Areas</p>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {tutor.preferredCities?.map((city, i) => (
                        <Chip key={i} label={city} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700 }} />
                      ))}
                      {tutor.preferredLocations?.map((loc, i) => (
                        <Chip key={i} label={loc} size="small" variant="outlined" sx={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Availability Window</p>
                  <div className="space-y-2">
                    {tutor.settings?.availabilityPreferences?.daysAvailable?.length ? (
                      <div className="flex items-center gap-3 text-sm font-semibold">
                        <Calendar size={16} className="text-blue-400" />
                        <span>{tutor.settings.availabilityPreferences.daysAvailable.join(', ')}</span>
                      </div>
                    ) : null}
                    {tutor.settings?.availabilityPreferences?.timeSlots?.length ? (
                      <div className="flex items-center gap-3 text-sm font-semibold opacity-80">
                        <Clock size={16} className="text-blue-400" />
                        <span>{tutor.settings.availabilityPreferences.timeSlots.join(' | ')}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Grid>
            </Grid>
          </section>

          {/* Detailed Addresses */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <MapPin className="text-rose-500" size={24} /> Official Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Permanent Address</p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">{tutor.permanentAddress || 'Permanent address not provided'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Residential Address</p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">{tutor.residentialAddress || 'Same as permanent'}</p>
              </div>
            </div>
          </section>
        </Grid>

        <Grid item xs={12}>
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <FileText className="text-indigo-500" size={24} /> Compliance Documents
              </h3>
              {tutor.verificationStatus === 'VERIFIED' && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                  <ShieldCheck size={13} /> Documents locked after verification
                </span>
              )}
              {tutor.verificationStatus === 'PENDING' && Array.isArray(tutor.documents) && tutor.documents.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                  <Info size={13} /> Documents submitted — awaiting review
                </span>
              )}
              {tutor.verificationFeeStatus === 'PAID' && (
                <Chip icon={<CheckCircle size={14} />} label="Verification Fee Paid" color="success" size="small" />
              )}
              {tutor.verificationFeeStatus === 'DEDUCT_FROM_FIRST_MONTH' && (
                <Chip icon={<CheckCircle size={14} />} label="Fee: Deduct from Class" color="info" size="small" />
              )}
            </div>

            {/* Item 27: Show upload-blocked notice for VERIFIED tutors */}
            {tutor.verificationStatus === 'VERIFIED' && (
              <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 flex items-start gap-3">
                <ShieldCheck className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-sm text-green-700 font-medium">
                  Your identity documents are permanently locked after verification. Contact support if you need to make changes.
                </p>
              </div>
            )}
            {tutor.verificationStatus === 'REJECTED' && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                <Info className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-sm text-red-700 font-medium">
                  Your submission was rejected. Please re-upload valid documents.
                </p>
              </div>
            )}

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }} gap={3}>
              {Object.entries(docLabels).map(([type, label], idx) => {
                const status = computeStatusForType(type);
                const isVerified = tutor.verificationStatus === 'VERIFIED';
                const isPendingWithDocs = tutor.verificationStatus === 'PENDING' && Array.isArray(tutor.documents) && tutor.documents.length > 0;
                const isUploadBlocked = isVerified || (isPendingWithDocs && !tutorId) || isManager;
                return (
                  <div
                    key={idx}
                    onClick={isUploadBlocked ? undefined : () => handleOpenDocumentModal(type)}
                    className={`relative p-5 rounded-3xl border-2 transition-all group ${isUploadBlocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                      } ${status === 'approved' ? 'bg-green-50/50 border-green-100 hover:border-green-300' :
                        status === 'pending' ? 'bg-amber-50/50 border-amber-100 hover:border-amber-300' :
                          'bg-slate-50 border-slate-100 hover:border-slate-300'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${status === 'approved' ? 'bg-green-500 text-white' :
                      status === 'pending' ? 'bg-amber-500 text-white' :
                        'bg-slate-400 text-white'
                      }`}>
                      {status === 'approved' ? <ShieldCheck size={28} /> : <FileText size={28} />}
                    </div>
                    <p className="text-xs font-black text-slate-800 uppercase mb-1">{label}</p>
                    <p className={`text-[10px] font-bold ${status === 'approved' ? 'text-green-600' :
                      status === 'pending' ? 'text-amber-600' :
                        'text-slate-500'
                      }`}>
                      {isVerified ? 'LOCKED' : isPendingWithDocs ? 'UNDER REVIEW' : status.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                )
              })}
              {/* Verification Fee Card */}
              <div
                onClick={handleOpenFeeModal}
                className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer group ${tutor.verificationFeeStatus === 'PAID' ? 'bg-green-50/50 border-green-100 hover:border-green-300' :
                  tutor.verificationFeeStatus === 'DEDUCT_FROM_FIRST_MONTH' ? 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-300' :
                    'bg-slate-50 border-slate-100 hover:border-slate-300'
                  }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-12 ${tutor.verificationFeeStatus === 'PAID' ? 'bg-green-500 text-white' :
                  tutor.verificationFeeStatus === 'DEDUCT_FROM_FIRST_MONTH' ? 'bg-indigo-500 text-white' :
                    'bg-slate-400 text-white'
                  }`}>
                  <CreditCard size={28} />
                </div>
                <p className="text-xs font-black text-slate-800 uppercase mb-1">Verification Fee</p>
                <p className={`text-[10px] font-bold ${tutor.verificationFeeStatus === 'PAID' ? 'text-green-600' :
                  tutor.verificationFeeStatus === 'DEDUCT_FROM_FIRST_MONTH' ? 'text-indigo-600' :
                    'text-slate-500'
                  }`}>
                  {tutor.verificationFeeStatus === 'PAID' ? 'PAID (₹500)' :
                    tutor.verificationFeeStatus === 'DEDUCT_FROM_FIRST_MONTH' ? 'PAY LATER (₹500)' :
                      'NOT PAID (₹500)'}
                </p>
              </div>
            </Box>
          </section>
        </Grid>
      </Grid>

      {/* MODALS */}
      {/* ... Avatar Dialog ... */}
      <Dialog open={avatarModalOpen} onClose={handleCloseAvatarModal} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '32px', p: 1 } }}>
        <DialogTitle className="font-black text-center text-slate-800">Refresh Identity</DialogTitle>
        <DialogContent className="text-center">
          <Avatar sx={{ width: 120, height: 120, mx: 'auto', my: 3, bgcolor: '#2563eb' }} src={profileImageUrl}>{initials}</Avatar>
          <Button variant="outlined" component="label" sx={{ borderRadius: '16px', px: 4 }}>
            SELECT PHOTO <input hidden type="file" accept="image/*" onChange={handleAvatarFileChange} />
          </Button>
          {selectedFile && <p className="mt-4 text-xs font-bold text-blue-600">{selectedFile.name}</p>}
          {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3 }}>
          <Button onClick={handleCloseAvatarModal} sx={{ color: 'slate.400' }}>Cancel</Button>
          <Button variant="contained" disabled={!selectedFile || uploadingAvatar} onClick={handleUploadAvatar} sx={{ borderRadius: '16px', px: 6 }}>
            {uploadingAvatar ? 'UPLOADING...' : 'SAVE'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ... Document Dialog ... */}
      <Dialog open={documentModalOpen} onClose={handleCloseDocumentModal} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '32px', p: 1 } }}>
        <DialogTitle className="font-black text-slate-800">Compliance Upload</DialogTitle>
        <DialogContent className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <p className="text-sm font-bold text-slate-600 mb-2">Target: {docLabels[selectedDocumentType as keyof typeof docLabels]}</p>
            <Button variant="contained" component="label" size="small" sx={{ borderRadius: '12px' }}>
              CHOOSE FILE <input hidden type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setSelectedDocumentFile(e.target.files?.[0] || null)} />
            </Button>
            {selectedDocumentFile && <p className="text-xs mt-2 font-mono">{selectedDocumentFile.name}</p>}
          </div>
          {documentUploadError && <p className="text-red-500 text-xs text-center">{documentUploadError}</p>}
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3 }}>
          <Button onClick={handleCloseDocumentModal}>Close</Button>
          <Button variant="contained" color="secondary" disabled={!selectedDocumentFile || uploadingDocument} onClick={handleUploadDocumentFile} sx={{ borderRadius: '16px' }}>
            {uploadingDocument ? 'UPLOADING...' : 'UPLOAD NOW'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verification Fee Modal */}
      <Dialog open={feeModalOpen} onClose={() => setFeeModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '32px', p: 2 } }}>
        <DialogTitle className="font-black text-center text-slate-800 text-2xl">Verification Fees</DialogTitle>
        <DialogContent className="space-y-6 pt-4">
          {!feeAction ? (
            <Box>
              {isManager && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase">
                    <ShieldAlert size={18} className="text-indigo-600" /> Admin / Staff Action
                  </div>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => setFeeAction('ADMIN_MARK_PAID')}
                    sx={{ borderRadius: '12px', py: 1.5, fontWeight: 800 }}
                  >
                    MARK AS PAID MANUALLY
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={isTutorSelf ? () => setFeeAction('PAY_NOW') : undefined}
                  className={`p-6 rounded-3xl bg-blue-50 border-2 border-blue-100 transition-all flex flex-col items-center text-center gap-4 group ${isTutorSelf ? 'hover:border-blue-400 cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">Pay Now (₹{VERIFICATION_FEE_AMOUNT})</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">Scan QR & Upload Screenshot</p>
                  </div>
                </div>
                <div
                  onClick={isTutorSelf ? () => setFeeAction('DEDUCT') : undefined}
                  className={`p-6 rounded-3xl bg-amber-50 border-2 border-amber-100 transition-all flex flex-col items-center text-center gap-4 group ${isTutorSelf ? 'hover:border-amber-400 cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center group-hover:-rotate-12 transition-transform">
                    <Wallet size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">Pay Later (₹{VERIFICATION_FEE_AMOUNT})</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">Deduct from 1st Month Salary</p>
                  </div>
                </div>
              </div>
            </Box>
          ) : feeAction === 'PAY_NOW' ? (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-lg">
                {/* Placeholder QR */}
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=example@upi&pn=YourShikshak" alt="Payment QR" className="w-40 h-40 mx-auto" />
              </div>
              <p className="text-sm text-slate-500 font-bold">Scan to Pay Subscription Fee</p>

              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Button variant="outlined" component="label" fullWidth sx={{ borderRadius: '12px', height: '50px', borderStyle: 'dashed' }}>
                  {feeFile ? 'CHANGE SCREENSHOT' : 'UPLOAD PAYMENT SCREENSHOT'}
                  <input hidden type="file" accept="image/*" onChange={(e) => setFeeFile(e.target.files?.[0] || null)} />
                </Button>
                {feeFile && <p className="mt-2 text-sm font-bold text-green-600 flex items-center justify-center gap-2"><CheckCircle size={14} /> {feeFile.name}</p>}
              </div>
            </div>
          ) : feeAction === 'DEDUCT' ? (
            <div className="text-center space-y-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake size={40} />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Confirm Deduction?</h4>
              <p className="text-slate-500 max-w-xs mx-auto">
                We will verify your documents and deduct the verification fee automatically from your first payout.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={40} />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Admin: Mark as Paid?</h4>
              <p className="text-slate-500 max-w-xs mx-auto">
                Confirm that this tutor has paid the verification fee of ₹{VERIFICATION_FEE_AMOUNT} through an offline channel or verified previous proof.
              </p>
            </div>
          )}

          {feeError && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold text-center">{feeError}</div>}
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, justifyContent: 'center', gap: 2 }}>
          {feeAction ? (
            <>
              <Button onClick={() => setFeeAction(null)} sx={{ borderRadius: '12px', px: 3, color: 'slate.500' }}>Back</Button>
              <Button
                variant="contained"
                onClick={handleFeeSubmit}
                disabled={
                  submittingFee ||
                  (feeAction === 'PAY_NOW' && !feeFile) ||
                  ((feeAction === 'PAY_NOW' || feeAction === 'DEDUCT') && !isTutorSelf) ||
                  (feeAction === 'ADMIN_MARK_PAID' && !isManager)
                }
                sx={{ borderRadius: '12px', px: 6, py: 1.5, fontWeight: 800, bgcolor: feeAction === 'PAY_NOW' ? 'primary.main' : feeAction === 'DEDUCT' ? 'warning.main' : 'success.main' }}
              >
                {submittingFee ? <CircularProgress size={20} color="inherit" /> : 'CONFIRM CHOICE'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setFeeModalOpen(false)} sx={{ borderRadius: '12px', px: 4, color: 'slate.400' }}>Cancel</Button>
          )}
        </DialogActions>
      </Dialog>
    </div >
  );
};

export default MUIProfileCard;
