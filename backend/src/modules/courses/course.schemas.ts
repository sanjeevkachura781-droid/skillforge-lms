import { z } from 'zod';
import { CourseLevel } from '../../database/models/index.js';

const courseBody = z.object({
  categoryId: z.coerce.number().int().positive(),
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200),
  shortDescription: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20).max(50000),
  thumbnailUrl: z.string().url().max(500).nullable().optional(),
  level: z.nativeEnum(CourseLevel).optional(),
});

export const courseCreateSchema = z.object({ body: courseBody, params: z.object({}), query: z.object({}) });
export const courseUpdateSchema = z.object({ body: courseBody.partial(), params: z.object({ id: z.string() }), query: z.object({}) });
export const courseIdSchema = z.object({ body: z.object({}), params: z.object({ id: z.string() }), query: z.object({}) });
export const courseSlugSchema = z.object({ body: z.object({}), params: z.object({ slug: z.string().min(1) }), query: z.object({}) });
export const courseListSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(12), search: z.string().trim().max(100).optional(), categoryId: z.coerce.number().int().positive().optional(), level: z.nativeEnum(CourseLevel).optional() }),
});
