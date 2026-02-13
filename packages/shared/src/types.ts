// ========================
// Permission Enums
// ========================
export const Permissions = {
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

export const ALL_PERMISSIONS: Permission[] = [
  Permissions.USERS_READ,
  Permissions.USERS_CREATE,
  Permissions.USERS_UPDATE,
  Permissions.USERS_DELETE,
  Permissions.ROLES_READ,
  Permissions.ROLES_CREATE,
  Permissions.ROLES_UPDATE,
  Permissions.ROLES_DELETE,
];

// ========================
// User Types
// ========================
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  roleId: string | null;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

// ========================
// Role Types
// ========================
export interface Role {
  id: string;
  name: string;
  slug: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// ========================
// Auth Types
// ========================
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

// ========================
// API Response Types
// ========================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ========================
// Stats Types
// ========================
export interface Stats {
  usersCount: number;
  rolesCount: number;
  activeUsersCount: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

// ========================
// Pagination & Filter Types
// ========================
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UserFilterParams extends PaginationParams {
  search?: string;
  roleId?: string;
  status?: UserStatus;
}

// ========================
// Form DTOs
// ========================
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  status: UserStatus;
  roleId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  status?: UserStatus;
  roleId?: string;
}

export interface CreateRoleRequest {
  name: string;
  slug: string;
  permissions: Permission[];
}

export interface UpdateRoleRequest {
  name?: string;
  permissions?: Permission[];
}

export interface AssignRoleRequest {
  roleId: string;
}
