const User = require('../models/User');
const Job = require('../models/Job');
const MatchHistory = require('../models/MatchHistory');
const mlCommunicationService = require('./mlCommunication.service');
const jobAggregationService = require('./jobAggregation.service');
const s3Service = require('./s3.service');
const { NotFoundError, ValidationError } = require('../utils/errorTypes');
const logger = require('../config/logger');

class ResumeService {
  /**
   * Main resume processing workflow
   * 1. Parse resume via ML service
   * 2. Store parsed data in user profile
   * 3. Fetch jobs from external APIs
   * 4. Match jobs via ML service
   * 5. Store match history
   * 6. Delete S3 file
   */
  async processResume(userId, s3Key) {
    try {
      logger.info(`Starting resume processing for user ${userId}, S3 key: ${s3Key}`);

      // Step 1: Parse resume via ML service
      logger.info('Step 1: Parsing resume with ML service');
      const parsedData = await mlCommunicationService.parseResume(s3Key);

      // Step 2: Store parsed data in user profile
      logger.info('Step 2: Storing parsed data in user profile');
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.resume.parsed_data = parsedData;
      user.resume.last_updated = new Date();
      await user.save();

      // Step 3: Fetch jobs from external APIs
      logger.info('Step 3: Fetching jobs from external APIs');
      const keywords = parsedData.skills?.join(' ') || '';
      const location = parsedData.preferred_locations?.[0] || 'India';

      if (!keywords) {
        throw new ValidationError('No skills found in resume to match jobs');
      }

      const jobs = await jobAggregationService.fetchJobs(keywords, location);

      if (!jobs || jobs.length === 0) {
        logger.info('No jobs found from external APIs');
        
        // Clean up S3 file even if no jobs found
        await this.cleanupS3File(s3Key);

        return {
          parsed_: parsedData,
          matched_jobs: [],
          total_jobs_analyzed: 0,
          message: 'No jobs found matching your skills and location'
        };
      }

      logger.info(`Fetched ${jobs.length} jobs from external APIs`);

      // Step 4: Store jobs in database (cache)
      logger.info('Step 4: Caching jobs in database');
      const cachedJobs = await this.cacheJobs(jobs);

      // Step 5: Match jobs via ML service
      logger.info('Step 5: Matching jobs with ML service');
      const matchedJobs = await mlCommunicationService.matchJobs(parsedData, jobs);

      // Step 6: Store match history
      logger.info('Step 6: Storing match history');
      await this.storeMatchHistory(userId, matchedJobs, cachedJobs);

      // Step 7: Clean up S3 file
      logger.info('Step 7: Cleaning up S3 file');
      await this.cleanupS3File(s3Key);

      logger.info(`Resume processing completed successfully for user ${userId}`);

      return {
        parsed_: parsedData,
        matched_jobs: matchedJobs,
        total_jobs_analyzed: jobs.length
      };

    } catch (error) {
      logger.error(`Resume processing failed for user ${userId}: ${error.message}`);
      
      // Attempt cleanup even on error
      try {
        await this.cleanupS3File(s3Key);
      } catch (cleanupError) {
        logger.error(`Failed to cleanup S3 file on error: ${cleanupError.message}`);
      }

      throw error;
    }
  }

  /**
   * Cache jobs in database with upsert
   */
  async cacheJobs(jobs) {
    try {
      const cachedJobs = [];

      for (const job of jobs) {
        const cached = await Job.findOneAndUpdate(
          { external_id: job.external_id, source: job.source },
          {
            ...job,
            fetched_at: new Date(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          },
          { upsert: true, new: true }
        );
        cachedJobs.push(cached);
      }

      logger.info(`Cached ${cachedJobs.length} jobs in database`);
      return cachedJobs;

    } catch (error) {
      logger.error(`Error caching jobs: ${error.message}`);
      // Don't fail the entire process if caching fails
      return [];
    }
  }

  /**
   * Store match history for user
   */
  async storeMatchHistory(userId, matchedJobs, cachedJobs) {
    try {
      const matchHistoryDocs = [];

      for (let i = 0; i < matchedJobs.length; i++) {
        const matchedJob = matchedJobs[i];
        
        // Find corresponding cached job
        const cachedJob = cachedJobs.find(
          job => job.external_id === matchedJob.id || 
                 job.title === matchedJob.title
        );

        if (!cachedJob) {
          logger.warn(`Could not find cached job for match: ${matchedJob.title}`);
          continue;
        }

        matchHistoryDocs.push({
          user_id: userId,
          job_id: cachedJob._id,
          match_scores: {
            semantic_score: matchedJob.semantic_score || 0,
            skills_score: matchedJob.skills_score || 0,
            experience_score: matchedJob.experience_score || 0,
            composite_score: matchedJob.match_score / 100 // Convert percentage to 0-1
          },
          match_percentage: matchedJob.match_score,
          matched_skills: matchedJob.matched_skills || [],
          ranking_position: i + 1,
          viewed: false,
          saved: false,
          applied: false,
          matched_at: new Date()
        });
      }

      if (matchHistoryDocs.length > 0) {
        await MatchHistory.insertMany(matchHistoryDocs);
        logger.info(`Stored ${matchHistoryDocs.length} match history records`);
      }

    } catch (error) {
      logger.error(`Error storing match history: ${error.message}`);
      // Don't fail the entire process if history storage fails
    }
  }

  /**
   * Clean up S3 file
   */
  async cleanupS3File(s3Key) {
    try {
      await s3Service.deleteFile(s3Key);
      logger.info(`Cleaned up S3 file: ${s3Key}`);
    } catch (error) {
      logger.error(`Failed to cleanup S3 file ${s3Key}: ${error.message}`);
      // Don't throw - cleanup failure shouldn't break the process
    }
  }

  /**
   * Get parsed resume data for user
   */
  async getParsedResume(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (!user.resume.parsed_data) {
        throw new NotFoundError('No resume data found. Please upload a resume first.');
      }

      return {
        parsed_: user.resume.parsed_data,
        last_updated: user.resume.last_updated
      };

    } catch (error) {
      logger.error(`Error fetching parsed resume: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete resume data from user profile
   */
  async deleteResumeData(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.resume.parsed_data = null;
      user.resume.last_updated = null;
      await user.save();

      logger.info(`Deleted resume data for user ${userId}`);
      return true;

    } catch (error) {
      logger.error(`Error deleting resume  ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ResumeService();
