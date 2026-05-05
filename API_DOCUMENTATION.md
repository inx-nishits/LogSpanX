# Trackify API Documentation

**Project:** Trackify - Time Tracking & Productivity Management  
**Version:** 0.1.0  
**Base URL:** `https://api.trackify.com/v1`  
**Authentication:** Bearer Token (JWT)

---

## 📊 API Summary

| Category | Endpoint Count |
|----------|----------------|
| Authentication | 4 |
| Time Entries | 9 |
| Projects | 6 |
| Users | 5 |
| Tasks | 5 |
| Tags | 4 |
| Clients | 4 |
| Reports | 4 |
| Team & Workspace | 6 |
| **Total APIs** | **47** |

---

# 1. AUTHENTICATION (4 APIs)

## 1.1 User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "member",
      "workspaceId": "workspace_1",
      "avatar": "https://example.com/avatar.jpg"
    },
    "workspace": {
      "id": "workspace_1",
      "name": "My Company"
    }
  },
  "timestamp": "2026-04-22T10:30:00Z"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "AUTH_INVALID_CREDENTIALS",
  "timestamp": "2026-04-22T10:30:00Z"
}
```

---

## 1.2 User Signup

**Endpoint:** `POST /auth/signup`

**Description:** Create new user account

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "Jane Doe",
  "workspaceName": "Jane's Company"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_456",
      "email": "newuser@example.com",
      "name": "Jane Doe",
      "role": "owner",
      "workspaceId": "workspace_2",
      "avatar": null
    },
    "workspace": {
      "id": "workspace_2",
      "name": "Jane's Company"
    }
  },
  "timestamp": "2026-04-22T10:35:00Z"
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "error": "Email already registered",
  "code": "AUTH_EMAIL_EXISTS",
  "timestamp": "2026-04-22T10:35:00Z"
}
```

---

## 1.3 Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Send password reset link to email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email",
  "timestamp": "2026-04-22T10:40:00Z"
}
```

---

## 1.4 Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password using token from email

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "timestamp": "2026-04-22T10:45:00Z"
}
```

---

# 2. TIME ENTRIES (9 APIs)

## 2.1 Create Time Entry

**Endpoint:** `POST /time-entries`

**Description:** Create a new time entry

**Request Body:**
```json
{
  "description": "Frontend component development",
  "projectId": "project_1",
  "taskId": "task_5",
  "tagIds": ["tag_1", "tag_2"],
  "billable": true,
  "userId": "user_123",
  "workspaceId": "workspace_1",
  "startTime": "2026-04-22T09:00:00Z",
  "endTime": "2026-04-22T10:30:00Z",
  "duration": 5400,
  "clientId": "client_1"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "entry_789",
    "description": "Frontend component development",
    "projectId": "project_1",
    "taskId": "task_5",
    "tagIds": ["tag_1", "tag_2"],
    "billable": true,
    "userId": "user_123",
    "workspaceId": "workspace_1",
    "startTime": "2026-04-22T09:00:00Z",
    "endTime": "2026-04-22T10:30:00Z",
    "duration": 5400,
    "clientId": "client_1",
    "createdAt": "2026-04-22T10:30:00Z",
    "updatedAt": "2026-04-22T10:30:00Z"
  },
  "timestamp": "2026-04-22T10:30:00Z"
}
```

---

## 2.2 Get All Time Entries

**Endpoint:** `GET /time-entries?workspaceId=workspace_1&startDate=2026-04-01&endDate=2026-04-30`

