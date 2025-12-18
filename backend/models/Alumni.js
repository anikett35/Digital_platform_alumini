const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
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
  currentCompany: String,
  currentPosition: String,
  yearsOfExperience: { type: Number, default: 0 },
  industry: String,
  graduationYear: Number,
  department: String,
  skills: [String],
  interests: [String],
  linkedinUrl: String,
  githubUrl: String,
  availableAsMentor: { type: Boolean, default: false },
  mentorshipAreas: [String],
  profileStrength: { type: Number, default: 0 },
  profileComplete: { type: Boolean, default: false },
  lastProfileUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Alumni', alumniSchema);