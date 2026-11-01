const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const env = require('./config/env');

const app = express();
const fs = require('fs');

// Trust reverse proxies (Render, Vercel, Cloudflare) for secure cookies
app.set('trust proxy', 1);

// Security & Parsing Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);

      const clientUrl = (env.CLIENT_URL || '').replace(/\/$/, '');
      const allowedOrigins = [
        clientUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5001',
      ].filter(Boolean);

      // Allow configured client URL, localhost, Render, and Vercel domains
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, origin);
      }

      // Default fallback
      return callback(null, origin);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Protected file uploads will be served via authenticated route /api/resumes/:id/download

// Optional session auth middleware
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth.routes');
const jobsRoutes = require('./routes/jobs.routes');
const applicationsRoutes = require('./routes/applications.routes');
const profileRoutes = require('./routes/profile.routes');
const resumesRoutes = require('./routes/resumes.routes');
const externalJobsRoutes = require('./routes/externalJobs.routes');

app.use(authMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Scout API is operational',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/external-jobs', externalJobsRoutes);

// Serve static client assets in production if client build exists
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // 404 handler for API-only deployment
  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
  });
}

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);

  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Multer upload limits and file filter errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'File is too large. Maximum allowed size is 20 MB.';
  } else if (err.message && err.message.includes('Only PDF documents')) {
    status = 400;
  }

  res.status(status).json({
    error: message,
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Scout API server running on http://localhost:${env.PORT}`);
});

module.exports = { app, server };
