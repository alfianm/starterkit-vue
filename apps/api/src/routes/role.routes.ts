import { Router } from 'express';
import { z } from 'zod';
import { roleService } from '../services/role.service';
import { requireAuth, requirePermission } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';
import { Permissions, ALL_PERMISSIONS } from '@starter/shared';

const router = Router();

// Validation schemas
const roleParamsSchema = z.object({
  id: z.string().uuid('Invalid role ID'),
});

const createRoleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  permissions: z.array(z.string()).default([]),
});

const updateRoleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  permissions: z.array(z.string()).optional(),
});

// GET /roles
router.get(
  '/',
  requireAuth,
  requirePermission(Permissions.ROLES_READ),
  async (req, res) => {
    try {
      const roles = await roleService.findAll();
      successResponse(res, roles, 'Roles retrieved successfully');
    } catch (error) {
      errorResponse(res, 'Failed to retrieve roles', 500);
    }
  }
);

// GET /roles/:id
router.get(
  '/:id',
  requireAuth,
  requirePermission(Permissions.ROLES_READ),
  validateParams(roleParamsSchema),
  async (req, res) => {
    try {
      const role = await roleService.findById(req.params.id);
      
      if (!role) {
        notFoundResponse(res, 'Role not found');
        return;
      }

      successResponse(res, role, 'Role retrieved successfully');
    } catch (error) {
      errorResponse(res, 'Failed to retrieve role', 500);
    }
  }
);

// POST /roles
router.post(
  '/',
  requireAuth,
  requirePermission(Permissions.ROLES_CREATE),
  validateBody(createRoleSchema),
  async (req, res) => {
    try {
      const role = await roleService.create(req.body);
      successResponse(res, role, 'Role created successfully', 201);
    } catch (error) {
      errorResponse(res, 'Failed to create role', 500);
    }
  }
);

// PUT /roles/:id
router.put(
  '/:id',
  requireAuth,
  requirePermission(Permissions.ROLES_UPDATE),
  validateParams(roleParamsSchema),
  validateBody(updateRoleSchema),
  async (req, res) => {
    try {
      const role = await roleService.update(req.params.id, req.body);
      
      if (!role) {
        notFoundResponse(res, 'Role not found');
        return;
      }

      successResponse(res, role, 'Role updated successfully');
    } catch (error) {
      errorResponse(res, 'Failed to update role', 500);
    }
  }
);

// DELETE /roles/:id
router.delete(
  '/:id',
  requireAuth,
  requirePermission(Permissions.ROLES_DELETE),
  validateParams(roleParamsSchema),
  async (req, res) => {
    try {
      const success = await roleService.delete(req.params.id);
      
      if (!success) {
        notFoundResponse(res, 'Role not found');
        return;
      }

      successResponse(res, null, 'Role deleted successfully');
    } catch (error) {
      errorResponse(res, 'Failed to delete role', 500);
    }
  }
);

// GET /permissions (mounted at root router as /permissions)
export const permissionsRouter = Router();

permissionsRouter.get(
  '/',
  requireAuth,
  async (req, res) => {
    try {
      successResponse(res, ALL_PERMISSIONS, 'Permissions retrieved successfully');
    } catch (error) {
      errorResponse(res, 'Failed to retrieve permissions', 500);
    }
  }
);

export default router;
