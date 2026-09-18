import { z } from 'zod';

export const lessonProgressSchema = z.object({ body: z.object({}), params: z.object({ lessonId: z.string() }), query: z.object({}) });
export const enrollmentProgressSchema = z.object({ body: z.object({}), params: z.object({ enrollmentId: z.string() }), query: z.object({}) });
