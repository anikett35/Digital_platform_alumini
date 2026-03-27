const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'alumni', 'admin'], required: true },
  phoneNumber: { type: String, trim: true },
  location: { type: String, trim: true },

  // College ID used for admin verification
  collegeId: {
    type: String,
    trim: true,
    uppercase: true,
    required: function() { return this.role !== 'admin'; }
  },

  // Admin approval flow
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() { return this.role === 'admin' ? 'approved' : 'pending'; }
  },
  approvalNote: { type: String, default: '' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

  studentId: { type: String, sparse: true, trim: true },
  department: { type: String, required: true, trim: true },
  currentYear: { type: Number, min: 1, max: 8 },
  enrollmentYear: { type: Number },
  graduationYear: { type: Number },
  currentCompany: { type: String, trim: true },
  currentPosition: { type: String, trim: true },
  industry: { type: String, trim: true },

  // Alumni verification fields (FIXED: were missing)
  verificationStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'verified', 'rejected'],
    default: 'not_submitted'
  },
  isVerifiedAlumni: { type: Boolean, default: false },

  bio: { type: String, maxlength: 500 },
  profileHeadline: { type: String, default: '', maxlength: 200 },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  linkedinUrl: { type: String, trim: true },
  githubUrl: { type: String, trim: true },
  website: { type: String, trim: true },
  profileImage: { type: String, trim: true, default: '' },
  coverPhoto: { type: String, trim: true },
  photoGallery: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  workExperience: [{
    company: { type: String, trim: true, required: true },
    position: { type: String, trim: true, required: true },
    location: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    currentlyWorking: { type: Boolean, default: false },
    description: { type: String, maxlength: 500 }
  }],
  education: [{
    institution: { type: String, trim: true, required: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
    description: { type: String, maxlength: 500 }
  }],
  isOpenToMentorship: { type: Boolean, default: false },
  lookingForMentor: { type: Boolean, default: false },
  availableAsMentor: { type: Boolean, default: false },
  mentorshipAreas: [{ type: String, trim: true }],
  careerGoals: [{ type: String, trim: true }],
  industryPreferences: [{ type: String, trim: true }],
  rewardPoints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  profileVisibility: { type: String, enum: ['public', 'connections', 'private'], default: 'public' },
  profileStrength: { type: Number, default: 0, min: 0, max: 100 },
  profileComplete: { type: Boolean, default: false },
  lastLogin: { type: Date },
  lastProfileUpdate: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.calculateProfileStrength = function() {
  let filledFields = 0;
  const totalFields = 15;
  if (this.bio?.trim()) filledFields++;
  if (this.skills?.length > 0) filledFields++;
  if (this.interests?.length > 0) filledFields++;
  if (this.location?.trim()) filledFields++;
  if (this.profileHeadline?.trim()) filledFields++;
  if (this.linkedinUrl?.trim()) filledFields++;
  if (this.githubUrl?.trim()) filledFields++;
  if (this.profileImage?.trim()) filledFields++;
  if (this.phoneNumber?.trim()) filledFields++;
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

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
