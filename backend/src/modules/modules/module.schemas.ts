import { z } from 'zod';

const moduleBody = z.object({ title: z.string().trim().min(2).max(180), description: z.string().trim().max(5000).nullable().optional(), position: z.coerce.number().int().positive() });
export const moduleCreateSchema = z.object({ body: moduleBody, params: z.object({ courseId: z.string() }), query: z.object({}) });
export const moduleUpdateSchema = z.object({ body: moduleBody.partial(), params: z.object({ id: z.string() }), query: z.object({}) });
export const moduleIdSchema = z.object({ body: z.object({}), params: z.object({ id: z.string() }), query: z.object({}) });
export const courseModulesSchema = z.object({ body: z.object({}), params: z.object({ courseId: z.string() }), query: z.object({}) });
