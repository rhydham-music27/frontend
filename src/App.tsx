import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from './store/slices/authSlice';
import { USER_ROLES } from './constants';
import AppThemeProvider from './theme/ThemeProvider';
import { Provider } from 'react-redux';
import { store } from './store';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import OtpLoginPage from './pages/auth/OtpLoginPage';
import ParentLoginPage from './pages/auth/ParentLoginPage';
import StudentLoginPage from './pages/auth/StudentLoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ClassLeadsListPage from './pages/classLeads/ClassLeadsListPage';
import CreateClassLeadPage from './pages/classLeads/CreateClassLeadPage';
import ClassLeadDetailPage from './pages/classLeads/ClassLeadDetailPage';
import EditClassLeadPage from './pages/classLeads/EditClassLeadPage';
import AttendanceListPage from './pages/attendance/AttendanceListPage';
import PaymentsListPage from './pages/payments/PaymentsListPage';
import PaymentDetailPage from './pages/payments/PaymentDetailPage';
import TutorVerificationPage from './pages/tutors/TutorVerificationPage';
import ManagerProfilePage from './pages/manager/ManagerProfilePage';
import CoordinatorDashboardPage from './pages/coordinator/CoordinatorDashboardPage';
import AssignedClassesPage from './pages/coordinator/AssignedClassesPage';
import AttendanceApprovalPage from './pages/coordinator/AttendanceApprovalPage';
import TestSchedulingPage from './pages/coordinator/TestSchedulingPage';
import SendAnnouncementPage from './pages/coordinator/SendAnnouncementPage';
import TodayTasksPage from './pages/coordinator/TodayTasksPage';
import TestReportAnalysisPage from './pages/coordinator/TestReportAnalysisPage';
import TutorPerformancePage from './pages/coordinator/TutorPerformancePage';
import PaymentTrackingPage from './pages/coordinator/PaymentTrackingPage';
import CoordinatorProfilePage from './pages/coordinator/CoordinatorProfilePage';
import CoordinatorsPage from './pages/manager/CoordinatorsPage';
import ManagerTodayTasksPage from './pages/manager/ManagerTodayTasksPage';
import ManagerAnalyticsPage from './pages/manager/ManagerAnalyticsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import ManagersManagementPage from './pages/admin/ManagersManagementPage';
import CoordinatorsManagementPage from './pages/admin/CoordinatorsManagementPage';
import DataManagementPage from './pages/admin/DataManagementPage';
import TutorDashboardPage from './pages/tutors/TutorDashboardPage';
import TutorClassesPage from './pages/tutors/TutorClassesPage';
import TutorRegistrationPage from './pages/tutors/TutorRegistrationPage';
import TutorTimetablePage from './pages/tutors/TutorTimetablePage';
import TutorPaymentsPage from './pages/tutors/TutorPaymentsPage';
import TutorProfilePage from './pages/tutors/TutorProfilePage';
import TutorAttendancePage from './pages/tutors/TutorAttendancePage';
import TutorLeadsPage from './pages/tutors/TutorLeadsPage';
import TutorNotesPage from './pages/tutors/TutorNotesPage';
import NotesDrivePage from './pages/notes/NotesDrivePage';
import TutorPublicProfilePage from './pages/public/TutorPublicProfilePage';
import RequestTutorPage from './pages/public/RequestTutorPage';
import CoordinatorSettingsPage from './pages/coordinator/CoordinatorSettingsPage';
import ParentDashboardPage from './pages/parent/ParentDashboardPage';
import ParentAttendancePage from './pages/parent/ParentAttendancePage';
import ParentPaymentsPage from './pages/parent/ParentPaymentsPage';
import ParentTestsPage from './pages/parent/ParentTestsPage';
import ParentNotesPage from './pages/parent/ParentNotesPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentChangePasswordPage from './pages/student/StudentChangePasswordPage';
import StudentLayout from './components/layout/StudentLayout';
import StudentClassesPage from './pages/student/StudentClassesPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentTestsPage from './pages/student/StudentTestsPage';
import StudentNotesPage from './pages/student/StudentNotesPage';
import StudentPaymentsPage from './pages/student/StudentPaymentsPage';
import OptionsManagementPage from './pages/admin/OptionsManagementPage';

