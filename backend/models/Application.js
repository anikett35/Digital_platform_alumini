const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referrer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Hired', 'Rejected'],
    default: 'Pending'
  },
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  resumeUrl: {
    type: String
  }
}, { timestamps: true });

// Compound index to prevent duplicate applications
applicationSchema.index({ job_id: 1, applicant_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
