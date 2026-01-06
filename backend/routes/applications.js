const express = require("express");
const router = express.Router();
const appController = require("../controllers/applicationController");

router.post("/", appController.applyJob);
router.put("/:id/status", appController.updateStatus);

module.exports = router;
