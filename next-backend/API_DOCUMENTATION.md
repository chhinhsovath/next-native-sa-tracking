# TrackingApp API Documentation

## Base URL
```
https://your-domain.com/api
```

For development, the backend runs on:
```
http://localhost:3000/api
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication

#### Register a new user
- **POST** `/api/auth/register`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "position": "Software Engineer",
  "department": "IT"
}
```
- Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

#### Login
- **POST** `/api/auth/login`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

### Staff Features

#### Attendance Check-in/Check-out
- **POST** `/api/attendance/check-in-out`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "attendanceType": "CHECK_IN_AM|CHECK_OUT_AM|CHECK_IN_PM|CHECK_OUT_PM",
  "latitude": 12.345678,
  "longitude": 98.765432
}
```
- Response:
```json
{
  "message": "Attendance recorded successfully",
  "attendance": {
    "id": "attendance-id",
    "userId": "user-id",
    "officeId": "office-id",
    "attendanceType": "CHECK_IN_AM",
    "timestamp": "2023-01-01T09:00:00.000Z",
    "latitude": 12.345678,
    "longitude": 98.765432,
    "status": "Validated",
    "withinGeofence": true,
    "distanceFromOffice": 15.5
  }
}
```

- **GET** `/api/attendance/check-in-out`
- Headers: `Authorization: Bearer <token>`
- Query parameters: `?date=2023-01-01`
- Response: Array of attendance records

#### Leave Request
- **POST** `/api/leave/request`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "startDate": "2023-01-15T00:00:00.000Z",
  "endDate": "2023-01-20T23:59:59.999Z",
  "reason": "Personal reasons"
}
```
- Response:
```json
{
  "message": "Leave request submitted successfully",
  "leaveRequest": {
    "id": "leave-request-id",
    "userId": "user-id",
    "startDate": "2023-01-15T00:00:00.000Z",
    "endDate": "2023-01-20T23:59:59.999Z",
    "reason": "Personal reasons",
    "status": "PENDING",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

- **GET** `/api/leave/request`
- Headers: `Authorization: Bearer <token>`
- Response: Array of leave requests

- **PUT** `/api/leave/request`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "id": "leave-request-id",
  "reason": "Updated reason"
}
```
- Response: Updated leave request

- **DELETE** `/api/leave/request?id=leave-request-id`
- Headers: `Authorization: Bearer <token>`
- Response: Success message

#### Mission Request
- **POST** `/api/mission/request`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "title": "Project A",
  "description": "Work on Project A",
  "startDate": "2023-01-15T00:00:00.000Z",
  "endDate": "2023-01-20T23:59:59.999Z"
}
```
- Response: Created mission request

- **GET** `/api/mission/request`
- Headers: `Authorization: Bearer <token>`
- Response: Array of mission requests

- **PUT** `/api/mission/request`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "id": "mission-request-id",
  "title": "Updated Project A",
  "description": "Updated description"
}
```
- Response: Updated mission request

- **DELETE** `/api/mission/request?id=mission-request-id`
- Headers: `Authorization: Bearer <token>`
- Response: Success message

#### Work Plan
- **POST** `/api/workplan/manage`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "title": "Weekly Tasks",
  "description": "Complete weekly tasks",
  "dueDate": "2023-01-31T23:59:59.999Z"
}
```
- Response: Created work plan

- **GET** `/api/workplan/manage`
- Headers: `Authorization: Bearer <token>`
- Query parameters: `?status=DRAFT`
- Response: Array of work plans

- **PUT** `/api/workplan/manage`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "id": "workplan-id",
  "status": "SUBMITTED",
  "progress": 50,
  "achievement": "Completed first phase",
  "output": "Documentation ready",
  "comments": "Good progress"
}
```
- Response: Updated work plan

- **DELETE** `/api/workplan/manage?id=workplan-id`
- Headers: `Authorization: Bearer <token>`
- Response: Success message

### Office Locations (for geofencing)
- **GET** `/api/office/location`
- Headers: `Authorization: Bearer <token>`
- Response: Array of office locations with coordinates and radius

### Admin Features

#### Approvals
- **GET** `/api/admin/approvals?resource=user|leave|mission`
- Headers: `Authorization: Bearer <token>`
- Response: Array of pending requests of specified type

- **PUT** `/api/admin/approvals?resource=user|leave|mission`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "id": "request-id",
  "status": "APPROVED|REJECTED"
}
```
- Response: Processed request

#### Reports
- **GET** `/api/admin/reports?reportType=attendance|leave|mission|workplan|daily&startDate=2023-01-01&endDate=2023-01-31`
- Headers: `Authorization: Bearer <token>`
- Response: Report data based on type

#### Work Plan Tracking
- **GET** `/api/admin/workplan-tracking?userId=user-id&status=SUBMITTED`
- Headers: `Authorization: Bearer <token>`
- Response: Array of work plans

- **PUT** `/api/admin/workplan-tracking`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "id": "workplan-id",
  "status": "APPROVED",
  "comments": "Good work, keep it up!"
}
```
- Response: Updated work plan

#### User Management
- **GET** `/api/admin/users?role=STAFF&isActive=true`
- Headers: `Authorization: Bearer <token>`
- Response: Array of users

- **PUT** `/api/admin/users`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "id": "user-id",
  "role": "ADMIN",
  "isActive": true
}
```
- Response: Updated user

- **DELETE** `/api/admin/users?id=user-id`
- Headers: `Authorization: Bearer <token>`
- Response: Success message