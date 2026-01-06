const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  referrer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"],
    default: "Applied"
  },
  applied_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Application", applicationSchema);
