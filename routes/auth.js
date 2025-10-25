const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP, verifyOTP, getRemainingDailyOTPs } = require('../services/otpService');

// Password validation function - Minimum 8 characters
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return true;
};

// Send OTP for registration
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, purpose } = req.body; // purpose: 'registration' or 'password-reset'

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // For registration, check if user already exists
    if (purpose === 'registration') {
      const existingUser = await User.findOne({ phone: phone.replace(/^\+91/, '') });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }
    }

    // For password reset, check if user exists
    if (purpose === 'password-reset') {
      const user = await User.findOne({ phone: phone.replace(/^\+91/, '') });
      if (!user) {
        return res.status(404).json({ message: 'Phone number not registered' });
      }
    }

    // Send OTP
    const result = await sendOTP(phone, purpose || 'registration');
    
    res.json({
      success: true,
      message: result.message,
      expiresIn: result.expiresIn,
      attemptsRemaining: result.attemptsRemaining
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Verify OTP and Register
router.post('/verify-otp-register', async (req, res) => {
  try {
    const { name, phone, email, password, otp } = req.body;

    // Validate required fields
    if (!name || !phone || !password || !otp) {
      return res.status(400).json({ message: 'Name, phone, password, and OTP are required' });
    }

    // Validate password (minimum 8 characters)
    validatePassword(password);

    // Verify OTP
    const otpResult = verifyOTP(phone, otp);
    
    if (!otpResult.success) {
      return res.status(400).json({ message: 'OTP verification failed' });
    }

    // Check if user already exists
    const cleanPhone = phone.replace(/^\+91/, '');
    let user = await User.findOne({ phone: cleanPhone });
    if (user) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Check if email exists (if provided)
    if (email) {
      user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email: email || undefined,
      phone: cleanPhone,
      password: hashedPassword,
      role: 'client',
      phoneVerified: true
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Login (with email or phone)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email/phone and password' });
    }

    // Clean phone number if it's a phone
    const cleanIdentifier = identifier.replace(/^\+91/, '');

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { phone: cleanIdentifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'User is blocked. Contact admin: +919524350214' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP for password reset
router.post('/verify-otp-reset', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // Verify OTP
    const otpResult = verifyOTP(phone, otp);
    
    if (!otpResult.success || otpResult.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid OTP for password reset' });
    }

    // Find user
    const cleanPhone = phone.replace(/^\+91/, '');
    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create temporary reset token (valid for 10 minutes)
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({
      success: true,
      message: 'OTP verified. You can now reset your password.',
      resetToken
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    // Validate new password (minimum 8 characters)
    validatePassword(newPassword);

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Check OTP daily limit
router.post('/check-otp-limit', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const remaining = getRemainingDailyOTPs(phone);

    res.json({
      success: true,
      remaining,
      canSendOTP: remaining > 0
    });
  } catch (error) {
    console.error('Check limit error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;