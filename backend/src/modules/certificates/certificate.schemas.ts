import { z } from 'zod';

export const certificateNumberSchema = z.object({ body: z.object({}), params: z.object({ certificateNumber: z.string().min(1).max(80) }), query: z.object({}) });
