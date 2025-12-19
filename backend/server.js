const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./config/socket');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://digital-platform-alumini.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);

// CORS configuration - MUST be before routes
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

setupSocket(io);
app.set('io', io);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    setTimeout(connectDB, 5000);
  }
};

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Alumni Platform API is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    socketIO: 'Active',
    allowedOrigins: allowedOrigins
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO enabled`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health`);
});