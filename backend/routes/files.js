const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Test file serving
router.get('/test/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  console.log('🔍 Testing file serving:', filename);
  console.log('📁 File path:', filePath);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log('❌ File not found:', filePath);
    return res.status(404).json({ error: 'File not found', path: filePath });
  }
  
  const stats = fs.statSync(filePath);
  console.log('✅ File found - Size:', stats.size, 'bytes');
  
  // Serve the file
  res.sendFile(filePath);
});

module.exports = router;
