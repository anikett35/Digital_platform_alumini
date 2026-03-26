const express = require('express');
const router = express.Router();
const Reward = require('../models/Reward');
const { auth } = require('../middleware/auth');

// Get my rewards (authenticated)
router.get('/me', auth, async (req, res) => {
  try {
    const rewards = await Reward.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    const totalPoints = rewards.reduce((sum, r) => sum + (r.points || 0), 0);
    res.json({ rewards, totalPoints });
  } catch (err) {
    console.error('Rewards error:', err);
    res.status(500).json({ message: 'Failed to fetch rewards' });
  }
});

module.exports = router;
