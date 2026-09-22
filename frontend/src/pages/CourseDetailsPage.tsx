import { ChevronDown, CirclePlay, LockKeyhole } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { catalogApi, studentApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import { ErrorState, LoadingState } from '../components/State';
import { CourseReviews } from './LearningFeatures';

export function CourseDetailsPage() {
  const { slug = '' } = useParams();
  const { user, loading } = useAuth();
  const client = useQueryClient();
  const course = useQuery({ queryKey: ['course', slug], queryFn: () => catalogApi.course(slug).then(r => r.data.data) });
  const enrollments = useQuery({ queryKey: ['enrollments'], queryFn: () => studentApi.enrollments().then(r => r.data.data), enabled: user?.role === 'student' });
  const enroll = useMutation({
    mutationFn: (courseId: number) => studentApi.enroll(courseId),
    onSuccess: async () => { await Promise.all(['enrollments', 'notifications'].map(key => client.invalidateQueries({ queryKey: [key] }))); },
  });
  if (course.isLoading) return <LoadingState />;
  if (course.isError || !course.data) return <ErrorState message="This course is not available." />;
  const item = course.data;
  const enrollment = enrollments.data?.find(entry => entry.courseId === item.id) ?? (enroll.data?.data.data.courseId === item.id ? enroll.data.data.data : undefined);
  return <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
    <Link to="/courses" className="font-sans text-sm text-[#657066]">Back to catalog</Link>
    <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_340px]">
      <div>
        <p className="font-sans text-xs font-bold uppercase tracking-[.25em] text-[#d86445]">{item.category?.name ?? 'Course'}</p>
        <h1 className="mt-3 max-w-3xl break-words text-4xl leading-none sm:text-6xl">{item.title}</h1>
        {item.instructor && <p className="mt-4 font-sans text-sm">By {item.instructor.firstName} {item.instructor.lastName}</p>}
        <p className="mt-6 max-w-2xl whitespace-pre-wrap font-sans text-lg leading-8 text-[#657066]">{item.description}</p>
        <div className="mt-8 border-t border-[#d8d2c3] pt-7">
          <h2 className="text-3xl">Course outline</h2>
          <div className="mt-5 space-y-3">{[...(item.modules ?? [])].sort((a, b) => a.position - b.position).map(module => <details key={module.id} className="group border border-[#d8d2c3] bg-[#fbfaf5]" open>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-sans font-bold">{module.title}<ChevronDown className="shrink-0 transition group-open:rotate-180" size={18} /></summary>
            {module.description && <p className="px-5 pb-3 font-sans text-sm text-[#657066]">{module.description}</p>}
            <div className="border-t border-[#e6e1d6] px-5 pb-4">{[...(module.lessons ?? [])].sort((a, b) => a.position - b.position).map(lesson => <div key={lesson.id} className="flex items-center gap-3 border-b border-[#eee9df] py-4 font-sans text-sm last:border-0">
              <CirclePlay size={16} className="shrink-0 text-[#d86445]" />
              <div className="min-w-0 flex-1">{lesson.title}{lesson.isPreview && <details className="mt-2"><summary>Read preview</summary><p className="whitespace-pre-wrap">{lesson.content}</p>{lesson.videoUrl && <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="underline">Watch preview</a>}</details>}</div>
              {lesson.isPreview ? <span className="text-xs text-[#d86445]">Preview</span> : <LockKeyhole size={14} aria-label="Available after enrollment" className="shrink-0 text-[#8c958c]" />}
            </div>)}</div>
          </details>)}</div>
        </div>
      </div>
      <aside className="h-fit border border-[#d8d2c3] bg-[#193b31] p-7 text-white">
        {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" className="mb-5 aspect-video w-full object-cover" />}
        <p className="font-sans text-xs uppercase tracking-[.2em] text-[#b8c7bc]">{item.level} level</p>
        <p className="mt-3 font-sans text-sm leading-6 text-[#dbe3db]">{item.shortDescription}</p>
        {user?.role === 'student' ? enrollment ? <>
          <p className="mt-5" role="status">You are enrolled in this course.</p>
          <Link to={`/learn/${enrollment.id}`} className="mt-4 block rounded-full bg-[#d86445] px-5 py-3 text-center font-sans text-sm font-bold">Continue learning</Link>
          <Link to="/dashboard" className="mt-4 block underline">Go to my learning</Link>
        </> : <>
          <button disabled={enroll.isPending || enrollments.isLoading || enrollments.isError} onClick={() => enroll.mutate(item.id)} className="mt-7 w-full rounded-full bg-[#d86445] px-5 py-3 font-sans text-sm font-bold text-white disabled:opacity-60">{enroll.isPending ? 'Enrolling...' : enrollments.isLoading ? 'Checking enrollment...' : 'Enroll in course'}</button>
          {enrollments.isError && <p role="alert" className="mt-3">Your enrollment could not be checked. <button className="underline" onClick={() => void enrollments.refetch()}>Try again</button></p>}
        </> : !user && !loading ? <Link to="/login" state={{ from: `/courses/${slug}` }} className="mt-7 block rounded-full bg-[#edbd61] px-5 py-3 text-center font-sans text-sm font-bold text-[#18221d]">Sign in to enroll</Link> : null}
        {enroll.isError && <p role="alert" className="mt-3 font-sans text-xs text-[#ffc9ba]">{apiErrorMessage(enroll.error)}</p>}
      </aside>
    </div>
    <CourseReviews key={item.id} courseId={item.id} canReview={Boolean(enrollment)} />
  </section>;
}
