const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Workshop', 'Networking', 'Seminar', 'Conference', 'Webinar', 'Social', 'Career Fair'],
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  maxAttendees: {
    type: Number,
    required: true,
    min: 1
  },
  duration: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  imageUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ 'attendees.user': 1 });

// Virtual for current attendee count
eventSchema.virtual('currentAttendees').get(function() {
  return this.attendees.filter(a => a.status === 'registered').length;
});

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function(userId) {
  return this.attendees.some(
    attendee => attendee.user.toString() === userId.toString() && 
    attendee.status === 'registered'
  );
};

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);