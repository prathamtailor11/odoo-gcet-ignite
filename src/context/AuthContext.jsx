import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, usersAPI } from '../services/api'

const USE_API = import.meta.env.VITE_USE_API !== 'false' // Default to true if not set

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (USE_API) {
        // Try to load user from API using token
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const response = await authAPI.getCurrentUser()
            if (response.success) {
              setUser(response.data.user)
            } else {
              localStorage.removeItem('token')
            }
          } catch (error) {
            console.error('Failed to load user:', error)
            localStorage.removeItem('token')
          }
        }
      } else {
        // Fallback to localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  const signUp = async (userData) => {
    if (USE_API) {
      try {
        const response = await authAPI.signup(userData)
        if (response.success) {
          localStorage.setItem('token', response.data.token)
          setUser(response.data.user)
          return { success: true }
        }
        // Handle validation errors
        const errorMessage = response.errors 
          ? response.errors.map(err => err.msg || err).join(', ')
          : response.message || 'Registration failed'
        return { success: false, error: errorMessage }
      } catch (error) {
        console.error('Signup error:', error)
        return { success: false, error: error.message || 'Registration failed. Please check your connection and try again.' }
      }
    } else {
      // Fallback to localStorage
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
      return { success: true }
    }
  }

  const signIn = async (email, password) => {
    if (USE_API) {
      try {
        const response = await authAPI.signin(email, password)
        if (response.success) {
          localStorage.setItem('token', response.data.token)
          setUser(response.data.user)
          return { success: true }
        }
        return { success: false, error: response.message }
      } catch (error) {
        return { success: false, error: error.message || 'Invalid email or password' }
      }
    } else {
      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      )
      if (foundUser) {
        localStorage.setItem('user', JSON.stringify(foundUser))
        setUser(foundUser)
        return { success: true }
      }
      return { success: false, error: 'Invalid email or password' }
    }
  }

  const signOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = async (updatedUser) => {
    if (USE_API) {
      try {
        const response = await usersAPI.update(updatedUser.id, updatedUser)
        if (response.success) {
          setUser(response.data.user)
          return response.data.user
        }
      } catch (error) {
        console.error('Failed to update user:', error)
        // Fallback to local update
        setUser(updatedUser)
        return updatedUser
      }
    } else {
      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const index = users.findIndex((u) => u.id === updatedUser.id)
      if (index !== -1) {
        users[index] = updatedUser
        localStorage.setItem('users', JSON.stringify(users))
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
      return updatedUser
    }
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    updateUser,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

