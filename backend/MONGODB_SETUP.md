# MongoDB Setup Guide

## Prerequisites

1. **Install MongoDB**
   - Download from [MongoDB Official Website](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (Cloud) - [Free tier available](https://www.mongodb.com/cloud/atlas)

## Local MongoDB Setup

### 1. Install MongoDB Community Edition

**Windows:**
- Download and run the MongoDB installer
- Follow the installation wizard
- MongoDB will be installed as a Windows service

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Verify Installation

```bash
mongod --version
mongo --version  # or mongosh for newer versions
```

## MongoDB Atlas Setup (Cloud - Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select your preferred region
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `dayflow-hrms`)

## Backend Configuration

### 1. Update `.env` File

Create or update `backend/.env`:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# MongoDB Connection
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dayflow-hrms?retryWrites=true&w=majority
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Start the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost:27017
🚀 Server running on port 5000
```

## Database Collections

The following collections will be automatically created:

1. **users** - User accounts and profiles
2. **attendances** - Attendance records
3. **leaverequests** - Leave requests and approvals

## Troubleshooting

### Connection Issues

1. **"MongoServerError: Authentication failed"**
   - Check username and password in connection string
   - Verify database user has correct permissions

2. **"MongoNetworkError: connect ECONNREFUSED"**
   - Ensure MongoDB is running locally
   - Check if port 27017 is accessible
   - For Atlas: Check IP whitelist

3. **"MongoParseError: Invalid connection string"**
   - Verify connection string format
   - Ensure password is URL-encoded if it contains special characters

### MongoDB Not Running (Local)

**Windows:**
```bash
# Check service status
sc query MongoDB

# Start service
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

## Migration from JSON Files

If you have existing data in JSON files:

1. The old JSON files in `backend/data/` will be ignored
2. You'll need to re-register users
3. All new data will be stored in MongoDB

## Production Considerations

1. **Use MongoDB Atlas** for production (managed service)
2. **Enable authentication** and use strong passwords
3. **Whitelist only production server IPs**
4. **Enable MongoDB backups**
5. **Use connection pooling** (already configured in mongoose)
6. **Set up monitoring** and alerts

## Useful MongoDB Commands

```bash
# Connect to MongoDB shell
mongosh  # or mongo for older versions

# List databases
show dbs

# Use database
use dayflow-hrms

# List collections
show collections

# Query users
db.users.find().pretty()

# Count documents
db.users.countDocuments()
```

