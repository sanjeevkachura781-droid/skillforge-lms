export type Role = 'student' | 'instructor' | 'admin';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User { id: number; firstName: string; lastName: string; email: string; role: Role; status: string; instructorProfile?: { approvalStatus: string } | null; }
export interface Category { id: number; name: string; slug: string; description?: string | null; isActive?: boolean; }
export interface Lesson { id: number; moduleId: number; title: string; content?: string; videoUrl?: string | null; durationMinutes?: number | null; position: number; isPreview?: boolean; }
export interface CourseModule { id: number; courseId: number; title: string; description?: string | null; position: number; lessons?: Lesson[]; }
export interface Course { id: number; instructorId: number; categoryId: number; title: string; slug: string; shortDescription: string; description: string; thumbnailUrl?: string | null; level: CourseLevel; status: string; category?: Category; instructor?: User; modules?: CourseModule[]; quizzes?: Quiz[]; }
export interface Enrollment { id: number; studentId: number; courseId: number; status: string; course?: Course; enrolledAt: string; completedAt?: string | null; }
export interface Progress { enrollmentId: number; totalLessons: number; completedLessons: number; percentage: number; progress: Array<{ lessonId: number; completed: boolean; lesson?: Lesson }> }
export interface Certificate { id: number; certificateNumber: string; issuedAt: string; course?: Course; }
export interface Notification { id: number; type: string; title: string; message: string; readAt?: string | null; createdAt: string; }
export interface QuizOption { id: number; optionText: string; position: number; isCorrect?: boolean; }
export interface QuizQuestion { id: number; questionText: string; position: number; points: number; options: QuizOption[]; }
export interface Quiz { id: number; title: string; description?: string | null; passingPercentage: number; questions: QuizQuestion[]; courseId: number; isPublished?: boolean; }
export interface QuizResult { attempt: { id: number }; scorePercentage: number; passed: boolean; totalPoints: number; earnedPoints: number; }
export interface ApiEnvelope<T> { success: boolean; message: string; data: T; }
export interface Paginated<T> { items: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }

export interface Review { id: number; rating: number; comment?: string; student?: { firstName: string; lastName: string }; }
export interface InstructorApplication { id: number; approvalStatus: string; user: User; }
