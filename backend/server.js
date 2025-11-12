const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting production server...');

const app = express();

// CORS configuration - allow all origins in production
app.use(cors({
  origin: "*", // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Load routes IMMEDIATELY (don't wait for MongoDB)
console.log('🔄 Loading routes...');
try {
  app.use('/api/upload', require('./routes/upload'));
  app.use('/share', require('./routes/share'));
  // Removed plist route - we don't need OTA installation
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.log('❌ Route loading failed:', error.message);
}

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
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('⚠️ Server running without database - uploads will fail');
  }
};

const PORT = process.env.PORT || 10000;

// Start server
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
