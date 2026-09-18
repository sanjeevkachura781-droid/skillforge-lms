import { api } from './client';
import type { ApiEnvelope, Certificate, Category, Course, Enrollment, Lesson, Notification, Paginated, Progress, Quiz, QuizResult, User } from '../types/api';

export const authApi = {
  login: (body: unknown) => api.post<ApiEnvelope<{ user: User; accessToken: string }>>('/auth/login', body),
  register: (body: unknown) => api.post<ApiEnvelope<{ user: User; accessToken: string }>>('/auth/register', body),
  me: () => api.get<ApiEnvelope<User>>('/auth/me'),
};
export const catalogApi = {
  categories: () => api.get<ApiEnvelope<Category[]>>('/categories'),
  courses: (params: Record<string, string | number | undefined>) => api.get<ApiEnvelope<Paginated<Course>>>('/courses', { params }),
  course: (slug: string) => api.get<ApiEnvelope<Course>>(`/courses/${slug}`),
  reviews: (courseId: number) => api.get<ApiEnvelope<unknown[]>>(`/courses/${courseId}/reviews`),
};
export const studentApi = {
  enroll: (courseId: number) => api.post<ApiEnvelope<Enrollment>>(`/enrollments/courses/${courseId}`),
  enrollments: () => api.get<ApiEnvelope<Enrollment[]>>('/enrollments/mine'),
  progress: (enrollmentId: number) => api.get<ApiEnvelope<Progress>>(`/enrollments/${enrollmentId}/progress`),
  completeLesson: (lessonId: number) => api.post<ApiEnvelope<Progress>>(`/lessons/${lessonId}/complete`),
  certificates: () => api.get<ApiEnvelope<Certificate[]>>('/certificates'),
  notifications: () => api.get<ApiEnvelope<Notification[]>>('/notifications'),
  markNotificationRead: (id: number) => api.patch<ApiEnvelope<Notification>>(`/notifications/${id}/read`),
  quiz: (quizId: number) => api.get<ApiEnvelope<Quiz>>(`/quizzes/${quizId}`),
  submitQuiz: (quizId: number, answers: Array<{ questionId: number; optionId: number }>) => api.post<ApiEnvelope<QuizResult>>(`/quizzes/${quizId}/attempts`, { answers }),
  review: (courseId: number, body: { rating: number; comment?: string }) => api.post(`/courses/${courseId}/reviews`, body),
};
export const instructorApi = {
  courses: () => api.get<ApiEnvelope<Course[]>>('/courses/mine'),
  createCourse: (body: unknown) => api.post<ApiEnvelope<Course>>('/courses', body),
  submitCourse: (id: number) => api.post<ApiEnvelope<Course>>(`/courses/${id}/submit`),
};
export const adminApi = {
  pendingCourses: () => api.get<ApiEnvelope<Course[]>>('/courses/pending'),
  approveCourse: (id: number) => api.post<ApiEnvelope<Course>>(`/courses/${id}/approve`),
  rejectCourse: (id: number) => api.post<ApiEnvelope<Course>>(`/courses/${id}/reject`),
};

export type ApiLesson = Lesson;
