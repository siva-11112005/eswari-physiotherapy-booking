const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  phone: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  reason: {
    type: String
  },
  painType: {
    type: String
  },
  verificationCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'cancelled'],
    default: 'pending'
  },
  timeChanged: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);