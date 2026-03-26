const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

/* =======================
   Socket.IO Setup
======================= */
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

/* =======================
   Middleware
======================= */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* =======================
   MongoDB Connection
======================= */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

/* =======================
   Import Routes
======================= */
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');           // FIXED: was missing from server.js
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const aiMatchingRoutes = require('./routes/aiMatching');
const eventRoutes = require('./routes/events');
const profileRoutes = require('./routes/profiles');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const rewardRoutes = require('./routes/rewards');
const verificationRoutes = require('./routes/verification');
const communityRoutes = require('./routes/communities');
const meetingRoutes = require('./routes/meetings');
const insightRoutes = require('./routes/insights');

/* =======================
   Register Routes
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);                     // FIXED: Added missing user routes
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai-matching', aiMatchingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/insights', insightRoutes);

/* =======================
   Socket.IO Events
======================= */
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('newMessage', (data) => {
    // Emit to recipient's room
    if (data.recipientId) {
      io.to(`user_${data.recipientId}`).emit('newMessage', data);
    } else {
      socket.broadcast.emit('newMessage', data);
    }
  });

  socket.on('eventUpdate', (data) => {
    io.emit('eventUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

/* =======================
   Health Check
======================= */
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Alumni Platform API is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

/* =======================
   Global Error Handler
======================= */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

/* =======================
   Server Start
======================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 http://localhost:${PORT}/api/health`);
});
