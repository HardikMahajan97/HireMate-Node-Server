const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('../config/aws');
const { S3Error } = require('../utils/errorTypes');
const logger = require('../config/logger');

class S3Service {
  /**
   * Delete file from S3
   */
  async deleteFile(s3Key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key
      });

      await s3Client.send(command);

      logger.info(`File deleted from S3: ${s3Key}`);
      return true;
    } catch (error) {
      logger.error(`S3 delete error: ${error.message}`);
      throw new S3Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(s3Key) {
    try {
      const { HeadObjectCommand } = require('@aws-sdk/client-s3');
      const command = new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw new S3Error(`Failed to check file existence: ${error.message}`);
    }
  }
}

module.exports = new S3Service();
