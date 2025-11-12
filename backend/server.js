const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting server with safe route loading...');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Basic health check (works even without DB)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'Server is running!', 
    database: dbStatus,
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// Start server first, then connect to DB
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  
  // Connect to MongoDB in the background
  console.log('🔄 Attempting to connect to MongoDB...');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      
      // Safely load routes after DB connection
      try {
        app.use('/api/upload', require('./routes/upload'));
        app.use('/share', require('./routes/share'));
        app.use('/plist', require('./routes/plist'));
        console.log('✅ All routes loaded successfully');
        console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload`);
        console.log(`🔗 Share pages: http://localhost:${PORT}/share/{shareId}`);
      } catch (routeError) {
        console.log('❌ Route loading error:', routeError.message);
      }
    })
    .catch(err => {
      console.log('❌ MongoDB connection failed:', err.message);
      console.log('⚠️  Server running without database');
    });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    console.log('Server closed');
  });
});
