import type { Response } from 'express';
import type { ApiResponse, ApiError } from '@starter/shared';

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponse<T>['meta']
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: Record<string, string[]>
): void => {
  const response: ApiError = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  res.status(statusCode).json(response);
};

export const unauthorizedResponse = (res: Response, message = 'Unauthorized'): void => {
  errorResponse(res, message, 401);
};

export const forbiddenResponse = (res: Response, message = 'Forbidden'): void => {
  errorResponse(res, message, 403);
};

export const notFoundResponse = (res: Response, message = 'Not found'): void => {
  errorResponse(res, message, 404);
};
