const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const env = require('./config/env');

const app = express();

// Security & Parsing Middleware
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

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
