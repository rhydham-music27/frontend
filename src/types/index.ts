export interface IUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClassLead {
  id: string;
  studentName: string;
  parentPhone?: string;
  grade: string;
  subject: string;
  board: string;
  mode: string;
  location?: string;
  city?: string;
  area?: string;
  address?: string;
  leadSource?: string;
  preferredTutorGender?: string;
  timing: string;
  classesPerMonth?: number;
  classDurationHours?: number;
  paymentAmount?: number;
  status: string;
  assignedTutor?: IUser;
  demoDetails?: Record<string, any>;
  createdBy: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument {
  documentType: string;
  documentUrl: string;
  uploadedAt: Date;
  verifiedAt?: Date;
}

export interface ITutor {
  id: string;
  user: IUser;
  teacherId?: string;
  experienceHours: number;
  subjects: string[];
  ratings: number;
  classesAssigned: number;
  demosTaken: number;
  demosApproved: number;
  approvalRatio: number;
  verificationStatus: string;
  documents: IDocument[];
  qualifications?: string[];
  totalRatings: number;
  classesCompleted: number;
  interestCount: number;
  verificationNotes?: string;
  verifiedBy?: IUser;
  verifiedAt?: Date;
  isAvailable: boolean;
  preferredMode?: string;
  preferredLocations?: string[];
  createdAt: Date;
  updatedAt: Date;
  tier: string;
  tierUpdatedAt?: Date;
  tierUpdatedBy?: IUser;
  pendingTierChange?: IPendingTierChange;
}

export interface ICoordinator {
  id: string;
  user: IUser;
  assignedClasses: any[];
  maxClassCapacity: number;
  activeClassesCount: number;
  totalClassesHandled: number;
  availableCapacity: number;
  specialization?: string[];
  joiningDate: Date;
  performanceScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoordinatorDashboardStats {
  totalClassesAssigned: number;
  activeClassesCount: number;
  totalClassesHandled: number;
  pendingAttendanceApprovals: number;
  todaysTasksCount: number;
  performanceScore: number;
}

export interface ICoordinatorTodaysTasks {
  pendingAttendanceApprovals: IAttendance[];
  paymentReminders: any[];
  testsToSchedule: any[];
  parentComplaints: any[];
  counts: {
    pendingAttendance: number;
    paymentReminders: number;
    testsToSchedule: number;
    parentComplaints: number;
  };
}

export type TaskPriority = 'overdue' | 'today' | 'upcoming';

export interface ITaskWithPriority<T> {
  task: T;
  priority: TaskPriority;
  priorityDate: Date;
}

export interface IPaymentReminder extends Omit<IPayment, 'finalClass'> {
  finalClass: IFinalClass;
}

export interface IFinalClass {
  id: string;
  classLead: IClassLead;
  tutor: IUser;
  coordinator: IUser;
  parent?: IUser;
  startDate: Date;
  endDate?: Date;
  status: string;
  schedule: { daysOfWeek: string[]; timeSlot: string };
  totalSessions: number;
  completedSessions: number;
  studentName: string;
  subject: string[];
  grade: string;
  board: string;
  mode: string;
  location?: string;
  ratePerSession?: number;
  convertedBy: IUser;
  convertedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  progressPercentage?: number;
  metrics?: {
    progressPercentage: number;
    pendingAttendanceCount: number;
    overduePaymentsCount: number;
  };
}

export interface IAttendance {
  id: string;
  finalClass: IFinalClass;
  sessionDate: Date;
  sessionNumber?: number;
   topicCovered?: string;
  tutor: IUser;
  coordinator: IUser;
  parent?: IUser;
  status: string;
  submittedBy: IUser;
  submittedAt: Date;
  coordinatorApprovedBy?: IUser;
  coordinatorApprovedAt?: Date;
  parentApprovedBy?: IUser;
  parentApprovedAt?: Date;
  rejectedBy?: IUser;
  rejectedAt?: Date;
  rejectionReason?: string;
  studentAttendanceStatus?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  id: string;
  finalClass: IFinalClass;
  attendance: IAttendance;
  tutor: IUser;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: Date;
  dueDate: Date;
  paidBy?: IUser;
  notes?: string;
  createdBy: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITest {
  id: string;
  finalClass: IFinalClass;
  tutor: IUser;
  coordinator: IUser;
  testDate: Date;
  testTime: string;
  status: string;
  scheduledBy: IUser;
  scheduledAt: Date;
  completedAt?: Date;
  report?: {
    feedback: string;
    strengths: string;
    areasOfImprovement: string;
    studentPerformance: string;
    recommendations: string;
  };
  reportSubmittedBy?: IUser;
  reportSubmittedAt?: Date;
  cancellationReason?: string;
  cancelledBy?: IUser;
  cancelledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITestReport {
  feedback: string;
  strengths: string;
  areasOfImprovement: string;
  studentPerformance: string;
  recommendations: string;
}

export interface IScheduleTestFormData {
  finalClassId: string;
  testDate: string;
  testTime: string;
  notes?: string;
}

export interface IAnnouncement {
  id: string;
  classLead: IClassLead;
  postedBy: IUser;
  postedAt: Date;
  interestedTutors: Array<{
    tutor: IUser;
    interestedAt: Date;
    notes?: string;
  }>;
  interestCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITutorComparison extends ITutor {
  interestedAt: Date;
  user: IUser;
}

export interface IDemoHistory {
  id: string;
  classLead: IClassLead;
  tutor: IUser;
  demoDate: Date;
  demoTime: string;
  status: string;
  assignedBy: IUser;
  assignedAt: Date;
  completedAt?: Date;
  feedback?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
}

export interface INotification {
  id: string;
  recipient: IUser;
  type: string;
  title: string;
  message: string;
  relatedAnnouncement?: IAnnouncement;
  relatedClassLead?: IClassLead;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface ICoordinatorAnnouncement {
  id: string;
  coordinator: IUser;
  subject: string;
  message: string;
  recipientType: 'SPECIFIC_CLASS' | 'ALL_CLASSES' | 'SPECIFIC_TUTOR' | 'ALL_TUTORS' | 'STUDENTS_PARENTS';
  targetClass?: IFinalClass;
  targetTutor?: IUser;
  recipients: IUser[];
  recipientCount: number;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISendAnnouncementFormData {
  subject: string;
  message: string;
  recipientType: string;
  targetClassId?: string;
  targetTutorId?: string;
}

export interface ICoordinatorAnnouncementStats {
  totalAnnouncements: number;
  totalRecipients: number;
  breakdown: Array<{ recipientType: string; count: number; totalRecipients: number }>;
}

export interface ITestReportAnalytics {
  totalTests: number;
  averagePerformanceScore: number;
  testsOverTime: Array<{ date: string; count: number; averageScore: number }>;
  performanceByClass: Array<{ className: string; classId: string; testCount: number; averageScore: number }>;
  performanceByTutor: Array<{ tutorName: string; tutorId: string; testCount: number; averageScore: number }>;
  commonStrengths: Array<{ strength: string; frequency: number }>;
  commonImprovements: Array<{ improvement: string; frequency: number }>;
}

export interface ITestReportFilters {
  classId?: string;
  tutorId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface ITutorFeedback {
  id: string;
  tutor: IUser;
  finalClass: IFinalClass;
  submittedBy: IUser;
  submitterRole: 'PARENT' | 'STUDENT';
  month: string;
  overallRating: number;
  teachingQuality: number;
  punctuality: number;
  communication: number;
  subjectKnowledge: number;
  comments?: string;
  strengths?: string;
  improvements?: string;
  wouldRecommend: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITutorPerformanceMetrics {
  tutor: ITutor;
  classesAssigned: number;
  classesCompleted: number;
  totalClassHours: number;
  attendanceApprovalRate: number;
  averageTestScore: number;
  feedbackRatings: { overall: number; teachingQuality: number; punctuality: number; communication: number; subjectKnowledge: number };
  recommendationRate: number;
  totalFeedback: number;
}

export interface ISubmitFeedbackFormData {
  tutorId: string;
  finalClassId: string;
  submitterRole: 'PARENT' | 'STUDENT';
  month: string;
  overallRating: number;
  teachingQuality: number;
  punctuality: number;
  communication: number;
  subjectKnowledge: number;
  comments?: string;
  strengths?: string;
  improvements?: string;
  wouldRecommend: boolean;
}

export interface IPendingTierChange {
  newTier: string;
  requestedAt: Date;
  requestedBy: IUser;
  reason?: string;
}

export interface IClassLeadFormData {
  studentName: string;
  parentPhone?: string;
  grade: string;
  subject: string[];
  board: string;
  mode: string;
  location?: string;
  city?: string;
  area?: string;
  address?: string;
  leadSource?: string;
  preferredTutorGender?: string;
  timing: string;
  classesPerMonth?: number;
  classDurationHours?: number;
  paymentAmount?: number;
  notes?: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export interface IAttendanceStatistics {
  totalSessions: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  approvalRate: number;
}

export interface IPaymentStatistics {
  totalPayments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export interface ICoordinatorPaymentSummary {
  payments: IPayment[];
  total: number;
  page: number;
  limit: number;
  statistics: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    overdueCount: number;
    upcomingCount: number;
    paidCount: number;
  };
  categorized: {
    overdue: IPayment[];
    upcoming: IPayment[];
    paid: IPayment[];
  };
}

export interface ICoordinatorProfileMetrics {
  coordinator: ICoordinator;
  totalClassesHandled: number;
  activeClassesCount: number;
  completedClassesCount: number;
  pausedClassesCount: number;
  attendanceApprovalRate: number;
  performanceScore: number;
  availableCapacity: number;
  maxClassCapacity: number;
  pendingApprovalsCount: number;
  todaysTasksCount: number;
  specialization?: string[];
  joiningDate: Date;
  isActive: boolean;
}

export interface IPaymentReminderFormData {
  paymentId: string;
  reminderMessage?: string;
}

export interface IPaymentFilters {
  status?: string;
  classId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IDateWiseData {
  date: string;
  total: number;
  statusBreakdown: Record<string, number>;
}

export interface IStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface IConversionFunnelStage {
  name: string;
  count: number;
  percentage: number;
}

export interface IConversionFunnel {
  stages: IConversionFunnelStage[];
  overallConversionRate: number;
}

export interface IClassProgress {
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  pausedClasses: number;
  cancelledClasses: number;
  completionRate: number;
  averageProgress: number;
  statusDistribution: IStatusDistribution[];
}

export interface ITutorPerformance {
  tutor: ITutor;
  classesCompleted: number;
  totalRevenue: number;
  averageRating: number;
  demoApprovalRatio: number;
  attendanceApprovalRate: number;
}

export interface ICumulativeGrowth {
  date: string;
  newClasses: number;
  cumulativeClasses: number;
}

export interface IPendingApprovals {
  attendance: {
    coordinatorPending: number;
    parentPending: number;
    total: number;
  };
  demos: {
    scheduledCount: number;
  };
  totalPending: number;
}

export interface IRevenueAnalytics {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  revenueByDate: Array<{ date: string; revenue: number; paidRevenue: number }>;
  revenueByTutor: Array<{ tutor: ITutor; totalRevenue: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  averageRevenuePerClass: number;
}

export interface IDashboardStatistics {
  classLeads: { total: number; new: number; converted: number };
  finalClasses: { total: number; active: number; completed: number };
  tutors: { total: number; verified: number; active: number };
  payments: { total: number; totalRevenue: number; paidRevenue: number; pendingRevenue: number };
  conversionRate: number;
  averageRevenuePerClass: number;
  pendingApprovals: number;
}

export interface IManager {
  id: string;
  user: IUser;
  classLeadsCreated: number;
  demosScheduled: number;
  classesConverted: number;
  revenueGenerated: number;
  tutorsVerified: number;
  coordinatorsCreated: number;
  paymentsProcessed: number;
  conversionRate: number;
  averageRevenuePerClass: number;
  joiningDate: Date;
  department?: string;
  isActive: boolean;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin {
  id: string;
  user: IUser;
  usersCreated: number;
  managersCreated: number;
  coordinatorsCreated: number;
  tutorsCreated: number;
  parentsCreated: number;
  dataModifications: number;
  dataDeletes: number;
  systemActionsPerformed: number;
  joiningDate: Date;
  department?: string;
  isActive: boolean;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  totalUsersManaged: number;
  averageActionsPerDay: number;
}

export interface IUserStatsByRole {
  ADMIN: { count: number; active: number };
  MANAGER: { count: number; active: number };
  COORDINATOR: { count: number; active: number };
  TUTOR: { count: number; active: number };
  PARENT: { count: number; active: number };
}

export interface IUserGrowthData {
  month: string;
  count: number;
}

export interface IManagerPerformanceSummary {
  activeManagers: number;
  totals: { totalLeads: number; totalClasses: number; totalRevenue: number };
  averages: { perManagerLeads: number; perManagerClasses: number; perManagerRevenue: number };
}

export interface ICoordinatorPerformanceSummary {
  activeCoordinators: number;
  totalClasses: number;
  avgScore: number;
  avgCapacityUtilization: number;
}

export type ITutorStatsByStatus = Record<
  'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'UNKNOWN',
  { count: number; totalClasses: number; avgRating: number }
>;

export interface IFinancialSummary {
  paidRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  grossRevenue: number;
  collectionRate: number;
  growth: Array<{ month: string; total: number }>;
}

export interface ISystemHealthIndicators {
  pendingApprovals: IPendingApprovals;
  overduePayments: number;
  inactiveUsersByRole: Record<string, number>;
  pendingTutorVerifications: number;
}

export interface IAdminAnalytics {
  base: IDashboardStatistics;
  users: {
    byRole: IUserStatsByRole;
    totals: { totalUsers: number; totalActiveUsers: number };
    growth: IUserGrowthData[];
  };
  managers: IManagerPerformanceSummary;
  coordinators: ICoordinatorPerformanceSummary;
  tutors: ITutorStatsByStatus;
  finance: IFinancialSummary;
  classes: { growth: ICumulativeGrowth[] };
  health: ISystemHealthIndicators;
}

export interface IManagerMetrics {
  classLeadsCreated: number;
  demosScheduled: number;
  classesConverted: number;
  revenueGenerated: number;
  tutorsVerified: number;
  coordinatorsCreated: number;
  paymentsProcessed: number;
  conversionRate: number;
  averageRevenuePerClass: number;
  averageDemosPerLead: number;
  dateRange?: { from?: string; to?: string };
}

export interface IManagerPerformanceHistory {
  date: string;
  leadsCreated: number;
  classesConverted: number;
  revenue: number;
  conversionRate: number;
}

// Auth related types
export interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export type AuthResponse = ApiResponse<{
  user: IUser;
  accessToken: string;
  refreshToken: string;
}>;
