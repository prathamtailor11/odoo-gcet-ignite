# Dayflow HRMS - Complete Setup Guide

## Project Structure

```
dayflow-hrms/
├── backend/          # Node.js/Express API
├── src/             # React Frontend
└── package.json     # Frontend dependencies
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_API=true
```

If `VITE_USE_API=false` or not set, the app will use localStorage (offline mode).

### 3. Start Frontend

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features

### Backend API
- ✅ RESTful API with Express.js
- ✅ JWT Authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Input validation
- ✅ Error handling
- ✅ CORS configuration
- ✅ JSON file-based database (easily migratable to MongoDB/PostgreSQL)

### Frontend Integration
- ✅ API service layer
- ✅ Automatic fallback to localStorage if API unavailable
- ✅ Token-based authentication
- ✅ Real-time data synchronization

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (HR only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `POST /api/attendance` - Create record (HR)
- `PUT /api/attendance/:id` - Update record (HR)

### Leave
- `GET /api/leave` - Get leave requests
- `POST /api/leave` - Create leave request
- `PUT /api/leave/:id/approve` - Approve (HR)
- `PUT /api/leave/:id/reject` - Reject (HR)

### Payroll
- `GET /api/payroll` - Get payroll info
- `GET /api/payroll/all` - Get all payrolls (HR)

## Database Migration

The backend currently uses JSON files. To migrate to a real database:

1. **MongoDB**: Replace `utils/database.js` with Mongoose models
2. **PostgreSQL**: Use Sequelize or Prisma ORM
3. **MySQL**: Use Sequelize or Knex.js

## Security Notes

- Change `JWT_SECRET` in production
- Use environment variables for sensitive data
- Implement rate limiting for production
- Add HTTPS in production
- Consider adding request logging and monitoring

## Testing

Test the API using:
- Postman
- curl
- Frontend application

Example signup:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User",
    "employeeId": "EMP001",
    "role": "Employee"
  }'
```

