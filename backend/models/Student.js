const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: String,
  email: String,
  profilePicture: String,
  profileHeadline: String,
  bio: String,
  location: String,
  currentYear: Number,
  enrollmentYear: Number,
  department: String,
  skills: [String],
  interests: [String],
  careerGoals: [String],
  industryPreferences: [String],
  linkedinUrl: String,
  githubUrl: String,
  lookingForMentor: { type: Boolean, default: false },
  profileStrength: { type: Number, default: 0 },
  profileComplete: { type: Boolean, default: false },
  lastProfileUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);