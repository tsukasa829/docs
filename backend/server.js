require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');

const app = express();
const PORT = process.env.PORT || 50321;

// GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await octokit.rest.users.getAuthenticated();
    res.json({
      status: 'ok',
      timestamp: new Date(),
      port: PORT,
      github: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date(),
      port: PORT,
      github: 'disconnected',
      error: error.message,
    });
  }
});

// GitHub API Proxy - すべてのリクエストをそのまま転送
app.all('/api/*', async (req, res) => {
  try {
    const path = req.params[0];
    const method = req.method;
    
    console.log(`  → GitHub API: ${method} /${path}`);
    
    // GitHub APIリクエスト
    const response = await octokit.request(`${method} /${path}`, {
      ...req.query,
      ...req.body,
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    
    res.status(error.status || 500).json({
      error: error.message,
      status: error.status,
      documentation_url: error.documentation_url,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 GitHub API Proxy Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
