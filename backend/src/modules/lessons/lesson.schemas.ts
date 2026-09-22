import { z } from 'zod';

const lessonBody = z.object({
  title: z.string().trim().min(2).max(180),
  content: z.string().trim().min(1).max(100000),
  videoUrl: z.string().url().max(500).refine(value => /^https?:\/\//i.test(value), 'Use an HTTP or HTTPS video URL').nullable().optional(),
  durationMinutes: z.coerce.number().int().nonnegative().nullable().optional(),
  position: z.coerce.number().int().positive(),
  isPreview: z.boolean().optional(),
});
export const lessonCreateSchema = z.object({ body: lessonBody, params: z.object({ moduleId: z.string() }), query: z.object({}) });
export const lessonUpdateSchema = z.object({ body: lessonBody.partial(), params: z.object({ id: z.string() }), query: z.object({}) });
export const lessonIdSchema = z.object({ body: z.object({}), params: z.object({ id: z.string() }), query: z.object({}) });
export const moduleLessonsSchema = z.object({ body: z.object({}), params: z.object({ moduleId: z.string() }), query: z.object({}) });
