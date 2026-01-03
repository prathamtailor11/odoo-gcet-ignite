# Dayflow HRMS Backend API

RESTful API backend for Dayflow Human Resource Management System.

## Features

- 🔐 JWT-based authentication
- 👥 User management (Employee & HR roles)
- ⏰ Attendance tracking (Check-in/Check-out)
- 📅 Leave management with approval workflow
- 💰 Payroll calculation and management
- 🔒 Role-based access control
- 📊 Salary structure management

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
```

**For MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dayflow-hrms?retryWrites=true&w=majority
```

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed MongoDB setup instructions.

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (HR only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in (Employee only)
- `POST /api/attendance/checkout` - Check out (Employee only)
- `POST /api/attendance` - Create attendance record (HR only)
- `PUT /api/attendance/:id` - Update attendance record (HR only)

### Leave
- `GET /api/leave` - Get leave requests
- `POST /api/leave` - Create leave request (Employee only)
- `PUT /api/leave/:id/approve` - Approve leave request (HR only)
- `PUT /api/leave/:id/reject` - Reject leave request (HR only)

### Payroll
- `GET /api/payroll` - Get payroll information
- `GET /api/payroll/all` - Get all employees payroll (HR only)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Data Storage

Uses **MongoDB** for data storage. The application automatically connects to MongoDB on startup.

- **Local MongoDB**: `mongodb://localhost:27017/dayflow-hrms`
- **MongoDB Atlas**: Use connection string from Atlas dashboard

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for setup instructions.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation with express-validator
- CORS configuration

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

