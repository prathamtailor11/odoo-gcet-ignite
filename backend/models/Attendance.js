import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'leave'],
    default: 'present',
  },
  checkIn: {
    type: String,
    default: null,
  },
  checkInDateTime: {
    type: Date,
    default: null,
  },
  checkOut: {
    type: String,
    default: null,
  },
  checkOutDateTime: {
    type: Date,
    default: null,
  },
  workingHours: {
    type: Number,
    default: 0,
  },
  breakTime: {
    type: Number,
    default: 1, // Default 1 hour
  },
}, {
  timestamps: true,
})

// Compound index for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true })

const Attendance = mongoose.model('Attendance', attendanceSchema)

export default Attendance

