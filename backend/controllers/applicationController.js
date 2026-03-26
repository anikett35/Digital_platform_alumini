const Application = require('../models/Application');
const Reward = require('../models/Reward');

exports.applyJob = async (req, res) => {
  try {
    const { job_id, referrer_id } = req.body;
    if (!job_id) return res.status(400).json({ message: 'job_id is required' });

    const existing = await Application.findOne({ job_id, applicant_id: req.user.id });
    if (existing) return res.status(400).json({ message: 'You already applied for this job' });

    const application = new Application({
      job_id,
      applicant_id: req.user.id,
      referrer_id: referrer_id || null
    });
    await application.save();

    if (referrer_id) {
      await Reward.create({ user_id: referrer_id, points: 5, earned_from: 'Application Submitted' });
    }

    res.status(201).json(application);
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ message: 'Failed to submit application', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (req.body.status === 'Hired' && application.referrer_id) {
      await Reward.create({ user_id: application.referrer_id, points: 100, earned_from: 'Referral Hired' });
    }
    res.json(application);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant_id: req.user.id })
      .populate('job_id', 'title company location job_type salary_range')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};
