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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
             <Route
             path="/directory/students"
             element={<StudentsPage />}
             />

             <Route
              path="/directory/students/:id"
              element={<StudentDetailsPage />}
             />


             <Route
             path="/directory/teachers"
             element={<TeachersPage />}
            />

            <Route
             path="/directory/parents"
             element={<ParentsPage />}
             />

             <Route
              path="/academics/performance"
             element={<AcademicPerformancePage />}
             />

             <Route
              path="/operations/attendance"
              element={<AttendancePage />}
             />

             <Route
               path="/operations/meetings"
                element={<MeetingsPage />}
              />

              <Route
               path="/operations/documents"
               element={<DocumentsPage />}
               />
               
               <Route
               path="/operations/notifications"
               element={<NotificationsPage />}
                />

              <Route
                  path="/administration/admissions"
                  element={<AdmissionsPage />}
                />

                <Route
                path="/administration/fees"
                  element={<FeesPage />}
                 />

                 <Route
                  path="/ai"
                 element={<AIAssistantPage />}
                 />

                 <Route
                  path="/directory/teachers"
                  element={<TeachersPage />}
                 />

                 <Route
                  path="/directory/teachers/:id"
                  element={<TeacherDetailsPage />}
                  />

                  <Route
                  path="/directory/parents/:id"
                  element={<ParentDetailsPage />}
                  />

         </Route>
       </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;