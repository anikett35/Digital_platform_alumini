const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle user going online
    socket.broadcast.emit('userOnline', {
      userId: socket.userId,
      name: socket.user.name,
      role: socket.user.role
    });

    // Handle joining conversation rooms
    socket.on('joinConversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user.name} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.user.name} left conversation ${conversationId}`);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('userTyping', {
        userId: socket.userId,
        name: socket.user.name,
        conversationId: data.conversationId
      });
    });

    socket.on('stopTyping', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('userStoppedTyping', {
        userId: socket.userId,
        conversationId: data.conversationId
      });
    });

    // Handle message read receipts
    socket.on('markAsRead', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('messageRead', {
        userId: socket.userId,
        conversationId: data.conversationId,
        messageId: data.messageId
      });
    });

    // Handle user presence
    socket.on('updatePresence', (status) => {
      socket.broadcast.emit('userPresenceUpdate', {
        userId: socket.userId,
        status: status // 'online', 'away', 'busy', 'offline'
      });
    });

    // Handle mentorship requests
    socket.on('mentorshipRequest', (data) => {
      // Send mentorship request to specific user
      socket.to(`user_${data.mentorId}`).emit('mentorshipRequestReceived', {
        from: {
          userId: socket.userId,
          name: socket.user.name,
          role: socket.user.role,
          department: socket.user.department
        },
        topic: data.topic,
        message: data.message,
        requestId: data.requestId
      });
    });

    // Handle mentorship response
    socket.on('mentorshipResponse', (data) => {
      socket.to(`user_${data.studentId}`).emit('mentorshipResponseReceived', {
        from: {
          userId: socket.userId,
          name: socket.user.name
        },
        accepted: data.accepted,
        message: data.message,
        conversationId: data.conversationId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
      
      // Notify others that user went offline
      socket.broadcast.emit('userOffline', {
        userId: socket.userId,
        name: socket.user.name
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

module.exports = setupSocket;