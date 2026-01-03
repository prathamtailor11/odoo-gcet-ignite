import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { User, Clock, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { format } from 'date-fns'

const EmployeeDashboard = () => {
  const { user } = useAuth()
  const { getEmployeeLeaveRequests, getEmployeeAttendance } = useData()
  
  const leaveRequests = getEmployeeLeaveRequests(user?.id)
  const attendance = getEmployeeAttendance(user?.id)
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length
  const recentAttendance = attendance.slice(-5).reverse()

  const cards = [
    {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: User,
      link: '/profile',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      title: 'Attendance',
      description: 'Check in/out and view records',
      icon: Clock,
      link: '/attendance',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      title: 'Leave Requests',
      description: 'Apply for time off',
      icon: Calendar,
      link: '/leave',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      badge: pendingLeaves > 0 ? pendingLeaves : null,
    },
    {
      title: 'Payroll',
      description: 'View salary details',
      icon: DollarSign,
      link: '/payroll',
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50',
    },
  ]

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-6 animate-slide-down">
          <h1 className="text-4xl font-bold gradient-text mb-2">Welcome back, {user?.name}!</h1>
          <p className="mt-2 text-sm text-gray-600">Here's your dashboard overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <Link
                key={card.title}
                to={card.link}
                className={`card-hover bg-gradient-to-br ${card.bgGradient} rounded-xl shadow-lg p-6 border border-white/50 animate-slide-up relative overflow-hidden group`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="shimmer absolute inset-0"></div>
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{card.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${card.gradient} p-4 rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                {card.badge && (
                  <div className="mt-4 flex items-center text-sm text-orange-600 relative z-10 animate-pulse">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {card.badge} pending request{card.badge > 1 ? 's' : ''}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-xl shadow-lg p-6 border border-white/50 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-3"></div>
              Recent Activity
            </h2>
            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">{record.status}</p>
                    </div>
                    {record.checkIn && (
                      <span className="text-xs text-gray-500 font-medium">
                        {record.checkIn} - {record.checkOut || 'In Progress'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No attendance records yet</p>
            )}
          </div>

          <div className="glass rounded-xl shadow-lg p-6 border border-white/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></div>
              Leave Status
            </h2>
            {leaveRequests.length > 0 ? (
              <div className="space-y-3">
                {leaveRequests.slice(-3).reverse().map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-green-300 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{request.leaveType}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                        request.status === 'approved'
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                          : request.status === 'rejected'
                          ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200'
                          : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 animate-pulse'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No leave requests yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default EmployeeDashboard

