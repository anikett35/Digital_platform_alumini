const mongoose = require('mongoose');

const meetingRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['one-on-one', 'workshop'],
    default: 'one-on-one'
  },
  topic: { type: String, required: true, maxlength: 300 },
  message: { type: String, maxlength: 1000 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledAt: { type: Date },
  duration: { type: Number, default: 30 }, // minutes
  meetingLink: { type: String, default: '' },
  rejectionReason: { type: String },
  reminderSent: { type: Boolean, default: false },
  // For workshops
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('MeetingRequest', meetingRequestSchema);
