const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Please add a mobile number'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'worker', 'admin'],
    default: 'user'
  },
  address: {
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    area: {
      type: String,
      required: [true, 'Please add an area']
    },
    line: {
      type: String,
      required: [true, 'Please add an address line']
    },
    doorNo: {
      type: String,
      required: [true, 'Please add a door number']
    }
  },
  otp: {
    code: {
      type: String,
      select: false
    },
    expiresAt: {
      type: Date,
      select: false
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt if password exists
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    next();
  } else {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP for user
UserSchema.methods.generateOTP = function() {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiration (10 minutes)
  this.otp = {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  };
  
  return otp;
};

// Verify OTP
UserSchema.methods.verifyOTP = function(enteredOTP) {
  return this.otp && 
         this.otp.code === enteredOTP && 
         this.otp.expiresAt > Date.now();
};

module.exports = mongoose.model('User', UserSchema);