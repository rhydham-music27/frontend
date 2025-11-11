export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TUTOR: 'TUTOR',
  COORDINATOR: 'COORDINATOR',
  PARENT: 'PARENT',
} as const;

export const CLASS_LEAD_STATUS = {
  NEW: 'NEW',
  ANNOUNCED: 'ANNOUNCED',
  DEMO_SCHEDULED: 'DEMO_SCHEDULED',
  DEMO_COMPLETED: 'DEMO_COMPLETED',
  CONVERTED: 'CONVERTED',
  REJECTED: 'REJECTED',
} as const;

export const DEMO_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const ATTENDANCE_STATUS = {
  PENDING: 'PENDING',
  COORDINATOR_APPROVED: 'COORDINATOR_APPROVED',
  PARENT_APPROVED: 'PARENT_APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const;

export const FINAL_CLASS_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
} as const;

export const TEST_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REPORT_SUBMITTED: 'REPORT_SUBMITTED',
} as const;

export const TUTOR_TIER = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
} as const;

export const FEEDBACK_RATING = {
  EXCELLENT: 5,
  GOOD: 4,
  AVERAGE: 3,
  BELOW_AVERAGE: 2,
  POOR: 1,
} as const;

export const RECIPIENT_TYPE = {
  SPECIFIC_CLASS: 'SPECIFIC_CLASS',
  ALL_CLASSES: 'ALL_CLASSES',
  SPECIFIC_TUTOR: 'SPECIFIC_TUTOR',
  ALL_TUTORS: 'ALL_TUTORS',
  STUDENTS_PARENTS: 'STUDENTS_PARENTS',
} as const;

export const PAYMENT_METHOD = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  UPI: 'UPI',
  CHEQUE: 'CHEQUE',
  ONLINE: 'ONLINE',
} as const;

export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

export const NOTIFICATION_TYPE = {
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  DEMO_ASSIGNED: 'DEMO_ASSIGNED',
  PAYMENT: 'PAYMENT',
  VERIFICATION: 'VERIFICATION',
  GENERAL: 'GENERAL',
  ATTENDANCE: 'ATTENDANCE',
} as const;

export const TEACHING_MODE = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  HYBRID: 'HYBRID',
} as const;

export const BOARD_TYPE = {
  CBSE: 'CBSE',
  ICSE: 'ICSE',
  STATE_BOARD: 'STATE_BOARD',
  IB: 'IB',
  IGCSE: 'IGCSE',
} as const;

