# Fullstack Starter Kit

A complete fullstack starter kit with Vue 3 + Express + Prisma + PostgreSQL featuring JWT authentication and RBAC (Role-Based Access Control).

## Features

- **Frontend**: Vue 3 + TypeScript + Vite + Tailwind CSS + shadcn-vue
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT Access Token + Refresh Token + Role/Permission enforcement
- **RBAC**: Full role-based access control with permissions

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone <your-repo>
cd template_starter_vue
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the database:
```bash
pnpm db:up
```

4. Run migrations and seed:
```bash
pnpm db:migrate
pnpm db:seed
```

5. Start development servers:
```bash
pnpm dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Default Login Credentials

- **Email**: admin@example.com
- **Password**: Admin123!

## Project Structure

```
/
├── apps/
│   ├── web/              # Vue 3 Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── stores/
│   │   │   ├── router/
│   │   │   └── ...
│   │   └── package.json
│   └── api/              # Express Backend
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── ...
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── package.json
├── packages/
│   └── shared/           # Shared types and utilities
│       └── src/
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## Available Scripts

### Root
- `pnpm dev` - Start both frontend and backend in development mode
- `pnpm build` - Build all packages
- `pnpm db:up` - Start PostgreSQL via Docker
- `pnpm db:down` - Stop PostgreSQL
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm db:seed` - Seed the database
- `pnpm db:studio` - Open Prisma Studio

### Backend (apps/api)
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run migrations
- `pnpm db:seed` - Seed database

### Frontend (apps/web)
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

## API Endpoints

### Auth
- `POST /auth/login` - Login with email and password
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Users (requires `users.read` permission)
- `GET /users` - List users (with pagination, search, filter)
- `POST /users` - Create user (requires `users.create`)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user (requires `users.update`)
- `DELETE /users/:id` - Delete user (requires `users.delete`)
- `PUT /users/:id/role` - Assign role (requires `users.update`)

### Roles (requires `roles.read` permission)
- `GET /roles` - List roles
- `POST /roles` - Create role (requires `roles.create`)
- `GET /roles/:id` - Get role by ID
- `PUT /roles/:id` - Update role (requires `roles.update`)
- `DELETE /roles/:id` - Delete role (requires `roles.delete`)

### Permissions
- `GET /permissions` - List all available permissions

### Stats
- `GET /stats` - Get dashboard statistics

## Default Roles & Permissions

| Role | Slug | Permissions |
|------|------|-------------|
| Super Admin | `super-admin` | All permissions |
| Admin | `admin` | users.*, roles.read |
| Viewer | `viewer` | users.read, roles.read |

### Available Permissions

- `users.read` - View users
- `users.create` - Create users
- `users.update` - Update users
- `users.delete` - Delete users
- `roles.read` - View roles
- `roles.create` - Create roles
- `roles.update` - Update roles
- `roles.delete` - Delete roles

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/starterkit?schema=public"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
CORS_ORIGIN="http://localhost:5173"
PORT=3000
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3000
```

## Example API Requests

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin123!"}'
```

### Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "status": "ACTIVE",
    "roleId": "<role_id>"
  }'
```

### List Users
```bash
curl "http://localhost:3000/users?page=1&limit=10&search=john" \
  -H "Authorization: Bearer <access_token>"
```

## Frontend Features

- **Authentication**: Login page with JWT token storage
- **Route Guards**: Automatic redirect to login if not authenticated
- **Auto Refresh Token**: Silent token refresh on 401 responses
- **RBAC UI**: Buttons and actions hidden based on permissions
- **Dashboard**: KPI cards with user/role counts and recent activity
- **User Management**: 
  - Data table with pagination and search
  - Create/Edit/Delete users
  - Assign roles to users
  - Filter by role and status
- **Role Management**:
  - Create/Edit/Delete roles
  - Manage permissions with checkbox groups
  - Grouped by category (users, roles)

## Architecture

### Authentication Flow
1. User logs in with email/password
2. Server returns access token (15 min) and refresh token (7 days)
3. Access token stored in memory, refresh token in localStorage
4. Axios interceptor attaches access token to requests
5. On 401, automatically refresh using refresh token
6. If refresh fails, redirect to login

### Permission System
- Permissions are stored in JWT payload
- Server middleware enforces permissions on API routes
- Frontend uses `can(permission)` helper to conditionally show UI
- Permission check happens on both client and server

## License

MIT
