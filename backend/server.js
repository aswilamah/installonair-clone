const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting production server...');

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'https://frontend-pebt147ka-swilams-projects.vercel.app',
      'https://frontend-git-main-swilams-projects.vercel.app',
      'https://frontend-swilams-projects.vercel.app',
      /\.vercel\.app$/ // Allow all Vercel deployments
    ];
    
    if (allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return origin === pattern;
      }
      return pattern.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Basic health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'Server is running!', 
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    
    // Load routes after successful DB connection
    app.use('/api/upload', require('./routes/upload'));
    app.use('/share', require('./routes/share'));
    app.use('/plist', require('./routes/plist'));
    
    console.log('✅ All routes loaded successfully');
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('⚠️ Server will continue running without database connection');
  }
};

const PORT = process.env.PORT || 10000;

// Start server first, then connect to DB
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production server running on port ${PORT}`);
  console.log(`📍 Health check: ${process.env.RAILWAY_STATIC_URL || 'http://localhost:' + PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Connect to MongoDB
  connectDB();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    console.log('Server closed');
  });
});

module.exports = app;
