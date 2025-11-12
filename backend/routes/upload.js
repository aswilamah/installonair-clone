const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const App = require('../models/App');

console.log('📤 Upload route loaded');

// Single file upload route
router.post('/', upload.single('appFile'), async (req, res) => {
  console.log('📨 Upload request received');
  
  try {
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📁 File received:', req.file.originalname);

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ MongoDB not connected');
      return res.status(500).json({ 
        error: 'Database not connected. Please try again later.' 
      });
    }

    // Determine platform based on file extension
    const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
    const platform = fileExtension === 'apk' ? 'android' : 'ios';

    // Generate unique share ID
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create file URL (for production) - use the actual file URL
    const fileUrl = `https://installonair-clone-production.up.railway.app/uploads/${req.file.filename}`;

    // Create app record in database
    const newApp = new App({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileUrl: fileUrl,
      fileSize: req.file.size,
      platform: platform,
      shareId: shareId
    });

    await newApp.save();

    console.log('✅ File uploaded successfully:', shareId);

    // FIX: Generate the CORRECT share URL that points to the backend install page
    const shareUrl = `https://installonair-clone-production.up.railway.app/share/${shareId}`;

    res.json({
      success: true,
      message: 'File uploaded successfully!',
      shareUrl: shareUrl, // This should point to backend install page
      app: {
        id: newApp._id,
        originalName: newApp.originalName,
        platform: newApp.platform,
        fileSize: newApp.fileSize,
        uploadDate: newApp.uploadDate
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message 
    });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  console.error('❌ Multer error:', error);
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 500MB' });
  }
  res.status(400).json({ error: error.message });
});

module.exports = router;
