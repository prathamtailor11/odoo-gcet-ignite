# Quick Start Guide

## 1. Install Backend Dependencies

```bash
cd backend
npm install
```

## 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and set your `JWT_SECRET`:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 3. Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Database initialized
🚀 Server running on port 5000
📝 Environment: development
```

## 4. Test the API

Open another terminal and test:

```bash
# Health check
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"Dayflow HRMS API is running"}
```

## 5. Frontend Configuration

The frontend will automatically connect to the backend if:
- Backend is running on `http://localhost:5000`
- `VITE_USE_API=true` in frontend `.env` (or not set, defaults to true)

## API is Ready! 🎉

Your backend is now running and ready to handle requests from the frontend.