**Description:** Retrieve all time entries with optional filtering

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `startDate` (optional): ISO date format (e.g., 2026-04-01)
- `endDate` (optional): ISO date format (e.g., 2026-04-30)
- `userId` (optional): Filter by user
- `projectId` (optional): Filter by project
- `billable` (optional): true/false
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "entry_789",
        "description": "Frontend component development",
        "projectId": "project_1",
        "taskId": "task_5",
        "tagIds": ["tag_1", "tag_2"],
        "billable": true,
        "userId": "user_123",
        "workspaceId": "workspace_1",
        "startTime": "2026-04-22T09:00:00Z",
        "endTime": "2026-04-22T10:30:00Z",
        "duration": 5400,
        "clientId": "client_1",
        "createdAt": "2026-04-22T10:30:00Z",
        "updatedAt": "2026-04-22T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "hasMore": true
    }
  },
  "timestamp": "2026-04-22T10:35:00Z"
}
```

---

## 2.3 Get Time Entry by ID

**Endpoint:** `GET /time-entries/{id}`

**Description:** Retrieve a specific time entry

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "entry_789",
    "description": "Frontend component development",
    "projectId": "project_1",
    "taskId": "task_5",
    "tagIds": ["tag_1", "tag_2"],
    "billable": true,
    "userId": "user_123",
    "workspaceId": "workspace_1",
    "startTime": "2026-04-22T09:00:00Z",
    "endTime": "2026-04-22T10:30:00Z",
    "duration": 5400,
    "clientId": "client_1",
    "createdAt": "2026-04-22T10:30:00Z",
    "updatedAt": "2026-04-22T10:30:00Z"
  },
  "timestamp": "2026-04-22T10:35:00Z"
}
```

---

## 2.4 Update Time Entry

**Endpoint:** `PUT /time-entries/{id}`

**Description:** Update an existing time entry

**Request Body:**
```json
{
  "description": "Updated description",
  "projectId": "project_2",
  "billable": false,
  "duration": 3600,
  "endTime": "2026-04-22T11:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "entry_789",
    "description": "Updated description",
    "projectId": "project_2",
    "taskId": "task_5",
    "tagIds": ["tag_1", "tag_2"],
    "billable": false,
    "userId": "user_123",
    "workspaceId": "workspace_1",
    "startTime": "2026-04-22T09:00:00Z",
    "endTime": "2026-04-22T11:00:00Z",
    "duration": 3600,
    "clientId": "client_1",
    "createdAt": "2026-04-22T10:30:00Z",
    "updatedAt": "2026-04-22T10:40:00Z"
  },
  "timestamp": "2026-04-22T10:40:00Z"
}
```

---

## 2.5 Delete Time Entry

**Endpoint:** `DELETE /time-entries/{id}`

**Description:** Delete a time entry

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Time entry deleted successfully",
  "data": {
    "id": "entry_789"
  },
  "timestamp": "2026-04-22T10:45:00Z"
}
```

---

## 2.6 Bulk Delete Time Entries

**Endpoint:** `DELETE /time-entries`

**Description:** Delete multiple time entries at once

**Request Body:**
```json
{
  "ids": ["entry_789", "entry_790", "entry_791"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 time entries deleted successfully",
  "data": {
    "deletedIds": ["entry_789", "entry_790", "entry_791"],
    "deletedCount": 3
  },
  "timestamp": "2026-04-22T10:50:00Z"
}
```

---

## 2.7 Get Time Entries by User

**Endpoint:** `GET /time-entries/user/{userId}?workspaceId=workspace_1`

**Description:** Get all time entries for a specific user

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "entries": [
      {
        "id": "entry_789",
        "description": "Frontend component development",
        "projectId": "project_1",
        "duration": 5400,
        "startTime": "2026-04-22T09:00:00Z",
        "billable": true,
        "createdAt": "2026-04-22T10:30:00Z"
      }
    ],
    "total": 45,
    "totalHours": 180.5
  },
  "timestamp": "2026-04-22T10:55:00Z"
}
```

---

## 2.8 Get Time Entries by Project

**Endpoint:** `GET /time-entries/project/{projectId}?workspaceId=workspace_1`

**Description:** Get all time entries for a specific project

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "projectId": "project_1",
    "projectName": "StaffBot Dedicated",
    "entries": [
      {
        "id": "entry_789",
        "description": "Frontend component development",
        "userId": "user_123",
        "userName": "John Doe",
        "duration": 5400,
        "billable": true,
        "startTime": "2026-04-22T09:00:00Z"
      }
    ],
    "total": 28,
    "totalHours": 112.3
  },
  "timestamp": "2026-04-22T11:00:00Z"
}
```

---

## 2.9 Undo Delete Time Entry

**Endpoint:** `POST /time-entries/undo-delete`

**Description:** Restore last deleted time entry

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Time entry restored successfully",
  "data": {
    "entries": [
      {
        "id": "entry_789",
        "description": "Frontend component development",
        "projectId": "project_1",
        "duration": 5400,
        "billable": true
      }
    ],
    "count": 1
  },
  "timestamp": "2026-04-22T11:05:00Z"
}
```

