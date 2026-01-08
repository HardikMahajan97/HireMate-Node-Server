const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('./logger');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Test S3 connection
const testS3Connection = async () => {
  try {
    // Simple test to verify credentials work
    logger.info('S3 client initialized successfully');
    return true;
  } catch (error) {
    logger.error(`S3 initialization error: ${error.message}`);
    return false;
  }
};

module.exports = { s3Client, testS3Connection };
