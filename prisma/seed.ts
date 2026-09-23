import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─────────────────────────────────────────────
  // 1. Create Roles
  // ─────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Full system access — manage spaces, bookings, users, and analytics',
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { name: 'MEMBER' },
    update: {},
    create: {
      name: 'MEMBER',
      description: 'Standard member — can browse spaces and manage own bookings',
    },
  });

  console.log(`✅ Roles created: ${adminRole.name}, ${memberRole.name}`);

  // ─────────────────────────────────────────────
  // 2. Create Permissions
  // ─────────────────────────────────────────────
  const permissions = [
    { action: 'spaces:create',        description: 'Create new co-working spaces' },
    { action: 'spaces:update',        description: 'Update existing co-working spaces' },
    { action: 'spaces:delete',        description: 'Delete / deactivate co-working spaces' },
    { action: 'spaces:read:admin',    description: 'Read spaces with full admin details' },
    { action: 'bookings:approve',     description: 'Approve pending bookings' },
    { action: 'bookings:reject',      description: 'Reject pending bookings' },
    { action: 'bookings:read:all',    description: 'View all bookings across all users' },
    { action: 'users:read:all',       description: 'View all registered users' },
    { action: 'users:update',         description: 'Update any user details' },
    { action: 'users:activate',       description: 'Activate / deactivate user accounts' },
    { action: 'roles:manage',         description: 'Create, update, and delete roles' },
    { action: 'permissions:manage',   description: 'Manage role permissions' },
    { action: 'maintenance:manage',   description: 'Create and manage maintenance windows' },
    { action: 'dashboard:read',       description: 'Access admin dashboard analytics' },
    { action: 'bookings:create',      description: 'Create a new booking' },
    { action: 'bookings:read:own',    description: 'View own bookings' },
    { action: 'bookings:cancel:own',  description: 'Cancel own bookings' },
  ];

  const createdPermissions: Record<string, string> = {};
  for (const perm of permissions) {
    const p = await prisma.permission.upsert({
      where: { action: perm.action },
      update: { description: perm.description },
      create: perm,
    });
    createdPermissions[perm.action] = p.id;
  }

  console.log(`✅ ${permissions.length} permissions created`);

  // ─────────────────────────────────────────────
  // 3. Assign Permissions to Roles
  // ─────────────────────────────────────────────

  // Admin gets ALL permissions
  const adminPermissionActions = permissions.map((p) => p.action);
  for (const action of adminPermissionActions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: createdPermissions[action],
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: createdPermissions[action],
      },
    });
  }

  // Member gets only member-level permissions
  const memberPermissionActions = [
    'bookings:create',
    'bookings:read:own',
    'bookings:cancel:own',
  ];
  for (const action of memberPermissionActions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: memberRole.id,
          permissionId: createdPermissions[action],
        },
      },
      update: {},
      create: {
        roleId: memberRole.id,
        permissionId: createdPermissions[action],
      },
    });
  }

  console.log(`✅ Role permissions assigned`);

  // ─────────────────────────────────────────────
  // 4. Create Default Users
  // ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const memberPassword = await bcrypt.hash('Member@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@coworking.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@coworking.com',
      password: adminPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: 'member@coworking.com' },
    update: {},
    create: {
      name: 'Default Member',
      email: 'member@coworking.com',
      password: memberPassword,
      roleId: memberRole.id,
      isActive: true,
    },
  });

  console.log(`✅ Users created:`);
  console.log(`   👑 Admin  → ${adminUser.email}  / Admin@123`);
  console.log(`   👤 Member → ${memberUser.email} / Member@123`);

  // ─────────────────────────────────────────────
  // 5. Create Sample Co-working Spaces
  // ─────────────────────────────────────────────
  const spaces = [
    {
      name: 'Executive Suite A',
      type: 'PRIVATE_OFFICE',
      description: 'Premium private office with high-speed internet, 4K display, and ergonomic seating.',
      capacity: 4,
      pricePerHour: 25.0,
      priceUnit: 'HOUR',
      location: 'First Floor, Block A',
      amenities: ['WiFi', 'AC', '4K Display', 'Ergonomic Chair', 'Whiteboard'],
      images: [],
      rules: ['No food or drinks near equipment', 'Book minimum 1 hour'],
    },
    {
      name: 'Open Collaboration Hub',
      type: 'OPEN_DESK',
      description: 'Spacious open-plan workspace perfect for teams and creative sessions.',
      capacity: 20,
      pricePerHour: 8.0,
      priceUnit: 'HOUR',
      location: 'Ground Floor',
      amenities: ['WiFi', 'Power Outlets', 'Standing Desks', 'Printer'],
      images: [],
      rules: ['Maintain noise levels', 'Clean up after use'],
    },
    {
      name: 'Conference Room Alpha',
      type: 'MEETING_ROOM',
      description: 'Fully equipped meeting room with projector, whiteboard, and video conferencing.',
      capacity: 12,
      pricePerHour: 40.0,
      priceUnit: 'HOUR',
      location: 'Second Floor, Room 201',
      amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'WiFi', 'AC'],
      images: [],
      rules: ['Booking required at least 2 hours in advance', 'Maximum 3 hour sessions'],
    },
    {
      name: 'Quiet Focus Pod',
      type: 'PRIVATE_OFFICE',
      description: 'Compact private booth designed for deep-focus individual work and calls.',
      capacity: 1,
      pricePerHour: 12.0,
      priceUnit: 'HOUR',
      location: 'First Floor, Pod Area',
      amenities: ['WiFi', 'Noise Cancellation', 'Power Outlet', 'Desk Light'],
      images: [],
      rules: ['Single person occupancy only'],
    },
    {
      name: 'Innovation Lab',
      type: 'EVENT_SPACE',
      description: 'Tech-equipped space for workshops, hackathons, and product demos.',
      capacity: 30,
      pricePerHour: 60.0,
      priceUnit: 'HOUR',
      location: 'Third Floor',
      amenities: ['Projector', 'Sound System', 'WiFi', 'AC', 'Catering Area', 'Smart TV'],
      images: [],
      rules: ['Advance booking required', 'Setup time included in booking'],
    },
  ];

  const createdSpaces = [];
  for (const space of spaces) {
    let existing = await prisma.space.findFirst({ where: { name: space.name } });
    if (!existing) {
      existing = await prisma.space.create({ data: space });
    }
    createdSpaces.push(existing);
  }

  console.log(`✅ ${spaces.length} sample spaces created`);

  // ─────────────────────────────────────────────
  // 6. Create Demo Bookings & Maintenance
  // ─────────────────────────────────────────────
  const now = new Date();
  
  // Tomorrow 10:00 - 12:00 (APPROVED)
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(12, 0, 0, 0);

  // Day after tomorrow 14:00 - 16:00 (PENDING)
  const nextDayStart = new Date(now);
  nextDayStart.setDate(now.getDate() + 2);
  nextDayStart.setHours(14, 0, 0, 0);
  const nextDayEnd = new Date(nextDayStart);
  nextDayEnd.setHours(16, 0, 0, 0);

  // Next week (CANCELLED)
  const nextWeekStart = new Date(now);
  nextWeekStart.setDate(now.getDate() + 7);
  nextWeekStart.setHours(9, 0, 0, 0);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setHours(11, 0, 0, 0);

  const existingBookings = await prisma.booking.count();
  if (existingBookings === 0 && createdSpaces.length >= 3) {
    await prisma.booking.createMany({
      data: [
        {
          userId: memberUser.id,
          spaceId: createdSpaces[0].id,
          startTime: tomorrowStart,
          endTime: tomorrowEnd,
          status: 'APPROVED',
          notes: 'Client quarterly strategy discussion',
        },
        {
          userId: memberUser.id,
          spaceId: createdSpaces[1].id,
          startTime: nextDayStart,
          endTime: nextDayEnd,
          status: 'PENDING',
          notes: 'Sprint design review meeting',
        },
        {
          userId: memberUser.id,
          spaceId: createdSpaces[2].id,
          startTime: nextWeekStart,
          endTime: nextWeekEnd,
          status: 'CANCELLED',
          notes: 'Cancelled due to travel rescheduling',
        },
      ],
    });
    console.log(`✅ Demo bookings created (APPROVED, PENDING, CANCELLED)`);
  }

  // Maintenance window for Space 3
  const existingMaintenance = await prisma.maintenance.count();
  if (existingMaintenance === 0 && createdSpaces.length >= 4) {
    const maintStart = new Date(now);
    maintStart.setDate(now.getDate() + 3);
    maintStart.setHours(8, 0, 0, 0);
    const maintEnd = new Date(maintStart);
    maintEnd.setHours(14, 0, 0, 0);

    await prisma.maintenance.create({
      data: {
        spaceId: createdSpaces[3].id,
        startTime: maintStart,
        endTime: maintEnd,
        reason: 'Air filtration & ergonomic acoustic check',
      },
    });
    console.log(`✅ Demo maintenance window scheduled`);
  }

  // ─────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DEFAULT LOGIN CREDENTIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  👑 Admin');
  console.log('     Email    : admin@coworking.com');
  console.log('     Password : Admin@123');
  console.log('');
  console.log('  👤 Member');
  console.log('     Email    : member@coworking.com');
  console.log('     Password : Member@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
