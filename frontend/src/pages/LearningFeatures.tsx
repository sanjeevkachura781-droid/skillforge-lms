import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { studentApi, catalogApi } from '../api/endpoints';
import { ActionForm, Field, Page, text } from '../components/Forms';
import { ErrorState, LoadingState } from '../components/State';
import type { Quiz, QuizResult } from '../types/api';
export function QuizPage() {
  const { quizId } = useParams(); const id = Number(quizId);
  const validId = Number.isSafeInteger(id) && id > 0;
  const query = useQuery({ queryKey: ['quiz', id], queryFn: () => studentApi.quiz(id).then(r => r.data.data), enabled: validId });
  if (!validId) return <ErrorState message="This quiz could not be found." />;
  if (query.isLoading) return <LoadingState />; if (query.isError || !query.data) return <ErrorState />;
  return <QuizAttempt key={query.data.id} quiz={query.data} />;
}
function QuizAttempt({ quiz }: { quiz: Quiz }) {
  const [result, setResult] = useState<QuizResult>();
  const client = useQueryClient();
  return <Page title={quiz.title}><Link to="/dashboard">Back to dashboard</Link><p>Passing score: {quiz.passingPercentage}%</p><ActionForm label="Submit answers" submit={async data => { const response = await studentApi.submitQuiz(quiz.id, quiz.questions.map(q => ({ questionId: q.id, optionId: Number(data.get(String(q.id))) }))); setResult(response.data.data); await client.invalidateQueries({ queryKey: ['notifications'] }); }}>
  {[...quiz.questions].sort((a,b) => a.position-b.position).map(q => <fieldset key={q.id} className="space-y-2 border p-4"><legend>{q.questionText}</legend>{[...q.options].sort((a,b) => a.position-b.position).map(o => <label className="block" key={o.id}><input required type="radio" name={String(q.id)} value={o.id} /> {o.optionText}</label>)}</fieldset>)}
  </ActionForm>{result && <p role="status" className="border p-5 text-xl">{result.passed ? 'Passed' : 'Try again'}: {result.scorePercentage}% ({result.earnedPoints}/{result.totalPoints} points). Attempt #{result.attempt.id} saved.</p>}</Page>;
}
export function CourseReviews({ courseId, canReview }: { courseId: number; canReview: boolean }) {
  const query = useQuery({ queryKey: ['reviews', courseId], queryFn: () => catalogApi.reviews(courseId).then(r => r.data.data) });
  return <section className="mt-8 space-y-4"><h2 className="text-3xl">Student reviews</h2>{query.isError && <ErrorState message="Reviews could not load." />}{query.data?.length === 0 && <p>No reviews yet.</p>}{query.data?.map(review => <article key={review.id} className="border p-4"><p>{review.student?.firstName} {review.student?.lastName}: {review.rating}/5</p><p>{review.comment}</p></article>)}{canReview && <ActionForm label="Post review" onDone={() => { void query.refetch(); }} submit={data => studentApi.review(courseId, { rating: Number(data.get('rating')), comment: text(data,'comment') })}><p>Enrolled students can leave one review per course.</p><label>Rating <select name="rating">{[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}</select></label><Field name="comment" label="Your review" type="textarea" required={false} /></ActionForm>}</section>;
}
