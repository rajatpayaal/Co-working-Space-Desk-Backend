# Co-working Space Desk Reservation API — Request & Response Specification (51 APIs)

This document provides sample HTTP Requests and Responses for all **51 APIs** built in the project. You can test these endpoints using:
- **Production URL**: `https://co-working-space-desk-backend.vercel.app`
- **Swagger UI (Production)**: `https://co-working-space-desk-backend.vercel.app/api-docs`
- **Local Dev Server**: `http://localhost:5000`
- **Swagger UI (Local)**: `http://localhost:5000/api-docs`

---

## 📌 Table of Contents
- [1. Authentication APIs (01 - 08)](#1-authentication-apis-01---08)
- [2. Visitor / Public Space & Availability APIs (09 - 14)](#2-visitor--public-space--availability-apis-09---14)
- [3. Member Booking APIs (15 - 19)](#3-member-booking-apis-15---19)
- [4. Admin Space Management APIs (20 - 24)](#4-admin-space-management-apis-20---24)
- [5. Admin Booking Management APIs (25 - 28)](#5-admin-booking-management-apis-25---28)
- [6. Admin Maintenance Management APIs (29 - 33)](#6-admin-maintenance-management-apis-29---33)
- [7. Admin User Management APIs (34 - 38)](#7-admin-user-management-apis-34---38)
- [8. Admin Role Management APIs (39 - 43)](#8-admin-role-management-apis-39---43)
- [9. Admin Permission Management APIs (44 - 46)](#9-admin-permission-management-apis-44---46)
- [10. Admin Dashboard Analytics APIs (47 - 51)](#10-admin-dashboard-analytics-apis-47---51)

---

## 1. Authentication APIs (01 - 08)

### 01. POST `/api/auth/register` — Register New Member
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "janedoe@example.com",
  "password": "SecretPassword123"
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "e4c9f1a0-3b8c-4d2e-9f1a-0b2c3d4e5f6a",
      "name": "Jane Doe",
      "email": "janedoe@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "eyJhbGciOiJIUzI1Ni..."
  }
}
```

---

### 02. POST `/api/auth/login` — User Login
- **Access**: Public
- **Request Body**:
```json
{
  "email": "janedoe@example.com",
  "password": "SecretPassword123"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "e4c9f1a0-3b8c-4d2e-9f1a-0b2c3d4e5f6a",
      "name": "Jane Doe",
      "email": "janedoe@example.com",
      "role": "MEMBER"
    },
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "eyJhbGciOiJIUzI1Ni..."
  }
}
```

---

### 03. GET `/api/auth/me` — Get Current User Profile
- **Access**: Authenticated (Bearer Token)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "User profile fetched successfully",
  "data": {
    "id": "e4c9f1a0-3b8c-4d2e-9f1a-0b2c3d4e5f6a",
    "name": "Jane Doe",
    "email": "janedoe@example.com",
    "isActive": true,
    "createdAt": "2026-09-22T02:00:00.000Z",
    "role": {
      "id": "role-uuid-123",
      "name": "MEMBER"
    }
  }
}
```

---

### 04. POST `/api/auth/refresh` — Refresh Access Token
- **Access**: Public / Auth
- **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1Ni..."
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1Ni.newAccess...",
    "refreshToken": "eyJhbGciOiJIUzI1Ni.newRefresh..."
  }
}
```

---

### 05. POST `/api/auth/logout` — Logout User
- **Access**: Authenticated
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 06. PATCH `/api/auth/change-password` — Change Password
- **Access**: Authenticated
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
```json
{
  "oldPassword": "SecretPassword123",
  "newPassword": "NewSuperSecret456"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

---

### 07. POST `/api/auth/forgot-password` — Forgot Password Request
- **Access**: Public
- **Request Body**:
```json
{
  "email": "janedoe@example.com"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Password reset token generated successfully.",
  "data": {
    "message": "Password reset token generated successfully.",
    "resetToken": "7f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c"
  }
}
```

---

### 08. POST `/api/auth/reset-password` — Reset Password
- **Access**: Public
- **Request Body**:
```json
{
  "token": "7f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
  "newPassword": "BrandNewSecretPassword789"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Password has been reset successfully"
}
```

---

## 2. Visitor / Public Space & Availability APIs (09 - 14)

### 09. GET `/api/spaces?search=Executive&minCapacity=4&page=1&limit=10`
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Public spaces list retrieved successfully",
  "data": {
    "spaces": [
      {
        "id": "spc-001-uuid",
        "name": "Executive Conference Room A",
        "description": "Soundproof office suite with 4K display",
        "capacity": 8,
        "pricePerHour": 35.0,
        "isActive": true,
        "createdAt": "2026-09-22T01:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 10. GET `/api/spaces/:id` — Get Space Details
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Space details retrieved successfully",
  "data": {
    "id": "spc-001-uuid",
    "name": "Executive Conference Room A",
    "description": "Soundproof office suite with 4K display",
    "capacity": 8,
    "pricePerHour": 35.0,
    "isActive": true,
    "maintenances": []
  }
}
```

---

### 11. POST `/api/availability/check` — Check Slot Availability
- **Access**: Public
- **Request Body**:
```json
{
  "spaceId": "spc-001-uuid",
  "startTime": "2026-10-15T09:00:00.000Z",
  "endTime": "2026-10-15T12:00:00.000Z"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Space availability checked successfully",
  "data": {
    "spaceId": "spc-001-uuid",
    "spaceName": "Executive Conference Room A",
    "startTime": "2026-10-15T09:00:00.000Z",
    "endTime": "2026-10-15T12:00:00.000Z",
    "isAvailable": true,
    "conflicts": {
      "bookingsCount": 0,
      "maintenanceCount": 0
    }
  }
}
```

---

### 12. GET `/api/spaces/:id/availability?date=2026-10-15`
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Space availability details retrieved successfully",
  "data": {
    "space": {
      "id": "spc-001-uuid",
      "name": "Executive Conference Room A",
      "capacity": 8,
      "pricePerHour": 35.0
    },
    "date": "2026-10-15",
    "bookings": [],
    "maintenances": [],
    "totalOccupiedWindows": 0
  }
}
```

---

### 13. GET `/api/spaces/:id/slots?date=2026-10-15&durationMinutes=60`
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Available time slots retrieved successfully",
  "data": {
    "spaceId": "spc-001-uuid",
    "spaceName": "Executive Conference Room A",
    "date": "2026-10-15",
    "totalSlots": 12,
    "availableSlotsCount": 12,
    "slots": [
      {
        "slot": "08:00 - 09:00",
        "startTime": "2026-10-15T08:00:00.000Z",
        "endTime": "2026-10-15T09:00:00.000Z",
        "isAvailable": true
      }
    ]
  }
}
```

---

### 14. GET `/api/availability/calendar?spaceId=spc-001-uuid`
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Availability calendar fetched successfully",
  "data": {
    "range": {
      "startDate": "2026-09-15T00:00:00.000Z",
      "endDate": "2026-10-22T00:00:00.000Z"
    },
    "events": []
  }
}
```

---

## 3. Member Booking APIs (15 - 19)

### 15. POST `/api/bookings` — Create Desk Booking
- **Access**: Authenticated (Member)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
```json
{
  "spaceId": "spc-001-uuid",
  "startTime": "2026-10-20T10:00:00.000Z",
  "endTime": "2026-10-20T14:00:00.000Z"
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "message": "Desk booking created successfully",
  "data": {
    "id": "bkg-101-uuid",
    "userId": "e4c9f1a0-3b8c-4d2e-9f1a-0b2c3d4e5f6a",
    "spaceId": "spc-001-uuid",
    "startTime": "2026-10-20T10:00:00.000Z",
    "endTime": "2026-10-20T14:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2026-09-22T02:00:00.000Z",
    "space": {
      "id": "spc-001-uuid",
      "name": "Executive Conference Room A",
      "capacity": 8,
      "pricePerHour": 35.0
    }
  }
}
```

---

### 16. GET `/api/bookings?status=PENDING&page=1` — View Own Bookings
- **Access**: Authenticated (Member)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Member bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "id": "bkg-101-uuid",
        "spaceId": "spc-001-uuid",
        "startTime": "2026-10-20T10:00:00.000Z",
        "endTime": "2026-10-20T14:00:00.000Z",
        "status": "PENDING",
        "space": {
          "name": "Executive Conference Room A"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 17. GET `/api/bookings/:id` — View Booking Details
- **Access**: Authenticated (Member)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Booking details retrieved successfully",
  "data": {
    "id": "bkg-101-uuid",
    "status": "PENDING",
    "startTime": "2026-10-20T10:00:00.000Z",
    "endTime": "2026-10-20T14:00:00.000Z",
    "space": { "name": "Executive Conference Room A" },
    "user": { "name": "Jane Doe", "email": "janedoe@example.com" }
  }
}
```

---

### 18. PATCH `/api/bookings/:id` — Update Booking Time Range
- **Access**: Authenticated (Member)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
```json
{
  "startTime": "2026-10-20T11:00:00.000Z",
  "endTime": "2026-10-20T15:00:00.000Z"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Booking updated successfully",
  "data": {
    "id": "bkg-101-uuid",
    "startTime": "2026-10-20T11:00:00.000Z",
    "endTime": "2026-10-20T15:00:00.000Z",
    "status": "PENDING"
  }
}
```

---

### 19. POST `/api/bookings/:id/cancel` — Cancel Booking
- **Access**: Authenticated (Member)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Booking cancelled successfully",
  "data": {
    "id": "bkg-101-uuid",
    "status": "CANCELLED"
  }
}
```

---

## 4. Admin Space Management APIs (20 - 24)

### 20. POST `/api/admin/spaces` — Create Co-working Space
- **Access**: Authenticated (Admin)
- **Headers**: `Authorization: Bearer <adminToken>`
- **Request Body**:
```json
{
  "name": "Quiet Focus Desk B1",
  "description": "Ergonomic standing desk with dual monitors",
  "capacity": 1,
  "pricePerHour": 12.5
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "message": "Co-working space created successfully",
  "data": {
    "id": "spc-002-uuid",
    "name": "Quiet Focus Desk B1",
    "capacity": 1,
    "pricePerHour": 12.5,
    "isActive": true
  }
}
```

---

### 21. GET `/api/admin/spaces?isActive=true` — Admin List Spaces
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Admin spaces list retrieved successfully",
  "data": {
    "spaces": [
      {
        "id": "spc-002-uuid",
        "name": "Quiet Focus Desk B1",
        "isActive": true
      }
    ]
  }
}
```

---

### 22. GET `/api/admin/spaces/:id` — Admin Space Details & History
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Admin space details & history retrieved successfully",
  "data": {
    "id": "spc-002-uuid",
    "name": "Quiet Focus Desk B1",
    "maintenances": [],
    "bookings": []
  }
}
```

---

### 23. PATCH `/api/admin/spaces/:id` — Edit Space
- **Access**: Authenticated (Admin)
- **Request Body**:
```json
{
  "pricePerHour": 15.0,
  "capacity": 2
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Space updated successfully",
  "data": {
    "id": "spc-002-uuid",
    "pricePerHour": 15.0,
    "capacity": 2
  }
}
```

---

### 24. DELETE `/api/admin/spaces/:id` — Deactivate Space
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Space deactivated successfully"
}
```

---

## 5. Admin Booking Management APIs (25 - 28)

### 25. GET `/api/admin/bookings?status=PENDING` — Admin View All Bookings
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Admin bookings list retrieved successfully",
  "data": {
    "bookings": [
      {
        "id": "bkg-101-uuid",
        "status": "PENDING",
        "space": { "name": "Quiet Focus Desk B1" },
        "user": { "name": "Jane Doe", "email": "janedoe@example.com" }
      }
    ]
  }
}
```

---

### 26. GET `/api/admin/bookings/:id` — Admin Booking Details
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Admin booking details retrieved successfully",
  "data": {
    "id": "bkg-101-uuid",
    "status": "PENDING",
    "user": { "name": "Jane Doe" },
    "space": { "name": "Quiet Focus Desk B1" }
  }
}
```

---

### 27. PATCH `/api/admin/bookings/:id/approve` — Approve Booking
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Booking approved successfully and overlapping pending bookings auto-rejected",
  "data": {
    "id": "bkg-101-uuid",
    "status": "APPROVED"
  }
}
```

---

### 28. PATCH `/api/admin/bookings/:id/reject` — Reject Booking
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Booking rejected successfully",
  "data": {
    "id": "bkg-101-uuid",
    "status": "REJECTED"
  }
}
```

---

## 6. Admin Maintenance Management APIs (29 - 33)

### 29. GET `/api/admin/maintenance` — List Maintenance Windows
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Maintenance records retrieved successfully",
  "data": {
    "records": [
      {
        "id": "mt-001-uuid",
        "spaceId": "spc-001-uuid",
        "startTime": "2026-11-01T08:00:00.000Z",
        "endTime": "2026-11-01T18:00:00.000Z",
        "reason": "HVAC equipment servicing & electrical audit"
      }
    ]
  }
}
```

---

### 30. POST `/api/admin/maintenance` — Schedule Maintenance Window
- **Access**: Authenticated (Admin)
- **Request Body**:
```json
{
  "spaceId": "spc-001-uuid",
  "startTime": "2026-11-01T08:00:00.000Z",
  "endTime": "2026-11-01T18:00:00.000Z",
  "reason": "HVAC equipment servicing & electrical audit"
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "message": "Maintenance window created successfully",
  "data": {
    "id": "mt-001-uuid",
    "spaceId": "spc-001-uuid",
    "reason": "HVAC equipment servicing & electrical audit"
  }
}
```

---

### 31. GET `/api/admin/maintenance/:id` — Maintenance Details
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Maintenance details retrieved successfully",
  "data": {
    "id": "mt-001-uuid",
    "reason": "HVAC equipment servicing & electrical audit"
  }
}
```

---

### 32. PATCH `/api/admin/maintenance/:id` — Update Maintenance
- **Access**: Authenticated (Admin)
- **Request Body**:
```json
{
  "reason": "HVAC servicing extended by 2 hours"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Maintenance window updated successfully"
}
```

---

### 33. DELETE `/api/admin/maintenance/:id` — Delete Maintenance
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Maintenance window deleted successfully"
}
```

---

## 7. Admin User Management APIs (34 - 38)

### 34. GET `/api/admin/users?isActive=true` — List Registered Users
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "usr-001-uuid",
        "name": "Jane Doe",
        "email": "janedoe@example.com",
        "isActive": true
      }
    ]
  }
}
```

---

### 35. GET `/api/admin/users/:id` — Get User Profile & Booking History
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "User details retrieved successfully",
  "data": {
    "id": "usr-001-uuid",
    "name": "Jane Doe",
    "bookings": []
  }
}
```

