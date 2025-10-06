const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceCategories: {
    type: [String],
    required: true,
    enum: ['Electronics', 'Electrical', 'Plumbing', 'Vehicles', 'Home Appliances', 'Other']
  },
  skills: {
    type: [String]
  },
  experience: {
    type: Number, // in years
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [{
    documentType: String,
    documentPath: String,
    uploadedAt: Date
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  serviceRadius: {
    type: Number, // in kilometers
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating
WorkerSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  
  const totalRating = this.ratings.reduce((sum, rating) => sum + rating.score, 0);
  this.averageRating = totalRating / this.ratings.length;
};

// Check if worker is available at specific time
WorkerSchema.methods.isAvailableAt = function(day, time) {
  if (!this.isAvailable) {
    return false;
  }
  
  const daySlots = this.availability[day.toLowerCase()];
  
  if (!daySlots || daySlots.length === 0) {
    return false;
  }
  
  // Convert time to minutes for easier comparison
  const timeInMinutes = convertTimeToMinutes(time);
  
  // Check if time falls within any availability slot
  return daySlots.some(slot => {
    const startInMinutes = convertTimeToMinutes(slot.start);
    const endInMinutes = convertTimeToMinutes(slot.end);
    
    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  });
};

// Helper function to convert time string (HH:MM) to minutes
function convertTimeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

module.exports = mongoose.model('Worker', WorkerSchema);