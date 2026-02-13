import { Router } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service';
import { requireAuth, requirePermission } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validate';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';
import { Permissions, type UserStatus } from '@starter/shared';

const router = Router();

// Validation schemas
const userParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  roleId: z.string().uuid().optional().nullable(),
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  roleId: z.string().uuid().optional().nullable(),
});

const assignRoleSchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
});

const userQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  roleId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// GET /users
router.get(
  '/',
  requireAuth,
  requirePermission(Permissions.USERS_READ),
  validateQuery(userQuerySchema),
  async (req, res) => {
    try {
      const result = await userService.findAll(req.query as any);
      successResponse(res, result.data, 'Users retrieved successfully', 200, result.meta);
    } catch (error) {
      errorResponse(res, 'Failed to retrieve users', 500);
    }
  }
);

// GET /users/:id
router.get(
  '/:id',
  requireAuth,
  requirePermission(Permissions.USERS_READ),
  validateParams(userParamsSchema),
  async (req, res) => {
    try {
      const user = await userService.findById(req.params.id);
      
      if (!user) {
        notFoundResponse(res, 'User not found');
        return;
      }

      successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      errorResponse(res, 'Failed to retrieve user', 500);
    }
  }
);

// POST /users
router.post(
  '/',
  requireAuth,
  requirePermission(Permissions.USERS_CREATE),
  validateBody(createUserSchema),
  async (req, res) => {
    try {
      const user = await userService.create(req.body);
      successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      errorResponse(res, 'Failed to create user', 500);
    }
  }
);

// PUT /users/:id
router.put(
  '/:id',
  requireAuth,
  requirePermission(Permissions.USERS_UPDATE),
  validateParams(userParamsSchema),
  validateBody(updateUserSchema),
  async (req, res) => {
    try {
      const user = await userService.update(req.params.id, req.body);
      
      if (!user) {
        notFoundResponse(res, 'User not found');
        return;
      }

      successResponse(res, user, 'User updated successfully');
    } catch (error) {
      errorResponse(res, 'Failed to update user', 500);
    }
  }
);

// DELETE /users/:id
router.delete(
  '/:id',
  requireAuth,
  requirePermission(Permissions.USERS_DELETE),
  validateParams(userParamsSchema),
  async (req, res) => {
    try {
      const success = await userService.delete(req.params.id);
      
      if (!success) {
        notFoundResponse(res, 'User not found');
        return;
      }

      successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      errorResponse(res, 'Failed to delete user', 500);
    }
  }
);

// PUT /users/:id/role
router.put(
  '/:id/role',
  requireAuth,
  requirePermission(Permissions.USERS_UPDATE),
  validateParams(userParamsSchema),
  validateBody(assignRoleSchema),
  async (req, res) => {
    try {
      const user = await userService.assignRole(req.params.id, req.body.roleId);
      
      if (!user) {
        notFoundResponse(res, 'User not found');
        return;
      }

      successResponse(res, user, 'Role assigned successfully');
    } catch (error) {
      errorResponse(res, 'Failed to assign role', 500);
    }
  }
);

export default router;
