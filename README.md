# Next Native SA Tracking App

A comprehensive staff attendance tracking application with both React Native frontend and Next.js backend.

## Features

- Staff attendance tracking with geofencing (check-in/check-out)
- Leave request management
- Mission request management
- Work plan creation and tracking
- Admin approval dashboard
- Reporting system (daily, weekly, monthly)
- Role-based access (Staff/Admin)
- Multilingual support (Khmer/English)
- Geolocation-based attendance verification

## Tech Stack

- Frontend: React Native with Expo
- Backend: Next.js
- Database: PostgreSQL
- Authentication: JWT
- UI Library: HeroUI Native
- Fonts: Google Hanuman (Khmer)
- I18n: i18next

## Installation

1. Clone the repository
2. Navigate to the NativeApp/example directory for the React Native app
3. Navigate to the next-backend directory for the Next.js backend
4. Install dependencies in both directories:
   - `npm install` in each directory
5. Set up environment variables for the backend
6. Start the applications

## Environment Variables

### For Backend (next-backend):

```
DB_HOST=157.10.73.52
DB_PORT=5432
DB_NAME=ped_attendance_app
DB_USER=admin
DB_PASSWORD=P@ssw0rd
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Backend API Endpoints

The backend provides all necessary endpoints for staff and admin functionality:
- Authentication: /api/auth/login, /api/auth/register
- Attendance: /api/attendance/check-in-out
- Leave requests: /api/leave/request
- Mission requests: /api/mission/request
- Work plans: /api/workplan/manage
- Admin: /api/admin/*

## Frontend Features

- Complete authentication flow (login/register)
- Attendance check-in/out with geolocation
- Leave and mission request forms
- Work plan creation and management
- Admin dashboard with approval controls
- Multilingual support (Khmer as default)
- Google Hanuman font for Khmer text

## License

[Specify your license here]