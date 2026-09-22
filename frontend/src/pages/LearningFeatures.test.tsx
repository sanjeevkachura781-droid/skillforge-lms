import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QuizPage } from './LearningFeatures';
import { studentApi } from '../api/endpoints';
vi.mock('../api/endpoints', () => ({ studentApi: { quiz: vi.fn(), submitQuiz: vi.fn() }, catalogApi: {} }));
it('submits selected answers and displays the backend score', async () => {
  vi.mocked(studentApi.quiz).mockResolvedValue({ data: { data: { id: 7, title: 'Knowledge check', passingPercentage: 70, questions: [{ id: 9, position: 1, questionText: 'Which answer?', options: [{ id: 11, position: 1, optionText: 'First' }, { id: 12, position: 2, optionText: 'Second' }] }] } } } as never);
  vi.mocked(studentApi.submitQuiz).mockResolvedValue({ data: { data: { passed: true, scorePercentage: 100, earnedPoints: 1, totalPoints: 1, attempt: { id: 4 } } } } as never);
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={['/quizzes/7']}><Routes><Route path="/quizzes/:quizId" element={<QuizPage />} /></Routes></MemoryRouter></QueryClientProvider>);
  await userEvent.click(await screen.findByLabelText('Second'));
  await userEvent.click(screen.getByRole('button', { name: 'Submit answers' }));
  expect(await screen.findByText(/Passed: 100%/)).toBeInTheDocument();
  expect(studentApi.submitQuiz).toHaveBeenCalledWith(7, [{ questionId: 9, optionId: 12 }]);
});
