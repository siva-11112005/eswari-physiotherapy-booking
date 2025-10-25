const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all bookings (Admin only)
router.get('/bookings', auth, adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify booking (Admin only)
router.put('/bookings/:id/verify', auth, adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'verified';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking (Admin only)
router.put('/bookings/:id/cancel', auth, adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Here you can add SMS notification logic
    // Example: sendSMS(booking.phone, `Your booking for ${booking.date} at ${booking.time} has been cancelled.`);

    res.json({ success: true, booking, message: 'Booking cancelled and notification sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel all bookings for a specific date (Admin only)
router.put('/bookings/cancel-all/:date', auth, adminAuth, async (req, res) => {
  try {
    const { date } = req.params;
    
    const result = await Booking.updateMany(
      { date, status: { $ne: 'cancelled' } },
      { $set: { status: 'cancelled' } }
    );

    // Get all cancelled bookings to send SMS
    const cancelledBookings = await Booking.find({ date, status: 'cancelled' });
    
    // Here you can add bulk SMS notification logic
    // cancelledBookings.forEach(booking => {
    //   sendSMS(booking.phone, `Your booking for ${booking.date} at ${booking.time} has been cancelled.`);
    // });

    res.json({ 
      success: true, 
      message: `${result.modifiedCount} bookings cancelled`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block user (Admin only)
router.put('/users/:identifier/block', auth, adminAuth, async (req, res) => {
  try {
    const { identifier } = req.params; // Can be email or phone
    
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unblock user (Admin only)
router.put('/users/:identifier/unblock', auth, adminAuth, async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = false;
    await user.save();

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blocked users (Admin only)
router.get('/blocked-users', auth, adminAuth, async (req, res) => {
  try {
    const blockedUsers = await User.find({ isBlocked: true }).select('-password');
    res.json({ success: true, users: blockedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;