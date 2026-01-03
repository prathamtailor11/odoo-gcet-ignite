import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'

const router = express.Router()

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    { expiresIn: '7d' }
  )
}

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('name').trim().notEmpty(),
    body('employeeId').trim().notEmpty(),
    body('role').isIn(['Employee', 'HR']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
          field: err.param,
          msg: err.msg
        }))
        return res.status(400).json({
          success: false,
          message: 'Validation failed: ' + errorMessages.map(e => e.msg).join(', '),
          errors: errorMessages,
        })
      }

      const { email, password, name, employeeId, role } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { employeeId }]
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or employee ID already exists',
        })
      }

      // Create user (password will be hashed by pre-save hook)
      const newUser = await User.create({
        email,
        password,
        name,
        employeeId,
        role,
        salary: 0,
        salaryStructure: null,
        profilePicture: null,
        phone: '',
        address: '',
        department: '',
        position: '',
      })

      // Generate token
      const token = generateToken({
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      })

      // Convert to plain object and remove password
      const userResponse = newUser.toObject()
      delete userResponse.password

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token,
        },
      })
    } catch (error) {
      console.error('Signup error:', error)
      
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0]
        return res.status(400).json({
          success: false,
          message: `User with this ${field} already exists`,
        })
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message)
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors,
        })
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Server error during registration',
      })
    }
  }
)

// @route   POST /api/auth/signin
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/signin',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      // Find user with password field
      const user = await User.findOne({ email }).select('+password')

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        })
      }

      // Verify password using model method
      const isMatch = await user.comparePassword(password)

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        })
      }

      // Generate token
      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      })

      // Convert to plain object and remove password
      const userResponse = user.toObject()
      delete userResponse.password

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
        },
      })
    } catch (error) {
      console.error('Signin error:', error)
      res.status(500).json({
        success: false,
        message: 'Server error during authentication',
      })
    }
  }
)

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key')
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Convert to plain object (password already excluded by default)
    const userResponse = user.toObject()

    res.json({
      success: true,
      data: { user: userResponse },
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
})

export default router

