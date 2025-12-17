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
    required: true
  },
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
  phoneNumber: {
    type: String,
    trim: true
  },
  // Student specific fields
  currentYear: {
    type: Number,
    min: 1,
    max: 8
  },
  enrollmentYear: {
    type: Number
  },
  // Alumni specific fields
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
  // Profile fields
  bio: {
    type: String,
    maxlength: 500
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  linkedinUrl: {
    type: String,
    trim: true
  },
  githubUrl: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true,
    default: ''
  },
  
  // NEW: Photo gallery fields
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
  
  coverPhoto: {
    type: String,
    trim: true
  },
  
  // Profile visibility and preferences
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  
  // AI Matching fields
  profileHeadline: {
    type: String,
    default: '',
    maxlength: 200
  },
  industry: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  
  // Career history
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
  
  // Education history
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
  
  // Additional links
  website: {
    type: String,
    trim: true
  },
  
  // Mentorship settings
  isOpenToMentorship: {
    type: Boolean,
    default: false
  },
  
  // AI Matching preferences
  careerGoals: [{
    type: String,
    trim: true
  }],
  industryPreferences: [{
    type: String,
    trim: true
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
  
  profileVisibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
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

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);