const App: React.FC = () => {
  const RoleBasedDashboard: React.FC = () => {
    const user = useSelector(selectCurrentUser);
    const role = user?.role;
    if (role === USER_ROLES.ADMIN) {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (role === USER_ROLES.COORDINATOR) {
      return <Navigate to="/coordinator-dashboard" replace />;
    }
    if (role === USER_ROLES.TUTOR) {
      return <Navigate to="/tutor-dashboard" replace />;
    }
    if (role === USER_ROLES.PARENT) {
      return <Navigate to="/parent-dashboard" replace />;
    }
    if (role === USER_ROLES.STUDENT) {
      return <Navigate to="/student-dashboard" replace />;
    }
    return <DashboardPage />;
  };

  const RoleBasedProfile: React.FC = () => {
    const user = useSelector(selectCurrentUser);
    const role = user?.role;

    if (role === USER_ROLES.TUTOR) {
      return <TutorProfilePage />;
    }
    if (role === USER_ROLES.COORDINATOR) {
      return <CoordinatorProfilePage />;
    }
    if (role === USER_ROLES.ADMIN) {
      return <AdminProfilePage />;
    }
    // Default to manager profile for MANAGER or unknown roles
    return <ManagerProfilePage />;
  };

  return (
    <AppThemeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-otp" element={<OtpLoginPage />} />
            <Route path="/parent-login" element={<ParentLoginPage />} />
            <Route path="/student-login" element={<StudentLoginPage />} />
            <Route
              path="/register"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <RegisterPage />
                </ProtectedRoute>
              }
            />
            <Route path="/tutor-register" element={<TutorRegistrationPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleBasedDashboard />} />
              <Route path="coordinator-dashboard" element={<CoordinatorDashboardPage />} />
              <Route path="tutor-dashboard" element={<TutorDashboardPage />} />
              <Route path="tutor-classes" element={<TutorClassesPage />} />
              <Route path="tutor-timetable" element={<TutorTimetablePage />} />
              <Route path="tutor-payments" element={<TutorPaymentsPage />} />
              <Route path="tutor-attendance" element={<TutorAttendancePage />} />
              <Route path="tutor-leads" element={<TutorLeadsPage />} />
              <Route path="tutor-notes" element={<TutorNotesPage />} />
              <Route path="notes" element={<NotesDrivePage />} />
              <Route path="today-tasks" element={<TodayTasksPage />} />
              <Route path="assigned-classes" element={<AssignedClassesPage />} />
              <Route path="attendance-approvals" element={<AttendanceApprovalPage />} />
              <Route path="test-scheduling" element={<TestSchedulingPage />} />
              <Route path="announcements" element={<SendAnnouncementPage />} />
              <Route path="test-reports" element={<TestReportAnalysisPage />} />
              <Route path="tutor-performance" element={<TutorPerformancePage />} />
              <Route path="payment-tracking" element={<PaymentTrackingPage />} />
              <Route path="coordinator-settings" element={<CoordinatorSettingsPage />} />
              <Route path="coordinator-profile" element={<CoordinatorProfilePage />} />
              <Route path="admin-dashboard" element={<AdminDashboardPage />} />
              <Route path="admin-profile" element={<AdminProfilePage />} />
              <Route path="manager-today-tasks" element={<ManagerTodayTasksPage />} />
              <Route path="parent-dashboard" element={<ParentDashboardPage />} />
              <Route path="parent-attendance" element={<ParentAttendancePage />} />
              <Route path="parent-payments" element={<ParentPaymentsPage />} />
              <Route path="parent-test" element={<ParentTestsPage />} />
              <Route path="parent-notes" element={<ParentNotesPage />} />
              <Route path="admin">
                <Route path="managers" element={<ManagersManagementPage />} />
                <Route path="coordinators" element={<CoordinatorsManagementPage />} />
                <Route path="data-management" element={<DataManagementPage />} />
                <Route path="options" element={<OptionsManagementPage />} />
              </Route>
              <Route path="class-leads">
                <Route index element={<ClassLeadsListPage />} />
                <Route path="new" element={<CreateClassLeadPage />} />
                <Route path=":id" element={<ClassLeadDetailPage />} />
                <Route path=":id/edit" element={<EditClassLeadPage />} />
              </Route>
              <Route path="tutors" element={<TutorVerificationPage />} />
              <Route path="coordinators" element={<CoordinatorsPage />} />
              <Route path="attendance" element={<AttendanceListPage />} />
              <Route path="payments">
                <Route index element={<PaymentsListPage />} />
                <Route path=":id" element={<PaymentDetailPage />} />
              </Route>
              <Route path="analytics" element={<ManagerAnalyticsPage />} />

              <Route path="profile" element={<RoleBasedProfile />} />
              <Route path="tutor-profile" element={<TutorProfilePage />} />
            </Route>

            {/* Student Routes - Navbar Only */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute studentRoute={true}>
                  <StudentLayout>
                    <StudentDashboardPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-profile"
              element={
                <ProtectedRoute studentRoute={true}>
                  <StudentLayout>
                    <StudentProfilePage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-change-password"
              element={
                <ProtectedRoute studentRoute={true}>
                  <StudentLayout>
                    <StudentChangePasswordPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-classes"
              element={
                <ProtectedRoute studentRoute={true}>
                  <StudentLayout>
                    <StudentClassesPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-attendance"
              element={
                <ProtectedRoute studentRoute={true}>
                  <StudentLayout>
                    <StudentAttendancePage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-tests"
              element={
                <ProtectedRoute studentRoute={true}>
                  <StudentLayout>
                    <StudentTestsPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-notes"
              element={
                <ProtectedRoute studentRoute={true}>
                  <StudentLayout>
                    <StudentNotesPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-payments"
              element={
                <ProtectedRoute studentRoute={true}>
                  <StudentLayout>
                    <StudentPaymentsPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />

            <Route path="ourtutor/:teacherId" element={<TutorPublicProfilePage />} />
            <Route path="/request-tutor" element={<RequestTutorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </AppThemeProvider>
  );
};

export default App;