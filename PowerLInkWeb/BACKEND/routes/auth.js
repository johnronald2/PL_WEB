const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Generate and send OTP for login
router.post('/request-otp', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    
    if (!mobileNumber) {
      return res.status(400).json({ success: false, message: 'Please provide mobile number' });
    }
    
    // Check if user exists
    let user = await User.findOne({ mobileNumber });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first' });
    }
    
    // Generate OTP
    const otp = user.generateOTP();
    await user.save();
    
    // In production, send OTP via SMS
    // For development, return OTP in response
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: otp // Remove in production
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    
    if (!mobileNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide mobile number and OTP' });
    }
    
    // Find user
    const user = await User.findOne({ mobileNumber });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();
    
    // Generate JWT token
    const token = user.getSignedToken();
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, password, address } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ mobileNumber });
    
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      mobileNumber,
      password,
      address,
      role: 'user' // Default role
    });
    
    // Generate OTP for verification
    const otp = user.generateOTP();
    await user.save();
    
    // In production, send OTP via SMS
    // For development, return OTP in response
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully. OTP sent for verification',
      otp: otp // Remove in production
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register as worker
router.post('/register-worker', async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, password, address } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ mobileNumber });
    
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Create new user with worker role
    user = new User({
      firstName,
      lastName,
      email,
      mobileNumber,
      password,
      address,
      role: 'worker'
    });
    
    // Generate OTP for verification
    const otp = user.generateOTP();
    await user.save();
    
    // In production, send OTP via SMS
    // For development, return OTP in response
    res.status(201).json({ 
      success: true, 
      message: 'Worker registered successfully. OTP sent for verification',
      otp: otp // Remove in production
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, email, address } = req.body;
    
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (address) updateFields.address = address;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry');
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;