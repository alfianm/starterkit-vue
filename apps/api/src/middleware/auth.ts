import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../utils/jwt';
import { unauthorizedResponse, forbiddenResponse } from '../utils/response';
import type { Permission } from '@starter/shared';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    unauthorizedResponse(res);
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    unauthorizedResponse(res, 'Invalid or expired token');
  }
};

export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorizedResponse(res);
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      forbiddenResponse(res, `Missing permission: ${permission}`);
      return;
    }

    next();
  };
};

export const requireAnyPermission = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorizedResponse(res);
      return;
    }

    const hasAnyPermission = permissions.some(p => req.user!.permissions.includes(p));
    
    if (!hasAnyPermission) {
      forbiddenResponse(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};
