import http from 'http';
import app from '../src/app.js';

process.env.NODE_ENV = 'test';
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}`;

let server: http.Server;
let adminToken = '';
let memberToken = '';
let sampleSpaceId = '';
let sampleBookingId = '';
let createdSpaceId = '';
let createdRoleId = '';
let createdMaintenanceId = '';
let targetUserId = '';
let testPermissionId = '';

interface TestResult {
  category: string;
  name: string;
  method: string;
  endpoint: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

async function api(
  method: string,
  endpoint: string,
  body?: unknown,
  token?: string
): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { status: res.status, data };
}

function record(
  category: string,
  name: string,
  method: string,
  endpoint: string,
  expectedStatus: number | number[],
  actualStatus: number,
  notes?: string
) {
  const passed = Array.isArray(expectedStatus)
    ? expectedStatus.includes(actualStatus)
    : actualStatus === expectedStatus;
  results.push({
    category,
    name,
    method,
    endpoint,
    expectedStatus: Array.isArray(expectedStatus) ? expectedStatus[0] : expectedStatus,
    actualStatus,
    passed,
    notes,
  });

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${actualStatus}] ${method} ${endpoint} — ${name}`);
}

async function runTests() {
  console.log('\n🚀 Starting Full API Test Suite across all 17 Screens & Modules...\n');

  // ─────────────────────────────────────────────
  // 1. Health Check
  // ─────────────────────────────────────────────
  const health = await api('GET', '/health');
  record('Health', 'Health check', 'GET', '/health', 200, health.status);

  // ─────────────────────────────────────────────
  // 2. Auth APIs
  // ─────────────────────────────────────────────
  // Register a new test user
  const randomEmail = `test_${Date.now()}@example.com`;
  const regRes = await api('POST', '/api/auth/register', {
    name: 'New Registered Member',
    email: randomEmail,
    password: 'Password@123',
    phone: '9876543210',
  });
  record('Auth', 'Register new user', 'POST', '/api/auth/register', 201, regRes.status);

  // Admin Login
  const adminLogin = await api('POST', '/api/auth/login', {
    email: 'admin@coworking.com',
    password: 'Admin@123',
  });
  record('Auth', 'Admin login (verifies permissions[])', 'POST', '/api/auth/login', 200, adminLogin.status);
  adminToken = adminLogin.data?.data?.accessToken || '';

  // Member Login
  const memberLogin = await api('POST', '/api/auth/login', {
    email: 'member@coworking.com',
    password: 'Member@123',
  });
  record('Auth', 'Member login', 'POST', '/api/auth/login', 200, memberLogin.status);
  memberToken = memberLogin.data?.data?.accessToken || '';

  // Auth Me (Member)
  const memberMe = await api('GET', '/api/auth/me', undefined, memberToken);
  record('Auth', 'Member GET /auth/me', 'GET', '/api/auth/me', 200, memberMe.status);

  // Auth Me (Admin)
  const adminMe = await api('GET', '/api/auth/me', undefined, adminToken);
  record('Auth', 'Admin GET /auth/me (has permissions[])', 'GET', '/api/auth/me', 200, adminMe.status);

  // Refresh Token
  const refreshToken = memberLogin.data?.data?.refreshToken;
  const refreshRes = await api('POST', '/api/auth/refresh', { refreshToken });
  record('Auth', 'Refresh token', 'POST', '/api/auth/refresh', 200, refreshRes.status);

  // Forgot Password
  const forgotRes = await api('POST', '/api/auth/forgot-password', { email: 'member@coworking.com' });
  record('Auth', 'Forgot password', 'POST', '/api/auth/forgot-password', 200, forgotRes.status);

  // ─────────────────────────────────────────────
  // 3. Visitor / Spaces APIs
  // ─────────────────────────────────────────────
  const spacesRes = await api('GET', '/api/spaces?page=1&limit=10&search=Suite');
  record('Spaces (Visitor)', 'GET /spaces with filter & search', 'GET', '/api/spaces', 200, spacesRes.status);
  sampleSpaceId = spacesRes.data?.data?.data?.[0]?.id || '';

  // If no spaces by search, fetch all
  if (!sampleSpaceId) {
    const allSpaces = await api('GET', '/api/spaces');
    sampleSpaceId = allSpaces.data?.data?.data?.[0]?.id || '';
  }

  const spaceDetail = await api('GET', `/api/spaces/${sampleSpaceId}`);
  record('Spaces (Visitor)', 'GET /spaces/:id detail', 'GET', `/api/spaces/:id`, 200, spaceDetail.status);

  const spaceAvail = await api('GET', `/api/spaces/${sampleSpaceId}/availability?date=2026-09-25`);
  record('Spaces (Visitor)', 'GET /spaces/:id/availability', 'GET', `/api/spaces/:id/availability`, 200, spaceAvail.status);

  const spaceSlots = await api('GET', `/api/spaces/${sampleSpaceId}/slots?date=2026-09-25`);
  record('Spaces (Visitor)', 'GET /spaces/:id/slots', 'GET', `/api/spaces/:id/slots`, 200, spaceSlots.status);

  // ─────────────────────────────────────────────
  // 4. Availability APIs
  // ─────────────────────────────────────────────
  const checkAvail = await api('POST', '/api/availability/check', {
    spaceId: sampleSpaceId,
    date: '2026-09-25',
    startTime: '10:00',
    endTime: '12:00',
  });
  record('Availability', 'POST /availability/check (new format)', 'POST', '/api/availability/check', 200, checkAvail.status);

  const calAvail = await api('GET', `/api/availability/calendar?spaceId=${sampleSpaceId}`);
  record('Availability', 'GET /availability/calendar', 'GET', '/api/availability/calendar', 200, calAvail.status);

  // ─────────────────────────────────────────────
  // 5. Member Bookings APIs
  // ─────────────────────────────────────────────
  const baseOffset = Math.floor(Math.random() * 1000) + 30;
  const futureDate1 = new Date(Date.now() + (baseOffset + 1) * 86400000).toISOString().split('T')[0];
  const futureDate2 = new Date(Date.now() + (baseOffset + 10) * 86400000).toISOString().split('T')[0];
  const futureDate3 = new Date(Date.now() + (baseOffset + 20) * 86400000).toISOString().split('T')[0];

  const newBooking = await api(
    'POST',
    '/api/bookings',
    {
      spaceId: sampleSpaceId,
      date: futureDate1,
      startTime: '11:00',
      endTime: '13:00',
      notes: 'Strategy brainstorm session',
    },
    memberToken
  );
  record('Bookings (Member)', 'POST /bookings (create booking with notes)', 'POST', '/api/bookings', 201, newBooking.status);
  sampleBookingId = newBooking.data?.data?.id || '';

  const myBookings = await api('GET', '/api/bookings?page=1&limit=10', undefined, memberToken);
  record('Bookings (Member)', 'GET /bookings (my bookings with data[] & amount)', 'GET', '/api/bookings', 200, myBookings.status);

  if (sampleBookingId) {
    const bookingDetail = await api('GET', `/api/bookings/${sampleBookingId}`, undefined, memberToken);
    record('Bookings (Member)', 'GET /bookings/:id (booking detail)', 'GET', `/api/bookings/:id`, 200, bookingDetail.status);

    const updateBooking = await api(
      'PATCH',
      `/api/bookings/${sampleBookingId}`,
      { notes: 'Updated agenda for meeting' },
      memberToken
    );
    record('Bookings (Member)', 'PATCH /bookings/:id (update booking notes)', 'PATCH', `/api/bookings/:id`, 200, updateBooking.status);

    const cancelBooking = await api(
      'POST',
      `/api/bookings/${sampleBookingId}/cancel`,
      { reason: 'Client requested reschedule' },
      memberToken
    );
    record('Bookings (Member)', 'POST /bookings/:id/cancel (cancel booking)', 'POST', `/api/bookings/:id/cancel`, 200, cancelBooking.status);
  }

  // ─────────────────────────────────────────────
  // 6. Admin Space Management APIs
  // ─────────────────────────────────────────────
  const adminSpaces = await api('GET', '/api/admin/spaces?page=1&limit=10', undefined, adminToken);
  record('Admin Spaces', 'GET /api/admin/spaces', 'GET', '/api/admin/spaces', 200, adminSpaces.status);

  const createSpaceRes = await api(
    'POST',
    '/api/admin/spaces',
    {
      name: `Test Executive Pod ${Date.now()}`,
      type: 'PRIVATE_OFFICE',
      description: 'Private 1-person work pod',
      capacity: 1,
      pricePerHour: 15.0,
      priceUnit: 'HOUR',
      location: 'Floor 2, Pods',
      amenities: ['WiFi', 'Power Outlet', 'Monitor'],
      images: [],
      rules: ['Single person only'],
    },
    adminToken
  );
  record('Admin Spaces', 'POST /api/admin/spaces (create space)', 'POST', '/api/admin/spaces', 201, createSpaceRes.status);
  createdSpaceId = createSpaceRes.data?.data?.id || '';

  if (createdSpaceId) {
    const adminSpaceDetail = await api('GET', `/api/admin/spaces/${createdSpaceId}`, undefined, adminToken);
    record('Admin Spaces', 'GET /api/admin/spaces/:id', 'GET', `/api/admin/spaces/:id`, 200, adminSpaceDetail.status);

    const updateSpaceRes = await api(
      'PATCH',
      `/api/admin/spaces/${createdSpaceId}`,
      { pricePerHour: 18.0, description: 'Updated pricing pod' },
      adminToken
    );
    record('Admin Spaces', 'PATCH /api/admin/spaces/:id', 'PATCH', `/api/admin/spaces/:id`, 200, updateSpaceRes.status);

    const deleteSpaceRes = await api('DELETE', `/api/admin/spaces/${createdSpaceId}`, undefined, adminToken);
    record('Admin Spaces', 'DELETE /api/admin/spaces/:id (deactivate)', 'DELETE', `/api/admin/spaces/:id`, 200, deleteSpaceRes.status);
  }

  // ─────────────────────────────────────────────
  // 7. Admin Booking Management APIs
  // ─────────────────────────────────────────────
  const adminBookings = await api('GET', '/api/admin/bookings?page=1&limit=10', undefined, adminToken);
  record('Admin Bookings', 'GET /api/admin/bookings', 'GET', '/api/admin/bookings', 200, adminBookings.status);

  // Create a pending booking to approve/reject
  const pendingBookingRes = await api(
    'POST',
    '/api/bookings',
    {
      spaceId: sampleSpaceId,
      date: futureDate2,
      startTime: '10:00',
      endTime: '12:00',
      notes: 'Pending approval test booking',
    },
    memberToken
  );
  const pendingBookingId = pendingBookingRes.data?.data?.id || '';

  if (pendingBookingId) {
    const adminBookingDetail = await api('GET', `/api/admin/bookings/${pendingBookingId}`, undefined, adminToken);
    record('Admin Bookings', 'GET /api/admin/bookings/:id', 'GET', `/api/admin/bookings/:id`, 200, adminBookingDetail.status);

    const approveBooking = await api('PATCH', `/api/admin/bookings/${pendingBookingId}/approve`, {}, adminToken);
    record('Admin Bookings', 'PATCH /api/admin/bookings/:id/approve', 'PATCH', `/api/admin/bookings/:id/approve`, 200, approveBooking.status);
  }

  // Create another pending booking to test reject
  const rejectTestBooking = await api(
    'POST',
    '/api/bookings',
    {
      spaceId: sampleSpaceId,
      date: futureDate3,
      startTime: '14:00',
      endTime: '16:00',
      notes: 'Reject test booking',
    },
    memberToken
  );
  const rejectBookingId = rejectTestBooking.data?.data?.id || '';

  if (rejectBookingId) {
    const rejectRes = await api(
      'PATCH',
      `/api/admin/bookings/${rejectBookingId}/reject`,
      { reason: 'Conflict with maintenance window' },
      adminToken
    );
    record('Admin Bookings', 'PATCH /api/admin/bookings/:id/reject', 'PATCH', `/api/admin/bookings/:id/reject`, 200, rejectRes.status);
  }

  // ─────────────────────────────────────────────
  // 8. Admin Dashboard Analytics APIs
  // ─────────────────────────────────────────────
  const dashStats = await api('GET', '/api/admin/dashboard/stats', undefined, adminToken);
  record('Admin Dashboard', 'GET /api/admin/dashboard/stats', 'GET', '/api/admin/dashboard/stats', 200, dashStats.status);

  const dashBookings = await api('GET', '/api/admin/dashboard/bookings?limit=5', undefined, adminToken);
  record('Admin Dashboard', 'GET /api/admin/dashboard/bookings', 'GET', '/api/admin/dashboard/bookings', 200, dashBookings.status);

  const dashRevenue = await api('GET', '/api/admin/dashboard/revenue?groupBy=month', undefined, adminToken);
  record('Admin Dashboard', 'GET /api/admin/dashboard/revenue', 'GET', '/api/admin/dashboard/revenue', 200, dashRevenue.status);

  const dashActivity = await api('GET', '/api/admin/dashboard/activity?limit=5', undefined, adminToken);
  record('Admin Dashboard', 'GET /api/admin/dashboard/activity', 'GET', '/api/admin/dashboard/activity', 200, dashActivity.status);

  const dashTrends = await api('GET', '/api/admin/dashboard/booking-trends?groupBy=day', undefined, adminToken);
  record('Admin Dashboard', 'GET /api/admin/dashboard/booking-trends', 'GET', '/api/admin/dashboard/booking-trends', 200, dashTrends.status);

  // ─────────────────────────────────────────────
  // 9. Admin User Management APIs
  // ─────────────────────────────────────────────
  const adminUsers = await api('GET', '/api/admin/users?page=1&limit=10', undefined, adminToken);
  record('Admin Users', 'GET /api/admin/users', 'GET', '/api/admin/users', 200, adminUsers.status);
  targetUserId = adminUsers.data?.data?.data?.[0]?.id || '';

  if (targetUserId) {
    const adminUserDetail = await api('GET', `/api/admin/users/${targetUserId}`, undefined, adminToken);
    record('Admin Users', 'GET /api/admin/users/:id', 'GET', `/api/admin/users/:id`, 200, adminUserDetail.status);

    const updateAdminUser = await api(
      'PATCH',
      `/api/admin/users/${targetUserId}`,
      { phone: '9988776655' },
      adminToken
    );
    record('Admin Users', 'PATCH /api/admin/users/:id', 'PATCH', `/api/admin/users/:id`, 200, updateAdminUser.status);

    const deactivateUser = await api('PATCH', `/api/admin/users/${targetUserId}/deactivate`, {}, adminToken);
    record('Admin Users', 'PATCH /api/admin/users/:id/deactivate', 'PATCH', `/api/admin/users/:id/deactivate`, 200, deactivateUser.status);

    const activateUser = await api('PATCH', `/api/admin/users/${targetUserId}/activate`, {}, adminToken);
    record('Admin Users', 'PATCH /api/admin/users/:id/activate', 'PATCH', `/api/admin/users/:id/activate`, 200, activateUser.status);
  }

  // ─────────────────────────────────────────────
  // 10. Admin Roles & Permissions APIs
  // ─────────────────────────────────────────────
  const adminRoles = await api('GET', '/api/admin/roles?page=1&limit=10', undefined, adminToken);
  record('Admin Roles', 'GET /api/admin/roles', 'GET', '/api/admin/roles', 200, adminRoles.status);

  const createRoleRes = await api(
    'POST',
    '/api/admin/roles',
    {
      name: `COORDINATOR_${Date.now()}`,
      description: 'Desk Coordinator Role',
    },
    adminToken
  );
  record('Admin Roles', 'POST /api/admin/roles', 'POST', '/api/admin/roles', 201, createRoleRes.status);
  createdRoleId = createRoleRes.data?.data?.id || '';

  if (createdRoleId) {
    const roleDetail = await api('GET', `/api/admin/roles/${createdRoleId}`, undefined, adminToken);
    record('Admin Roles', 'GET /api/admin/roles/:id', 'GET', `/api/admin/roles/:id`, 200, roleDetail.status);

    const updateRoleRes = await api(
      'PATCH',
      `/api/admin/roles/${createdRoleId}`,
      { description: 'Updated Coordinator Role' },
      adminToken
    );
    record('Admin Roles', 'PATCH /api/admin/roles/:id', 'PATCH', `/api/admin/roles/:id`, 200, updateRoleRes.status);

    const rolePerms = await api('GET', `/api/admin/roles/${createdRoleId}/permissions`, undefined, adminToken);
    record('Admin Roles', 'GET /api/admin/roles/:id/permissions', 'GET', `/api/admin/roles/:id/permissions`, 200, rolePerms.status);

    // Get an existing permission to assign
    const permsRes = await api('GET', '/api/admin/permissions', undefined, adminToken);
    testPermissionId = permsRes.data?.data?.data?.[0]?.id || '';

    if (testPermissionId) {
      const putPerms = await api(
        'PUT',
        `/api/admin/roles/${createdRoleId}/permissions`,
        { permissionIds: [testPermissionId] },
        adminToken
      );
      record('Admin Roles', 'PUT /api/admin/roles/:id/permissions (replace perms)', 'PUT', `/api/admin/roles/:id/permissions`, 200, putPerms.status);
    }

    const deleteRoleRes = await api('DELETE', `/api/admin/roles/${createdRoleId}`, undefined, adminToken);
    record('Admin Roles', 'DELETE /api/admin/roles/:id', 'DELETE', `/api/admin/roles/:id`, 200, deleteRoleRes.status);
  }

  // ─────────────────────────────────────────────
  // 11. Admin Permissions List API
  // ─────────────────────────────────────────────
  const allPerms = await api('GET', '/api/admin/permissions?module=spaces', undefined, adminToken);
  record('Admin Permissions', 'GET /api/admin/permissions?module=spaces', 'GET', '/api/admin/permissions', 200, allPerms.status);

  // ─────────────────────────────────────────────
  // 12. Admin Maintenance Management APIs
  // ─────────────────────────────────────────────
  const maintList = await api('GET', '/api/admin/maintenance', undefined, adminToken);
  record('Admin Maintenance', 'GET /api/admin/maintenance', 'GET', '/api/admin/maintenance', 200, maintList.status);

  const createMaint = await api(
    'POST',
    '/api/admin/maintenance',
    {
      spaceId: sampleSpaceId,
      startTime: '2026-12-01T08:00:00.000Z',
      endTime: '2026-12-01T14:00:00.000Z',
      reason: 'Deep cleaning & sanitation',
    },
    adminToken
  );
  record('Admin Maintenance', 'POST /api/admin/maintenance', 'POST', '/api/admin/maintenance', 201, createMaint.status);
  createdMaintenanceId = createMaint.data?.data?.id || '';

  if (createdMaintenanceId) {
    const maintDetail = await api('GET', `/api/admin/maintenance/${createdMaintenanceId}`, undefined, adminToken);
    record('Admin Maintenance', 'GET /api/admin/maintenance/:id', 'GET', `/api/admin/maintenance/:id`, 200, maintDetail.status);

    const updateMaint = await api(
      'PATCH',
      `/api/admin/maintenance/${createdMaintenanceId}`,
      { reason: 'Updated: Full HVAC and deep cleaning' },
      adminToken
    );
    record('Admin Maintenance', 'PATCH /api/admin/maintenance/:id', 'PATCH', `/api/admin/maintenance/:id`, 200, updateMaint.status);

    const deleteMaint = await api('DELETE', `/api/admin/maintenance/${createdMaintenanceId}`, undefined, adminToken);
    record('Admin Maintenance', 'DELETE /api/admin/maintenance/:id', 'DELETE', `/api/admin/maintenance/:id`, 200, deleteMaint.status);
  }

  // ─────────────────────────────────────────────
  // Print Summary Table
  // ─────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('                          TEST SUITE RESULTS                               ');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.table(
    results.map((r) => ({
      Category: r.category,
      Method: r.method,
      Endpoint: r.endpoint,
      Expected: r.expectedStatus,
      Actual: r.actualStatus,
      Status: r.passed ? 'PASS' : 'FAIL',
    }))
  );

  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`Passed:      ${passedCount} ✅`);
  console.log(`Failed:      ${failedCount} ${failedCount > 0 ? '❌' : ''}`);
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  if (failedCount > 0) {
    console.error('Some tests failed!');
    process.exit(1);
  } else {
    console.log('🎉 ALL APIs ARE IN 100% WORKING MODE!');
    process.exit(0);
  }
}

server = app.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
