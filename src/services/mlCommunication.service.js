const axios = require('axios');
const { MLServiceError } = require('../utils/errorTypes');
const { ML_SERVICE } = require('../config/constants');
const logger = require('../config/logger');

class MLCommunicationService {
  constructor() {
    this.mlClient = axios.create({
      baseURL: process.env.ML_SERVICE_URL,
      timeout: ML_SERVICE.TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Parse resume via ML service
   */
  async parseResume(s3Key) {
    try {
      logger.info(`Calling ML service to parse resume: ${s3Key}`);

      const response = await this.mlClient.post('/parse-resume', {
        s3_key: s3Key
      });

      logger.info(`Resume parsed successfully: ${s3Key}`);
      return response.data.data;
    } catch (error) {
      logger.error(`ML parse error: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        throw new MLServiceError('ML service is not available');
      }
      
      if (error.response?.status >= 500) {
        throw new MLServiceError('ML service internal error');
      }

      throw new MLServiceError(error.response?.data?.detail || error.message);
    }
  }

  /**
   * Match jobs to resume via ML service
   */
  async matchJobs(parsedResume, jobs) {
    try {
      logger.info(`Calling ML service to match ${jobs.length} jobs`);

      const response = await this.mlClient.post('/match-jobs', {
        parsed_resume: parsedResume,
        jobs: jobs
      });

      logger.info(`Job matching completed: ${response.data.matched_jobs.length} matches`);
      return response.data.matched_jobs;
    } catch (error) {
      logger.error(`ML match error: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        throw new MLServiceError('ML service is not available');
      }

      throw new MLServiceError(error.response?.data?.detail || error.message);
    }
  }

  /**
   * Health check for ML service
   */
  async healthCheck() {
    try {
      const response = await this.mlClient.get('/health', { timeout: 5000 });
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new MLCommunicationService();