---

# 3. PROJECTS (6 APIs)

## 3.1 Create Project

**Endpoint:** `POST /projects`

**Description:** Create a new project

**Request Body:**
```json
{
  "name": "StaffBot Dedicated",
  "color": "#FF6B6B",
  "clientId": "client_1",
  "leadId": "user_456",
  "billable": true,
  "hourlyRate": 75.00,
  "members": [
    {
      "userId": "user_123",
      "role": "member",
      "hourlyRate": 50.00
    },
    {
      "userId": "user_456",
      "role": "manager",
      "hourlyRate": 75.00
    }
  ],
  "archived": false,
  "workspaceId": "workspace_1"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "project_1",
    "name": "StaffBot Dedicated",
    "color": "#FF6B6B",
    "clientId": "client_1",
    "leadId": "user_456",
    "billable": true,
    "hourlyRate": 75.00,
    "members": [
      {
        "userId": "user_123",
        "role": "member",
        "hourlyRate": 50.00
      },
      {
        "userId": "user_456",
        "role": "manager",
        "hourlyRate": 75.00
      }
    ],
    "archived": false,
    "workspaceId": "workspace_1",
    "createdAt": "2026-04-22T11:10:00Z",
    "updatedAt": "2026-04-22T11:10:00Z"
  },
  "timestamp": "2026-04-22T11:10:00Z"
}
```

---

## 3.2 Get All Projects

**Endpoint:** `GET /projects?workspaceId=workspace_1&includeArchived=false`

**Description:** Retrieve all projects

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `includeArchived` (optional): Include archived projects (default: false)
- `leadId` (optional): Filter by project lead
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project_1",
        "name": "StaffBot Dedicated",
        "color": "#FF6B6B",
        "clientId": "client_1",
        "leadId": "user_456",
        "billable": true,
        "hourlyRate": 75.00,
        "memberCount": 2,
        "archived": false,
        "createdAt": "2026-04-22T11:10:00Z"
      }
    ],
    "pagination": {
      "total": 14,
      "page": 1,
      "limit": 50
    }
  },
  "timestamp": "2026-04-22T11:15:00Z"
}
```

---

## 3.3 Get Project by ID

**Endpoint:** `GET /projects/{id}`

**Description:** Retrieve a specific project with full details

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "project_1",
    "name": "StaffBot Dedicated",
    "color": "#FF6B6B",
    "clientId": "client_1",
    "client": {
      "id": "client_1",
      "name": "StaffBot Inc"
    },
    "leadId": "user_456",
    "lead": {
      "id": "user_456",
      "name": "Jaydeep Vegad",
      "email": "jaydeep@example.com"
    },
    "billable": true,
    "hourlyRate": 75.00,
    "members": [
      {
        "userId": "user_123",
        "role": "member",
        "hourlyRate": 50.00,
        "user": {
          "id": "user_123",
          "name": "John Doe"
        }
      }
    ],
    "archived": false,
    "workspaceId": "workspace_1",
    "createdAt": "2026-04-22T11:10:00Z",
    "updatedAt": "2026-04-22T11:10:00Z"
  },
  "timestamp": "2026-04-22T11:20:00Z"
}
```

---

## 3.4 Update Project

**Endpoint:** `PUT /projects/{id}`

**Description:** Update an existing project

**Request Body:**
```json
{
  "name": "StaffBot Dedicated - Phase 2",
  "color": "#4ECDC4",
  "hourlyRate": 85.00,
  "archived": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "project_1",
    "name": "StaffBot Dedicated - Phase 2",
    "color": "#4ECDC4",
    "clientId": "client_1",
    "leadId": "user_456",
    "billable": true,
    "hourlyRate": 85.00,
    "members": [],
    "archived": false,
    "workspaceId": "workspace_1",
    "createdAt": "2026-04-22T11:10:00Z",
    "updatedAt": "2026-04-22T11:25:00Z"
  },
  "timestamp": "2026-04-22T11:25:00Z"
}
```

---

## 3.5 Delete Project

**Endpoint:** `DELETE /projects/{id}`

