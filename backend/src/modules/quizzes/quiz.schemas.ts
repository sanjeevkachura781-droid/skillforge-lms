import { z } from 'zod';

const quizBody = z.object({ title: z.string().trim().min(2).max(180), description: z.string().trim().max(5000).nullable().optional(), passingPercentage: z.coerce.number().min(0).max(100).optional() });
const optionBody = z.object({ optionText: z.string().trim().min(1).max(500), position: z.coerce.number().int().positive(), isCorrect: z.boolean().default(false) });
const questionBody = z.object({ questionText: z.string().trim().min(2).max(10000), position: z.coerce.number().int().positive(), points: z.coerce.number().int().positive().optional(), options: z.array(optionBody).min(2).refine((options) => options.filter((option) => option.isCorrect).length === 1, 'Exactly one correct option is required') });

export const quizCreateSchema = z.object({ body: quizBody, params: z.object({ courseId: z.string() }), query: z.object({}) });
export const quizIdSchema = z.object({ body: z.object({}), params: z.object({ quizId: z.string() }), query: z.object({}) });
export const questionCreateSchema = z.object({ body: questionBody, params: z.object({ quizId: z.string() }), query: z.object({}) });
export const quizAttemptSchema = z.object({ body: z.object({ answers: z.array(z.object({ questionId: z.coerce.number().int().positive(), optionId: z.coerce.number().int().positive() })) }), params: z.object({ quizId: z.string() }), query: z.object({}) });
export const attemptIdSchema = z.object({ body: z.object({}), params: z.object({ id: z.string() }), query: z.object({}) });
