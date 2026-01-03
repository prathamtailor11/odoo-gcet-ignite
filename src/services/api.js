const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token')
}

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken()
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      // Extract error message from response
      const errorMessage = data.message || data.errors?.[0]?.msg || data.errors?.[0] || 'API request failed'
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    // If it's already an Error object, re-throw it
    if (error instanceof Error) {
      throw error
    }
    // Otherwise, wrap it in an Error
    throw new Error(error.message || 'Network error. Please check if the backend server is running.')
  }
}

// Auth API
export const authAPI = {
  signup: (userData) => apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  signin: (email, password) => apiRequest('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  getCurrentUser: () => apiRequest('/auth/me'),
}

// Users API
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  getById: (id) => apiRequest(`/users/${id}`),
  update: (id, updates) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
}

// Attendance API
export const attendanceAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/attendance${queryString ? `?${queryString}` : ''}`)
  },
  checkIn: () => apiRequest('/attendance/checkin', {
    method: 'POST',
  }),
  checkOut: () => apiRequest('/attendance/checkout', {
    method: 'POST',
  }),
  create: (data) => apiRequest('/attendance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, updates) => apiRequest(`/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
}

// Leave API
export const leaveAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/leave${queryString ? `?${queryString}` : ''}`)
  },
  create: (data) => apiRequest('/leave', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  approve: (id, comments = '') => apiRequest(`/leave/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ comments }),
  }),
  reject: (id, comments = '') => apiRequest(`/leave/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ comments }),
  }),
}

// Payroll API
export const payrollAPI = {
  get: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/payroll${queryString ? `?${queryString}` : ''}`)
  },
  getAll: () => apiRequest('/payroll/all'),
}

