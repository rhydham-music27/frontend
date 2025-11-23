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
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import ManagersManagementPage from './pages/admin/ManagersManagementPage';
import CoordinatorsManagementPage from './pages/admin/CoordinatorsManagementPage';
import DataManagementPage from './pages/admin/DataManagementPage';
import TutorDashboardPage from './pages/tutors/TutorDashboardPage';
import TutorRegistrationPage from './pages/tutors/TutorRegistrationPage';
import TutorTimetablePage from './pages/tutors/TutorTimetablePage';

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
    return <DashboardPage />;
  };

  return (
    <AppThemeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
              <Route path="tutor-timetable" element={<TutorTimetablePage />} />
              <Route path="today-tasks" element={<TodayTasksPage />} />
              <Route path="assigned-classes" element={<AssignedClassesPage />} />
              <Route path="attendance-approvals" element={<AttendanceApprovalPage />} />
              <Route path="test-scheduling" element={<TestSchedulingPage />} />
              <Route path="announcements" element={<SendAnnouncementPage />} />
              <Route path="test-reports" element={<TestReportAnalysisPage />} />
              <Route path="tutor-performance" element={<TutorPerformancePage />} />
              <Route path="payment-tracking" element={<PaymentTrackingPage />} />
              <Route path="coordinator-profile" element={<CoordinatorProfilePage />} />
              <Route path="admin-dashboard" element={<AdminDashboardPage />} />
              <Route path="admin-profile" element={<AdminProfilePage />} />
              <Route path="admin">
                <Route path="managers" element={<ManagersManagementPage />} />
                <Route path="coordinators" element={<CoordinatorsManagementPage />} />
                <Route path="data-management" element={<DataManagementPage />} />
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
              <Route path="analytics" element={<div>Analytics - Coming soon</div>} />
              <Route path="profile" element={<ManagerProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </AppThemeProvider>
  );
};

export default App;