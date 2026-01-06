const { validationResult } = require('express-validator');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      isArchived: false
    })
    .populate('participants', 'name email role department currentCompany graduationYear')
    .populate('lastMessage')
    .sort({ lastActivity: -1 })
    .lean();

    // Format conversations with participant info (excluding current user)
    const formattedConversations = conversations.map(conv => {
      const otherParticipants = conv.participants.filter(p => p._id.toString() !== req.user.id);
      return {
        ...conv,
        otherParticipants,
        participant: otherParticipants[0] // For direct messages
      };
    });

    res.json({ conversations: formattedConversations });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error while fetching conversations' });
  }
};

// Get messages for a specific conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false
    })
    .populate('sender', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ 
      messages: messages.reverse(), // Return in chronological order
      conversationId 
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const { content, messageType = 'text' } = req.body;

    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: req.user.id,
      content,
      messageType
    });

    await message.save();

    // Update conversation's last message and activity
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Populate sender info
    await message.populate('sender', 'name email role');

    // Emit real-time message to other participants
    const io = req.app.get('io');
    if (io) {
      // Send to all participants except sender
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== req.user.id) {
          io.to(`user_${participantId}`).emit('newMessage', {
            message,
            conversationId
          });
        }
      });
    }

    res.status(201).json({
      message: message // Changed from 'data' to directly return the message object
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// Create a new conversation - FIXED VERSION
const createConversation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { participantId, title, mentorshipTopic } = req.body;

    // Validate participant exists and is not the current user
    if (participantId === req.user.id) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check if conversation already exists between these users
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId], $size: 2 },
      type: 'direct'
    }).populate('participants', 'name email role department currentCompany graduationYear');

    if (existingConversation) {
      // Format the existing conversation properly
      const otherParticipants = existingConversation.participants.filter(
        p => p._id.toString() !== req.user.id
      );
      
      const formattedConversation = {
        ...existingConversation.toObject(),
        otherParticipants,
        participant: otherParticipants[0]
      };

      // Return 200 with the existing conversation instead of 400 error
      return res.status(200).json({ 
        message: 'Conversation already exists',
        conversation: formattedConversation,
        isExisting: true
      });
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [req.user.id, participantId],
      type: 'direct',
      title: title || `${req.user.name} & ${participant.name}`,
      mentorshipDetails: mentorshipTopic ? {
        topic: mentorshipTopic,
        status: 'active',
        startedAt: new Date()
      } : undefined
    });

    await conversation.save();
    await conversation.populate('participants', 'name email role department currentCompany graduationYear');

    // Format the new conversation
    const otherParticipants = conversation.participants.filter(
      p => p._id.toString() !== req.user.id
    );
    
    const formattedConversation = {
      ...conversation.toObject(),
      otherParticipants,
      participant: otherParticipants[0]
    };

    // Emit real-time notification to the other participant
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${participantId}`).emit('newConversation', {
        conversation: formattedConversation,
        initiator: {
          _id: req.user.id,
          name: req.user.name,
          role: req.user.role
        }
      });
    }

    res.status(201).json({
      message: 'Conversation created successfully',
      conversation: formattedConversation,
      isExisting: false
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error while creating conversation' });
  }
};

// Get available users for messaging (Alumni for students, Students for alumni)
const getAvailableContacts = async (req, res) => {
  try {
    const { search = '', role = '' } = req.query;
    const currentUser = req.user;

    // Build query based on current user's role
    let userQuery = { _id: { $ne: currentUser.id }, isActive: true };

    if (currentUser.role === 'student') {
      // Students can message alumni and admins
      userQuery.role = { $in: ['alumni', 'admin'] };
    } else if (currentUser.role === 'alumni') {
      // Alumni can message students and other alumni
      userQuery.role = { $in: ['student', 'alumni'] };
    } else if (currentUser.role === 'admin') {
      // Admins can message everyone
      userQuery.role = { $in: ['student', 'alumni'] };
    }

    // Add role filter if specified
    if (role) {
      userQuery.role = role;
    }

    // Add search filter
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(userQuery)
      .select('name email role department currentCompany graduationYear currentPosition')
      .sort({ name: 1 })
      .limit(50)
      .lean();

    res.json({ users });

  } catch (error) {
    console.error('Get available contacts error:', error);
    res.status(500).json({ message: 'Server error while fetching contacts' });
  }
};

// Delete/Archive conversation
const archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    conversation.isArchived = true;
    await conversation.save();

    res.json({ message: 'Conversation archived successfully' });

  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({ message: 'Server error while archiving conversation' });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Messages marked as read' });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error while marking messages as read' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  getAvailableContacts,
  archiveConversation,
  markAsRead
};