---

### 36. PATCH `/api/admin/users/:id` — Update User Details
- **Access**: Authenticated (Admin)
- **Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "janesmith@example.com"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "User updated successfully"
}
```

---

### 37. PATCH `/api/admin/users/:id/activate` — Activate User Account
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "User activated successfully"
}
```

---

### 38. PATCH `/api/admin/users/:id/deactivate` — Deactivate User Account
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "User deactivated successfully"
}
```

---

## 8. Admin Role Management APIs (39 - 43)

### 39. GET `/api/admin/roles` — List RBAC Roles
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": "rl-001-uuid",
      "name": "ADMIN",
      "_count": { "users": 1 }
    }
  ]
}
```

---

### 40. POST `/api/admin/roles` — Create Role
- **Access**: Authenticated (Admin)
- **Request Body**:
```json
{
  "name": "FACILITY_MANAGER",
  "description": "Role for managing workspace maintenance and space schedules"
}
```
- **Response `201 Created`**:
```json
{
  "status": "success",
  "message": "Role created successfully",
  "data": {
    "id": "rl-002-uuid",
    "name": "FACILITY_MANAGER"
  }
}
```

---

### 41. GET `/api/admin/roles/:id` — Get Role Details
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Role details retrieved successfully",
  "data": {
    "id": "rl-002-uuid",
    "name": "FACILITY_MANAGER",
    "permissions": [],
    "users": []
  }
}
```

---

### 42. PATCH `/api/admin/roles/:id` — Update Role Name/Description
- **Access**: Authenticated (Admin)
- **Request Body**:
```json
{
  "description": "Updated facility manager role description"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Role updated successfully"
}
```

---

### 43. DELETE `/api/admin/roles/:id` — Delete Role
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Role deleted successfully"
}
```

