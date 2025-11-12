const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const upload = require('../config/multerConfig');
const App = require('../models/App');

router.post('/', upload.single('appFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
    const platform = fileExtension === 'apk' ? 'android' : 'ios';
    const shareId = nanoid(10);
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

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

router.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 500MB' });
  }
  res.status(400).json({ error: error.message });
});

module.exports = router;
