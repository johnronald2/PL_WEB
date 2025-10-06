const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const { protect, authorize } = require('../middleware/auth');

// Get all services
// GET /api/services
// Public
router.get('/', async (req, res) => {
  try {
    const { category, popular } = req.query;
    
    let query = {};
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Filter by popularity if requested
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    // Only show active services
    query.isActive = true;
    
    const services = await Service.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single service
// GET /api/services/:id
// Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new service
// POST /api/services
// Private - Admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, category, subcategory, description, basePrice, image, estimatedTime, isPopular } = req.body;
    
    const service = await Service.create({
      name,
      category,
      subcategory,
      description,
      basePrice,
      image,
      estimatedTime,
      isPopular: isPopular || false
    });
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update service
// PUT /api/services/:id
// Private - Admin only
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, category, subcategory, description, basePrice, image, estimatedTime, isPopular } = req.body;
    
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        subcategory,
        description,
        basePrice,
        image,
        estimatedTime,
        isPopular
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete service (soft delete)
// DELETE /api/services/:id
// Private - Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    // Soft delete by setting isActive to false
    service.isActive = false;
    await service.save();
    
    res.status(200).json({
      success: true,
      message: 'Service deactivated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Book a service
// POST /api/services/:id/book
// Private - User only
router.post('/:id/book', protect, authorize('user'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    const { scheduledDate, scheduledTime, address, notes } = req.body;
    
    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      service: service._id,
      scheduledDate,
      scheduledTime,
      address,
      notes,
      totalAmount: service.basePrice
    });
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user bookings
// GET /api/services/bookings
// Private - User only
router.get('/bookings/me', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('service')
      .populate('worker', 'firstName lastName mobileNumber')
      .sort({ createdAt: -1 });
    
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

// Cancel booking
// PUT /api/services/bookings/:id/cancel
// Private - User only
router.put('/bookings/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this booking' });
    }
    
    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking cannot be cancelled as it is already ${booking.status}` });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Rate and review service
// PUT /api/services/bookings/:id/rate
// Private - User only
router.put('/bookings/:id/rate', protect, authorize('user'), async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to rate this booking' });
    }
    
    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed bookings' });
    }
    
    // Add rating to booking
    booking.rating = {
      rating,
      review: review || '',
      date: Date.now()
    };
    
    await booking.save();
    
    // Update worker rating if worker was assigned
    if (booking.worker) {
      const worker = await Worker.findOne({ user: booking.worker });
      
      if (worker) {
        worker.ratings.push({
          user: req.user.id,
          score: rating,
          review: review || '',
          date: Date.now()
        });
        
        // Calculate average rating
        worker.calculateAverageRating();
        
        await worker.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;