const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    sparse: true // Allow multiple null values
  },
  graduationYear: {
    type: Number,
    required: function() {
      return this.role === 'alumni';
    }
  },
  department: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Alumni specific fields
  currentCompany: {
    type: String,
    required: function() {
      return this.role === 'alumni';
    }
  },
  currentPosition: {
    type: String,
    required: function() {
      return this.role === 'alumni';
    }
  },
  // Student specific fields
  currentYear: {
    type: Number,
    required: function() {
      return this.role === 'student';
    }
  },
  enrollmentYear: {
    type: Number,
    required: function() {
      return this.role === 'student';
    }
  },
  // AI Matching Profile Fields
  interests: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  skills: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  careerGoals: [{
    type: String,
    trim: true
  }],
  industryPreferences: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  lookingForMentor: {
    type: Boolean,
    default: false
  },
  availableAsMentor: {
    type: Boolean,
    default: false
  },
  mentorshipAreas: [{
    type: String,
    trim: true
  }],
  maxMentees: {
    type: Number,
    default: 3
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  linkedIn: {
    type: String,
    trim: true
  },
  portfolio: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);