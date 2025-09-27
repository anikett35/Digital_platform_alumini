const express = require('express');
const { body } = require('express-validator');
const {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  getAvailableContacts,
  archiveConversation,
  markAsRead
} = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const messageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Invalid message type')
];

const conversationValidation = [
  body('participantId')
    .isMongoId()
    .withMessage('Invalid participant ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('mentorshipTopic')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Mentorship topic cannot exceed 200 characters')
];

// All routes require authentication
router.use(auth);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get available contacts for messaging
router.get('/contacts', getAvailableContacts);

// Create new conversation
router.post('/conversations', conversationValidation, createConversation);

// Get messages for a conversation
router.get('/:conversationId', getMessages);

// Send message to a conversation
router.post('/:conversationId', messageValidation, sendMessage);

// Mark messages as read
router.put('/:conversationId/read', markAsRead);

// Archive conversation
router.delete('/:conversationId', archiveConversation);

module.exports = router;