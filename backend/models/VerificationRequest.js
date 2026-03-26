const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  institutions: [{
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    yearFrom: { type: Number },
    yearTo: { type: Number },
    degreeType: { type: String, trim: true },
    collegeCode: { type: String, trim: true },
    verificationDoc: { type: String } // file path / URL
  }],
  adminNotes: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
