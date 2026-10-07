import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import StudentsPage from "./pages/StudentsPage";
import TeachersPage from "./pages/TeachersPage";
import ParentsPage from "./pages/ParentsPage";

import AcademicPerformancePage from "./pages/AcademicPerformancePage";
import AttendancePage from "./pages/AttendancePage";
import MeetingsPage from "./pages/MeetingsPage";
import DocumentsPage from "./pages/DocumentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import FeesPage from "./pages/FeesPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import StudentDetailsPage from "./pages/StudentDetailsPage";
import TeacherDetailsPage from "./pages/TeacherDetailsPage";
import ParentDetailsPage from "./pages/ParentDetailsPage";
import AcademicPerformanceDetailsPage from "./pages/AcademicPerformanceDetailsPage";
import AttendanceDetailsPage from "./pages/AttendanceDetailsPage";
import MeetingDetailsPage from "./pages/MeetingDetailsPage";
import DocumentDetailsPage from "./pages/DocumentDetailsPage";
import NotificationDetailsPage from "./pages/NotificationDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected application routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            {/* Directory - Students */}
            <Route
              path="/directory/students"
              element={<StudentsPage />}
            />

            <Route
              path="/directory/students/:id"
              element={<StudentDetailsPage />}
            />

            {/* Directory - Teachers */}
            <Route
              path="/directory/teachers"
              element={<TeachersPage />}
            />

            <Route
              path="/directory/teachers/:id"
              element={<TeacherDetailsPage />}
            />

            {/* Directory - Parents */}
            <Route
              path="/directory/parents"
              element={<ParentsPage />}
            />

            <Route
              path="/directory/parents/:id"
              element={<ParentDetailsPage />}
            />

            {/* Academics - Academic Performance */}
            <Route
              path="/academics/performance"
              element={<AcademicPerformancePage />}
            />

            <Route
              path="/academics/performance/:id"
              element={<AcademicPerformanceDetailsPage />}
            />

            {/* Operations - Attendance */}
            <Route
              path="/operations/attendance"
              element={<AttendancePage />}
            />

            <Route
             path="/operations/attendance/:id"
             element={<AttendanceDetailsPage />}
             />

            {/* Operations - Meetings */}
            <Route
              path="/operations/meetings"
              element={<MeetingsPage />}
            />

            <Route
              path="/operations/meetings/:id"
              element={<MeetingDetailsPage />}
               />

            {/* Operations - Documents */}
            <Route
              path="/operations/documents"
              element={<DocumentsPage />}
            />

            <Route
            path="/operations/documents/:id"
              element={<DocumentDetailsPage />}
            />

            {/* Operations - Notifications */}
            <Route
              path="/operations/notifications"
              element={<NotificationsPage />}
            />

            <Route
            path="/operations/notifications/:id"
            element={<NotificationDetailsPage />}
            />

            {/* Administration - Admissions */}
            <Route
              path="/administration/admissions"
              element={<AdmissionsPage />}
            />

            {/* Administration - Fees */}
            <Route
              path="/administration/fees"
              element={<FeesPage />}
            />

            {/* AI Assistant */}
            <Route
              path="/ai"
              element={<AIAssistantPage />}
            />

          </Route>
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;