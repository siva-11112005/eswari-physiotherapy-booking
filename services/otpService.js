const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();
const otpAttempts = new Map();

// Clean up expired OTPs every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(key);
    }
  }
  
  // Reset daily attempts at midnight
  const today = new Date().toDateString();
  for (const [key, data] of otpAttempts.entries()) {
    if (data.date !== today) {
      otpAttempts.delete(key);
    }
  }
}, 60000);

// Validate Indian mobile number
const validateIndianMobile = (phoneNumber) => {
  // Remove +91 if present
  let cleanNumber = phoneNumber.replace(/^\+91/, '').replace(/\s+/g, '');
  
  // Check if it's a valid 10-digit Indian number
  const indianMobileRegex = /^[6-9]\d{9}$/;
  
  if (!indianMobileRegex.test(cleanNumber)) {
    throw new Error('Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9');
  }
  
  return '+91' + cleanNumber;
};

// Check daily OTP limit
const checkDailyLimit = (phoneNumber) => {
  const today = new Date().toDateString();
  const key = phoneNumber;
  
  if (!otpAttempts.has(key)) {
    otpAttempts.set(key, { count: 0, date: today });
  }
  
  const attempts = otpAttempts.get(key);
  
  if (attempts.date !== today) {
    attempts.count = 0;
    attempts.date = today;
  }
  
  if (attempts.count >= 5) {
    throw new Error('Daily OTP limit reached (5 OTPs). Try again tomorrow.');
  }
  
  return attempts;
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS
const sendOTP = async (phoneNumber, purpose = 'verification') => {
  try {
    // Validate Indian mobile number
    const validatedPhone = validateIndianMobile(phoneNumber);
    
    // Check daily limit
    const attempts = checkDailyLimit(validatedPhone);
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
    
    // Store OTP
    otpStore.set(validatedPhone, {
      otp,
      expiresAt,
      purpose,
      attempts: 0
    });
    
    // Increment daily count
    attempts.count++;
    
    // Prepare message based on purpose
    let message;
    if (purpose === 'registration') {
      message = `Your OTP for registration at Eswari Physiotherapy is: ${otp}\n\nValid for 5 minutes. Do not share with anyone.\n\n- Pain Rehab Clinic`;
    } else if (purpose === 'password-reset') {
      message = `Your password reset OTP for Eswari Physiotherapy is: ${otp}\n\nValid for 5 minutes. Do not share with anyone.\n\n- Pain Rehab Clinic`;
    } else {
      message = `Your verification OTP is: ${otp}\n\nValid for 5 minutes.\n\n- Eswari Physiotherapy`;
    }
    
    // Send SMS
    return new Promise((resolve, reject) => {
      vonage.sms.send({
        to: validatedPhone,
        from: 'ESWARI',
        text: message
      })
      .then(resp => {
        console.log(`OTP sent successfully to ${validatedPhone}`);
        resolve({
          success: true,
          message: 'OTP sent successfully',
          expiresIn: 300, // 5 minutes in seconds
          attemptsRemaining: 5 - attempts.count
        });
      })
      .catch(err => {
        console.error('OTP SMS Error:', err);
        reject(err);
      });
    });
  } catch (error) {
    throw error;
  }
};

// Verify OTP
const verifyOTP = (phoneNumber, otp) => {
  try {
    const validatedPhone = validateIndianMobile(phoneNumber);
    
    const otpData = otpStore.get(validatedPhone);
    
    if (!otpData) {
      throw new Error('OTP not found or expired. Please request a new OTP.');
    }
    
    // Check expiry
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(validatedPhone);
      throw new Error('OTP has expired. Please request a new OTP.');
    }
    
    // Check attempts (max 3 attempts)
    if (otpData.attempts >= 3) {
      otpStore.delete(validatedPhone);
      throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
    }
    
    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts++;
      throw new Error(`Invalid OTP. ${3 - otpData.attempts} attempts remaining.`);
    }
    
    // OTP verified successfully
    otpStore.delete(validatedPhone);
    
    return {
      success: true,
      message: 'OTP verified successfully',
      purpose: otpData.purpose
    };
  } catch (error) {
    throw error;
  }
};

// Check if OTP exists and is valid
const checkOTPStatus = (phoneNumber) => {
  try {
    const validatedPhone = validateIndianMobile(phoneNumber);
    const otpData = otpStore.get(validatedPhone);
    
    if (!otpData) {
      return { exists: false };
    }
    
    const now = Date.now();
    const timeRemaining = Math.max(0, Math.floor((otpData.expiresAt - now) / 1000));
    
    if (timeRemaining === 0) {
      otpStore.delete(validatedPhone);
      return { exists: false };
    }
    
    return {
      exists: true,
      timeRemaining,
      attemptsRemaining: 3 - otpData.attempts
    };
  } catch (error) {
    throw error;
  }
};

// Get remaining daily OTPs
const getRemainingDailyOTPs = (phoneNumber) => {
  try {
    const validatedPhone = validateIndianMobile(phoneNumber);
    const today = new Date().toDateString();
    const key = validatedPhone;
    
    if (!otpAttempts.has(key)) {
      return 5;
    }
    
    const attempts = otpAttempts.get(key);
    
    if (attempts.date !== today) {
      return 5;
    }
    
    return Math.max(0, 5 - attempts.count);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  checkOTPStatus,
  getRemainingDailyOTPs,
  validateIndianMobile
};