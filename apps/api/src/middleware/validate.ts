import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(error.message);
      });
      errorResponse(res, 'Validation failed', 400, errors);
      return;
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(error.message);
      });
      errorResponse(res, 'Validation failed', 400, errors);
      return;
    }

    req.query = result.data;
    next();
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(error.message);
      });
      errorResponse(res, 'Validation failed', 400, errors);
      return;
    }

    req.params = result.data;
    next();
  };
};
