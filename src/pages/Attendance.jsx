import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Clock, CheckCircle, XCircle, Calendar, Users } from 'lucide-react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, startOfMonth, endOfMonth } from 'date-fns'

const Attendance = () => {
  const { user } = useAuth()
  const { attendance, addAttendance, updateAttendance, employees, leaveRequests } = useData()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('monthly') // 'daily', 'weekly', or 'monthly'
  
  const isAdmin = user?.role === 'HR'
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  
  // Default to monthly view for employees
  useEffect(() => {
    if (!isAdmin) {
      setView('monthly')
      setSelectedDate(new Date())
    }
  }, [isAdmin])
  
  // Get today's attendance for current user
  const todayAttendance = attendance.find((a) => {
    if (a.employeeId !== user?.id) return false
    try {
      const recordDate = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date)
      return format(recordDate, 'yyyy-MM-dd') === todayStr
    } catch {
      return false
    }
  })

  const handleCheckIn = () => {
    const checkInTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const checkInDateTime = new Date()
    
    if (todayAttendance) {
      updateAttendance(todayAttendance.id, {
        checkIn: checkInTime,
        checkInDateTime: checkInDateTime.toISOString(),
        status: 'present',
        workingHours: 0,
        breakTime: 0,
      })
    } else {
      addAttendance({
        employeeId: user.id,
        date: today.toISOString(),
        checkIn: checkInTime,
        checkInDateTime: checkInDateTime.toISOString(),
        status: 'present',
        workingHours: 0,
        breakTime: 0, // Default break time in hours
      })
    }
  }

  const handleCheckOut = () => {
    if (todayAttendance) {
      const checkOutTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
      const checkOutDateTime = new Date()
      
      // Calculate working hours
      const checkInDateTime = todayAttendance.checkInDateTime 
        ? new Date(todayAttendance.checkInDateTime)
        : new Date()
      const totalMinutes = (checkOutDateTime - checkInDateTime) / (1000 * 60)
      const breakTime = todayAttendance.breakTime || 1 // Default 1 hour break
      const workingHours = Math.max(0, (totalMinutes / 60) - breakTime)
      
      updateAttendance(todayAttendance.id, {
        checkOut: checkOutTime,
        checkOutDateTime: checkOutDateTime.toISOString(),
        workingHours: parseFloat(workingHours.toFixed(2)),
        breakTime: breakTime,
      })
    }
  }
  
  // Calculate payable days for an employee
  const calculatePayableDays = (employeeId, month, year) => {
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    
    // Get all attendance records for the month
    const monthAttendance = attendance.filter((a) => {
      if (a.employeeId !== employeeId) return false
      try {
        const recordDate = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date)
        return recordDate >= monthStart && recordDate <= monthEnd && a.status === 'present'
      } catch {
        return false
      }
    })
    
    // Get approved unpaid leaves for the month
    const unpaidLeaves = leaveRequests.filter((l) => {
      if (l.employeeId !== employeeId || l.status !== 'approved' || l.leaveType !== 'Unpaid') return false
      try {
        const startDate = parseISO(l.startDate)
        const endDate = parseISO(l.endDate)
        return (startDate >= monthStart && startDate <= monthEnd) || 
               (endDate >= monthStart && endDate <= monthEnd) ||
               (startDate <= monthStart && endDate >= monthEnd)
      } catch {
        return false
      }
    })
    
    // Calculate unpaid leave days in the month
    let unpaidDays = 0
    unpaidLeaves.forEach((leave) => {
      const startDate = parseISO(leave.startDate)
      const endDate = parseISO(leave.endDate)
      const leaveStart = startDate < monthStart ? monthStart : startDate
      const leaveEnd = endDate > monthEnd ? monthEnd : endDate
      const days = Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1
      unpaidDays += days
    })
    
    const totalWorkingDays = monthEnd.getDate()
    const payableDays = monthAttendance.length - unpaidDays
    
    return {
      totalWorkingDays,
      presentDays: monthAttendance.length,
      unpaidLeaveDays: unpaidDays,
      payableDays: Math.max(0, payableDays),
    }
  }

  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }
  
  const getMonthDates = () => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    return eachDayOfInterval({ start, end })
  }

  const getAttendanceForDate = (date, employeeId) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return attendance.find((a) => {
      if (a.employeeId !== employeeId) return false
      try {
        const recordDate = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date)
        return format(recordDate, 'yyyy-MM-dd') === dateStr
      } catch {
        return false
      }
    })
  }

  const getEmployeeAttendance = (employeeId) => {
    if (view === 'daily') {
      return [getAttendanceForDate(selectedDate, employeeId)].filter(Boolean)
    } else {
      return getWeekDates()
        .map((date) => getAttendanceForDate(date, employeeId))
        .filter(Boolean)
    }
  }

  // For employees: Show current month's attendance by default
  // For admins: Show current day's attendance for all employees
  const userAttendance = isAdmin
    ? attendance.filter((a) => {
        try {
          const recordDate = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date)
          const dateStr = format(recordDate, 'yyyy-MM-dd')
          // Admins see current day's attendance for all employees
          return dateStr === format(today, 'yyyy-MM-dd')
        } catch {
          return false
        }
      })
    : attendance.filter((a) => {
        if (a.employeeId !== user?.id) return false
        try {
          const recordDate = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date)
          if (view === 'monthly') {
            // Show current month's attendance
            const monthStart = startOfMonth(today)
            const monthEnd = endOfMonth(today)
            return recordDate >= monthStart && recordDate <= monthEnd
          } else if (view === 'weekly') {
            const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
            const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
            return recordDate >= weekStart && recordDate <= weekEnd
          } else {
            const dateStr = format(recordDate, 'yyyy-MM-dd')
            return dateStr === format(selectedDate, 'yyyy-MM-dd')
          }
        } catch {
          return false
        }
      })
  
  // Get month statistics for employees
  const monthStats = !isAdmin ? calculatePayableDays(
    user?.id,
    today.getMonth(),
    today.getFullYear()
  ) : null

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'half-day':
        return 'bg-yellow-100 text-yellow-800'
      case 'leave':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
            <p className="mt-2 text-sm text-gray-600">
              {isAdmin ? 'View and manage employee attendance' : 'Track your daily attendance'}
            </p>
          </div>
          {!isAdmin && (
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              {!todayAttendance?.checkIn ? (
                <button
                  onClick={handleCheckIn}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check In
                </button>
              ) : !todayAttendance?.checkOut ? (
                <button
                  onClick={handleCheckOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Check Out
                </button>
              ) : (
                <div className="text-sm text-gray-600">
                  Checked in: {todayAttendance.checkIn} | Checked out: {todayAttendance.checkOut}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            {!isAdmin && (
              <div className="flex space-x-2 mb-4 sm:mb-0">
                <button
                  onClick={() => setView('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    view === 'monthly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setView('weekly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    view === 'weekly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setView('daily')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    view === 'daily'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
              </div>
            )}
            {isAdmin ? (
              <div className="text-sm text-gray-600">
                Showing attendance for: {format(today, 'MMMM dd, yyyy')}
              </div>
            ) : (
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={view === 'monthly'}
              />
            )}
          </div>
          
          {!isAdmin && monthStats && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Monthly Attendance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-600">Total Working Days</p>
                  <p className="text-lg font-bold text-blue-900">{monthStats.totalWorkingDays}</p>
                </div>
                <div>
                  <p className="text-green-600">Present Days</p>
                  <p className="text-lg font-bold text-green-900">{monthStats.presentDays}</p>
                </div>
                <div>
                  <p className="text-red-600">Unpaid Leave Days</p>
                  <p className="text-lg font-bold text-red-900">{monthStats.unpaidLeaveDays}</p>
                </div>
                <div>
                  <p className="text-purple-600">Payable Days</p>
                  <p className="text-lg font-bold text-purple-900">{monthStats.payableDays}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Calendar View for Employees */}
        {view === 'monthly' && !isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {format(today, 'MMMM yyyy')} - Day-wise Attendance
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 p-2">
                  {day}
                </div>
              ))}
              {getMonthDates().map((date) => {
                const record = getAttendanceForDate(date, user?.id)
                const isToday = isSameDay(date, today)
                return (
                  <div
                    key={date.toISOString()}
                    className={`p-3 rounded-lg border min-h-[80px] ${
                      isToday
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <p className="text-xs text-gray-600 mb-1">{format(date, 'EEE')}</p>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {format(date, 'dd')}
                    </p>
                    {record ? (
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                        {record.checkIn && (
                          <div className="text-xs text-gray-600">
                            <p>In: {record.checkIn}</p>
                            {record.checkOut && <p>Out: {record.checkOut}</p>}
                          </div>
                        )}
                        {record.workingHours > 0 && (
                          <div className="text-xs text-gray-600">
                            <p>Hours: {record.workingHours.toFixed(1)}h</p>
                            {record.breakTime > 0 && (
                              <p>Break: {record.breakTime}h</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No record</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Weekly View */}
        {view === 'weekly' && !isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Week View</h2>
            <div className="grid grid-cols-7 gap-2">
              {getWeekDates().map((date) => {
                const record = getAttendanceForDate(date, user?.id)
                return (
                  <div
                    key={date.toISOString()}
                    className={`p-3 rounded-lg border ${
                      isSameDay(date, today)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <p className="text-xs text-gray-600 mb-1">{format(date, 'EEE')}</p>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {format(date, 'dd')}
                    </p>
                    {record ? (
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                        {record.workingHours > 0 && (
                          <p className="text-xs text-gray-600">
                            {record.workingHours.toFixed(1)}h
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No record</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isAdmin ? 'All Employees Attendance' : 'Your Attendance Records'}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  {!isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Working Hours
                    </th>
                  )}
                  {!isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Break Time
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userAttendance.length > 0 ? (
                  userAttendance
                    .sort((a, b) => {
                      const dateA = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date)
                      const dateB = typeof b.date === 'string' ? parseISO(b.date) : new Date(b.date)
                      return dateB - dateA
                    })
                    .map((record) => {
                      const employee = isAdmin
                        ? employees.find((e) => e.id === record.employeeId)
                        : null
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {employee?.name || 'Unknown'}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(
                              typeof record.date === 'string'
                                ? parseISO(record.date)
                                : new Date(record.date),
                              'MMM dd, yyyy'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkIn || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkOut || '-'}
                          </td>
                          {!isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.workingHours ? `${record.workingHours.toFixed(2)} hrs` : '-'}
                            </td>
                          )}
                          {!isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.breakTime ? `${record.breakTime} hrs` : '-'}
                            </td>
                          )}
                        </tr>
                      )
                    })
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 5 : 7}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {isAdmin 
                        ? 'No attendance records found for today'
                        : 'No attendance records found'}
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

export default Attendance

