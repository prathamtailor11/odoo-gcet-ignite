import express from 'express'
import { body, validationResult } from 'express-validator'
import { authenticate, authorize } from '../middleware/auth.js'
import LeaveRequest from '../models/LeaveRequest.js'
import mongoose from 'mongoose'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// @route   GET /api/leave
// @desc    Get leave requests
// @access  Private
router.get('/', async (req, res) => {
  try {
    const query = {}

    // Filter by employee (users can only see their own, HR can see all)
    if (req.user.role !== 'HR') {
      query.employeeId = new mongoose.Types.ObjectId(req.user.id)
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate('employeeId', 'name email employeeId')
      .populate('approvedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: { leaveRequests },
    })
  } catch (error) {
    console.error('Get leave requests error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

// @route   POST /api/leave
// @desc    Create leave request
// @access  Private (Employee only)
router.post(
  '/',
  [
    body('leaveType').isIn(['Paid', 'Sick', 'Unpaid']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('remarks').optional().trim(),
  ],
  async (req, res) => {
    try {
      if (req.user.role === 'HR') {
        return res.status(403).json({
          success: false,
          message: 'HR officers cannot create leave requests',
        })
      }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        })
      }

      const { leaveType, startDate, endDate, remarks } = req.body

      // Validate date range
      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date',
        })
      }

      const leaveRequest = {
        employeeId: new mongoose.Types.ObjectId(req.user.id),
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        remarks: remarks || '',
        status: 'pending',
      }

      const newRequest = await LeaveRequest.create(leaveRequest)

      res.status(201).json({
        success: true,
        message: 'Leave request created',
        data: { leaveRequest: newRequest },
      })
    } catch (error) {
      console.error('Create leave request error:', error)
      res.status(500).json({
        success: false,
        message: 'Server error',
      })
    }
  }
)

// @route   PUT /api/leave/:id/approve
// @desc    Approve leave request
// @access  Private (HR)
router.put('/:id/approve', authorize('HR'), async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave request ID',
      })
    }

    const updated = await LeaveRequest.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'approved',
          approvedBy: new mongoose.Types.ObjectId(req.user.id),
          approvedAt: new Date(),
          comments: req.body.comments || '',
        },
      },
      { new: true }
    ).populate('employeeId', 'name email employeeId')

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      })
    }

    res.json({
      success: true,
      message: 'Leave request approved',
      data: { leaveRequest: updated },
    })
  } catch (error) {
    console.error('Approve leave error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

// @route   PUT /api/leave/:id/reject
// @desc    Reject leave request
// @access  Private (HR)
router.put('/:id/reject', authorize('HR'), async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave request ID',
      })
    }

    const updated = await LeaveRequest.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'rejected',
          rejectedBy: new mongoose.Types.ObjectId(req.user.id),
          rejectedAt: new Date(),
          comments: req.body.comments || '',
        },
      },
      { new: true }
    ).populate('employeeId', 'name email employeeId')

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      })
    }

    res.json({
      success: true,
      message: 'Leave request rejected',
      data: { leaveRequest: updated },
    })
  } catch (error) {
    console.error('Reject leave error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

export default router

