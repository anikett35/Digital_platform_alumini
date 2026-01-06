// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
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
    required: true
  },
  
  // Contact Information
  phoneNumber: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  
  // Academic Information
  studentId: {
    type: String,
    sparse: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  
  // Student Specific Fields
  currentYear: {
    type: Number,
    min: 1,
    max: 8
  },
  enrollmentYear: {
    type: Number
  },
  
  // Alumni Specific Fields
  graduationYear: {
    type: Number
  },
  currentCompany: {
    type: String,
    trim: true
  },
  currentPosition: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  
  // Profile Information
  bio: {
    type: String,
    maxlength: 500
  },
  profileHeadline: {
    type: String,
    default: '',
    maxlength: 200
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  
  // Social Links
  linkedinUrl: {
    type: String,
    trim: true
  },
  githubUrl: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  
  // Media
  profileImage: {
    type: String,
    trim: true,
    default: ''
  },
  coverPhoto: {
    type: String,
    trim: true
  },
  photoGallery: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Work Experience
  workExperience: [{
    company: {
      type: String,
      trim: true,
      required: true
    },
    position: {
      type: String,
      trim: true,
      required: true
    },
    location: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    currentlyWorking: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: 500
    }
  }],
  
  // Education History
  education: [{
    institution: {
      type: String,
      trim: true,
      required: true
    },
    degree: {
      type: String,
      trim: true
    },
    fieldOfStudy: {
      type: String,
      trim: true
    },
    startYear: {
      type: Number
    },
    endYear: {
      type: Number
    },
    description: {
      type: String,
      maxlength: 500
    }
  }],
  
  // Mentorship
  isOpenToMentorship: {
    type: Boolean,
    default: false
  },
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
  
  // Career Goals & Preferences
  careerGoals: [{
    type: String,
    trim: true
  }],
  industryPreferences: [{
    type: String,
    trim: true
  }],
  
  // Profile Status
  isActive: {
    type: Boolean,
    default: true
  },
  profileVisibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  profileStrength: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: {
    type: Date
  },
  lastProfileUpdate: {
    type: Date
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

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate profile strength
userSchema.methods.calculateProfileStrength = function() {
  let filledFields = 0;
  const totalFields = 15;
  
  // Basic fields
  if (this.bio?.trim()) filledFields++;
  if (this.skills?.length > 0) filledFields++;
  if (this.interests?.length > 0) filledFields++;
  if (this.location?.trim()) filledFields++;
  if (this.profileHeadline?.trim()) filledFields++;
  if (this.linkedinUrl?.trim()) filledFields++;
  if (this.githubUrl?.trim()) filledFields++;
  if (this.profileImage?.trim()) filledFields++;
  if (this.phoneNumber?.trim()) filledFields++;
  
  // Role-specific fields
  if (this.role === 'student') {
    if (this.careerGoals?.length > 0) filledFields++;
    if (this.industryPreferences?.length > 0) filledFields++;
    if (this.currentYear) filledFields++;
    if (this.enrollmentYear) filledFields++;
    if (this.department?.trim()) filledFields++;
    if (this.education?.length > 0) filledFields++;
  } else if (this.role === 'alumni') {
    if (this.currentPosition?.trim()) filledFields++;
    if (this.currentCompany?.trim()) filledFields++;
    if (this.industry?.trim()) filledFields++;
    if (this.graduationYear) filledFields++;
    if (this.mentorshipAreas?.length > 0) filledFields++;
    if (this.workExperience?.length > 0) filledFields++;
  }
  
  return Math.round(Math.min((filledFields / totalFields) * 100, 100));
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
