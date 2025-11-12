console.log('🚀 Starting minimal Express server...');

const express = require('express');
const app = express();
const PORT = 8888;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal Express server running on http://0.0.0.0:${PORT}`);
  console.log(`📍 Test: curl http://localhost:${PORT}/health`);
});

console.log('Server setup complete');
