import { z } from 'zod';

export const courseEnrollmentSchema = z.object({ body: z.object({}), params: z.object({ courseId: z.string() }), query: z.object({}) });
export const enrollmentIdSchema = z.object({ body: z.object({}), params: z.object({ id: z.string() }), query: z.object({}) });
