import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { LogOut, Menu, X, CheckCircle, XCircle, User } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const Layout = ({ children }) => {
  const { user, signOut } = useAuth()
  const { attendance, addAttendance, updateAttendance } = useData()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState(null)
  const dropdownRef = useRef(null)

  const isAdmin = user?.role === 'HR'
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  useEffect(() => {
    const loadTodayAttendance = async () => {
      if (user && !isAdmin) {
        if (USE_API) {
          try {
            const response = await attendanceAPI.getAll({ date: todayStr })
            if (response.success && response.data.attendance.length > 0) {
              setTodayAttendance(response.data.attendance[0])
            } else {
              setTodayAttendance(null)
            }
          } catch (error) {
            console.error('Failed to load today attendance:', error)
            // Fallback to local data
            const todayRecord = attendance.find((a) => {
              if (a.employeeId !== user.id) return false
              try {
                const recordDate = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date)
                return format(recordDate, 'yyyy-MM-dd') === todayStr
              } catch {
                return false
              }
            })
            setTodayAttendance(todayRecord || null)
          }
        } else {
          const todayRecord = attendance.find((a) => {
            if (a.employeeId !== user.id) return false
            try {
              const recordDate = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date)
              return format(recordDate, 'yyyy-MM-dd') === todayStr
            } catch {
              return false
            }
          })
          setTodayAttendance(todayRecord || null)
        }
      }
    }
    loadTodayAttendance()
  }, [attendance, user, todayStr, isAdmin])

  const handleLogout = () => {
    signOut()
    navigate('/signin')
  }

  const handleCheckIn = async () => {
    if (!user || isAdmin) return
    
    try {
      if (USE_API) {
        const response = await attendanceAPI.checkIn()
        if (response.success) {
          setTodayAttendance(response.data.attendance)
          // Refresh attendance list
          const allResponse = await attendanceAPI.getAll()
          if (allResponse.success) {
            // Update context would be handled by DataContext refresh
          }
        }
      } else {
        const result = await addAttendance({
          employeeId: user.id,
          date: today.toISOString(),
          checkIn: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'present',
        })
        setTodayAttendance(result)
      }
    } catch (error) {
      console.error('Check-in failed:', error)
    }
  }

  const handleCheckOut = async () => {
    if (!user || isAdmin || !todayAttendance) return
    
    try {
      if (USE_API) {
        const response = await attendanceAPI.checkOut()
        if (response.success) {
          setTodayAttendance(response.data.attendance)
        }
      } else {
        await updateAttendance(todayAttendance.id, {
          checkOut: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })
      }
    } catch (error) {
      console.error('Check-out failed:', error)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut
  const isCheckedOut = todayAttendance?.checkOut

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileDropdownOpen])

  const handleProfileAvatarClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
  }

  const handleProfileMenuClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setProfileDropdownOpen(false)
    // Use setTimeout to ensure dropdown closes before navigation
    setTimeout(() => {
      navigate('/profile')
    }, 100)
  }

  const handleLogoutClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setProfileDropdownOpen(false)
    handleLogout()
  }

  const navItems = isAdmin
    ? [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/attendance', label: 'Attendance' },
        { path: '/leave', label: 'Leave Requests' },
        { path: '/payroll', label: 'Payroll' },
      ]
    : [
        { path: '/employee/dashboard', label: 'Dashboard' },
        { path: '/profile', label: 'Profile' },
        { path: '/attendance', label: 'Attendance' },
        { path: '/leave', label: 'Leave' },
        { path: '/payroll', label: 'Payroll' },
      ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <nav className="glass shadow-lg border-b border-gray-200/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold gradient-text animate-fade-in">Dayflow</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="inline-flex items-center px-3 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-purple-600 hover:border-purple-500 transition-all duration-300 animate-slide-down"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex items-center space-x-3">
                {!isAdmin && (
                  <>
                    {/* Status Indicator */}
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isCheckedIn ? 'bg-green-500' : 'bg-red-500'
                          } shadow-lg ${isCheckedIn ? 'animate-pulse' : ''}`}
                          title={isCheckedIn ? 'Checked In' : 'Not Checked In'}
                        />
                        {isCheckedIn && (
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Check In/Out Buttons */}
                    {!todayAttendance?.checkIn ? (
                      <button
                        onClick={handleCheckIn}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Check In
                      </button>
                    ) : !todayAttendance?.checkOut ? (
                      <button
                        onClick={handleCheckOut}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Check Out
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {todayAttendance.checkIn} - {todayAttendance.checkOut}
                      </span>
                    )}
                  </>
                )}
                
                {/* Profile Picture with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleProfileAvatarClick}
                    className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-1 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-md cursor-pointer">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user?.name || 'User'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(user?.name || user?.email)
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium text-gray-700">
                        {user?.name || user?.email}
                      </span>
                      <span className="text-xs text-gray-500">{user?.role}</span>
                    </div>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleProfileMenuClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        My Profile
                      </button>
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="sm:hidden flex items-center space-x-2">
              {!isAdmin && (
                <>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCheckedIn ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  {!todayAttendance?.checkIn ? (
                    <button
                      onClick={handleCheckIn}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      In
                    </button>
                  ) : !todayAttendance?.checkOut ? (
                    <button
                      onClick={handleCheckOut}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Out
                    </button>
                  ) : null}
                </>
              )}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleProfileAvatarClick}
                  className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user?.name || user?.email)
                  )}
                </button>
                
                {/* Mobile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleProfileMenuClick}
                      className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 text-left"
                    >
                      <User className="h-3 w-3 mr-2 text-gray-400" />
                      My Profile
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 text-left"
                    >
                      <LogOut className="h-3 w-3 mr-2 text-gray-400" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout

