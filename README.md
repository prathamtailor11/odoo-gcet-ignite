# Dayflow - Human Resource Management System

**Every workday, perfectly aligned.**

A comprehensive HRMS built with React that digitizes and streamlines core HR operations including employee onboarding, profile management, attendance tracking, leave management, payroll visibility, and approval workflows.

## Features

### Authentication & Authorization
- ✅ Secure Sign Up with Employee ID, Email, and Password
- ✅ Sign In with email and password
- ✅ Role-based access control (Admin/HR vs Employee)
- ✅ Password validation with security rules

### Employee Dashboard
- ✅ Quick-access cards for Profile, Attendance, Leave Requests, and Payroll
- ✅ Recent activity and alerts
- ✅ Leave status overview

### Admin/HR Dashboard
- ✅ Employee list with search functionality
- ✅ Attendance records overview
- ✅ Leave approvals management
- ✅ Statistics and quick actions

### Employee Profile Management
- ✅ View personal details, job details, and salary structure
- ✅ Edit limited fields (address, phone, profile picture) for employees
- ✅ Admin can edit all employee details

### Attendance Management
- ✅ Daily and weekly attendance views
- ✅ Check-in/check-out functionality for employees
- ✅ Status types: Present, Absent, Half-day, Leave
- ✅ Employees can view only their own attendance
- ✅ Admin/HR can view attendance of all employees

### Leave & Time-Off Management
- ✅ Apply for leave (Paid, Sick, Unpaid)
- ✅ Select date range and add remarks
- ✅ Leave request status: Pending, Approved, Rejected
- ✅ Admin can approve or reject requests
- ✅ Changes reflect immediately in employee records

### Payroll/Salary Management
- ✅ Read-only payroll view for employees
- ✅ Admin can view payroll of all employees
- ✅ Salary breakdown with tax calculations
- ✅ Salary slip generation (UI ready)

## Technology Stack

- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Context API** - State management
- **date-fns** - Date utilities
- **lucide-react** - Icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
hrms/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/          # Context providers
│   │   ├── AuthContext.jsx
│   │   └── DataContext.jsx
│   ├── pages/           # Page components
│   │   ├── SignUp.jsx
│   │   ├── SignIn.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── Attendance.jsx
│   │   ├── LeaveManagement.jsx
│   │   └── Payroll.jsx
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Usage

### Creating an Account

1. Navigate to the Sign Up page
2. Fill in:
   - Full Name
   - Employee ID
   - Email
   - Role (Employee or HR Officer)
   - Password (must be at least 8 characters with uppercase, lowercase, and number)
3. Click "Sign Up"

### Employee Features

- **Dashboard**: View quick access cards and recent activity
- **Profile**: View and edit personal information
- **Attendance**: Check in/out and view attendance records
- **Leave**: Apply for leave and track request status
- **Payroll**: View salary details and breakdown

### Admin/HR Features

- **Dashboard**: View all employees, statistics, and pending requests
- **Employee Management**: View and search employee list
- **Attendance**: View attendance records for all employees
- **Leave Management**: Approve or reject leave requests
- **Payroll**: View and manage payroll for all employees

## Data Storage

Currently, the application uses `localStorage` for data persistence. In a production environment, this should be replaced with a backend API and database.

## Future Enhancements

- Email & notification alerts
- Analytics & reports dashboard
- Salary slip generation and download
- Document management
- Performance reviews
- Employee directory

## License

This project is part of the Dayflow HRMS system.

