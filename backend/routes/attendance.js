import express from 'express'
import { body, validationResult } from 'express-validator'
import { authenticate, authorize } from '../middleware/auth.js'
import Attendance from '../models/Attendance.js'
import mongoose from 'mongoose'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { employeeId, date, startDate, endDate } = req.query
    const query = {}

    // Filter by employee (users can only see their own, HR can see all)
    if (req.user.role !== 'HR') {
      query.employeeId = new mongoose.Types.ObjectId(req.user.id)
    } else if (employeeId) {
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        query.employeeId = new mongoose.Types.ObjectId(employeeId)
      }
    }

    // Filter by date
    if (date) {
      const dateObj = new Date(date)
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0))
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999))
      query.date = { $gte: startOfDay, $lte: endOfDay }
    }

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'name email employeeId')
      .sort({ date: -1 })

    res.json({
      success: true,
      data: { attendance },
    })
  } catch (error) {
    console.error('Get attendance error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

// @route   POST /api/attendance/checkin
// @desc    Check in
// @access  Private (Employee only)
router.post(
  '/checkin',
  async (req, res) => {
    try {
      if (req.user.role === 'HR') {
        return res.status(403).json({
          success: false,
          message: 'HR officers cannot check in',
        })
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)

      // Check if already checked in today
      const todayRecord = await Attendance.findOne({
        employeeId: new mongoose.Types.ObjectId(req.user.id),
        date: { $gte: today, $lte: endOfDay },
      })

      if (todayRecord && todayRecord.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'Already checked in today',
        })
      }

      const checkInTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const attendanceData = {
        employeeId: new mongoose.Types.ObjectId(req.user.id),
        date: new Date(),
        checkIn: checkInTime,
        checkInDateTime: new Date(),
        status: 'present',
        workingHours: 0,
        breakTime: 1, // Default 1 hour
      }

      if (todayRecord) {
        const updated = await Attendance.findByIdAndUpdate(
          todayRecord._id,
          { $set: attendanceData },
          { new: true }
        )
        res.json({
          success: true,
          message: 'Checked in successfully',
          data: { attendance: updated },
        })
      } else {
        const newRecord = await Attendance.create(attendanceData)
        res.status(201).json({
          success: true,
          message: 'Checked in successfully',
          data: { attendance: newRecord },
        })
      }
    } catch (error) {
      console.error('Check in error:', error)
      res.status(500).json({
        success: false,
        message: 'Server error',
      })
    }
  }
)

// @route   POST /api/attendance/checkout
// @desc    Check out
// @access  Private (Employee only)
router.post(
  '/checkout',
  async (req, res) => {
    try {
      if (req.user.role === 'HR') {
        return res.status(403).json({
          success: false,
          message: 'HR officers cannot check out',
        })
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)

      const todayRecord = await Attendance.findOne({
        employeeId: new mongoose.Types.ObjectId(req.user.id),
        date: { $gte: today, $lte: endOfDay },
      })

      if (!todayRecord || !todayRecord.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'Please check in first',
        })
      }

      if (todayRecord.checkOut) {
        return res.status(400).json({
          success: false,
          message: 'Already checked out today',
        })
      }

      const checkOutTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })

      // Calculate working hours
      const checkInDateTime = new Date(todayRecord.checkInDateTime)
      const checkOutDateTime = new Date()
      const totalMinutes = (checkOutDateTime - checkInDateTime) / (1000 * 60)
      const breakTime = todayRecord.breakTime || 1
      const workingHours = Math.max(0, (totalMinutes / 60) - breakTime)

      const updated = await Attendance.findByIdAndUpdate(
        todayRecord._id,
        {
          $set: {
            checkOut: checkOutTime,
            checkOutDateTime: checkOutDateTime,
            workingHours: parseFloat(workingHours.toFixed(2)),
            breakTime: breakTime,
          },
        },
        { new: true }
      )

      res.json({
        success: true,
        message: 'Checked out successfully',
        data: { attendance: updated },
      })
    } catch (error) {
      console.error('Check out error:', error)
      res.status(500).json({
        success: false,
        message: 'Server error',
      })
    }
  }
)

// @route   POST /api/attendance
// @desc    Create attendance record (HR only)
// @access  Private (HR)
router.post(
  '/',
  [
    body('employeeId').notEmpty(),
    body('date').isISO8601(),
    body('status').isIn(['present', 'absent', 'half-day', 'leave']),
  ],
  async (req, res) => {
    try {
      if (req.user.role !== 'HR') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
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

      // Validate employeeId
      if (!mongoose.Types.ObjectId.isValid(req.body.employeeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid employee ID',
        })
      }

      const attendanceData = {
        employeeId: new mongoose.Types.ObjectId(req.body.employeeId),
        date: new Date(req.body.date),
        status: req.body.status,
        checkIn: req.body.checkIn || null,
        checkOut: req.body.checkOut || null,
        workingHours: req.body.workingHours || 0,
        breakTime: req.body.breakTime || 0,
      }

      const newRecord = await Attendance.create(attendanceData)

      res.status(201).json({
        success: true,
        message: 'Attendance record created',
        data: { attendance: newRecord },
      })
    } catch (error) {
      console.error('Create attendance error:', error)
      res.status(500).json({
        success: false,
        message: 'Server error',
      })
    }
  }
)

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (HR)
router.put('/:id', authorize('HR'), async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance record ID',
      })
    }

    const updated = await Attendance.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    )

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      })
    }

    res.json({
      success: true,
      message: 'Attendance record updated',
      data: { attendance: updated },
    })
  } catch (error) {
    console.error('Update attendance error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

export default router

