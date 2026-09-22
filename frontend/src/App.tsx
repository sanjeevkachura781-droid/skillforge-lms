import { lazy, Suspense } from 'react';
import { LoadingState } from './components/State';
const CourseEditorPage = lazy(() => import('./pages/AuthoringPages').then(module => ({ default: module.CourseEditorPage }))); 
import { ManagementPage } from './pages/ManagementPage';
import { QuizPage } from './pages/LearningFeatures';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { CertificatesPage, DashboardPage, LearningPage, NotificationsPage } from './pages/DashboardPages';

export default function App() {
  return <Suspense fallback={<LoadingState />}><Routes>
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
        <Route path="/quizzes/:quizId" element={<QuizPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['instructor']} />}>
        <Route path="/instructor/courses/new" element={<CourseEditorPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['instructor', 'admin']} />}><Route path="/instructor/courses/:courseId" element={<CourseEditorPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="/admin/manage" element={<ManagementPage />} /></Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes></Suspense>;
}
