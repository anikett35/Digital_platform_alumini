const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/rewardController");

router.get("/me", rewardController.getMyRewards);

module.exports = router;
