const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { auth, checkRole } = require('../middleware/auth');

// GET all jobs (authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.job_type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const jobs = await Job.find(filter)
      .populate('poster_id', 'name email currentPosition currentCompany')
      .sort({ created_at: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// CREATE job (alumni or admin only)
router.post('/', auth, checkRole('alumni', 'admin'), async (req, res) => {
  try {
    const { company, title, description, requirements, salary_range, location, job_type, deadline, referral_bonus } = req.body;
    if (!title || !company) {
      return res.status(400).json({ message: 'Title and company are required' });
    }
    const newJob = new Job({
      poster_id: req.user.id,
      company, title, description, requirements,
      salary_range, location, job_type, deadline, referral_bonus
    });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
});

// GET job by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('poster_id', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job' });
  }
});

// UPDATE job (poster or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.poster_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update job' });
  }
});

// DELETE job (poster or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.poster_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job' });
  }
});

module.exports = router;