---

## 9. Admin Permission Management APIs (44 - 46)

### 44. GET `/api/admin/permissions` — List System Permissions
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Permissions retrieved successfully",
  "data": [
    {
      "id": "pm-001-uuid",
      "action": "spaces:create",
      "description": "Allows creating co-working spaces"
    }
  ]
}
```

---

### 45. GET `/api/admin/roles/:id/permissions` — Get Role Permissions
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Role permissions retrieved successfully",
  "data": {
    "role": { "id": "rl-002-uuid", "name": "FACILITY_MANAGER" },
    "permissions": []
  }
}
```

---

### 46. PUT `/api/admin/roles/:id/permissions` — Assign Role Permissions
- **Access**: Authenticated (Admin)
- **Request Body**:
```json
{
  "permissionIds": ["pm-001-uuid"]
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Role permissions updated successfully"
}
```

---

## 10. Admin Dashboard Analytics APIs (47 - 51)

### 47. GET `/api/admin/dashboard/stats` — Dashboard Key Metrics
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "totalUsers": 45,
    "totalSpaces": 12,
    "totalBookings": 128,
    "pendingBookings": 14,
    "approvedBookings": 98,
    "totalMaintenance": 3
  }
}
```

---

### 48. GET `/api/admin/dashboard/bookings` — Recent Bookings Summary
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Dashboard bookings summary retrieved successfully",
  "data": [
    {
      "id": "bkg-101-uuid",
      "status": "APPROVED",
      "space": { "name": "Executive Suite A", "pricePerHour": 35.0 },
      "user": { "name": "Jane Doe", "email": "janedoe@example.com" }
    }
  ]
}
```