**Description:** Delete a project (archive or soft delete)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": {
    "id": "project_1",
    "archived": true
  },
  "timestamp": "2026-04-22T11:30:00Z"
}
```

---

## 3.6 Add Project Member

**Endpoint:** `POST /projects/{id}/members`

**Description:** Add a member to a project

**Request Body:**
```json
{
  "userId": "user_789",
  "role": "member",
  "hourlyRate": 55.00
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "project_1",
    "members": [
      {
        "userId": "user_123",
        "role": "member",
        "hourlyRate": 50.00
      },
      {
        "userId": "user_789",
        "role": "member",
        "hourlyRate": 55.00
      }
    ],
    "memberCount": 2
  },
  "timestamp": "2026-04-22T11:35:00Z"
}
```

---

# 4. USERS (5 APIs)

## 4.1 Get All Users

**Endpoint:** `GET /users?workspaceId=workspace_1`

**Description:** Retrieve all users in workspace

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `role` (optional): Filter by role (owner, admin, member, viewer)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "member",
        "avatar": "https://example.com/avatars/john.jpg",
        "workspaceId": "workspace_1",
        "joinedAt": "2026-01-15T10:00:00Z"
      },
      {
        "id": "user_456",
        "email": "jaydeep@example.com",
        "name": "Jaydeep Vegad",
        "role": "admin",
        "avatar": "https://example.com/avatars/jaydeep.jpg",
        "workspaceId": "workspace_1",
        "joinedAt": "2026-01-10T09:00:00Z"
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "limit": 50
    }
  },
  "timestamp": "2026-04-22T11:40:00Z"
}
```

---

## 4.2 Get User by ID

**Endpoint:** `GET /users/{id}`

**Description:** Retrieve user profile

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatars/john.jpg",
    "role": "member",
    "workspaceId": "workspace_1",
    "joinedAt": "2026-01-15T10:00:00Z",
    "lastActive": "2026-04-22T11:00:00Z",
    "preferences": {
      "timezone": "UTC",
      "dateFormat": "YYYY-MM-DD",
      "timeFormat": "24h"
    }
  },
  "timestamp": "2026-04-22T11:45:00Z"
}
```

---

## 4.3 Update User Profile

**Endpoint:** `PUT /users/{id}`

**Description:** Update user profile information

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "avatar": "https://example.com/avatars/john-new.jpg",
  "preferences": {
    "timezone": "EST",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe Updated",
    "avatar": "https://example.com/avatars/john-new.jpg",
    "role": "member",
    "workspaceId": "workspace_1",
    "preferences": {
      "timezone": "EST",
      "dateFormat": "MM/DD/YYYY",
      "timeFormat": "12h"
    },
    "updatedAt": "2026-04-22T11:50:00Z"
  },
  "timestamp": "2026-04-22T11:50:00Z"
}
```

---

## 4.4 Get User's Time Statistics

**Endpoint:** `GET /users/{id}/statistics?startDate=2026-04-01&endDate=2026-04-30`

**Description:** Get time tracking statistics for a user

**Query Parameters:**
- `startDate` (required): Start date (ISO format)
- `endDate` (required): End date (ISO format)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "userName": "John Doe",
    "period": {
      "start": "2026-04-01",
      "end": "2026-04-30"
    },
    "statistics": {
      "totalHours": 160.5,
      "billableHours": 140.25,
      "nonBillableHours": 20.25,
      "numberOfEntries": 45,
      "activeProjects": 3,
      "averageHoursPerDay": 8.02
    }
  },
  "timestamp": "2026-04-22T11:55:00Z"
}
```

---

## 4.5 Change User Password

**Endpoint:** `PUT /users/{id}/password`

**Description:** Change user password

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "timestamp": "2026-04-22T12:00:00Z"
}
```

---

# 5. TASKS (5 APIs)

## 5.1 Create Task

**Endpoint:** `POST /tasks`

**Description:** Create a new task

**Request Body:**
```json
{
  "name": "Frontend Refactor",
  "projectId": "project_1",
  "workspaceId": "workspace_1",
  "completed": false,
  "description": "Refactor React components",
  "dueDate": "2026-05-15T18:00:00Z",
  "assigneeId": "user_123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "task_1",
    "name": "Frontend Refactor",
    "projectId": "project_1",
    "workspaceId": "workspace_1",
    "completed": false,
    "description": "Refactor React components",
    "dueDate": "2026-05-15T18:00:00Z",
    "assigneeId": "user_123",
    "createdAt": "2026-04-22T12:05:00Z",
    "updatedAt": "2026-04-22T12:05:00Z"
  },
  "timestamp": "2026-04-22T12:05:00Z"
}
```

