const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./config/socket'); // Import socket setup

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup Socket.IO with authentication
setupSocket(io);

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Enhanced MongoDB connection with error handling
const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⏳ Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const aiMatchingRoutes = require('./routes/aiMatching');
const eventRoutes = require('./routes/events');
const profileRoutes = require('./routes/profiles');
const userRoutes = require('./routes/user');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai-matching', aiMatchingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/user', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Alumni Platform API is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    socketIO: 'Active'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔌 Socket.IO enabled with authentication`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});