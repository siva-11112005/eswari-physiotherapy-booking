const { Vonage } = require('@vonage/server-sdk');

// Initialize Vonage client
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

const ADMIN_PHONE = process.env.ADMIN_PHONE || '+919524350214'; // Admin contact number

// Send SMS function
const sendSMS = (to, message) => {
  return new Promise((resolve, reject) => {
    vonage.sms.send({
      to: to,
      from: 'ESWARI',
      text: message
    })
    .then(resp => {
      console.log('Message sent successfully.');
      resolve(resp);
    })
    .catch(err => {
      console.error('SMS Error:', err);
      reject(err);
    });
  });
};

// Booking Confirmed SMS
const sendBookingConfirmation = async (phoneNumber, bookingDetails) => {
  const { name, date, time, verificationCode } = bookingDetails;
  
  const message = `Hi ${name}!\n\nYour appointment at Eswari Physiotherapy is confirmed!\n\nDate: ${date}\nTime: ${time}\nVerification Code: ${verificationCode}\n\nFor any queries, contact: ${ADMIN_PHONE}\n\n- Pain Rehab Clinic`;
  
  try {
    await sendSMS(phoneNumber, message);
    console.log(`Booking confirmation sent to ${phoneNumber}`);
  } catch (error) {
    console.error(`Failed to send booking confirmation to ${phoneNumber}:`, error);
  }
};

// Booking Verified SMS
const sendBookingVerification = async (phoneNumber, bookingDetails) => {
  const { name, date, time } = bookingDetails;
  
  const message = `Hi ${name}!\n\nYour appointment has been VERIFIED by our team.\n\nDate: ${date}\nTime: ${time}\n\nPlease arrive 5 minutes early. For queries: ${ADMIN_PHONE}\n\n- Eswari Physiotherapy`;
  
  try {
    await sendSMS(phoneNumber, message);
    console.log(`Verification sent to ${phoneNumber}`);
  } catch (error) {
    console.error(`Failed to send verification to ${phoneNumber}:`, error);
  }
};

// Booking Cancelled SMS
const sendBookingCancellation = async (phoneNumber, bookingDetails) => {
  const { name, date, time } = bookingDetails;
  
  const message = `Hi ${name},\n\nYour appointment has been CANCELLED.\n\nDate: ${date}\nTime: ${time}\n\nTo reschedule or for more details, contact: ${ADMIN_PHONE}\n\n- Eswari Physiotherapy (Pain Rehab Clinic)`;
  
  try {
    await sendSMS(phoneNumber, message);
    console.log(`Cancellation sent to ${phoneNumber}`);
  } catch (error) {
    console.error(`Failed to send cancellation to ${phoneNumber}:`, error);
  }
};

// Bulk Cancellation SMS (for cancel all bookings)
const sendBulkCancellation = async (phoneNumber, bookingDetails) => {
  const { name, date } = bookingDetails;
  
  const message = `Hi ${name},\n\nAll appointments for ${date} have been CANCELLED due to unavoidable circumstances.\n\nWe apologize for the inconvenience. Please contact ${ADMIN_PHONE} to reschedule.\n\n- Eswari Physiotherapy`;
  
  try {
    await sendSMS(phoneNumber, message);
    console.log(`Bulk cancellation sent to ${phoneNumber}`);
  } catch (error) {
    console.error(`Failed to send bulk cancellation to ${phoneNumber}:`, error);
  }
};

// Time Change SMS
const sendTimeChangeNotification = async (phoneNumber, bookingDetails) => {
  const { name, date, oldTime, newTime } = bookingDetails;
  
  const message = `Hi ${name}!\n\nYour appointment time has been changed:\n\nDate: ${date}\nOld Time: ${oldTime}\nNew Time: ${newTime}\n\nFor queries: ${ADMIN_PHONE}\n\n- Eswari Physiotherapy`;
  
  try {
    await sendSMS(phoneNumber, message);
    console.log(`Time change notification sent to ${phoneNumber}`);
  } catch (error) {
    console.error(`Failed to send time change notification to ${phoneNumber}:`, error);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingVerification,
  sendBookingCancellation,
  sendBulkCancellation,
  sendTimeChangeNotification
};