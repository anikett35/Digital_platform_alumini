const Application = require("../models/Application");
const Reward = require("../models/Reward");

exports.applyJob = async (req, res) => {
  const { job_id, referrer_id } = req.body;

  const application = new Application({
    job_id,
    applicant_id: req.user.id,
    referrer_id
  });

  await application.save();

  if (referrer_id) {
    await Reward.create({
      user_id: referrer_id,
      points: 5,
      earned_from: "Application Submitted"
    });
  }

  res.status(201).json(application);
};

exports.updateStatus = async (req, res) => {
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  if (req.body.status === "Hired") {
    await Reward.create({
      user_id: application.referrer_id,
      points: 100,
      earned_from: "Referral Hired"
    });
  }

  res.json(application);
};
