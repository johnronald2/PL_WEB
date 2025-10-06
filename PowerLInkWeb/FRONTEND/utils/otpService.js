// OTP Service for PowerLinkWeb
// This service handles OTP generation and sending via SMS

// Note: In a production environment, you would use a proper SMS gateway service
// like Twilio, MessageBird, or AWS SNS. This is a simplified implementation.

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to mobile number
 * @param {string} mobileNumber - User's mobile number
 * @param {string} otp - Generated OTP
 * @returns {Promise} Promise that resolves when OTP is sent
 */
const sendOTP = async (mobileNumber, otp) => {
  try {
    // In a real implementation, you would call an SMS API here
    console.log(`Sending OTP: ${otp} to mobile number: ${mobileNumber}`);
    
    // For development purposes, we'll simulate a successful OTP send
    // In production, replace with actual SMS gateway API call
    
    // Example with Twilio (commented out):
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    await client.messages.create({
      body: `Your PowerLinkWeb verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobileNumber}` // Assuming Indian numbers, adjust as needed
    });
    */
    
    return {
      success: true,
      message: 'OTP sent successfully'
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP'
    };
  }
};

/**
 * Verify if OTP is valid and not expired
 * @param {Object} user - User document from MongoDB
 * @param {string} enteredOTP - OTP entered by user
 * @returns {boolean} Whether OTP is valid
 */
const verifyOTP = (user, enteredOTP) => {
  if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
    return false;
  }
  
  // Check if OTP matches and is not expired
  return user.otp.code === enteredOTP && user.otp.expiresAt > Date.now();
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP
};