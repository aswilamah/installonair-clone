const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'Simple server is working!',
    url: req.url,
    timestamp: new Date().toISOString()
  }));
});

const PORT = 9999;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple server running on http://0.0.0.0:${PORT}`);
  console.log('Test with: curl http://localhost:9999/any-path');
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
  });
});
