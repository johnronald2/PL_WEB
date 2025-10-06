const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  address: {
    state: String,
    city: String,
    area: String,
    line: String,
    doorNo: String,
    pincode: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'wallet'],
    default: 'cash'
  },
  notes: {
    type: String
  },
  rating: {
    rating: Number,
    review: String,
    date: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Update booking status
BookingSchema.methods.updateStatus = function(status) {
  this.status = status;
  
  if (status === 'completed') {
    this.completedAt = new Date();
  }
};

module.exports = mongoose.model('Booking', BookingSchema);