const express = require('express');
const multer = require('multer');

const app = express();
const PORT = 3333;

// Configure multer for file uploads (store in memory, accept any field name)
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint 1: Accept file uploads (multipart) and log their names
app.post('/upload', upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.log('[UPLOAD] No files received');
    return res.status(400).json({ message: 'No files uploaded' });
  }

  req.files.forEach((file) => {
    console.log(`[UPLOAD] Received file: ${file.originalname} (${file.size} bytes)`);
  });

  res.json({
    message: 'Files received',
    files: req.files.map((f) => f.originalname),
  });
});

// Endpoint 2: Return 200 with random latency (0-1000ms)
app.get('/random-latency', async (req, res) => {
  const delay = Math.floor(Math.random() * 1001); // 0-1000ms
  await new Promise((resolve) => setTimeout(resolve, delay));
  res.json({ latency: delay, message: 'OK' });
});

// Health check / root
app.get('/', (req, res) => {
  res.json({ status: 'ok', endpoints: ['/upload (POST)', '/random-latency (GET)'] });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`   POST /upload         - Upload files (multipart)`);
  console.log(`   GET  /random-latency - Random delay 0-1000ms`);
});

