import { z } from 'zod';

export const reviewCreateSchema = z.object({ body: z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().max(5000).nullable().optional() }), params: z.object({ courseId: z.string() }), query: z.object({}) });
export const courseReviewListSchema = z.object({ body: z.object({}), params: z.object({ courseId: z.string() }), query: z.object({}) });
