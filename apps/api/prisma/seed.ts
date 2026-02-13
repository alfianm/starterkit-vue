import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'roles.read',
  'roles.create',
  'roles.update',
  'roles.delete',
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create roles
  console.log('Creating roles...');
  
  const superAdminRole = await prisma.role.upsert({
    where: { slug: 'super-admin' },
    update: {},
    create: {
      name: 'Super Admin',
      slug: 'super-admin',
      permissions: ALL_PERMISSIONS,
    },
  });
  console.log(`✅ Role created: ${superAdminRole.name} (${superAdminRole.permissions.length} permissions)`);

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'Admin',
      slug: 'admin',
      permissions: ['users.read', 'users.create', 'users.update', 'users.delete', 'roles.read'],
    },
  });
  console.log(`✅ Role created: ${adminRole.name} (${adminRole.permissions.length} permissions)`);

  const viewerRole = await prisma.role.upsert({
    where: { slug: 'viewer' },
    update: {},
    create: {
      name: 'Viewer',
      slug: 'viewer',
      permissions: ['users.read', 'roles.read'],
    },
  });
  console.log(`✅ Role created: ${viewerRole.name} (${viewerRole.permissions.length} permissions)`);

  // Create default superadmin user
  console.log('\nCreating default users...');
  
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'admin@example.com',
      passwordHash,
      status: 'ACTIVE',
      roleId: superAdminRole.id,
    },
  });
  console.log(`✅ User created: ${superAdmin.email} (Role: ${superAdminRole.name})`);

  // Create sample users
  const sampleUsers = [
    { name: 'John Doe', email: 'john@example.com', roleId: adminRole.id },
    { name: 'Jane Smith', email: 'jane@example.com', roleId: viewerRole.id },
    { name: 'Bob Wilson', email: 'bob@example.com', roleId: viewerRole.id, status: 'INACTIVE' },
  ];

  for (const userData of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        passwordHash: await bcrypt.hash('Password123!', 10),
        status: (userData.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      },
    });
    const role = await prisma.role.findUnique({ where: { id: user.roleId! } });
    console.log(`✅ User created: ${user.email} (Role: ${role?.name})`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
