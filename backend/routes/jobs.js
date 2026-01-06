const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

/*
|--------------------------------------------------------------------------
| GET ALL JOBS
| GET /api/jobs
|--------------------------------------------------------------------------
*/
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("poster_id", "name email")
      .sort({ created_at: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

/*
|--------------------------------------------------------------------------
| CREATE JOB
| POST /api/jobs
|--------------------------------------------------------------------------
*/
router.post("/", async (req, res) => {
  try {
    const {
      poster_id,
      company,
      title,
      description,
      requirements,
      salary_range,
      location,
      job_type,
      deadline,
      referral_bonus
    } = req.body;

    // Basic validation
    if (!poster_id || !title || !company) {
      return res.status(400).json({
        message: "poster_id, title, and company are required"
      });
    }

    const newJob = new Job({
      poster_id,
      company,
      title,
      description,
      requirements,
      salary_range,
      location,
      job_type,
      deadline,
      referral_bonus
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);

  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Failed to create job" });
  }
});

/*
|--------------------------------------------------------------------------
| GET JOB BY ID
| GET /api/jobs/:id
|--------------------------------------------------------------------------
*/
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("poster_id", "name email");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job" });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE JOB (optional)
| DELETE /api/jobs/:id
|--------------------------------------------------------------------------
*/
router.delete("/:id", async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job" });
  }
});

module.exports = router;
