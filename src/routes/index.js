const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const resumeRoutes = require('./resume.routes');
const jobRoutes = require('./job.routes');
const userRoutes = require('./user.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/user', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Resume-Job Matcher API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      resume: '/api/resume',
      jobs: '/api/jobs',
      user: '/api/user'
    },
    documentation: 'https://github.com/yourrepo/api-docs'
  });
});

// Add this after the API info endpoint

/**
 * System status endpoint
 */
router.get('/status', async (req, res) => {
  const mongoose = require('mongoose');
  const mlCommunicationService = require('../services/mlCommunication.service');

  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check ML service
    const mlStatus = await mlCommunicationService.healthCheck();

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          host: mongoose.connection.host
        },
        ml_service: {
          status: mlStatus.status,
          url: process.env.ML_SERVICE_URL
        }
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});


module.exports = router;