---

## 5.2 Get Tasks by Project

**Endpoint:** `GET /tasks/project/{projectId}?workspaceId=workspace_1`

**Description:** Retrieve all tasks for a project

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `completed` (optional): Filter by completion status
- `assigneeId` (optional): Filter by assignee

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "projectId": "project_1",
    "projectName": "StaffBot Dedicated",
    "tasks": [
      {
        "id": "task_1",
        "name": "Frontend Refactor",
        "completed": false,
        "dueDate": "2026-05-15T18:00:00Z",
        "assigneeId": "user_123",
        "assigneeName": "John Doe",
        "createdAt": "2026-04-22T12:05:00Z"
      },
      {
        "id": "task_2",
        "name": "API Integration",
        "completed": true,
        "dueDate": "2026-04-20T18:00:00Z",
        "assigneeId": "user_456",
        "assigneeName": "Jaydeep Vegad",
        "createdAt": "2026-04-15T10:00:00Z"
      }
    ],
    "total": 2,
    "completed": 1,
    "pending": 1
  },
  "timestamp": "2026-04-22T12:10:00Z"
}
```

---

## 5.3 Get Task by ID

**Endpoint:** `GET /tasks/{id}`

**Description:** Retrieve a specific task

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "task_1",
    "name": "Frontend Refactor",
    "projectId": "project_1",
    "workspaceId": "workspace_1",
    "completed": false,
    "description": "Refactor React components",
    "dueDate": "2026-05-15T18:00:00Z",
    "assigneeId": "user_123",
    "assignee": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2026-04-22T12:05:00Z",
    "updatedAt": "2026-04-22T12:05:00Z"
  },
  "timestamp": "2026-04-22T12:15:00Z"
}
```

---

## 5.4 Update Task

**Endpoint:** `PUT /tasks/{id}`

**Description:** Update a task

**Request Body:**
```json
{
  "name": "Frontend Refactor - Phase 2",
  "completed": true,
  "dueDate": "2026-05-20T18:00:00Z",
  "assigneeId": "user_789"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "task_1",
    "name": "Frontend Refactor - Phase 2",
    "projectId": "project_1",
    "completed": true,
    "dueDate": "2026-05-20T18:00:00Z",
    "assigneeId": "user_789",
    "updatedAt": "2026-04-22T12:20:00Z"
  },
  "timestamp": "2026-04-22T12:20:00Z"
}
```

---

## 5.5 Delete Task

**Endpoint:** `DELETE /tasks/{id}`

**Description:** Delete a task

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": "task_1"
  },
  "timestamp": "2026-04-22T12:25:00Z"
}
```

---

# 6. TAGS (4 APIs)

## 6.1 Create Tag

**Endpoint:** `POST /tags`

**Description:** Create a new tag

**Request Body:**
```json
{
  "name": "Bug",
  "workspaceId": "workspace_1",
  "archived": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "tag_1",
    "name": "Bug",
    "workspaceId": "workspace_1",
    "archived": false,
    "createdAt": "2026-04-22T12:30:00Z",
    "updatedAt": "2026-04-22T12:30:00Z"
  },
  "timestamp": "2026-04-22T12:30:00Z"
}
```

---

## 6.2 Get All Tags

**Endpoint:** `GET /tags?workspaceId=workspace_1&includeArchived=false`

**Description:** Retrieve all tags

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `includeArchived` (optional): Include archived tags (default: false)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "tag_1",
        "name": "Bug",
        "archived": false,
        "createdAt": "2026-04-22T12:30:00Z"
      },
      {
        "id": "tag_2",
        "name": "Feature",
        "archived": false,
        "createdAt": "2026-04-20T10:00:00Z"
      },
      {
        "id": "tag_3",
        "name": "Review",
        "archived": false,
        "createdAt": "2026-04-18T14:30:00Z"
      }
    ],
    "total": 8
  },
  "timestamp": "2026-04-22T12:35:00Z"
}
```

---

## 6.3 Update Tag

**Endpoint:** `PUT /tags/{id}`

**Description:** Update a tag

