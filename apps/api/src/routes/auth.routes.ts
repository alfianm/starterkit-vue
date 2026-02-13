import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { successResponse, errorResponse, unauthorizedResponse } from '../utils/response';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// POST /auth/login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const result = await authService.login(req.body);
    
    if (!result) {
      unauthorizedResponse(res, 'Invalid email or password');
      return;
    }

    successResponse(res, result, 'Login successful');
  } catch (error) {
    errorResponse(res, 'Login failed', 500);
  }
});

// POST /auth/refresh
router.post('/refresh', validateBody(refreshSchema), async (req, res) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    
    if (!result) {
      unauthorizedResponse(res, 'Invalid or expired refresh token');
      return;
    }

    successResponse(res, result, 'Token refreshed successfully');
  } catch (error) {
    errorResponse(res, 'Token refresh failed', 500);
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    
    if (!user) {
      unauthorizedResponse(res, 'User not found');
      return;
    }

    successResponse(res, { user }, 'User retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Failed to get user', 500);
  }
});

// POST /auth/logout
router.post('/logout', validateBody(logoutSchema), async (req, res) => {
  try {
    await authService.logout(req.body.refreshToken);
    successResponse(res, null, 'Logout successful');
  } catch (error) {
    errorResponse(res, 'Logout failed', 500);
  }
});

export default router;
