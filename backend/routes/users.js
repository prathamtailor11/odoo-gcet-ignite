import express from 'express'
import { body, validationResult } from 'express-validator'
import { authenticate, authorize } from '../middleware/auth.js'
import User from '../models/User.js'
import mongoose from 'mongoose'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// @route   GET /api/users
// @desc    Get all users (HR only)
// @access  Private (HR)
router.get('/', authorize('HR'), async (req, res) => {
  try {
    const users = await User.find().select('-password')

    res.json({
      success: true,
      data: { users },
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      })
    }

    // Users can only view their own profile unless they're HR
    if (req.user.id !== id && req.user.role !== 'HR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      })
    }

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.json({
      success: true,
      data: { user: user.toObject() },
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('address').optional().trim(),
    body('department').optional().trim(),
    body('position').optional().trim(),
    body('salary').optional().isNumeric(),
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

      const { id } = req.params

      // Validate MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        })
      }

      // Users can only update their own profile unless they're HR
      if (req.user.id !== id && req.user.role !== 'HR') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        })
      }

      const user = await User.findById(id)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      // HR can update all fields, employees can only update limited fields
      const allowedFields = req.user.role === 'HR'
        ? ['name', 'email', 'phone', 'address', 'department', 'position', 'salary', 'salaryStructure', 'profilePicture']
        : ['name', 'phone', 'address', 'profilePicture']

      const updates = {}
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field]
        }
      })

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      )

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser.toObject() },
      })
    } catch (error) {
      console.error('Update user error:', error)
      res.status(500).json({
        success: false,
        message: 'Server error',
      })
    }
  }
)

export default router

