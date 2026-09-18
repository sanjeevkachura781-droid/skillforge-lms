import { Award, BarChart3, BookOpenCheck, CheckCircle2, Clock3, FilePlus2, ShieldCheck, Users } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { adminApi, instructorApi, studentApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { formatDate } from '../utils/format';

type Icon = typeof BookOpenCheck;

export function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'instructor') return <InstructorDashboard />;
  return <StudentDashboard />;
}

function StudentDashboard() {
  const enrollments = useQuery({ queryKey: ['enrollments'], queryFn: () => studentApi.enrollments().then((r) => r.data.data) });
  const certificates = useQuery({ queryKey: ['certificates'], queryFn: () => studentApi.certificates().then((r) => r.data.data) });
  if (enrollments.isLoading) return <LoadingState />;
  if (enrollments.isError) return <ErrorState message="Your learning dashboard could not load." />;
  const items = enrollments.data ?? [];
  return <DashboardFrame eyebrow="Student dashboard" title="Keep your momentum visible." stats={[["Active paths", String(items.length), BookOpenCheck], ["Certificates", String(certificates.data?.length ?? 0), Award], ["Current streak", "Build it today", Clock3]]}>
    <div className="flex items-end justify-between"><div><h2 className="text-3xl">Your learning</h2><p className="mt-2 font-sans text-sm text-[#657066]">Courses you have chosen to move through.</p></div><Link to="/courses" className="rounded-full bg-[#d86445] px-4 py-2 font-sans text-xs font-bold text-white">Find a course</Link></div>
    <div className="mt-6 space-y-3">{items.length ? items.map((enrollment) => <Link key={enrollment.id} to={`/learn/${enrollment.id}`} className="flex items-center gap-4 border border-[#d8d2c3] bg-[#fbfaf5] p-5 transition hover:border-[#d86445]"><div className="grid h-12 w-12 place-items-center bg-[#193b31] text-[#edbd61]"><BookOpenCheck size={21} /></div><div className="flex-1"><h3 className="text-xl">{enrollment.course?.title}</h3><p className="mt-1 font-sans text-xs uppercase tracking-wider text-[#657066]">{enrollment.status}</p></div><span className="font-sans text-sm font-bold">Open →</span></Link>) : <EmptyState title="Your path starts here" detail="Choose a course from the catalog to begin." />}</div>
  </DashboardFrame>;
}