**Request Body:**
```json
{
  "name": "Critical Bug",
  "archived": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "tag_1",
    "name": "Critical Bug",
    "workspaceId": "workspace_1",
    "archived": false,
    "updatedAt": "2026-04-22T12:40:00Z"
  },
  "timestamp": "2026-04-22T12:40:00Z"
}
```

---

## 6.4 Delete Tag

**Endpoint:** `DELETE /tags/{id}`

**Description:** Delete a tag

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tag deleted successfully",
  "data": {
    "id": "tag_1"
  },
  "timestamp": "2026-04-22T12:45:00Z"
}
```

---

# 7. CLIENTS (4 APIs)

## 7.1 Create Client

**Endpoint:** `POST /clients`

**Description:** Create a new client

**Request Body:**
```json
{
  "name": "StaffBot Inc",
  "email": "contact@staffbot.com",
  "phone": "+1-800-555-0123",
  "address": "123 Business St, New York, NY 10001",
  "workspaceId": "workspace_1"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "client_1",
    "name": "StaffBot Inc",
    "email": "contact@staffbot.com",
    "phone": "+1-800-555-0123",
    "address": "123 Business St, New York, NY 10001",
    "workspaceId": "workspace_1",
    "createdAt": "2026-04-22T12:50:00Z",
    "updatedAt": "2026-04-22T12:50:00Z"
  },
  "timestamp": "2026-04-22T12:50:00Z"
}
```

---

## 7.2 Get All Clients

**Endpoint:** `GET /clients?workspaceId=workspace_1`

**Description:** Retrieve all clients

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client_1",
        "name": "StaffBot Inc",
        "email": "contact@staffbot.com",
        "phone": "+1-800-555-0123",
        "projectCount": 3,
        "createdAt": "2026-04-22T12:50:00Z"
      },
      {
        "id": "client_2",
        "name": "Tech Solutions Ltd",
        "email": "info@techsolutions.com",
        "phone": "+44-20-7946-0958",
        "projectCount": 1,
        "createdAt": "2026-04-15T09:00:00Z"
      }
    ],
    "total": 5
  },
  "timestamp": "2026-04-22T12:55:00Z"
}
```

---

## 7.3 Update Client

**Endpoint:** `PUT /clients/{id}`

**Description:** Update client information

**Request Body:**
```json
{
  "name": "StaffBot Inc - Updated",
  "email": "newemail@staffbot.com",
  "phone": "+1-800-555-0124"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "client_1",
    "name": "StaffBot Inc - Updated",
    "email": "newemail@staffbot.com",
    "phone": "+1-800-555-0124",
    "address": "123 Business St, New York, NY 10001",
    "updatedAt": "2026-04-22T13:00:00Z"
  },
  "timestamp": "2026-04-22T13:00:00Z"
}
```

---

## 7.4 Delete Client

**Endpoint:** `DELETE /clients/{id}`

**Description:** Delete a client

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Client deleted successfully",
  "data": {
    "id": "client_1"
  },
  "timestamp": "2026-04-22T13:05:00Z"
}
```

---

# 8. REPORTS (4 APIs)

## 8.1 Get Summary Report

**Endpoint:** `GET /reports/summary?workspaceId=workspace_1&startDate=2026-04-01&endDate=2026-04-30`

**Description:** Get time tracking summary with grouping options

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `startDate` (required): Start date
- `endDate` (required): End date
- `groupBy` (optional): 'user', 'project', 'lead', 'tag', 'date' (default: 'user')
- `projectId` (optional): Filter by project
- `userId` (optional): Filter by user
- `billable` (optional): true/false

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2026-04-01",
      "end": "2026-04-30"
    },
    "summary": {
      "totalHours": 640.5,
      "billableHours": 560.25,
      "nonBillableHours": 80.25,
      "totalEntries": 180,
      "workingDays": 22,
      "averageHoursPerDay": 29.11
    },
    "groupedData": [
      {
        "id": "user_123",
        "name": "John Doe",
        "totalHours": 160.5,
        "billableHours": 140.25,
        "nonBillableHours": 20.25,
        "entries": 45
      },
      {
        "id": "user_456",
        "name": "Jaydeep Vegad",
        "totalHours": 156.75,
        "billableHours": 156.75,
        "nonBillableHours": 0,
        "entries": 42
      }
    ]
  },
  "timestamp": "2026-04-22T13:10:00Z"
}
```

