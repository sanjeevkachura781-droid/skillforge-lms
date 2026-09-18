import { z } from 'zod';

const categoryBody = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description: z.string().trim().max(5000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const categoryCreateSchema = z.object({ body: categoryBody, params: z.object({}), query: z.object({}) });
export const categoryUpdateSchema = z.object({ body: categoryBody.partial(), params: z.object({ id: z.string() }), query: z.object({}) });
export const categoryIdSchema = z.object({ body: z.object({}), params: z.object({ id: z.string() }), query: z.object({}) });
