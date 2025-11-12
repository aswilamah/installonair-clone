const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const App = require('../models/App');

// Single file upload route
router.post('/', upload.single('appFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        error: 'Database not connected. Please try again later.' 
      });
    }

    // Determine platform based on file extension
    const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
    const platform = fileExtension === 'apk' ? 'android' : 'ios';

    // Generate unique share ID using a simple method (replace nanoid)
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create file URL (for production)
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

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

    res.json({
      success: true,
      message: 'File uploaded successfully!',
      shareUrl: `${process.env.CLIENT_URL || 'http://localhost:5000'}/share/${shareId}`,
      app: {
        id: newApp._id,
        originalName: newApp.originalName,
        platform: newApp.platform,
        fileSize: newApp.fileSize,
        uploadDate: newApp.uploadDate
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message 
    });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 500MB' });
  }
  res.status(400).json({ error: error.message });
});

module.exports = router;