export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', path: '/', allowedRoles: [USER_ROLES.MANAGER, USER_ROLES.COORDINATOR, USER_ROLES.ADMIN] },
  { label: 'Admin Dashboard', path: '/admin-dashboard', allowedRoles: [USER_ROLES.ADMIN] },
  { label: 'Tutor Dashboard', path: '/tutor-dashboard', allowedRoles: [USER_ROLES.TUTOR] },
  { label: "Today's Tasks", path: '/today-tasks', allowedRoles: [USER_ROLES.COORDINATOR] },
  { label: 'Class Leads', path: '/class-leads', allowedRoles: [USER_ROLES.MANAGER, USER_ROLES.ADMIN] },
  { label: 'Tutors', path: '/tutors', allowedRoles: [USER_ROLES.MANAGER, USER_ROLES.ADMIN] },
  { label: 'Coordinators', path: '/coordinators', allowedRoles: [USER_ROLES.MANAGER] },
  { label: 'Managers', path: '/admin/managers', allowedRoles: [USER_ROLES.ADMIN] },
  { label: 'Coordinators Management', path: '/admin/coordinators', allowedRoles: [USER_ROLES.ADMIN] },
  { label: 'Data Management', path: '/admin/data-management', allowedRoles: [USER_ROLES.ADMIN] },
  { label: 'Register New Member', path: '/register', allowedRoles: [USER_ROLES.ADMIN] },
  { label: 'Attendance', path: '/attendance', allowedRoles: [USER_ROLES.MANAGER, USER_ROLES.COORDINATOR, USER_ROLES.PARENT, USER_ROLES.ADMIN] },
  { label: 'My Classes', path: '/assigned-classes', allowedRoles: [USER_ROLES.COORDINATOR] },
  { label: 'Attendance Approvals', path: '/attendance-approvals', allowedRoles: [USER_ROLES.COORDINATOR] },
  { label: 'Test Scheduling', path: '/test-scheduling', allowedRoles: [USER_ROLES.COORDINATOR] },
  { label: 'Announcements', path: '/announcements', allowedRoles: [USER_ROLES.COORDINATOR] },
  { label: 'Test Reports', path: '/test-reports', allowedRoles: [USER_ROLES.COORDINATOR] },
  { label: 'Tutor Performance', path: '/tutor-performance', allowedRoles: [USER_ROLES.COORDINATOR] },
  { label: 'Payment Tracking', path: '/payment-tracking', allowedRoles: [USER_ROLES.COORDINATOR] },
  { label: 'Payments', path: '/payments', allowedRoles: [USER_ROLES.MANAGER, USER_ROLES.ADMIN] },
  { label: 'Analytics', path: '/analytics', allowedRoles: [USER_ROLES.MANAGER, USER_ROLES.ADMIN] },
  { label: 'Profile', path: '/profile', allowedRoles: [USER_ROLES.MANAGER, USER_ROLES.TUTOR, USER_ROLES.PARENT, USER_ROLES.ADMIN] },
  { label: 'My Profile', path: '/coordinator-profile', allowedRoles: [USER_ROLES.COORDINATOR] },
  { label: 'Admin Profile', path: '/admin-profile', allowedRoles: [USER_ROLES.ADMIN] },
];

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REFRESH: '/api/auth/refresh-token',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',
  AUTH_REFRESH_TOKEN: '/api/auth/refresh-token',
  LEADS: '/api/leads',
  LEADS_MY: '/api/leads/my-leads',
  LEAD_STATUS: (id: string) => `/api/leads/${id}/status`,
  TUTORS: '/api/tutors',
  COORDINATORS: '/api/coordinators',
  ATTENDANCE: '/api/attendance',
  PAYMENTS: '/api/payments',
  ANALYTICS: '/api/analytics',
  ANNOUNCEMENTS: '/api/announcements',
  ANNOUNCEMENTS_BY_LEAD: (leadId: string) => `/api/announcements/lead/${leadId}`,
  ANNOUNCEMENTS_INTERESTED_TUTORS: (id: string) => `/api/announcements/${id}/interested-tutors`,
  ANNOUNCEMENTS_EXPRESS_INTEREST: (id: string) => `/api/announcements/${id}/interest`,
  DEMOS: '/api/demos',
  DEMOS_ASSIGN: (leadId: string) => `/api/demos/assign/${leadId}`,
  DEMOS_STATUS: (leadId: string) => `/api/demos/status/${leadId}`,
  DEMOS_EDIT: (leadId: string) => `/api/demos/edit/${leadId}`,
  DEMOS_HISTORY: (leadId: string) => `/api/demos/history/${leadId}`,
  DEMOS_MY_DEMOS: '/api/demos/tutor/my-demos',
  // Attendance extended endpoints
  ATTENDANCE_COORDINATOR_PENDING: '/api/attendance/coordinator/pending',
  ATTENDANCE_PARENT_PENDING: '/api/attendance/parent/pending',
  ATTENDANCE_CLASS: (classId: string) => `/api/attendance/class/${classId}`,
  ATTENDANCE_HISTORY: (classId: string) => `/api/attendance/class/${classId}/history`,
  ATTENDANCE_APPROVE_COORDINATOR: (id: string) => `/api/attendance/${id}/coordinator-approve`,
  ATTENDANCE_APPROVE_PARENT: (id: string) => `/api/attendance/${id}/parent-approve`,
  ATTENDANCE_REJECT: (id: string) => `/api/attendance/${id}/reject`,
  // Payments extended endpoints
  PAYMENTS_TUTOR: (tutorId: string) => `/api/payments/tutor/${tutorId}`,
  PAYMENTS_CLASS: (classId: string) => `/api/payments/class/${classId}`,
  PAYMENTS_STATUS: (id: string) => `/api/payments/${id}/status`,
  PAYMENTS_STATISTICS: '/api/payments/statistics',
  PAYMENTS_SEND_REMINDER: (id: string) => `/api/payments/${id}/send-reminder`,
  PAYMENTS_MY_SUMMARY: '/api/payments/tutor/summary',
  PAYMENTS_RECEIPT: (id: string) => `/api/payments/${id}/receipt`,
  // Tutors extended endpoints
  TUTORS_MY_PROFILE: '/api/tutors/my-profile',
  TUTORS_PENDING_VERIFICATIONS: '/api/tutors/pending-verifications',
  TUTORS_VERIFICATION_STATUS: (id: string) => `/api/tutors/${id}/verification-status`,
  TUTORS_DOCUMENTS: (id: string) => `/api/tutors/${id}/documents`,
  TUTORS_DELETE_DOCUMENT: (id: string, docIndex: number) => `/api/tutors/${id}/documents/${docIndex}`,
  // Notifications endpoints
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread-count',
  NOTIFICATIONS_MARK_ALL_READ: '/api/notifications/mark-all-read',
  NOTIFICATIONS_MARK_READ: (id: string) => `/api/notifications/${id}/read`,
  // Dashboard endpoints
  DASHBOARD_STATS: '/api/dashboard/stats',
  DASHBOARD_LEADS_DATE_WISE: '/api/dashboard/leads/date-wise',
  DASHBOARD_LEADS_STATUS_DISTRIBUTION: '/api/dashboard/leads/status-distribution',
  DASHBOARD_CONVERSION_FUNNEL: '/api/dashboard/conversion-funnel',
  DASHBOARD_CLASSES_PROGRESS: '/api/dashboard/classes/progress',
  DASHBOARD_CLASSES_CUMULATIVE_GROWTH: '/api/dashboard/classes/cumulative-growth',
  DASHBOARD_TUTORS_PROGRESS_REPORT: '/api/dashboard/tutors/progress-report',
  DASHBOARD_PENDING_APPROVALS: '/api/dashboard/pending-approvals',
  DASHBOARD_REVENUE_ANALYTICS: '/api/dashboard/revenue/analytics',
  DASHBOARD_EXPORT_CSV: '/api/dashboard/export/csv',
  DASHBOARD_EXPORT_PDF: '/api/dashboard/export/pdf',
  // Manager endpoints
  MANAGERS: '/api/managers',
  MANAGERS_MY_PROFILE: '/api/managers/my-profile',
  MANAGERS_MY_METRICS: '/api/managers/my-metrics',
  MANAGERS_MY_ACTIVITY_LOG: '/api/managers/my-activity-log',
  MANAGERS_METRICS: (id: string) => `/api/managers/${id}/metrics`,
  MANAGERS_PERFORMANCE_HISTORY: (id: string) => `/api/managers/${id}/performance-history`,
  MANAGERS_ACTIVITY_LOG: (id: string) => `/api/managers/${id}/activity-log`,
  MANAGERS_CONTRIBUTION: (id: string) => `/api/managers/${id}/contribution`,
  // Coordinator endpoints
  COORDINATORS_DASHBOARD_STATS: '/api/coordinators/dashboard/stats',
  COORDINATORS_DASHBOARD_TASKS: '/api/coordinators/dashboard/tasks',
  COORDINATORS_ASSIGNED_CLASSES: '/api/coordinators/assigned-classes',
  COORDINATOR_PAYMENTS_SUMMARY: '/api/coordinators/payments/summary',
  COORDINATOR_PROFILE_METRICS: '/api/coordinators/profile/metrics',
  // Test endpoints
  TESTS: '/api/tests',
  TESTS_COORDINATOR: '/api/tests/coordinator/tests',
  TESTS_CLASS: (classId: string) => `/api/tests/class/${classId}`,
  TESTS_STATUS: (id: string) => `/api/tests/${id}/status`,
  TESTS_REPORT: (id: string) => `/api/tests/${id}/report`,
  TESTS_CANCEL: (id: string) => `/api/tests/${id}/cancel`,
  TESTS_EXPORT_PDF: (testId: string) => `/api/tests/${testId}/export-pdf`,
  // Coordinator announcements
  COORDINATOR_ANNOUNCEMENTS: '/api/announcements/coordinator',
  COORDINATOR_ANNOUNCEMENTS_STATS: '/api/announcements/coordinator/stats',
  COORDINATOR_ANNOUNCEMENT_DETAIL: (id: string) => `/api/announcements/coordinator/${id}`,
  // Tutor performance & feedback endpoints
  TUTORS_TIER_REQUEST: '/api/tutors/tier/request',
  TUTORS_TIER_APPROVE: (tutorId: string) => `/api/tutors/${tutorId}/tier/approve`,
  TUTORS_FEEDBACK: '/api/tutors/feedback',
  TUTORS_FEEDBACK_GET: (tutorId: string) => `/api/tutors/${tutorId}/feedback`,
  TUTORS_PERFORMANCE: (tutorId: string) => `/api/tutors/${tutorId}/performance`,
  COORDINATOR_TUTORS: '/api/tutors/coordinator/tutors',
  // Final classes - tutor
  FINAL_CLASSES_MY_CLASSES: '/api/final-classes/tutor/my-classes',
  
  // Admin endpoints
  // Admin profile and base
  ADMIN: '/api/admin',
  ADMIN_MY_PROFILE: '/api/admin/my-profile',
  ADMIN_BY_USER: (userId: string) => `/api/admin/user/${userId}`,
  ADMIN_BY_ID: (adminId: string) => `/api/admin/${adminId}`,
  // Admin analytics
  ADMIN_ANALYTICS: '/api/admin/analytics',
  ADMIN_ANALYTICS_EXPORT_CSV: '/api/admin/analytics/export/csv',
  ADMIN_ANALYTICS_EXPORT_PDF: '/api/admin/analytics/export/pdf',
  // Admin user management
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USERS_BULK: '/api/admin/users/bulk',
  ADMIN_ELIGIBLE_MANAGER_USERS: '/api/managers/eligible-users',
  ADMIN_ELIGIBLE_COORDINATOR_USERS: '/api/coordinators/eligible-users',
  // Admin bulk operations
  ADMIN_BULK_USERS: '/api/admin/bulk/users',
  ADMIN_BULK_MANAGERS: '/api/admin/bulk/managers',
  ADMIN_BULK_COORDINATORS: '/api/admin/bulk/coordinators',
  ADMIN_BULK_PAYMENTS: '/api/admin/bulk/payments',
  ADMIN_BULK_RECORDS: '/api/admin/bulk/records',
};
