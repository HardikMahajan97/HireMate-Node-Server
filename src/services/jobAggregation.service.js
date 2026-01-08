const axios = require('axios');
const { ExternalAPIError } = require('../utils/errorTypes');
const { EXTERNAL_APIS } = require('../config/constants');
const { normalizeJobData, sleep } = require('../utils/helpers');
const logger = require('../config/logger');

class JobAggregationService {
  /**
   * Fetch jobs with fallback logic
   */
  async fetchJobs(keywords, location, options = {}) {
    const apis = [
      { name: 'jooble', fn: this.fetchFromJooble.bind(this) },
      { name: 'theirstack', fn: this.fetchFromTheirStack.bind(this) }
    ];

    for (const api of apis) {
      try {
        logger.info(`Fetching jobs from ${api.name}: "${keywords}" in ${location}`);
        const jobs = await api.fn(keywords, location, options);
        
        if (jobs && jobs.length > 0) {
          logger.info(`Fetched ${jobs.length} jobs from ${api.name}`);
          return jobs;
        }
        
        // Empty results are valid - return them
        logger.info(`No jobs found from ${api.name}`);
        return [];
      } catch (error) {
        logger.warn(`${api.name} failed: ${error.message}`);
        
        // If rate limited or server error, try next API
        if (error.statusCode === 429 || error.statusCode >= 500) {
          logger.info(`Trying next API due to ${api.name} failure`);
          continue;
        }
        
        // For other errors, throw immediately
        throw error;
      }
    }

    // All APIs failed
    throw new ExternalAPIError('All job APIs failed');
  }

  /**
   * Fetch from Jooble API
   */
  async fetchFromJooble(keywords, location, options = {}) {
    try {
      const apiKey = process.env.JOOBLE_API_KEY;
      if (!apiKey) {
        throw new ExternalAPIError('Jooble API key not configured', 'jooble');
      }

      const response = await axios.post(
        `${EXTERNAL_APIS.JOOBLE.BASE_URL}/${apiKey}`,
        {
          keywords,
          location,
          radius: options.radius || 40,
          salary: options.salary || ''
        },
        {
          timeout: EXTERNAL_APIS.JOOBLE.TIMEOUT
        }
      );

      const jobs = response.data.jobs || [];
      return jobs.map(job => normalizeJobData(job, 'jooble'));
    } catch (error) {
      if (error.response?.status === 429) {
        throw new ExternalAPIError('Jooble rate limit exceeded', 'jooble');
      }
      throw new ExternalAPIError(
        `Jooble API error: ${error.message}`,
        'jooble'
      );
    }
  }

  /**
   * Fetch from TheirStack API (fallback)
   */
  async fetchFromTheirStack(keywords, location, options = {}) {
    try {
      const apiKey = process.env.THEIRSTACK_API_KEY;
      if (!apiKey) {
        throw new ExternalAPIError('TheirStack API key not configured', 'theirstack');
      }

      const response = await axios.get(
        `${EXTERNAL_APIS.THEIRSTACK.BASE_URL}/jobs`,
        {
          params: {
            query: keywords,
            location: location,
            page: 1,
            limit: 25
          },
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: EXTERNAL_APIS.THEIRSTACK.TIMEOUT
        }
      );

      const jobs = response.data.jobs || response.data.data || [];
      return jobs.map(job => normalizeJobData(job, 'theirstack'));
    } catch (error) {
      if (error.response?.status === 429) {
        throw new ExternalAPIError('TheirStack rate limit exceeded', 'theirstack');
      }
      throw new ExternalAPIError(
        `TheirStack API error: ${error.message}`,
        'theirstack'
      );
    }
  }
}

module.exports = new JobAggregationService();
