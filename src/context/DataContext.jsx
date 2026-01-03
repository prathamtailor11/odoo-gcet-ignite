import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { attendanceAPI, leaveAPI, usersAPI } from '../services/api'

const USE_API = import.meta.env.VITE_USE_API !== 'false'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (USE_API && user) {
        try {
          // Load all data from API
          const [attendanceRes, leaveRes, usersRes] = await Promise.all([
            attendanceAPI.getAll().catch(() => ({ success: false, data: { attendance: [] } })),
            leaveAPI.getAll().catch(() => ({ success: false, data: { leaveRequests: [] } })),
            usersAPI.getAll().catch(() => ({ success: false, data: { users: [] } })),
          ])

          if (attendanceRes.success) {
            setAttendance(attendanceRes.data.attendance)
          }
          if (leaveRes.success) {
            setLeaveRequests(leaveRes.data.leaveRequests)
          }
          if (usersRes.success) {
            setEmployees(usersRes.data.users)
          }
        } catch (error) {
          console.error('Failed to load data:', error)
          // Fallback to localStorage
          loadFromLocalStorage()
        }
      } else {
        loadFromLocalStorage()
      }
      setLoading(false)
    }

    const loadFromLocalStorage = () => {
      const storedAttendance = localStorage.getItem('attendance')
      const storedLeaveRequests = localStorage.getItem('leaveRequests')
      const storedEmployees = localStorage.getItem('users')

      if (storedAttendance) {
        setAttendance(JSON.parse(storedAttendance))
      }
      if (storedLeaveRequests) {
        setLeaveRequests(JSON.parse(storedLeaveRequests))
      }
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees))
      }
    }

    loadData()
  }, [user])

  const addAttendance = async (attendanceData) => {
    if (USE_API) {
      try {
        const response = await attendanceAPI.create(attendanceData)
        if (response.success) {
          setAttendance([...attendance, response.data.attendance])
          return response.data.attendance
        }
      } catch (error) {
        console.error('Failed to create attendance:', error)
      }
    }
    // Fallback to localStorage
    const newAttendance = {
      ...attendanceData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    }
    const updated = [...attendance, newAttendance]
    setAttendance(updated)
    localStorage.setItem('attendance', JSON.stringify(updated))
    return newAttendance
  }

  const updateAttendance = async (id, updates) => {
    if (USE_API) {
      try {
        const response = await attendanceAPI.update(id, updates)
        if (response.success) {
          setAttendance(attendance.map((a) => (a.id === id ? response.data.attendance : a)))
          return response.data.attendance
        }
      } catch (error) {
        console.error('Failed to update attendance:', error)
      }
    }
    // Fallback to localStorage
    const updated = attendance.map((a) => (a.id === id ? { ...a, ...updates } : a))
    setAttendance(updated)
    localStorage.setItem('attendance', JSON.stringify(updated))
    return updated.find((a) => a.id === id)
  }

  const addLeaveRequest = async (leaveData) => {
    if (USE_API) {
      try {
        const response = await leaveAPI.create(leaveData)
        if (response.success) {
          setLeaveRequests([...leaveRequests, response.data.leaveRequest])
          return response.data.leaveRequest
        }
      } catch (error) {
        console.error('Failed to create leave request:', error)
        throw error
      }
    }
    // Fallback to localStorage
    const newRequest = {
      ...leaveData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    const updated = [...leaveRequests, newRequest]
    setLeaveRequests(updated)
    localStorage.setItem('leaveRequests', JSON.stringify(updated))
    return newRequest
  }

  const updateLeaveRequest = async (id, updates) => {
    if (USE_API) {
      try {
        let response
        if (updates.status === 'approved') {
          response = await leaveAPI.approve(id, updates.comments)
        } else if (updates.status === 'rejected') {
          response = await leaveAPI.reject(id, updates.comments)
        } else {
          // For other updates, we'd need a general update endpoint
          // For now, just update locally
          const updated = leaveRequests.map((r) => (r.id === id ? { ...r, ...updates } : r))
          setLeaveRequests(updated)
          return updated.find((r) => r.id === id)
        }

        if (response.success) {
          setLeaveRequests(leaveRequests.map((r) => (r.id === id ? response.data.leaveRequest : r)))
          return response.data.leaveRequest
        }
      } catch (error) {
        console.error('Failed to update leave request:', error)
      }
    }
    // Fallback to localStorage
    const updated = leaveRequests.map((r) => (r.id === id ? { ...r, ...updates } : r))
    setLeaveRequests(updated)
    localStorage.setItem('leaveRequests', JSON.stringify(updated))
    return updated.find((r) => r.id === id)
  }

  const getEmployeeAttendance = (employeeId) => {
    return attendance.filter((a) => a.employeeId === employeeId)
  }

  const getEmployeeLeaveRequests = (employeeId) => {
    return leaveRequests.filter((r) => r.employeeId === employeeId)
  }

  const value = {
    attendance,
    leaveRequests,
    employees,
    addAttendance,
    updateAttendance,
    addLeaveRequest,
    updateLeaveRequest,
    getEmployeeAttendance,
    getEmployeeLeaveRequests,
    setEmployees,
    loading,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

