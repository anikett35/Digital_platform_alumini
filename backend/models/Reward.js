const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  earned_from: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
