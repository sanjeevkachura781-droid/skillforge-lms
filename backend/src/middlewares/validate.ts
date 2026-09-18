import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export function validate(schema: z.ZodTypeAny) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse({ body: request.body ?? {}, params: request.params, query: request.query });
    if (!result.success) {
      next(result.error);
      return;
    }
    request.body = result.data.body;
    for (const key of Object.keys(request.params)) delete request.params[key];
    Object.assign(request.params, result.data.params);
    for (const key of Object.keys(request.query)) delete request.query[key];
    Object.assign(request.query, result.data.query);
    next();
  };
}
