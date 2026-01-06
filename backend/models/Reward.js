const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  points: Number,
  earned_from: String,
  redeemed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reward", rewardSchema);
