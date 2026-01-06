const Job = require("../models/Job");

exports.createJob = async (req, res) => {
  try {
    const job = new Job({ ...req.body, poster_id: req.user.id });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobs = async (req, res) => {
  const filters = req.query;
  const jobs = await Job.find(filters).sort({ created_at: -1 });
  res.json(jobs);
};
