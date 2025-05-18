// Simple HTTP server for testing announcements
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const WEBSITE_DIR = path.join(__dirname, 'Website');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle the root URL
  let filePath = path.join(WEBSITE_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Get the file extension
  const extname = path.extname(filePath).toLowerCase();
  
  // Set the content type based on the file extension
  const contentType = MIME_TYPES[extname] || 'text/plain';
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // Server error
        console.error(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Test announcements page: http://localhost:${PORT}/test-announcements.html`);
}); 