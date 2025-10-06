const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true
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
  mobileNumber: {
    type: String,
    required: [true, 'Please add a mobile number'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'worker', 'admin'],
    default: 'user'
  },
  address: {
    state: String,
    city: String,
    area: String,
    line: String,
    doorNo: String,
    pincode: String
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String
  },
  savedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  savedWorkers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate OTP
UserSchema.methods.generateOTP = function() {
  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash OTP
  const salt = bcrypt.genSaltSync(10);
  this.otp = bcrypt.hashSync(otp, salt);
  
  // Set OTP expiry (10 minutes)
  this.otpExpiry = Date.now() + 10 * 60 * 1000;
  
  return otp;
};

// Verify OTP
UserSchema.methods.verifyOTP = function(otp) {
  // Check if OTP is expired
  if (this.otpExpiry < Date.now()) {
    return false;
  }
  
  // Verify OTP
  return bcrypt.compareSync(otp, this.otp);
};

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'powerlink_secret_key', {
    expiresIn: '30d'
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);