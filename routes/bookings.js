const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { date, time, reason, painType, phone, email } = req.body;

    // Check if user is blocked
    const user = await User.findById(req.user.userId);
    if (user.isBlocked) {
      return res.status(403).json({ message: 'User is blocked from booking' });
    }

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({
      date,
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    // Generate verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create booking
    const booking = new Booking({
      userId: req.user.userId,
      name: user.name,
      email: email || user.email,
      phone: phone || user.phone,
      date,
      time,
      reason,
      painType,
      verificationCode,
      status: 'pending'
    });

    await booking.save();

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking (by user)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking time (only for current date)
router.put('/:id/change-time', auth, async (req, res) => {
  try {
    const { newTime } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if booking is for today
    const today = new Date().toISOString().split('T')[0];
    if (booking.date !== today) {
      return res.status(400).json({ message: 'Can only change time for today\'s booking' });
    }

    // Check if new slot is available
    const existingBooking = await Booking.findOne({
      date: booking.date,
      time: newTime,
      status: { $ne: 'cancelled' },
      _id: { $ne: booking._id }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'New time slot is already booked' });
    }

    booking.time = newTime;
    booking.timeChanged = true;
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;