import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import User from '../models/User.js'
import Attendance from '../models/Attendance.js'
import LeaveRequest from '../models/LeaveRequest.js'
import { calculateSalaryComponents } from '../utils/salaryCalculator.js'
import mongoose from 'mongoose'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// @route   GET /api/payroll
// @desc    Get payroll information
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { employeeId, month, year } = req.query

    let targetEmployeeId = employeeId || req.user.id

    // HR can view any employee's payroll, employees can only view their own
    if (req.user.role !== 'HR' && targetEmployeeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      })
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetEmployeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      })
    }

    const employee = await User.findById(targetEmployeeId)

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
    }

    // Calculate salary breakdown
    const salaryInfo = calculateSalaryComponents(
      employee.salary || 0,
      employee.salaryStructure
    )

    // Calculate payable days if month and year provided
    let payableDays = null
    if (month && year) {
      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 0)

      const monthAttendance = await Attendance.find({
        employeeId: new mongoose.Types.ObjectId(targetEmployeeId),
        status: 'present',
        date: { $gte: monthStart, $lte: monthEnd },
      })

      const unpaidLeaves = await LeaveRequest.find({
        employeeId: new mongoose.Types.ObjectId(targetEmployeeId),
        status: 'approved',
        leaveType: 'Unpaid',
        $or: [
          { startDate: { $gte: monthStart, $lte: monthEnd } },
          { endDate: { $gte: monthStart, $lte: monthEnd } },
          { $and: [{ startDate: { $lte: monthStart } }, { endDate: { $gte: monthEnd } }] },
        ],
      })

      let unpaidDays = 0
      unpaidLeaves.forEach((leave) => {
        const startDate = new Date(leave.startDate)
        const endDate = new Date(leave.endDate)
        const leaveStart = startDate < monthStart ? monthStart : startDate
        const leaveEnd = endDate > monthEnd ? monthEnd : endDate
        const days = Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1
        unpaidDays += days
      })

      payableDays = {
        totalWorkingDays: monthEnd.getDate(),
        presentDays: monthAttendance.length,
        unpaidLeaveDays: unpaidDays,
        payableDays: Math.max(0, monthAttendance.length - unpaidDays),
      }
    }

    res.json({
      success: true,
      data: {
        employee: {
          id: employee._id.toString(),
          name: employee.name,
          employeeId: employee.employeeId,
        },
        salary: salaryInfo,
        payableDays,
      },
    })
  } catch (error) {
    console.error('Get payroll error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

// @route   GET /api/payroll/all
// @desc    Get all employees payroll (HR only)
// @access  Private (HR)
router.get('/all', authorize('HR'), async (req, res) => {
  try {
    const users = await User.find()
    const payrolls = users.map((employee) => {
      const salaryInfo = calculateSalaryComponents(
        employee.salary || 0,
        employee.salaryStructure
      )
      return {
        employee: {
          id: employee._id.toString(),
          name: employee.name,
          employeeId: employee.employeeId,
        },
        salary: salaryInfo,
      }
    })

    res.json({
      success: true,
      data: { payrolls },
    })
  } catch (error) {
    console.error('Get all payrolls error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
})

export default router

