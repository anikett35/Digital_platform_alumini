const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getAIMentorSuggestions,
  sendMentorshipRequest,
  respondToMentorshipRequest,
  getMentorshipStatus,
  updateMatchingProfile,
  getMatchingAnalytics
} = require('../controllers/aiMatchingController');

const { auth, checkRole, adminOnly } = require('../middleware/auth');

// Get AI-powered mentor suggestions (student only)
router.get('/suggestions', auth, checkRole('student'), getAIMentorSuggestions);

// Send mentorship request
router.post('/request', auth, checkRole('student'), [
  body('mentorId').notEmpty().withMessage('Mentor ID is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('topic').notEmpty().withMessage('Topic is required')
], sendMentorshipRequest);

// Respond to mentorship request (mentor only)
router.post('/respond', auth, checkRole('alumni'), [
  body('matchId').notEmpty().withMessage('Match ID is required'),
  body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status'),
  body('responseMessage').optional()
], respondToMentorshipRequest);

// Get mentorship status (student or mentor)
router.get('/status', auth, getMentorshipStatus);

// Update matching profile (student or mentor)
router.put('/profile', auth, updateMatchingProfile);

// Get analytics (admin only)
router.get('/analytics', auth, adminOnly, getMatchingAnalytics);

module.exports = router;
