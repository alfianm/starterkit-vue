Buatkan FULLSTACK STARTER KIT dalam SATU REPOSITORY (monorepo) yang berisi:
1) Frontend Admin: Vue 3 + TypeScript + Vite + shadcn-vue (Radix Vue) + Tailwind
2) Backend API: Node.js + TypeScript + Express + Prisma ORM
3) Database: PostgreSQL
4) Auth + RBAC: JWT Access Token + Refresh Token + Role/Permission enforcement
5) Fitur: Auth, Dashboard, User Management, Role Management (CRUD + assign role + permissions)

Target: setelah clone, user cukup jalankan:
- `pnpm i`
- `pnpm dev`
dan frontend + backend + database (opsional via Docker) langsung jalan.

========================
A. REPO STRUCTURE
========================
Gunakan workspace (pnpm workspaces) dengan struktur:
/
  apps/
    web/        (Vue admin)
    api/        (Express API)
  packages/
    shared/     (types shared: DTO, enums permission)
  docker-compose.yml (Postgres)
  pnpm-workspace.yaml
  package.json (root scripts)
  README.md

Semua harus TypeScript end-to-end, gunakan shared types dari packages/shared.

========================
B. FRONTEND (apps/web)
========================
- Vue 3 Composition API + TS + Vite
- Vue Router, Pinia, Axios
- Form: vee-validate + zod
- UI: shadcn-vue + Tailwind
- Toast: sonner/toast style shadcn (pilih yang tersedia)
- Icons: lucide-vue-next

Layout:
- AdminLayout: sidebar (collapsible), topbar, breadcrumb
Routes:
- /login (public)
- /dashboard (protected)
- /users (protected + permission users.read)
- /roles (protected + permission roles.read)

Auth flow:
- Login form -> call API POST /auth/login
- Simpan accessToken + refreshToken secara aman di storage (starter kit boleh localStorage)
- Axios interceptor:
  - attach Authorization: Bearer accessToken
  - jika 401 -> coba refresh token via POST /auth/refresh
  - kalau refresh gagal -> logout dan redirect /login
Route guard:
- jika tidak login -> redirect /login
- jika sudah login dan akses /login -> redirect /dashboard

Pages:
1) Login.vue
   - email + password
   - validation zod
2) Dashboard.vue
   - cards KPI (users count, roles count)
   - recent activity dummy dari API /stats
3) Users.vue
   - table + pagination + search + filter role/status
   - create/edit user (Dialog)
   - delete user (Confirm dialog)
   - assign role dropdown
4) Roles.vue
   - table roles
   - create/edit/delete role
   - manage permissions (checkbox list)

RBAC UI:
- Helper `can(permission: Permission)` dari auth store
- Tombol Create/Edit/Delete disembunyikan jika tidak punya permission yang sesuai

Komponen reusable:
- DataTable (table + pagination)
- ConfirmDialog
- UserFormDialog
- RoleFormDialog
- PermissionCheckboxGroup

========================
C. BACKEND API (apps/api)
========================
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- Validation: zod
- Auth:
  - Access token JWT (short, misal 15m)
  - Refresh token JWT (long, misal 7d) disimpan di DB (revocable)
- Password hashing: bcrypt
- Security:
  - Helmet, CORS untuk web dev origin
  - Rate limit basic untuk login (optional)

RBAC:
- Model Role memiliki permissions: string[] (atau tabel Permission terpisah)
- Middleware `requireAuth` + `requirePermission("users.read")`
- Semua endpoint CRUD wajib enforce permission

API Endpoints (WAJIB):
Auth:
- POST /auth/login
  req: { email, password }
  res: { accessToken, refreshToken, user }
- POST /auth/refresh
  req: { refreshToken }
  res: { accessToken, refreshToken }
- GET /auth/me
  header: Authorization Bearer
  res: { user }
- POST /auth/logout
  req: { refreshToken }
  res: success

Stats:
- GET /stats
  res: { usersCount, rolesCount, activeUsersCount, recentActivities: [...] }

Users:
- GET /users?search=&page=&limit=&roleId=&status=
- POST /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id
- PUT /users/:id/role  (assign role)
Semua response harus konsisten:
{ success: boolean, message: string, data: any, meta?: any }

Roles:
- GET /roles
- POST /roles
- GET /roles/:id
- PUT /roles/:id
- DELETE /roles/:id

Permissions:
- GET /permissions (list semua permission)

========================
D. DATABASE MODELS (Prisma)
========================
Buat schema prisma dengan minimal:
- User: id, name, email (unique), passwordHash, status (ACTIVE/INACTIVE), roleId, createdAt, updatedAt
- Role: id, name, slug (unique), permissions (String[]), createdAt, updatedAt
- RefreshToken: id, token (unique), userId, revokedAt nullable, expiresAt, createdAt

Seed data (WAJIB):
- Role: Super Admin (semua permissions)
- Role: Admin (users.* + roles.read)
- Role: Viewer (users.read + roles.read)
- User default superadmin:
  email: admin@example.com
  password: Admin123! (jelaskan di README)
- Permission list:
  users.read, users.create, users.update, users.delete
  roles.read, roles.create, roles.update, roles.delete

========================
E. DEV EXPERIENCE (WAJIB)
========================
Root scripts:
- pnpm dev  -> run api + web secara bersamaan
- pnpm db:up -> docker-compose up -d postgres
- pnpm db:migrate -> prisma migrate dev
- pnpm db:seed -> prisma db seed
- pnpm lint, pnpm format

Environment:
- apps/api/.env: DATABASE_URL, JWT secrets, CORS origin
- apps/web/.env: VITE_API_BASE_URL

README harus menjelaskan step-by-step:
1) start DB
2) migrate + seed
3) start dev
4) login credentials
5) contoh curl request

========================
F. OUTPUT YANG HARUS KAMU BERIKAN
========================
Berikan output lengkap dan siap copy-paste:
1) Tree folder repo
2) Semua file konfigurasi penting (workspace, tsconfig, vite, tailwind, prisma, docker-compose)
3) Implementasi route API + middleware auth/permission
4) Implementasi Pinia auth store + axios refresh interceptor
5) Pages + components utama (minimal working)
6) Konsistensi response format + error handling
7) Pastikan semuanya bisa jalan setelah pnpm i + pnpm dev

Jangan gunakan pseudocode. Tulis kode nyata yang runnable.

