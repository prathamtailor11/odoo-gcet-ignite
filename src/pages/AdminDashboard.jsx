import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Users, Clock, Calendar, DollarSign, Search } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

const AdminDashboard = () => {
  const { employees, attendance, leaveRequests } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Leaves',
      value: leaveRequests.filter((l) => l.status === 'pending').length,
      icon: Calendar,
      color: 'bg-yellow-500',
    },
    {
      title: 'Today Attendance',
      value: attendance.filter(
        (a) =>
          format(new Date(a.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
          a.status === 'present'
      ).length,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      title: 'Total Payroll',
      value: `₹${employees.reduce((sum, emp) => sum + (emp.salary || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ]

  const recentLeaves = leaveRequests
    .filter((l) => l.status === 'pending')
    .slice(0, 5)
    .reverse()

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Admin Dashboard
          </h1>
          <p className="mt-2 text-base text-gray-600 font-medium">Manage employees and HR operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div 
                key={stat.title} 
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 card-hover animate-scale-in relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <div className={`w-full h-full ${stat.color} rounded-full blur-2xl`}></div>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-xl shadow-md transform hover:scale-110 transition-all duration-300 ml-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full mr-3"></div>
              <span className="font-semibold">Pending Leave Requests</span>
            </h2>
            {recentLeaves.length > 0 ? (
              <div className="space-y-3">
                {recentLeaves.map((request) => {
                  const employee = employees.find((e) => e.id === request.employeeId)
                  return (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {employee?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.leaveType} - {format(new Date(request.startDate), 'MMM dd')} to{' '}
                          {format(new Date(request.endDate), 'MMM dd')}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No pending leave requests</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></div>
              <span className="font-semibold">Quick Actions</span>
            </h2>
            <div className="space-y-2">
              <a
                href="/attendance"
                className="block p-3.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-200"
              >
                <span className="text-sm font-semibold text-gray-900">View All Attendance</span>
              </a>
              <a
                href="/leave"
                className="block p-3.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-200"
              >
                <span className="text-sm font-semibold text-gray-900">Manage Leave Requests</span>
              </a>
              <a
                href="/payroll"
                className="block p-3.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-200"
              >
                <span className="text-sm font-semibold text-gray-900">View Payroll</span>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Employee List</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Employee ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.employeeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 border border-primary-200">
                          {employee.role}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard

