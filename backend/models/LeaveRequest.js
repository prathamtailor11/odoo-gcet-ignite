import mongoose from 'mongoose'

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  leaveType: {
    type: String,
    enum: ['Paid', 'Sick', 'Unpaid'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  remarks: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  rejectedAt: {
    type: Date,
    default: null,
  },
  comments: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
})

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema)

export default LeaveRequest

