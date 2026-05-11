# Logspanx API Documentation

## Overview

This document provides comprehensive API documentation for the Logspanx time tracking application backend. The API is built with NestJS and follows RESTful conventions.

### Base URL
```
http://localhost:8000
```

### Authentication
All endpoints except public shared reports require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Refresh tokens are handled via HTTP-only cookies. Use the `/auth/refresh` endpoint to obtain new access tokens.

### Response Format
All responses follow a consistent structure:
```json
{
  "success": true,
  "message": "Optional message",
  "data": "Response data or null"
}
```

### Roles and Permissions
The application uses role-based access control with the following hierarchy:
- **OWNER**: Full access to all resources
- **ADMIN**: Administrative access, can manage users and resources
- **GROUP_LEAD**: Can manage projects, teams, and group members
- **MEMBER**: Basic user access for time tracking and personal data

---

## Table of Contents

- [App](#app)
- [Authentication](#authentication)
- [Clients](#clients)
- [Groups](#groups)
- [Projects](#projects)
- [Reports](#reports)
- [Shared Reports](#shared-reports)
- [Public Shared Reports](#public-shared-reports)
- [Tags](#tags)
- [Tasks](#tasks)
- [Teams](#teams)
- [Time Entries](#time-entries)
- [Users](#users)

---

## App

### GET /

Get application health check.

**Response:**
```json
{
  "success": true,
  "data": "Logspanx API is running"
}
```

---

## Authentication

### POST /auth/signup

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2N2E5ZjA3ZjFmMjQ0ZjEwMDAwMDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6Im1lbWJlcjoiLCJpYXQiOjE2ODQ4MzYwMDAsImV4cCI6MTY4NDgzOTYwMH0.signature",
    "user": {
      "id": "67a9f07f1f244f1000000000",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "member",
      "avatar": null
    }
  }
}
```

### POST /auth/login

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2N2E5ZjA3ZjFmMjQ0ZjEwMDAwMDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6Im1lbWJlcjoiLCJpYXQiOjE2ODQ4MzYwMDAsImV4cCI6MTY4NDgzOTYwMH0.signature",
    "user": {
      "id": "67a9f07f1f244f1000000000",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "member",
      "avatar": null
    }
  }
}
```

### POST /auth/logout

Logout user and invalidate refresh token.

**Request Body (optional):**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body (optional):**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2N2E5ZjA3ZjFmMjQ0ZjEwMDAwMDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6Im1lbWJlcjoiLCJpYXQiOjE2ODQ4MzYwMDAsImV4cCI6MTY4NDgzOTYwMH0.signature",
    "user": {
      "id": "67a9f07f1f244f1000000000",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "member",
      "avatar": null
    }
  }
}
```

### POST /auth/accept-invite

Accept user invitation and create account.

**Request Body:**
```json
{
  "token": "invitation_token_here",
  "name": "Jane Smith",
  "password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2N2E5ZjA3ZjFmMjQ0ZjEwMDAwMDAwMDAiLCJlbWFpbCI6ImphbmUuc21pdGhAZXhhbXBsZS5jb20iLCJyb2xlIjoibWVtYmVyIiwiaWF0IjoxNjg0ODM2MDAwLCJleHAiOjE2ODQ4Mzk2MDB9.signature",
    "user": {
      "id": "67a9f07f1f244f1000000001",
      "email": "jane.smith@example.com",
      "name": "Jane Smith",
      "role": "member",
      "avatar": null
    }
  }
}
```

### POST /auth/forgot-password

Request password reset link.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reset link sent",
  "data": null
}
```

### POST /auth/reset-password

Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated",
  "data": null
}
```

### GET /auth/me

Get current user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67a9f07f1f244f1000000000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "member",
    "avatar": "https://example.com/avatar.jpg",
    "timezone": "America/New_York",
    "isActive": true,
    "billableRate": 50,
    "group": "Development Team",
    "archived": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  }
}
```

### PUT /auth/me

Update current user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/new-avatar.jpg",
  "timezone": "Europe/London"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "id": "67a9f07f1f244f1000000000",
    "email": "john.doe@example.com",
    "name": "John Smith",
    "role": "member",
    "avatar": "https://example.com/new-avatar.jpg",
    "timezone": "Europe/London",
    "isActive": true,
    "billableRate": 50,
    "group": "Development Team",
    "archived": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

### PUT /auth/me/password

Change current user password.

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed",
  "data": null
}
```

---

## Clients

### GET /clients

Get all clients with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `isActive` (boolean, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "67a9f07f1f244f1000000002",
        "name": "Acme Corporation",
        "email": "contact@acme.com",
        "phone": "+1-555-0123",
        "address": "123 Business St, City, State 12345",
        "isActive": true,
        "createdAt": "2024-01-10T09:00:00.000Z",
        "updatedAt": "2024-01-10T09:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### POST /clients

Create a new client.

**Required Roles:** owner, admin, group_lead

**Request Body:**
```json
{
  "name": "Tech Solutions Inc",
  "email": "hello@techsolutions.com",
  "phone": "+1-555-0456",
  "address": "456 Tech Ave, Silicon Valley, CA 94043"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client created",
  "data": {
    "id": "67a9f07f1f244f1000000003",
    "name": "Tech Solutions Inc",
    "email": "hello@techsolutions.com",
    "phone": "+1-555-0456",
    "address": "456 Tech Ave, Silicon Valley, CA 94043",
    "isActive": true,
    "createdAt": "2024-01-22T11:30:00.000Z",
    "updatedAt": "2024-01-22T11:30:00.000Z"
  }
}
```

### PUT /clients/:id

Update an existing client.

**Required Roles:** owner, admin, group_lead

**Request Body:**
```json
{
  "name": "Tech Solutions LLC",
  "email": "contact@techsolutions.com",
  "phone": "+1-555-0456",
  "address": "456 Tech Avenue, Silicon Valley, CA 94043"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67a9f07f1f244f1000000003",
    "name": "Tech Solutions LLC",
    "email": "contact@techsolutions.com",
    "phone": "+1-555-0456",
    "address": "456 Tech Avenue, Silicon Valley, CA 94043",
    "isActive": true,
    "createdAt": "2024-01-22T11:30:00.000Z",
    "updatedAt": "2024-01-22T12:00:00.000Z"
  }
}
```

### DELETE /clients/:id

Delete a client.

**Required Roles:** owner, admin, group_lead

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

## Groups

### GET /groups

Get all groups.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "67a9f07f1f244f1000000004",
      "name": "Development Team",
      "leadId": "67a9f07f1f244f1000000000",
      "memberIds": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001"],
      "createdAt": "2024-01-05T08:00:00.000Z",
      "updatedAt": "2024-01-05T08:00:00.000Z"
    }
  ]
}
```

### GET /groups/:id

Get a specific group by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67a9f07f1f244f1000000004",
    "name": "Development Team",
    "leadId": "67a9f07f1f244f1000000000",
    "memberIds": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001"],
    "createdAt": "2024-01-05T08:00:00.000Z",
    "updatedAt": "2024-01-05T08:00:00.000Z"
  }
}
```

### POST /groups

Create a new group.

**Required Roles:** owner, admin, group_lead

**Request Body:**
```json
{
  "name": "Design Team",
  "leadId": "67a9f07f1f244f1000000001",
  "memberIds": ["67a9f07f1f244f1000000001", "67a9f07f1f244f1000000005"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group created",
  "data": {
    "id": "67a9f07f1f244f1000000006",
    "name": "Design Team",
    "leadId": "67a9f07f1f244f1000000001",
    "memberIds": ["67a9f07f1f244f1000000001", "67a9f07f1f244f1000000005"],
    "createdAt": "2024-01-25T10:15:00.000Z",
    "updatedAt": "2024-01-25T10:15:00.000Z"
  }
}
```

### PUT /groups/:id

Update an existing group.

**Required Roles:** owner, admin, group_lead

**Request Body:**
```json
{
  "name": "Frontend Development Team",
  "leadId": "67a9f07f1f244f1000000000",
  "memberIds": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001", "67a9f07f1f244f1000000005"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group updated",
  "data": {
    "id": "67a9f07f1f244f1000000004",
    "name": "Frontend Development Team",
    "leadId": "67a9f07f1f244f1000000000",
    "memberIds": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001", "67a9f07f1f244f1000000005"],
    "createdAt": "2024-01-05T08:00:00.000Z",
    "updatedAt": "2024-01-25T11:00:00.000Z"
  }
}
```

### DELETE /groups/:id

Delete a group.

**Required Roles:** owner, admin

**Response:**
```json
{
  "success": true,
  "message": "Group deleted",
  "data": null
}
```

---

## Projects

### POST /projects

Create a new project.

**Required Roles:** owner, admin, group_lead

**Request Body:**
```json
{
  "name": "E-commerce Platform",
  "color": "#3B82F6",
  "leadId": "67a9f07f1f244f1000000000",
  "clientName": "Retail Corp",
  "billable": true,
  "members": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created",
  "data": {
    "id": "67a9f07f1f244f1000000007",
    "name": "E-commerce Platform",
    "color": "#3B82F6",
    "leadId": "67a9f07f1f244f1000000000",
    "clientName": "Retail Corp",
    "billable": true,
    "archived": false,
    "members": [
      {
        "userId": "67a9f07f1f244f1000000000",
        "role": "lead",
        "hourlyRate": 75
      },
      {
        "userId": "67a9f07f1f244f1000000001",
        "role": "member",
        "hourlyRate": 50
      }
    ],
    "createdAt": "2024-01-20T13:45:00.000Z",
    "updatedAt": "2024-01-20T13:45:00.000Z"
  }
}
```

### GET /projects

Get all projects with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [
      {
        "id": "67a9f07f1f244f1000000007",
        "name": "E-commerce Platform",
        "color": "#3B82F6",
        "leadId": "67a9f07f1f244f1000000000",
        "clientName": "Retail Corp",
        "billable": true,
        "archived": false,
        "members": [
          {
            "userId": "67a9f07f1f244f1000000000",
            "role": "lead",
            "hourlyRate": 75
          }
        ],
        "createdAt": "2024-01-20T13:45:00.000Z",
        "updatedAt": "2024-01-20T13:45:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### GET /projects/:id

Get a specific project with tasks.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67a9f07f1f244f1000000007",
    "name": "E-commerce Platform",
    "color": "#3B82F6",
    "leadId": "67a9f07f1f244f1000000000",
    "clientName": "Retail Corp",
    "billable": true,
    "archived": false,
    "members": [
      {
        "userId": "67a9f07f1f244f1000000000",
        "role": "lead",
        "hourlyRate": 75
      }
    ],
    "tasks": [
      {
        "id": "67a9f07f1f244f1000000008",
        "name": "Implement user authentication",
        "completed": false,
        "assignees": ["67a9f07f1f244f1000000000"],
        "createdAt": "2024-01-21T09:30:00.000Z",
        "updatedAt": "2024-01-21T09:30:00.000Z"
      }
    ],
    "createdAt": "2024-01-20T13:45:00.000Z",
    "updatedAt": "2024-01-20T13:45:00.000Z"
  }
}
```

### GET /projects/:id/members

Get project members.

**Response:**
```json
{
  "success": true,
  "message": "Project members retrieved successfully",
  "data": [
    {
      "id": "67a9f07f1f244f1000000000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "lead",
      "hourlyRate": 75,
      "avatar": null
    }
  ]
}
```

### PATCH /projects/:id

Update a project.

**Required Roles:** owner, admin, group_lead

**Request Body:**
```json
{
  "name": "Advanced E-commerce Platform",
  "color": "#10B981",
  "clientName": "Retail Corporation",
  "billable": true,
  "archived": false,
  "members": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "67a9f07f1f244f1000000007",
    "name": "Advanced E-commerce Platform",
    "color": "#10B981",
    "leadId": "67a9f07f1f244f1000000000",
    "clientName": "Retail Corporation",
    "billable": true,
    "archived": false,
    "members": [
      {
        "userId": "67a9f07f1f244f1000000000",
        "role": "lead",
        "hourlyRate": 75
      },
      {
        "userId": "67a9f07f1f244f1000000001",
        "role": "member",
        "hourlyRate": 50
      }
    ],
    "createdAt": "2024-01-20T13:45:00.000Z",
    "updatedAt": "2024-01-22T16:20:00.000Z"
  }
}
```

### PUT /projects/bulk

Bulk update multiple projects.

**Required Roles:** owner, admin, group_lead

**Request Body:**
```json
{
  "ids": ["67a9f07f1f244f1000000007", "67a9f07f1f244f1000000009"],
  "updates": {
    "archived": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Projects updated",
  "data": [
    {
      "id": "67a9f07f1f244f1000000007",
      "name": "Advanced E-commerce Platform",
      "archived": true,
      "updatedAt": "2024-01-25T10:30:00.000Z"
    }
  ]
}
```

### DELETE /projects/:id

Delete a project.

**Required Roles:** owner, admin, group_lead

**Response:**
```json
{
  "success": true,
  "message": "Project deleted",
  "data": null
}
```

### PATCH /projects/:id/archive

Archive or unarchive a project.

**Required Roles:** owner, admin, group_lead

**Response:**
```json
{
  "success": true,
  "message": "Project archived successfully",
  "data": {
    "id": "67a9f07f1f244f1000000007",
    "name": "Advanced E-commerce Platform",
    "archived": true,
    "updatedAt": "2024-01-25T10:30:00.000Z"
  }
}
```

### PATCH /projects/:id/lead

Update project lead.

**Required Roles:** owner, admin

**Request Body:**
```json
{
  "leadUserId": "67a9f07f1f244f1000000001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project lead updated",
  "data": {
    "id": "67a9f07f1f244f1000000007",
    "name": "Advanced E-commerce Platform",
    "leadId": "67a9f07f1f244f1000000001",
    "updatedAt": "2024-01-25T11:15:00.000Z"
  }
}
```

### POST /projects/:id/members

Add a member to project.

**Required Roles:** owner, admin, group_lead

**Request Body:**
```json
{
  "userId": "67a9f07f1f244f1000000005",
  "role": "member",
  "hourlyRate": 45
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member assigned",
  "data": {
    "id": "67a9f07f1f244f1000000007",
    "name": "Advanced E-commerce Platform",
    "members": [
      {
        "userId": "67a9f07f1f244f1000000000",
        "role": "lead",
        "hourlyRate": 75
      },
      {
        "userId": "67a9f07f1f244f1000000005",
        "role": "member",
        "hourlyRate": 45
      }
    ],
    "updatedAt": "2024-01-25T12:00:00.000Z"
  }
}
```

### DELETE /projects/:id/members/:userId

Remove a member from project.

**Required Roles:** owner, admin, group_lead

**Response:**
```json
{
  "success": true,
  "message": "Member unassigned",
  "data": {
    "id": "67a9f07f1f244f1000000007",
    "name": "Advanced E-commerce Platform",
    "members": [
      {
        "userId": "67a9f07f1f244f1000000000",
        "role": "lead",
        "hourlyRate": 75
      }
    ],
    "updatedAt": "2024-01-25T12:30:00.000Z"
  }
}
```

---

## Reports

### GET /reports/summary

Generate summary report.

**Query Parameters:**
- `startDate` (string, optional) - ISO date string
- `endDate` (string, optional) - ISO date string
- `projectId` (string, optional)
- `userId` (string, optional)
- `billable` (boolean, optional)
- `tagId` (string, optional)
- `teamId` (string, optional)
- `description` (string, optional)
- `page` (number, default: 1)

**Response:**
```json
{
  "success": true,
  "message": "Summary report generated successfully",
  "data": {
    "totalHours": 42.5,
    "billableHours": 38.0,
    "totalProjects": 3,
    "totalUsers": 5,
    "averageHourlyRate": 62.5,
    "totalRevenue": 2375.00,
    "entries": [
      {
        "date": "2024-01-22",
        "hours": 8.5,
        "billableHours": 8.0,
        "revenue": 500.00
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### GET /reports/weekly

Generate weekly report.

**Query Parameters:**
- `startDate` (string, optional)
- `endDate` (string, optional)
- `projectId` (string, optional)
- `userId` (string, optional)
- `billable` (boolean, optional)
- `tagId` (string, optional)
- `teamId` (string, optional)
- `description` (string, optional)
- `page` (number, default: 1)
- `groupBy` (string, optional) - "project" or "user"

**Response:**
```json
{
  "success": true,
  "message": "Weekly report generated successfully",
  "data": {
    "weeks": [
      {
        "week": "2024-W04",
        "startDate": "2024-01-22",
        "endDate": "2024-01-28",
        "totalHours": 40.0,
        "billableHours": 35.0,
        "projects": [
          {
            "projectId": "67a9f07f1f244f1000000007",
            "projectName": "E-commerce Platform",
            "hours": 25.0,
            "billableHours": 25.0
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### GET /reports/by-project

Generate report grouped by project.

**Query Parameters:** Same as summary report

**Response:**
```json
{
  "success": true,
  "message": "Project report generated successfully",
  "data": {
    "projects": [
      {
        "projectId": "67a9f07f1f244f1000000007",
        "projectName": "E-commerce Platform",
        "color": "#3B82F6",
        "totalHours": 25.0,
        "billableHours": 25.0,
        "revenue": 1875.00,
        "users": [
          {
            "userId": "67a9f07f1f244f1000000000",
            "userName": "John Doe",
            "hours": 15.0
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### GET /reports/by-user

Generate report grouped by user.

**Query Parameters:** Same as summary report

**Response:**
```json
{
  "success": true,
  "message": "User report generated successfully",
  "data": {
    "users": [
      {
        "userId": "67a9f07f1f244f1000000000",
        "userName": "John Doe",
        "totalHours": 42.5,
        "billableHours": 38.0,
        "revenue": 2375.00,
        "projects": [
          {
            "projectId": "67a9f07f1f244f1000000007",
            "projectName": "E-commerce Platform",
            "hours": 25.0
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### GET /reports/by-tag

Generate report grouped by tag.

**Query Parameters:** Same as summary report

**Response:**
```json
{
  "success": true,
  "message": "Tag report generated successfully",
  "data": {
    "tags": [
      {
        "tagId": "67a9f07f1f244f1000000010",
        "tagName": "Frontend",
        "color": "#EF4444",
        "totalHours": 18.5,
        "billableHours": 18.5,
        "revenue": 1156.25,
        "entries": [
          {
            "date": "2024-01-22",
            "hours": 8.5,
            "description": "Implement responsive design"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## Shared Reports

### POST /shared-reports

Create a shared report.

**Request Body:**
```json
{
  "name": "Weekly Team Report",
  "isPublic": true,
  "reportType": "weekly",
  "filters": {
    "startDate": "2024-01-15",
    "endDate": "2024-01-21",
    "projectId": "67a9f07f1f244f1000000007"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shared report created successfully",
  "data": {
    "id": "67a9f07f1f244f1000000011",
    "name": "Weekly Team Report",
    "token": "abc123def456ghi789jkl",
    "isPublic": true,
    "reportType": "weekly",
    "filters": {
      "startDate": "2024-01-15",
      "endDate": "2024-01-21",
      "projectId": "67a9f07f1f244f1000000007"
    },
    "createdBy": "67a9f07f1f244f1000000000",
    "createdAt": "2024-01-22T14:30:00.000Z",
    "updatedAt": "2024-01-22T14:30:00.000Z"
  }
}
```

### GET /shared-reports

Get all shared reports for current user.

**Response:**
```json
{
  "success": true,
  "message": "Shared reports retrieved successfully",
  "data": [
    {
      "id": "67a9f07f1f244f1000000011",
      "name": "Weekly Team Report",
      "token": "abc123def456ghi789jkl",
      "isPublic": true,
      "reportType": "weekly",
      "filters": {
        "startDate": "2024-01-15",
        "endDate": "2024-01-21"
      },
      "createdBy": "67a9f07f1f244f1000000000",
      "createdAt": "2024-01-22T14:30:00.000Z",
      "updatedAt": "2024-01-22T14:30:00.000Z"
    }
  ]
}
```

### DELETE /shared-reports/:id

Delete a shared report.

**Response:**
```json
{
  "success": true,
  "message": "Shared report deleted successfully",
  "data": {}
}
```

---

## Public Shared Reports

### GET /shared/:token

Get public shared report data.

**Response:**
```json
{
  "success": true,
  "message": "Shared report retrieved successfully",
  "data": {
    "report": {
      "type": "weekly",
      "title": "Weekly Team Report",
      "generatedAt": "2024-01-22T15:00:00.000Z",
      "data": {
        "weeks": [
          {
            "week": "2024-W03",
            "startDate": "2024-01-15",
            "endDate": "2024-01-21",
            "totalHours": 38.5,
            "billableHours": 35.0
          }
        ]
      }
    }
  }
}
```

---

## Tags

### POST /tags

Create a new tag.

**Request Body:**
```json
{
  "name": "Backend",
  "color": "#8B5CF6"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tag created successfully",
  "data": {
    "id": "67a9f07f1f244f1000000012",
    "name": "Backend",
    "color": "#8B5CF6",
    "archived": false,
    "createdBy": "67a9f07f1f244f1000000000",
    "createdAt": "2024-01-18T10:45:00.000Z",
    "updatedAt": "2024-01-18T10:45:00.000Z"
  }
}
```

### GET /tags

Get all tags with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Tags retrieved successfully",
  "data": {
    "tags": [
      {
        "id": "67a9f07f1f244f1000000010",
        "tagName": "Frontend",
        "color": "#EF4444",
        "archived": false,
        "createdBy": "67a9f07f1f244f1000000000",
        "createdAt": "2024-01-15T09:20:00.000Z",
        "updatedAt": "2024-01-15T09:20:00.000Z"
      },
      {
        "id": "67a9f07f1f244f1000000012",
        "tagName": "Backend",
        "color": "#8B5CF6",
        "archived": false,
        "createdBy": "67a9f07f1f244f1000000000",
        "createdAt": "2024-01-18T10:45:00.000Z",
        "updatedAt": "2024-01-18T10:45:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### PATCH /tags/:id

Update a tag.

**Request Body:**
```json
{
  "name": "Backend Development",
  "color": "#7C3AED",
  "archived": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tag updated successfully",
  "data": {
    "id": "67a9f07f1f244f1000000012",
    "name": "Backend Development",
    "color": "#7C3AED",
    "archived": false,
    "createdBy": "67a9f07f1f244f1000000000",
    "createdAt": "2024-01-18T10:45:00.000Z",
    "updatedAt": "2024-01-22T16:10:00.000Z"
  }
}
```

### DELETE /tags/:id

Delete a tag.

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

## Tasks

### GET /projects/:projectId/tasks

Get all tasks for a project.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "67a9f07f1f244f1000000008",
      "name": "Implement user authentication",
      "completed": false,
      "assignees": ["67a9f07f1f244f1000000000"],
      "createdAt": "2024-01-21T09:30:00.000Z",
      "updatedAt": "2024-01-21T09:30:00.000Z"
    },
    {
      "id": "67a9f07f1f244f1000000013",
      "name": "Design database schema",
      "completed": true,
      "assignees": ["67a9f07f1f244f1000000001"],
      "createdAt": "2024-01-21T11:15:00.000Z",
      "updatedAt": "2024-01-22T14:20:00.000Z"
    }
  ]
}
```

### POST /projects/:projectId/tasks

Create a new task.

**Required Roles:** owner, admin, group_lead

**Request Body:**
```json
{
  "name": "Setup CI/CD pipeline",
  "completed": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67a9f07f1f244f1000000014",
    "name": "Setup CI/CD pipeline",
    "completed": false,
    "assignees": [],
    "createdAt": "2024-01-23T08:45:00.000Z",
    "updatedAt": "2024-01-23T08:45:00.000Z"
  }
}
```

### PATCH /tasks/:id

Update a task.

**Request Body:**
```json
{
  "name": "Setup CI/CD pipeline with automated testing",
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67a9f07f1f244f1000000014",
    "name": "Setup CI/CD pipeline with automated testing",
    "completed": true,
    "assignees": ["67a9f07f1f244f1000000000"],
    "createdAt": "2024-01-23T08:45:00.000Z",
    "updatedAt": "2024-01-23T16:30:00.000Z"
  }
}
```

### PATCH /tasks/:id/assignees

Update task assignees.

**Request Body:**
```json
{
  "assignees": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assignees updated",
  "data": {
    "id": "67a9f07f1f244f1000000014",
    "name": "Setup CI/CD pipeline with automated testing",
    "completed": true,
    "assignees": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001"],
    "createdAt": "2024-01-23T08:45:00.000Z",
    "updatedAt": "2024-01-23T17:00:00.000Z"
  }
}
```

### DELETE /tasks/:id

Delete a task.

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

## Teams

### GET /teams

Get all teams with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Teams retrieved successfully",
  "data": {
    "teams": [
      {
        "id": "67a9f07f1f244f1000000015",
        "name": "Development Team",
        "members": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001"],
        "createdBy": "67a9f07f1f244f1000000000",
        "createdAt": "2024-01-10T08:30:00.000Z",
        "updatedAt": "2024-01-10T08:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### GET /teams/:id

Get a specific team by ID.

**Response:**
```json
{
  "success": true,
  "message": "Team retrieved successfully",
  "data": {
    "id": "67a9f07f1f244f1000000015",
    "name": "Development Team",
    "members": ["67a9f07f1f244f1000000000", "67a9f07f1f244f1000000001"],
    "createdBy": "67a9f07f1f244f1000000000",
    "createdAt": "2024-01-10T08:30:00.000Z",
    "updatedAt": "2024-01-10T08:30:00.000Z"
  }
}
```

### GET /teams/:id/members

Get team members.

**Response:**
```json
{
  "success": true,
  "message": "Team members retrieved successfully",
  "data": [
    {
      "id": "67a9f07f1f244f1000000000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "member",
      "avatar": null
    },
    {
      "id": "67a9f07f1f244f1000000001",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "member",
      "avatar": "https://example.com/avatar2.jpg"
    }
  ]
}
```

### POST /teams

Create a new team.

**Required Roles:** owner, group_lead

**Request Body:**
```json
{
  "name": "Design Team",
  "members": ["67a9f07f1f244f1000000005", "67a9f07f1f244f1000000006"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Team created successfully",
  "data": {
    "id": "67a9f07f1f244f1000000016",
    "name": "Design Team",
    "members": ["67a9f07f1f244f1000000005", "67a9f07f1f244f1000000006"],
    "createdBy": "67a9f07f1f244f1000000000",
    "createdAt": "2024-01-24T09:15:00.000Z",
    "updatedAt": "2024-01-24T09:15:00.000Z"
  }
}
```

### PATCH /teams/:id

Update a team.

**Required Roles:** owner, group_lead

**Request Body:**
```json
{
  "name": "UI/UX Design Team",
  "members": ["67a9f07f1f244f1000000005", "67a9f07f1f244f1000000006", "67a9f07f1f244f1000000007"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Team updated successfully",
  "data": {
    "id": "67a9f07f1f244f1000000016",
    "name": "UI/UX Design Team",
    "members": ["67a9f07f1f244f1000000005", "67a9f07f1f244f1000000006", "67a9f07f1f244f1000000007"],
    "createdBy": "67a9f07f1f244f1000000000",
    "createdAt": "2024-01-24T09:15:00.000Z",
    "updatedAt": "2024-01-24T14:45:00.000Z"
  }
}
```

### DELETE /teams/:id

Delete a team.

**Required Roles:** owner

**Response:**
```json
{
  "success": true,
  "message": "Team deleted successfully",
  "data": {}
}
```

### POST /teams/:id/members

Add a member to team.

**Required Roles:** owner, group_lead

**Request Body:**
```json
{
  "userId": "67a9f07f1f244f1000000008"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member added to team successfully",
  "data": {
    "id": "67a9f07f1f244f1000000016",
    "name": "UI/UX Design Team",
    "members": ["67a9f07f1f244f1000000005", "67a9f07f1f244f1000000006", "67a9f07f1f244f1000000007", "67a9f07f1f244f1000000008"],
    "updatedAt": "2024-01-24T15:30:00.000Z"
  }
}
```

### DELETE /teams/:id/members/:userId

Remove a member from team.

**Required Roles:** owner, group_lead

**Response:**
```json
{
  "success": true,
  "message": "Member removed from team successfully",
  "data": {}
}
```

---

## Time Entries

### POST /time-entries

Create a new time entry.

**Request Body:**
```json
{
  "projectId": "67a9f07f1f244f1000000007",
  "taskId": "67a9f07f1f244f1000000008",
  "description": "Working on user authentication module",
  "startTime": "2024-01-22T09:00:00.000Z",
  "endTime": "2024-01-22T12:30:00.000Z",
  "billable": true,
  "tagIds": ["67a9f07f1f244f1000000012"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Time entry created successfully",
  "data": {
    "id": "67a9f07f1f244f1000000017",
    "userId": "67a9f07f1f244f1000000000",
    "projectId": "67a9f07f1f244f1000000007",
    "taskId": "67a9f07f1f244f1000000008",
    "description": "Working on user authentication module",
    "startTime": "2024-01-22T09:00:00.000Z",
    "endTime": "2024-01-22T12:30:00.000Z",
    "duration": 3.5,
    "billable": true,
    "tagIds": ["67a9f07f1f244f1000000012"],
    "createdAt": "2024-01-22T12:35:00.000Z",
    "updatedAt": "2024-01-22T12:35:00.000Z"
  }
}
```

### GET /time-entries

Get all time entries with filtering and pagination.

**Query Parameters:**
- `startDate` (string, optional)
- `endDate` (string, optional)
- `projectId` (string, optional)
- `userId` (string, optional)
- `billable` (boolean, optional)
- `tagId` (string, optional)
- `isRunning` (boolean, optional)
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Time entries retrieved successfully",
  "data": {
    "entries": [
      {
        "id": "67a9f07f1f244f1000000017",
        "userId": "67a9f07f1f244f1000000000",
        "projectId": "67a9f07f1f244f1000000007",
        "taskId": "67a9f07f1f244f1000000008",
        "description": "Working on user authentication module",
        "startTime": "2024-01-22T09:00:00.000Z",
        "endTime": "2024-01-22T12:30:00.000Z",
        "duration": 3.5,
        "billable": true,
        "tagIds": ["67a9f07f1f244f1000000012"],
        "createdAt": "2024-01-22T12:35:00.000Z",
        "updatedAt": "2024-01-22T12:35:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### GET /time-entries/running

Get the currently running time entry.

**Response:**
```json
{
  "success": true,
  "message": "Running entry retrieved successfully",
  "data": {
    "id": "67a9f07f1f244f1000000018",
    "userId": "67a9f07f1f244f1000000000",
    "projectId": "67a9f07f1f244f1000000007",
    "description": "Code review and testing",
    "startTime": "2024-01-23T14:15:00.000Z",
    "endTime": null,
    "duration": null,
    "billable": true,
    "isRunning": true,
    "createdAt": "2024-01-23T14:15:00.000Z",
    "updatedAt": "2024-01-23T14:15:00.000Z"
  }
}
```

### POST /time-entries/start

Start a new timer.

**Request Body:**
```json
{
  "projectId": "67a9f07f1f244f1000000007",
  "description": "Implementing payment integration"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timer started successfully",
  "data": {
    "id": "67a9f07f1f244f1000000019",
    "userId": "67a9f07f1f244f1000000000",
    "projectId": "67a9f07f1f244f1000000007",
    "description": "Implementing payment integration",
    "startTime": "2024-01-23T16:45:00.000Z",
    "endTime": null,
    "duration": null,
    "billable": true,
    "isRunning": true,
    "createdAt": "2024-01-23T16:45:00.000Z",
    "updatedAt": "2024-01-23T16:45:00.000Z"
  }
}
```

### PATCH /time-entries/stop

Stop the currently running timer.

**Response:**
```json
{
  "success": true,
  "message": "Timer stopped successfully",
  "data": {
    "id": "67a9f07f1f244f1000000019",
    "userId": "67a9f07f1f244f1000000000",
    "projectId": "67a9f07f1f244f1000000007",
    "description": "Implementing payment integration",
    "startTime": "2024-01-23T16:45:00.000Z",
    "endTime": "2024-01-23T18:20:00.000Z",
    "duration": 1.58,
    "billable": true,
    "isRunning": false,
    "createdAt": "2024-01-23T16:45:00.000Z",
    "updatedAt": "2024-01-23T18:20:00.000Z"
  }
}
```

### GET /time-entries/:id

Get a specific time entry by ID.

**Response:**
```json
{
  "success": true,
  "message": "Time entry retrieved successfully",
  "data": {
    "id": "67a9f07f1f244f1000000017",
    "userId": "67a9f07f1f244f1000000000",
    "projectId": "67a9f07f1f244f1000000007",
    "taskId": "67a9f07f1f244f1000000008",
    "description": "Working on user authentication module",
    "startTime": "2024-01-22T09:00:00.000Z",
    "endTime": "2024-01-22T12:30:00.000Z",
    "duration": 3.5,
    "billable": true,
    "tagIds": ["67a9f07f1f244f1000000012"],
    "createdAt": "2024-01-22T12:35:00.000Z",
    "updatedAt": "2024-01-22T12:35:00.000Z"
  }
}
```

### PATCH /time-entries/:id

Update a time entry.

**Request Body:**
```json
{
  "description": "Working on user authentication and authorization module",
  "endTime": "2024-01-22T13:15:00.000Z",
  "billable": true,
  "tagIds": ["67a9f07f1f244f1000000012", "67a9f07f1f244f1000000010"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Time entry updated successfully",
  "data": {
    "id": "67a9f07f1f244f1000000017",
    "userId": "67a9f07f1f244f1000000000",
    "projectId": "67a9f07f1f244f1000000007",
    "taskId": "67a9f07f1f244f1000000008",
    "description": "Working on user authentication and authorization module",
    "startTime": "2024-01-22T09:00:00.000Z",
    "endTime": "2024-01-22T13:15:00.000Z",
    "duration": 4.25,
    "billable": true,
    "tagIds": ["67a9f07f1f244f1000000012", "67a9f07f1f244f1000000010"],
    "createdAt": "2024-01-22T12:35:00.000Z",
    "updatedAt": "2024-01-22T13:20:00.000Z"
  }
}
```

### DELETE /time-entries/bulk

Bulk delete time entries.

**Request Body:**
```json
{
  "ids": ["67a9f07f1f244f1000000017", "67a9f07f1f244f1000000020"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Time entries deleted successfully",
  "data": {}
}
```

### DELETE /time-entries/:id

Delete a time entry.

**Response:**
```json
{
  "success": true,
  "message": "Time entry deleted successfully",
  "data": {}
}
```

---

## Users

### GET /users

Get all users with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "67a9f07f1f244f1000000000",
        "email": "john.doe@example.com",
        "name": "John Doe",
        "role": "member",
        "avatar": null,
        "timezone": "America/New_York",
        "isActive": true,
        "billableRate": 50,
        "group": "Development Team",
        "archived": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:45:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### GET /users/:id

Get a specific user by ID.

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "67a9f07f1f244f1000000000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "member",
    "avatar": null,
    "timezone": "America/New_York",
    "isActive": true,
    "billableRate": 50,
    "group": "Development Team",
    "archived": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  }
}
```

### PATCH /users/:id/role

Update user role.

**Request Body:**
```json
{
  "role": "group_lead"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "67a9f07f1f244f1000000000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "group_lead",
    "avatar": null,
    "timezone": "America/New_York",
    "isActive": true,
    "billableRate": 50,
    "group": "Development Team",
    "archived": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-25T09:30:00.000Z"
  }
}
```

### POST /users/invite

Invite users to join the organization.

**Request Body:**
```json
{
  "emails": ["new.user@example.com", "another.user@example.com"],
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invited 2 user(s), skipped 0 already registered",
  "data": {
    "invited": [
      {
        "email": "new.user@example.com",
        "role": "member",
        "token": "inv123token456"
      },
      {
        "email": "another.user@example.com",
        "role": "member",
        "token": "inv789token012"
      }
    ],
    "skipped": []
  }
}
```

### PUT /users/:id

Update user information.

**Request Body:**
```json
{
  "billableRate": 65,
  "group": "Senior Development Team",
  "archived": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated",
  "data": {
    "id": "67a9f07f1f244f1000000000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "group_lead",
    "avatar": null,
    "timezone": "America/New_York",
    "isActive": true,
    "billableRate": 65,
    "group": "Senior Development Team",
    "archived": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-25T10:15:00.000Z"
  }
}
```

### PATCH /users/:id/status

Toggle user active status.

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated",
  "data": {
    "id": "67a9f07f1f244f1000000000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "group_lead",
    "avatar": null,
    "timezone": "America/New_York",
    "isActive": false,
    "billableRate": 65,
    "group": "Senior Development Team",
    "archived": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-25T10:30:00.000Z"
  }
}
```

### DELETE /users/:id

Delete a user.

**Required Roles:** owner

**Response:**
```json
{
  "success": true,
  "message": "User removed",
  "data": null
}
```

---

*This documentation was generated for Logspanx API v1.0. For support or questions, please contact the development team.*