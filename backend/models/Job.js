const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  poster_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company: String,
  title: String,
  description: String,
  requirements: String,
  salary_range: String,
  location: String,
  job_type: { type: String, enum: ["Full-time", "Part-time", "Internship", "Contract"] },
  deadline: Date,
  referral_bonus: Boolean,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", jobSchema);