---

### 49. GET `/api/admin/dashboard/revenue` — Estimated Revenue Stats
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Dashboard revenue statistics retrieved successfully",
  "data": {
    "approvedBookingsCount": 98,
    "totalEstimatedRevenue": 4350.0,
    "currency": "USD"
  }
}
```

---

### 50. GET `/api/admin/dashboard/activity` — Live Activity Feed
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Dashboard activity feed retrieved successfully",
  "data": {
    "recentBookings": [
      {
        "id": "bkg-101-uuid",
        "activity": "User Jane Doe booked Executive Suite A",
        "status": "PENDING",
        "timestamp": "2026-09-22T02:00:00.000Z"
      }
    ],
    "recentUsers": [
      {
        "id": "usr-001-uuid",
        "activity": "New user registered: Jane Doe (janedoe@example.com)",
        "timestamp": "2026-09-22T01:30:00.000Z"
      }
    ]
  }
}
```

---

### 51. GET `/api/admin/dashboard/booking-trends` — Booking Trend Analytics
- **Access**: Authenticated (Admin)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Booking trends analytics retrieved successfully",
  "data": [
    { "status": "APPROVED", "_count": { "status": 98 } },
    { "status": "PENDING", "_count": { "status": 14 } },
    { "status": "REJECTED", "_count": { "status": 8 } },
    { "status": "CANCELLED", "_count": { "status": 8 } }
  ]
}
```
