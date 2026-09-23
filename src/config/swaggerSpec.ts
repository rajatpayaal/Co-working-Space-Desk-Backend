export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Co-working Space Desk Reservation API',
    version: '1.0.0',
    description:
      'RESTful API documentation for managing co-working spaces, user registrations, desk/space bookings, maintenance tickets, and admin operations. Built with Express.js, TypeScript, and Prisma.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url:
        process.env.BACKEND_URL ||
        process.env.API_BASE_URL ||
        'https://co-working-space-desk-backend.vercel.app',
      description: 'Production Server (Vercel)',
    },
    {
      url: `http://localhost:${process.env.PORT || 5000}`,
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'System', description: 'Root & Health check endpoints' },
    { name: 'Authentication', description: 'Member & Admin authentication, profile, tokens' },
    { name: 'Visitor Spaces', description: 'Public browse, details, availability, and time slots' },
    { name: 'Visitor Availability', description: 'System-wide availability search and counts' },
    { name: 'Member Bookings', description: 'Desk & space reservations for logged-in members' },
    { name: 'Admin Spaces', description: 'Space catalog management (CRUD, status, pricing)' },
    { name: 'Admin Bookings', description: 'Reservation review, approvals, and rejections' },
    { name: 'Admin Maintenance', description: 'Space maintenance tickets and issue resolution' },
    { name: 'Admin Users', description: 'User account and profile administration' },
    { name: 'Admin Roles', description: 'Role-based access control (RBAC) role management' },
    { name: 'Admin Permissions', description: 'Permission catalog and role assignment' },
    { name: 'Admin Dashboard', description: 'Analytics, KPI metrics, occupancy, and recent activity' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT Bearer token in the format: Bearer <token>',
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Root Welcome Endpoint',
        description: 'Returns API overview, links to documentation and health check.',
        responses: {
          200: { description: 'API welcome information' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health Check',
        description: 'Verifies the server status and uptime.',
        responses: {
          200: { description: 'Server is healthy' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: '01. Register New Member',
        description: 'Registers a new user account with default MEMBER role.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'newuser@example.com' },
                  password: { type: 'string', minLength: 6, example: 'Password@123' },
                  name: { type: 'string', example: 'Alex Morgan' },
                  phone: { type: 'string', example: '+1-555-0199' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: '02. User Login',
        description: 'Authenticates a user and returns JWT accessToken, refreshToken, user profile, and permissions.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@coworking.com' },
                  password: { type: 'string', example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: '03. Refresh Access Token',
        description: 'Issues a new access token using a valid refresh token.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'New token issued' },
          401: { description: 'Invalid refresh token' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: '04. Forgot Password',
        description: 'Initiates password reset process and generates reset token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'member@coworking.com' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset instructions sent' },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: '05. Reset Password',
        description: 'Resets user password using the token received in forgot-password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: { type: 'string', example: 'reset-token-value' },
                  newPassword: { type: 'string', minLength: 6, example: 'NewSecret@123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset successful' },
          400: { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: '06. Get Current User Profile',
        description: 'Retrieves the authenticated user profile with assigned role and permissions.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/profile': {
      patch: {
        tags: ['Authentication'],
        summary: '07. Update User Profile',
        description: 'Updates current user details (name, phone).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'John Updated Doe' },
                  phone: { type: 'string', example: '+1-555-9876' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated successfully' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: '08. User Logout',
        description: 'Invalidates the refresh token and clears session cookie.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/spaces': {
      get: {
        tags: ['Visitor Spaces'],
        summary: '09. List All Active Spaces',
        description: 'Search and filter active spaces by type, location, price, capacity, and keyword.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Keyword search' },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['DESK', 'PRIVATE_OFFICE', 'MEETING_ROOM'] }, description: 'Space category' },
          { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Location filter' },
          { name: 'minCapacity', in: 'query', schema: { type: 'integer' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'List of spaces with pagination' },
        },
      },
    },
    '/api/spaces/{id}': {
      get: {
        tags: ['Visitor Spaces'],
        summary: '10. Get Space Details by ID',
        description: 'Fetches detailed information about a single space including amenities and images.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Space ID' },
        ],
        responses: {
          200: { description: 'Space details' },
          404: { description: 'Space not found' },
        },
      },
    },
    '/api/spaces/{id}/availability': {
      get: {
        tags: ['Visitor Spaces'],
        summary: '11. Check Space Availability',
        description: 'Checks whether a space is available for the given start and end date/time.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Space ID' },
          { name: 'startTime', in: 'query', required: true, schema: { type: 'string', format: 'date-time' }, example: '2026-10-01T09:00:00.000Z' },
          { name: 'endTime', in: 'query', required: true, schema: { type: 'string', format: 'date-time' }, example: '2026-10-01T17:00:00.000Z' },
        ],
        responses: {
          200: { description: 'Availability status returned' },
        },
      },
    },
    '/api/spaces/{id}/slots': {
      get: {
        tags: ['Visitor Spaces'],
        summary: '12. Get Available Time Slots',
        description: 'Returns available and booked hourly slots for a space on a given date.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Space ID' },
          { name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' }, example: '2026-10-01' },
        ],
        responses: {
          200: { description: 'Hourly slot availability list' },
        },
      },
    },
    '/api/availability': {
      get: {
        tags: ['Visitor Availability'],
        summary: '13. Search Available Spaces',
        description: 'Search for available spaces matching date, time, and optional capacity/type filters.',
        parameters: [
          { name: 'startTime', in: 'query', required: true, schema: { type: 'string', format: 'date-time' } },
          { name: 'endTime', in: 'query', required: true, schema: { type: 'string', format: 'date-time' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'minCapacity', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'List of available spaces' },
        },
      },
    },
    '/api/spaces/available-count': {
      get: {
        tags: ['Visitor Availability'],
        summary: '14. Get Available Space Counts',
        description: 'Returns count of available spaces grouped by space type.',
        parameters: [
          { name: 'startTime', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'endTime', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: { description: 'Available count summary' },
        },
      },
    },
    '/api/bookings': {
      post: {
        tags: ['Member Bookings'],
        summary: '15. Create Reservation',
        description: 'Creates a desk or space booking for the logged-in member.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['spaceId', 'startTime', 'endTime'],
                properties: {
                  spaceId: { type: 'string', example: 'space-uuid' },
                  startTime: { type: 'string', format: 'date-time', example: '2026-10-01T09:00:00.000Z' },
                  endTime: { type: 'string', format: 'date-time', example: '2026-10-01T17:00:00.000Z' },
                  notes: { type: 'string', example: 'Quiet desk needed' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking created successfully' },
          409: { description: 'Space already booked for this timeslot' },
        },
      },
      get: {
        tags: ['Member Bookings'],
        summary: '16. List My Bookings',
        description: 'Returns all reservations created by the logged-in member.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Member bookings list' },
        },
      },
    },
    '/api/bookings/{id}': {
      get: {
        tags: ['Member Bookings'],
        summary: '17. Get Booking Details',
        description: 'Retrieves full details for a member booking.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Booking details' },
          404: { description: 'Booking not found' },
        },
      },
      patch: {
        tags: ['Member Bookings'],
        summary: '18. Update Booking',
        description: 'Modifies schedule or notes on a pending/confirmed booking.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  startTime: { type: 'string', format: 'date-time' },
                  endTime: { type: 'string', format: 'date-time' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Booking updated' },
        },
      },
    },
    '/api/bookings/{id}/cancel': {
      post: {
        tags: ['Member Bookings'],
        summary: '19. Cancel Booking',
        description: 'Cancels a member reservation.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'Change of plans' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Booking cancelled' },
        },
      },
    },
    '/api/admin/spaces': {
      get: {
        tags: ['Admin Spaces'],
        summary: '20. Admin List Spaces',
        description: 'Lists all spaces (both active and inactive) with admin metadata.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Admin space list' },
        },
      },
      post: {
        tags: ['Admin Spaces'],
        summary: '21. Create New Space',
        description: 'Creates a new space listing with pricing, capacity, and amenities.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type', 'capacity', 'pricePerHour', 'location'],
                properties: {
                  name: { type: 'string', example: 'Executive Boardroom' },
                  description: { type: 'string', example: 'High-end meeting space with 4K projector' },
                  type: { type: 'string', enum: ['DESK', 'PRIVATE_OFFICE', 'MEETING_ROOM'], example: 'MEETING_ROOM' },
                  capacity: { type: 'integer', example: 12 },
                  pricePerHour: { type: 'number', example: 75.0 },
                  location: { type: 'string', example: 'Floor 4, Wing B' },
                  amenities: { type: 'array', items: { type: 'string' }, example: ['Wi-Fi', 'Whiteboard', 'AV Setup'] },
                  images: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Space created successfully' },
        },
      },
    },
    '/api/admin/spaces/{id}': {
      get: {
        tags: ['Admin Spaces'],
        summary: '22. Admin Get Space Detail',
        description: 'Fetches detailed space information including booking history and maintenance counts.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Space details' },
        },
      },
      patch: {
        tags: ['Admin Spaces'],
        summary: '23. Admin Update Space',
        description: 'Updates space details, status (isAvailable), pricing, or amenities.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  pricePerHour: { type: 'number' },
                  isAvailable: { type: 'boolean' },
                  amenities: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Space updated successfully' },
        },
      },
      delete: {
        tags: ['Admin Spaces'],
        summary: '24. Admin Delete Space',
        description: 'Soft deletes or deactivates a space listing.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Space deleted' },
        },
      },
    },
    '/api/admin/bookings': {
      get: {
        tags: ['Admin Bookings'],
        summary: '25. Admin List All Bookings',
        description: 'Retrieves all member bookings across the platform with user & space relations.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'All bookings list' },
        },
      },
    },
    '/api/admin/bookings/{id}': {
      get: {
        tags: ['Admin Bookings'],
        summary: '26. Admin Get Booking Details',
        description: 'Fetches detailed information on any booking including member profile and space.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Admin booking detail' },
        },
      },
    },
    '/api/admin/bookings/{id}/approve': {
      patch: {
        tags: ['Admin Bookings'],
        summary: '27. Admin Approve Booking',
        description: 'Approves a pending reservation and updates status to CONFIRMED.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Booking approved' },
        },
      },
    },
    '/api/admin/bookings/{id}/reject': {
      patch: {
        tags: ['Admin Bookings'],
        summary: '28. Admin Reject Booking',
        description: 'Rejects a booking with an optional reason.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'Maintenance scheduled during this period' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Booking rejected' },
        },
      },
    },
    '/api/maintenance': {
      post: {
        tags: ['Admin Maintenance'],
        summary: '29. Create Maintenance Ticket',
        description: 'Reports a maintenance issue for a specific space.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['spaceId', 'issue'],
                properties: {
                  spaceId: { type: 'string', example: 'space-uuid' },
                  issue: { type: 'string', example: 'Air conditioner leaking water' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Maintenance ticket created' },
        },
      },
    },
    '/api/admin/maintenance': {
      get: {
        tags: ['Admin Maintenance'],
        summary: '30. Admin List Maintenance Tickets',
        description: 'Retrieves all maintenance tickets with status and priority filters.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Maintenance ticket list' },
        },
      },
    },
    '/api/admin/maintenance/{id}': {
      get: {
        tags: ['Admin Maintenance'],
        summary: '31. Admin Get Ticket Details',
        description: 'Fetches details of a specific maintenance ticket.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Ticket details' },
        },
      },
      patch: {
        tags: ['Admin Maintenance'],
        summary: '32. Admin Update Ticket Status',
        description: 'Updates status, priority, or resolution notes of a maintenance ticket.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'] },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                  resolutionNotes: { type: 'string', example: 'Technician repaired AC unit.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Ticket updated successfully' },
        },
      },
      delete: {
        tags: ['Admin Maintenance'],
        summary: '33. Admin Delete Ticket',
        description: 'Deletes a maintenance ticket.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Ticket deleted' },
        },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin Users'],
        summary: '34. Admin List All Users',
        description: 'Retrieves all users with role information and pagination.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'roleId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'User list' },
        },
      },
      post: {
        tags: ['Admin Users'],
        summary: '35. Admin Create User',
        description: 'Creates a user directly with a specified role.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  roleId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User created' },
        },
      },
    },
    '/api/admin/users/{id}': {
      get: {
        tags: ['Admin Users'],
        summary: '36. Admin Get User Details',
        description: 'Retrieves user details and booking history.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'User details' },
        },
      },
      patch: {
        tags: ['Admin Users'],
        summary: '37. Admin Update User',
        description: 'Updates user profile, active status, or assigned role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  isActive: { type: 'boolean' },
                  roleId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User updated' },
        },
      },
      delete: {
        tags: ['Admin Users'],
        summary: '38. Admin Delete User',
        description: 'Deactivates or deletes a user account.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'User deleted' },
        },
      },
    },
    '/api/admin/roles': {
      get: {
        tags: ['Admin Roles'],
        summary: '39. Admin List Roles',
        description: 'Retrieves all roles with assigned permissions.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Roles list' },
        },
      },
      post: {
        tags: ['Admin Roles'],
        summary: '40. Admin Create Role',
        description: 'Creates a new RBAC role.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'SUPERVISOR' },
                  description: { type: 'string', example: 'Floor supervisor role' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Role created' },
        },
      },
    },
    '/api/admin/roles/{id}': {
      get: {
        tags: ['Admin Roles'],
        summary: '41. Admin Get Role Details',
        description: 'Retrieves role details by ID.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Role details' },
        },
      },
      patch: {
        tags: ['Admin Roles'],
        summary: '42. Admin Update Role',
        description: 'Updates role name or description.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Role updated' },
        },
      },
      delete: {
        tags: ['Admin Roles'],
        summary: '43. Admin Delete Role',
        description: 'Deletes a custom role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Role deleted' },
        },
      },
    },
    '/api/admin/permissions': {
      get: {
        tags: ['Admin Permissions'],
        summary: '44. Admin List Permissions',
        description: 'Retrieves all available permissions in the system.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Permissions list' },
        },
      },
      post: {
        tags: ['Admin Permissions'],
        summary: '45. Admin Create Permission',
        description: 'Registers a new system permission.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'reports:export' },
                  description: { type: 'string', example: 'Can export business analytics reports' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Permission created' },
        },
      },
    },
    '/api/admin/roles/{id}/permissions': {
      post: {
        tags: ['Admin Permissions'],
        summary: '46. Assign Permission to Role',
        description: 'Binds a permission to an existing role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['permissionId'],
                properties: {
                  permissionId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Permission assigned successfully' },
        },
      },
    },
    '/api/admin/dashboard/stats': {
      get: {
        tags: ['Admin Dashboard'],
        summary: '47. Dashboard Overall KPI Stats',
        description: 'Returns total spaces, total bookings, active users, total revenue, and occupancy rate.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Overall statistics' },
        },
      },
    },
    '/api/admin/dashboard/revenue': {
      get: {
        tags: ['Admin Dashboard'],
        summary: '48. Dashboard Revenue Analytics',
        description: 'Returns revenue breakdown by time period (daily/monthly).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'period', in: 'query', schema: { type: 'string', enum: ['daily', 'monthly'] } },
        ],
        responses: {
          200: { description: 'Revenue analytics breakdown' },
        },
      },
    },
    '/api/admin/dashboard/occupancy': {
      get: {
        tags: ['Admin Dashboard'],
        summary: '49. Dashboard Space Occupancy Rate',
        description: 'Returns occupancy percentage across spaces.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Occupancy rate data' },
        },
      },
    },
    '/api/admin/dashboard/recent-activity': {
      get: {
        tags: ['Admin Dashboard'],
        summary: '50. Dashboard Recent Activity Feed',
        description: 'Returns recent bookings, cancellations, and user activity events.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Recent activity list' },
        },
      },
    },
    '/api/admin/dashboard/spaces-status': {
      get: {
        tags: ['Admin Dashboard'],
        summary: '51. Dashboard Spaces Status Breakdown',
        description: 'Returns count of spaces categorized by type and active availability status.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Spaces status breakdown' },
        },
      },
    },
  },
};
