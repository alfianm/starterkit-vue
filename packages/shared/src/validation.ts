import type { Permission } from './types';

// ========================
// Validation Helpers
// ========================
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPermission = (permission: string): permission is Permission => {
  const validPermissions: Permission[] = [
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'roles.read',
    'roles.create',
    'roles.update',
    'roles.delete',
  ];
  return validPermissions.includes(permission as Permission);
};

export const validatePermissions = (permissions: string[]): Permission[] => {
  return permissions.filter(isValidPermission);
};

// ========================
// Default Values
// ========================
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const parsePagination = (page?: number, limit?: number) => {
  return {
    page: Math.max(1, page ?? DEFAULT_PAGE),
    limit: Math.min(MAX_LIMIT, Math.max(1, limit ?? DEFAULT_LIMIT)),
  };
};
