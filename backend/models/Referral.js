const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  referrer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  referee_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  status: String,
  reward_points: Number
});

module.exports = mongoose.model("Referral", referralSchema);
