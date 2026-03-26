const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  college: { type: String, trim: true, default: 'General' },
  description: { type: String, maxlength: 500 },
  icon: { type: String, default: '🎓' },
  color: { type: String, default: '#6366f1' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublic: { type: Boolean, default: true },
  rules: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
