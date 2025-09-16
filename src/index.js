import dotenv from "dotenv";
import express from "express";
import { dirname } from "path"; 
import fs from "fs";
import http from "http";
import https from "https";

dotenv.config(); // Load environment variables from .env file

const httpPort = process.env.PORTHTTP || 8080; // Default to 80 if PORTHTTP is not set
const httpsPort = process.env.PORTHTTPS || 8443; // Default to 443 if PORTHTTPS is not set
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();



// Settings
const FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const DURATION = 70 * 1000; // 60 seconds in ms
const CHUNK_SIZE = 64 * 1024; // 64 KB



app.get('/', (req, res) => {
  res.send('Welcome to the slow download server. Download a large file at /download');
});

app.get('/download', (req, res) => {
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="largefile.txt"');
  res.setHeader('Content-Length', FILE_SIZE);

  let sent = 0;
  const interval = DURATION / Math.ceil(FILE_SIZE / CHUNK_SIZE);

  function sendChunk() {
    if (sent >= FILE_SIZE) {
      res.end();
      return;
    }
    const remaining = FILE_SIZE - sent;
    const chunk = Buffer.alloc(Math.min(CHUNK_SIZE, remaining), 0);
    res.write(chunk);
    sent += chunk.length;
    setTimeout(sendChunk, interval);
  }

  sendChunk();
});

// Create HTTP server
const httpServer = http.createServer(app);

// Create HTTPS server if SSL files are provided
let httpsServer;
if (process.env.SSL_KEY && process.env.SSL_CERT && process.env.USESSL === "true") {
    const options = {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT)
    };
    httpsServer = https.createServer(options, app);
}

// Start HTTP server
httpServer.listen(httpPort, () => {
    console.log(`HTTP server running on port ${httpPort}`);
});

// Start HTTPS server if available
if (httpsServer) {
    httpsServer.listen(httpsPort, () => {
        console.log(`HTTPS server running on port ${httpsPort}`);
    });
}