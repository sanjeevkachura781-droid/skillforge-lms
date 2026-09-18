import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { CertificatesPage, DashboardPage, LearningPage, NotificationsPage } from './pages/DashboardPages';

export default function App() {
  return <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:slug" element={<CourseDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route path="/my-learning" element={<Navigate to="/dashboard" replace />} />
        <Route path="/learn/:enrollmentId" element={<LearningPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['instructor']} />}>
        <Route path="/instructor/courses/new" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>;
}