---

## 8.2 Get Detailed Report

**Endpoint:** `GET /reports/detailed?workspaceId=workspace_1&startDate=2026-04-01&endDate=2026-04-30`

**Description:** Get detailed list of all time entries with filters

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `startDate` (required): Start date
- `endDate` (required): End date
- `userId` (optional): Filter by user
- `projectId` (optional): Filter by project
- `billable` (optional): true/false
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2026-04-01",
      "end": "2026-04-30"
    },
    "summary": {
      "totalEntries": 180,
      "totalHours": 640.5
    },
    "entries": [
      {
        "id": "entry_789",
        "date": "2026-04-22",
        "userName": "John Doe",
        "projectName": "StaffBot Dedicated",
        "description": "Frontend component development",
        "duration": 5400,
        "billable": true,
        "startTime": "2026-04-22T09:00:00Z",
        "endTime": "2026-04-22T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 180,
      "page": 1,
      "limit": 50
    }
  },
  "timestamp": "2026-04-22T13:15:00Z"
}
```

---

## 8.3 Get Weekly Report

**Endpoint:** `GET /reports/weekly?workspaceId=workspace_1&week=2026-04-22`

**Description:** Get weekly time tracking summary

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `week` (required): Week date (ISBN week format)
- `groupBy` (optional): 'user', 'project' (default: 'user')

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "week": {
      "start": "2026-04-20",
      "end": "2026-04-26"
    },
    "summary": {
      "totalHours": 160.5,
      "billableHours": 140.25,
      "nonBillableHours": 20.25
    },
    "dailyData": [
      {
        "date": "2026-04-22",
        "dayName": "Wednesday",
        "hours": 8.5,
        "entries": 4
      },
      {
        "date": "2026-04-23",
        "dayName": "Thursday",
        "hours": 8.25,
        "entries": 3
      }
    ],
    "userData": [
      {
        "userId": "user_123",
        "userName": "John Doe",
        "totalHours": 40.5,
        "dailyBreakdown": [8.5, 8.25, 8.0, 8.0, 7.75, 0, 0]
      }
    ]
  },
  "timestamp": "2026-04-22T13:20:00Z"
}
```

---

## 8.4 Get Shared Reports

**Endpoint:** `GET /reports/shared?workspaceId=workspace_1`

**Description:** Get list of shared reports

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_1",
        "name": "April Team Report",
        "type": "summary",
        "period": {
          "start": "2026-04-01",
          "end": "2026-04-30"
        },
        "sharedBy": {
          "id": "user_456",
          "name": "Jaydeep Vegad"
        },
        "sharedAt": "2026-04-22T10:00:00Z",
        "expiresAt": "2026-05-22T10:00:00Z",
        "shareLink": "https://reports.logspanx.com/shared/abc123def456"
      }
    ],
    "total": 3
  },
  "timestamp": "2026-04-22T13:25:00Z"
}
```

---

# 9. TEAM & WORKSPACE (6 APIs)

## 9.1 Invite Team Member

**Endpoint:** `POST /workspace/invite-member`

**Description:** Send invite to new team member

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member",
  "workspaceId": "workspace_1"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": {
    "inviteId": "invite_123",
    "email": "newmember@example.com",
    "role": "member",
    "inviteLink": "https://app.logspanx.com/join/invite_123",
    "expiresAt": "2026-04-29T13:30:00Z"
  },
  "timestamp": "2026-04-22T13:30:00Z"
}
```

---

## 9.2 Get Team Members

**Endpoint:** `GET /workspace/members?workspaceId=workspace_1`

**Description:** Get all team members

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "user_123",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "member",
        "status": "active",
        "joinedAt": "2026-01-15T10:00:00Z",
        "lastActive": "2026-04-22T11:00:00Z"
      },
      {
        "id": "user_456",
        "email": "jaydeep@example.com",
        "name": "Jaydeep Vegad",
        "role": "admin",
        "status": "active",
        "joinedAt": "2026-01-10T09:00:00Z",
        "lastActive": "2026-04-22T12:30:00Z"
      }
    ],
    "total": 8,
    "pendingInvites": 2
  },
  "timestamp": "2026-04-22T13:35:00Z"
}
```

---

## 9.3 Update Member Role

**Endpoint:** `PUT /workspace/members/{userId}`

**Description:** Change member role

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "admin",
    "updatedAt": "2026-04-22T13:40:00Z"
  },
  "timestamp": "2026-04-22T13:40:00Z"
}
```

