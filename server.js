console.log('server.js: starting');

require('dotenv').config();
console.log('server.js: dotenv loaded');

const app = require('./src/app');
console.log('server.js: app required');

const connectDB = require('./src/config/database');
console.log('server.js: db module required');

const logger = require('./src/config/logger');
const { testS3Connection } = require('./src/config/aws');

const PORT = process.env.PORT || 5000;

logger.info("Starting server.js... Testing Database connection");
// Connect to database
connectDB();

logger.info("Database connection tested successfully! Moving forward to test AWS s3 connections...");
// Test AWS S3 connection
testS3Connection();

logger.info("AWS s3 connection tested successfully!");
// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
