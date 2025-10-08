const mongoose = require('mongoose');

const mentorshipMatchSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchFactors: {
    skillsMatch: Number,
    interestsMatch: Number,
    industryMatch: Number,
    careerGoalsMatch: Number,
    departmentMatch: Number
  },
  status: {
    type: String,
    enum: ['suggested', 'pending', 'accepted', 'rejected', 'completed'],
    default: 'suggested'
  },
  requestMessage: String,
  responseMessage: String,
  mentorshipTopic: String,
  requestedAt: Date,
  respondedAt: Date,
  startDate: Date,
  endDate: Date
}, {
  timestamps: true
});

// Compound index to ensure unique student-mentor pairs
mentorshipMatchSchema.index({ student: 1, mentor: 1 }, { unique: true });

module.exports = mongoose.model('MentorshipMatch', mentorshipMatchSchema);