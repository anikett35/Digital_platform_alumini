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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

/* =======================
   Middleware
======================= */
app.use(cors());
app.use(express.json());

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
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const aiMatchingRoutes = require('./routes/aiMatching');
const eventRoutes = require('./routes/events');
const profileRoutes = require('./routes/profiles');

/* 🔥 JOB BOARD ROUTES (MISSING BEFORE) */
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const rewardRoutes = require('./routes/rewards');

/* =======================
   Register Routes
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai-matching', aiMatchingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/profiles', profileRoutes);

/* 🔥 Job Board APIs */
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/rewards', rewardRoutes);

/* =======================
   Socket.IO Events
======================= */
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('newMessage', (data) => {
    socket.broadcast.emit('newMessage', data);
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
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

/* =======================
   Server Start
======================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 http://localhost:${PORT}/api/health`);
});