---

## 9.4 Remove Team Member

**Endpoint:** `DELETE /workspace/members/{userId}`

**Description:** Remove member from workspace

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Member removed successfully",
  "data": {
    "userId": "user_123"
  },
  "timestamp": "2026-04-22T13:45:00Z"
}
```

---

## 9.5 Get Workspace Settings

**Endpoint:** `GET /workspace/settings?workspaceId=workspace_1`

**Description:** Get workspace configuration

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace_1",
    "name": "My Company",
    "settings": {
      "dateFormat": "YYYY-MM-DD",
      "timeFormat": "24h",
      "weekStart": "monday",
      "currency": "USD",
      "timezone": "UTC",
      "defaultHourlyRate": 50.00,
      "roundingMethod": "nearest_minute"
    },
    "updatedAt": "2026-04-20T10:00:00Z"
  },
  "timestamp": "2026-04-22T13:50:00Z"
}
```

---

## 9.6 Update Workspace Settings

**Endpoint:** `PUT /workspace/settings`

**Description:** Update workspace configuration

**Request Body:**
```json
{
  "workspaceId": "workspace_1",
  "name": "My Updated Company",
  "settings": {
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "weekStart": "sunday",
    "timezone": "EST",
    "currency": "USD"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "workspaceId": "workspace_1",
    "name": "My Updated Company",
    "settings": {
      "dateFormat": "MM/DD/YYYY",
      "timeFormat": "12h",
      "weekStart": "sunday",
      "currency": "USD",
      "timezone": "EST",
      "defaultHourlyRate": 50.00,
      "roundingMethod": "nearest_minute"
    },
    "updatedAt": "2026-04-22T13:55:00Z"
  },
  "timestamp": "2026-04-22T13:55:00Z"
}
```

---

# 10. NOTIFICATIONS (3 APIs)

## 10.1 Get Notifications

**Endpoint:** `GET /notifications?userId=user_123&unreadOnly=false`

**Description:** Retrieve user notifications

**Query Parameters:**
- `userId` (required): User ID
- `unreadOnly` (optional): Show unread only (default: false)
- `limit` (optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_001",
        "title": "Time Entry Approved",
        "message": "Your time entry for 'Frontend Work' was approved",
        "type": "success",
        "read": false,
        "createdAt": "2026-04-22T13:00:00Z",
        "actionUrl": "/dashboard/tracker/entry_789"
      },
      {
        "id": "notif_002",
        "title": "Team Member Invited",
        "message": "Jane Doe was invited to the project",
        "type": "info",
        "read": true,
        "createdAt": "2026-04-21T10:00:00Z"
      }
    ],
    "unreadCount": 3,
    "total": 25
  },
  "timestamp": "2026-04-22T14:00:00Z"
}
```

---

## 10.2 Mark Notification as Read

**Endpoint:** `PUT /notifications/{id}`

**Description:** Mark notification as read

**Request Body:**
```json
{
  "read": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "notif_001",
    "read": true
  },
  "timestamp": "2026-04-22T14:05:00Z"
}
```

---

## 10.3 Mark All Notifications as Read

**Endpoint:** `PUT /notifications/mark-all-read`

**Description:** Mark all user notifications as read

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "markedCount": 5
  },
  "timestamp": "2026-04-22T14:10:00Z"
}
```

---

# Response Format Standards

## Success Response Template
```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-04-22T14:15:00Z"
}
```

## Error Response Template
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {},
  "timestamp": "2026-04-22T14:15:00Z"
}
```

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

---

# Authentication

All endpoints (except `/auth/login`, `/auth/signup`, `/auth/forgot-password`) require:

**Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

# Pagination

Paginated endpoints follow this format:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 250,
      "pages": 5,
      "hasMore": true
    }
  }
}
```

---

# Rate Limiting

- **General Limit:** 1000 requests per hour
- **Auth Endpoints:** 10 requests per minute
- **Upload Endpoints:** 100 requests per hour

**Response Header:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1713800400
```

---

**Document Version:** 1.0  
**Last Updated:** April 22, 2026  
**Total APIs:** 50
