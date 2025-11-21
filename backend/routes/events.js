const express = require('express');
const { body } = require('express-validator');
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyEvents,
  getEventStats
} = require('../controllers/eventController');
const { auth, adminOnly, checkRole } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const eventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .notEmpty()
    .withMessage('Time is required'),
  body('type')
    .isIn(['Workshop', 'Networking', 'Seminar', 'Conference', 'Webinar', 'Social', 'Career Fair'])
    .withMessage('Invalid event type'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('maxAttendees')
    .isInt({ min: 1 })
    .withMessage('Max attendees must be at least 1'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required'),
  body('organizer')
    .trim()
    .notEmpty()
    .withMessage('Organizer is required')
];

// Public routes (authenticated users can view events)
router.get('/', auth, getAllEvents);
router.get('/my-events', auth, getMyEvents);
router.get('/stats', auth, adminOnly, getEventStats);
router.get('/:id', auth, getEvent);

// Admin only routes
router.post('/', auth, adminOnly, eventValidation, createEvent);
router.put('/:id', auth, adminOnly, eventValidation, updateEvent);
router.delete('/:id', auth, adminOnly, deleteEvent);

// Student and Alumni routes
router.post('/:id/register', auth, checkRole('student', 'alumni'), registerForEvent);
router.delete('/:id/unregister', auth, checkRole('student', 'alumni'), unregisterFromEvent);

module.exports = router;