function InstructorDashboard() {
  const courses = useQuery({ queryKey: ['instructor-courses'], queryFn: () => instructorApi.courses().then((r) => r.data.data) });
  if (courses.isLoading) return <LoadingState />;
  if (courses.isError) return <ErrorState message="The instructor studio could not load." />;
  const items = courses.data ?? [];
  return <DashboardFrame eyebrow="Instructor studio" title="Shape knowledge people can use." stats={[["Your courses", String(items.length), BookOpenCheck], ["Published", String(items.filter((course) => course.status === 'published').length), CheckCircle2], ["Analytics", "Coming next", BarChart3]]}>
    <div className="flex items-end justify-between"><div><h2 className="text-3xl">Course studio</h2><p className="mt-2 font-sans text-sm text-[#657066]">Draft, submit, and refine your courses.</p></div><Link to="/instructor/courses/new" className="flex items-center gap-2 rounded-full bg-[#d86445] px-4 py-2 font-sans text-xs font-bold text-white"><FilePlus2 size={15} /> New course</Link></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">{items.length ? items.map((course) => <div key={course.id} className="border border-[#d8d2c3] bg-[#fbfaf5] p-5"><div className="flex items-start justify-between gap-4"><h3 className="text-xl">{course.title}</h3><span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#d86445]">{course.status}</span></div><p className="mt-2 font-sans text-sm text-[#657066]">{course.shortDescription}</p><p className="mt-5 font-sans text-xs text-[#657066]">Updated course workspace</p></div>) : <EmptyState title="No courses yet" detail="Create your first course to begin teaching." />}</div>
  </DashboardFrame>;
}

function AdminDashboard() {
  const pending = useQuery({ queryKey: ['pending-courses'], queryFn: () => adminApi.pendingCourses().then((r) => r.data.data) });
  const client = useQueryClient();
  const review = useMutation({ mutationFn: ({ id, action }: { id: number; action: 'approve' | 'reject' }) => action === 'approve' ? adminApi.approveCourse(id) : adminApi.rejectCourse(id), onSuccess: () => client.invalidateQueries({ queryKey: ['pending-courses'] }) });
  if (pending.isLoading) return <LoadingState />;
  if (pending.isError) return <ErrorState message={apiErrorMessage(pending.error)} />;
  const items = pending.data ?? [];
  return <DashboardFrame eyebrow="Admin control room" title="Keep the learning system healthy." stats={[["Pending courses", String(items.length), ShieldCheck], ["Users", "Live API", Users], ["Platform health", "Operational", BarChart3]]}>
    <div><h2 className="text-3xl">Course approvals</h2><p className="mt-2 font-sans text-sm text-[#657066]">Review instructor submissions before they reach students.</p></div>
    <div className="mt-6 space-y-3">{items.length ? items.map((course) => <div key={course.id} className="flex flex-col gap-4 border border-[#d8d2c3] bg-[#fbfaf5] p-5 sm:flex-row sm:items-center"><div className="flex-1"><h3 className="text-xl">{course.title}</h3><p className="mt-1 font-sans text-sm text-[#657066]">{course.shortDescription}</p></div><div className="flex gap-2"><button disabled={review.isPending} onClick={() => review.mutate({ id: course.id, action: 'reject' })} className="border border-[#d86445] px-3 py-2 font-sans text-xs font-bold text-[#d86445]">Reject</button><button disabled={review.isPending} onClick={() => review.mutate({ id: course.id, action: 'approve' })} className="bg-[#193b31] px-3 py-2 font-sans text-xs font-bold text-white">Approve</button></div></div>) : <EmptyState title="Nothing to review" detail="New course submissions will appear here." />}</div>
  </DashboardFrame>;
}

function DashboardFrame({ eyebrow, title, stats, children }: { eyebrow: string; title: string; stats: Array<[string, string, Icon]>; children: React.ReactNode }) {
  return <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><p className="font-sans text-xs font-bold uppercase tracking-[.25em] text-[#d86445]">{eyebrow}</p><h1 className="mt-3 max-w-3xl text-5xl leading-none">{title}</h1><div className="mt-10 grid gap-3 sm:grid-cols-3">{stats.map(([label, value, StatIcon]) => <div key={label} className="border border-[#d8d2c3] bg-[#e9e4d7] p-5"><StatIcon size={19} className="text-[#d86445]" /><p className="mt-7 font-sans text-xs uppercase tracking-widest text-[#657066]">{label}</p><p className="mt-1 text-2xl">{value}</p></div>)}</div><div className="mt-12">{children}</div></section>;
}

export function LearningPage() {
  const { enrollmentId } = useParams();
  const id = Number(enrollmentId);
  const enrollments = useQuery({ queryKey: ['enrollments'], queryFn: () => studentApi.enrollments().then((r) => r.data.data) });
  const enrollment = enrollments.data?.find((item) => item.id === id);
  const progress = useQuery({ queryKey: ['progress', id], queryFn: () => studentApi.progress(id).then((r) => r.data.data), enabled: Boolean(enrollment) });
  const complete = useMutation({ mutationFn: (lessonId: number) => studentApi.completeLesson(lessonId), onSuccess: () => progress.refetch() });
  if (enrollments.isLoading || progress.isLoading) return <LoadingState />;
  if (!enrollment?.course) return <ErrorState message="This learning path could not be found." />;
  const lessons = enrollment.course.modules?.flatMap((module) => module.lessons ?? []) ?? [];
  return <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><Link to="/dashboard" className="font-sans text-sm text-[#657066]">← Dashboard</Link><div className="mt-7 flex flex-col justify-between gap-6 border-b border-[#d8d2c3] pb-8 md:flex-row md:items-end"><div><p className="font-sans text-xs font-bold uppercase tracking-[.25em] text-[#d86445]">Learning path</p><h1 className="mt-2 text-5xl">{enrollment.course.title}</h1></div><div className="min-w-56"><div className="flex justify-between font-sans text-xs"><span>Course progress</span><strong>{progress.data?.percentage ?? 0}%</strong></div><div className="mt-2 h-2 bg-[#d8d2c3]"><div className="h-full bg-[#d86445]" style={{ width: `${progress.data?.percentage ?? 0}%` }} /></div></div></div><div className="mt-9 grid gap-3">{lessons.map((lesson) => { const done = progress.data?.progress.some((item) => item.lessonId === lesson.id && item.completed); return <div key={lesson.id} className="flex items-center gap-4 border border-[#d8d2c3] bg-[#fbfaf5] p-5"><div className={`grid h-10 w-10 place-items-center ${done ? 'bg-[#d86445] text-white' : 'bg-[#e9e4d7] text-[#657066]'}`}>{done ? <CheckCircle2 size={18} /> : <BookOpenCheck size={18} />}</div><div className="flex-1"><h3 className="text-xl">{lesson.title}</h3><p className="mt-1 font-sans text-xs text-[#657066]">{lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'Lesson'} · {done ? 'Completed' : 'Ready to learn'}</p></div>{!done && <button disabled={complete.isPending} onClick={() => complete.mutate(lesson.id)} className="rounded-full bg-[#193b31] px-4 py-2 font-sans text-xs font-bold text-white">Mark complete</button>}</div>; })}</div><p className="mt-6 font-sans text-xs text-[#657066]">Complete every lesson to unlock your certificate.</p></section>;
}

export function CertificatesPage() { const query = useQuery({ queryKey: ['certificates'], queryFn: () => studentApi.certificates().then((r) => r.data.data) }); if (query.isLoading) return <LoadingState />; return <section className="mx-auto max-w-5xl px-5 py-14 lg:px-8"><p className="font-sans text-xs font-bold uppercase tracking-[.25em] text-[#d86445]">Proof of progress</p><h1 className="mt-3 text-5xl">Certificates</h1><div className="mt-9 space-y-3">{query.data?.length ? query.data.map((certificate) => <div key={certificate.id} className="flex items-center gap-4 border border-[#d8d2c3] bg-[#fbfaf5] p-5"><Award className="text-[#d86445]" /><div className="flex-1"><h2 className="text-xl">{certificate.course?.title}</h2><p className="font-sans text-xs text-[#657066]">Issued {formatDate(certificate.issuedAt)} · {certificate.certificateNumber}</p></div><span className="font-sans text-xs font-bold uppercase tracking-widest text-[#d86445]">Earned</span></div>) : <EmptyState title="No certificates yet" detail="Finish every lesson in a course to earn one." />}</div></section>; }

export function NotificationsPage() { const query = useQuery({ queryKey: ['notifications'], queryFn: () => studentApi.notifications().then((r) => r.data.data) }); const client = useQueryClient(); const mark = useMutation({ mutationFn: (id: number) => studentApi.markNotificationRead(id), onSuccess: () => client.invalidateQueries({ queryKey: ['notifications'] }) }); if (query.isLoading) return <LoadingState />; return <section className="mx-auto max-w-3xl px-5 py-14 lg:px-8"><p className="font-sans text-xs font-bold uppercase tracking-[.25em] text-[#d86445]">Your feed</p><h1 className="mt-3 text-5xl">Notifications</h1><div className="mt-9 space-y-3">{query.data?.length ? query.data.map((item) => <div key={item.id} className={`border p-5 ${item.readAt ? 'border-[#d8d2c3] bg-transparent' : 'border-[#d86445] bg-[#fffaf1]'}`}><div className="flex justify-between gap-4"><h2 className="text-xl">{item.title}</h2>{!item.readAt && <button onClick={() => mark.mutate(item.id)} className="font-sans text-xs font-bold text-[#d86445]">Mark read</button>}</div><p className="mt-2 font-sans text-sm leading-6 text-[#657066]">{item.message}</p></div>) : <EmptyState title="All caught up" detail="New course and progress updates will appear here." />}</div></section>; }
