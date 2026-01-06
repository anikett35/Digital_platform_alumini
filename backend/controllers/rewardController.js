const Reward = require("../models/Reward");

exports.getMyRewards = async (req, res) => {
  const rewards = await Reward.find({ user_id: req.user.id });
  res.json(rewards);
};
