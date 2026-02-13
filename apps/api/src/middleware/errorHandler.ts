import type { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((error) => {
      const path = error.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(error.message);
    });
    errorResponse(res, 'Validation failed', 400, errors);
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma unique constraint errors
    if ((err as any).code === 'P2002') {
      errorResponse(res, 'Duplicate entry found', 409);
      return;
    }
    // Handle Prisma foreign key constraint errors
    if ((err as any).code === 'P2003') {
      errorResponse(res, 'Referenced record not found', 400);
      return;
    }
    // Handle Prisma record not found
    if ((err as any).code === 'P2025') {
      errorResponse(res, 'Record not found', 404);
      return;
    }
  }

  errorResponse(res, 'Internal server error', 500);
};
