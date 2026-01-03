# Environment Configuration

## Backend .env File

Location: `backend/.env`

```env
PORT=5000
JWT_SECRET=dayflow_hrms_super_secret_jwt_key_2024_change_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
```

### Configuration Details:

- **PORT**: Backend server port (default: 5000)
- **JWT_SECRET**: Secret key for JWT token signing (change in production!)
- **NODE_ENV**: Environment mode (development/production)
- **CORS_ORIGIN**: Frontend URL for CORS (http://localhost:3000)
- **MONGODB_URI**: MongoDB connection string
  - Local: `mongodb://localhost:27017/dayflow-hrms`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/dayflow-hrms`

## Frontend .env File

Location: `.env` (root directory)

```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_API=true
```

### Configuration Details:

- **VITE_API_URL**: Backend API base URL
- **VITE_USE_API**: Enable API mode (true) or use localStorage (false)

## Setup Instructions

1. **Backend Setup:**
   ```bash
   cd backend
   # .env file should already exist
   npm install
   npm start
   ```

2. **Frontend Setup:**
   ```bash
   # .env file should already exist in root
   npm install
   npm run dev
   ```

3. **MongoDB Setup:**
   - Install MongoDB locally, OR
   - Use MongoDB Atlas (cloud)
   - Update `MONGODB_URI` in `backend/.env` accordingly

## Connection Flow

```
Frontend (http://localhost:3000)
    ↓
    API Calls to: http://localhost:5000/api
    ↓
Backend (http://localhost:5000)
    ↓
    Connects to: MongoDB (mongodb://localhost:27017/dayflow-hrms)
```

## Important Notes

- **Never commit .env files to Git** (they're in .gitignore)
- **Change JWT_SECRET in production** to a strong random string
- **Update CORS_ORIGIN** if frontend URL changes
- **MongoDB must be running** before starting the backend

