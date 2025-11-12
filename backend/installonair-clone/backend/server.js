const express = require('express');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static('public'));

// Basic route to test server
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    message: 'Step 1 completed successfully',
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});