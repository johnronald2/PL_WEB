const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// Get all workers
// GET /api/workers
// Public
router.get('/', async (req, res) => {
  try {
    const { category, rating, available } = req.query;
    
    let query = {};
    
    // Filter by category if provided
    if (category) {
      query.serviceCategories = category;
    }
    
    // Filter by minimum rating if provided
    if (rating) {
      query.averageRating = { $gte: parseFloat(rating) };
    }
    
    // Filter by availability if provided
    if (available === 'true') {
      query.isAvailable = true;
    }
    
    // Find workers with populated user info
    const workers = await Worker.find(query)
      .populate('user', 'firstName lastName profileImage')
      .sort({ averageRating: -1 });
    
    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single worker
// GET /api/workers/:id
// Public
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('user', 'firstName lastName mobileNumber email profileImage');
    
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    
    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create worker profile
// POST /api/workers
// Private - Worker only
router.post('/', protect, authorize('worker'), async (req, res) => {
  try {
    // Check if worker profile already exists
    let workerProfile = await Worker.findOne({ user: req.user.id });
    
    if (workerProfile) {
      return res.status(400).json({ success: false, message: 'Worker profile already exists' });
    }
    
    const { 
      serviceCategories, 
      skills, 
      experience, 
      hourlyRate, 
      availability, 
      location,
      serviceRadius 
    } = req.body;
    
    // Create worker profile
    workerProfile = await Worker.create({
      user: req.user.id,
      serviceCategories,
      skills,
      experience,
      hourlyRate,
      availability,
      location,
      serviceRadius
    });
    
    res.status(201).json({
      success: true,
      data: workerProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update worker profile
// PUT /api/workers
// Private - Worker only
router.put('/', protect, authorize('worker'), async (req, res) => {
  try {
    const { 
      serviceCategories, 
      skills, 
      experience, 
      hourlyRate, 
      availability, 
      location,
      serviceRadius 
    } = req.body;
    
    // Find worker profile
    let workerProfile = await Worker.findOne({ user: req.user.id });
    
    if (!workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }
    
    // Update fields
    if (serviceCategories) workerProfile.serviceCategories = serviceCategories;
    if (skills) workerProfile.skills = skills;
    if (experience) workerProfile.experience = experience;
    if (hourlyRate) workerProfile.hourlyRate = hourlyRate;
    if (availability) workerProfile.availability = availability;
    if (location) workerProfile.location = location;
    if (serviceRadius) workerProfile.serviceRadius = serviceRadius;
    
    await workerProfile.save();
    
    res.status(200).json({
      success: true,
      data: workerProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update availability status
// PUT /api/workers/availability
// Private - Worker only
router.put('/availability', protect, authorize('worker'), async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    if (isAvailable === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide availability status' });
    }
    
    // Find worker profile
    let workerProfile = await Worker.findOne({ user: req.user.id });
    
    if (!workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }
    
    // Update availability
    workerProfile.isAvailable = isAvailable;
    await workerProfile.save();
    
    res.status(200).json({
      success: true,
      message: `Availability status updated to ${isAvailable ? 'available' : 'unavailable'}`,
      data: workerProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get worker bookings
// GET /api/workers/bookings
// Private - Worker only
router.get('/bookings/me', protect, authorize('worker'), async (req, res) => {
  try {
    // Find worker profile
    const workerProfile = await Worker.findOne({ user: req.user.id });
    
    if (!workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }
    
    // Find bookings assigned to this worker
    const bookings = await Booking.find({ worker: req.user.id })
      .populate('service')
      .populate('user', 'firstName lastName mobileNumber')
      .sort({ scheduledDate: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update booking status
// PUT /api/workers/bookings/:id/status
// Private - Worker only
router.put('/bookings/:id/status', protect, authorize('worker'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['accepted', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status' });
    }
    
    // Find booking
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if booking is assigned to this worker
    if (booking.worker.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this booking' });
    }
    
    // Update booking status
    booking.updateStatus(status);
    await booking.save();
    
    // If status is completed, update worker's completed jobs count
    if (status === 'completed') {
      const workerProfile = await Worker.findOne({ user: req.user.id });
      
      if (workerProfile) {
        workerProfile.completedJobs += 1;
        await workerProfile.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload identity verification documents
// POST /api/workers/verification
// Private - Worker only
router.post('/verification', protect, authorize('worker'), async (req, res) => {
  try {
    const { documentType, documentPath } = req.body;
    
    if (!documentType || !documentPath) {
      return res.status(400).json({ success: false, message: 'Please provide document type and path' });
    }
    
    // Find worker profile
    const workerProfile = await Worker.findOne({ user: req.user.id });
    
    if (!workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }
    
    // Add document to verification documents
    workerProfile.verificationDocuments.push({
      documentType,
      documentPath,
      uploadedAt: Date.now()
    });
    
    // Update verification status to pending
    workerProfile.isVerified = 'pending';
    
    await workerProfile.save();
    
    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully. Verification pending.',
      data: workerProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;