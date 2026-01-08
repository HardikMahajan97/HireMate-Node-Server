const Job = require('../models/Job');
const MatchHistory = require('../models/MatchHistory');
const { NotFoundError } = require('../utils/errorTypes');
const { parsePagination } = require('../utils/helpers');
const logger = require('../config/logger');

class JobService {
  /**
   * Search/filter matched jobs for user
   */
  async getMatchedJobs(userId, filters = {}, paginationParams = {}) {
    try {
      const { page, limit, skip } = parsePagination(paginationParams);

      // Build query
      const query = { user_id: userId };

      // Filter by saved/applied status
      if (filters.saved !== undefined) {
        query.saved = filters.saved === 'true' || filters.saved === true;
      }
      if (filters.applied !== undefined) {
        query.applied = filters.applied === 'true' || filters.applied === true;
      }

      // Get match history with populated job data
      const matchHistory = await MatchHistory.find(query)
        .populate('job_id')
        .sort({ match_percentage: -1, matched_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await MatchHistory.countDocuments(query);

      // Format response
      const jobs = matchHistory.map(match => ({
        id: match.job_id._id,
        external_id: match.job_id.external_id,
        source: match.job_id.source,
        title: match.job_id.title,
        company: match.job_id.company,
        location: match.job_id.location,
        description: match.job_id.description,
        snippet: match.job_id.snippet,
        salary: match.job_id.salary,
        experience_required: match.job_id.experience_required,
        job_type: match.job_id.job_type,
        work_mode: match.job_id.work_mode,
        link: match.job_id.link,
        posted_date: match.job_id.posted_date,
        match_percentage: match.match_percentage,
        matched_skills: match.matched_skills,
        ranking_position: match.ranking_position,
        viewed: match.viewed,
        saved: match.saved,
        applied: match.applied,
        matched_at: match.matched_at
      }));

      return {
        jobs,
        pagination: { page, limit, total }
      };

    } catch (error) {
      logger.error(`Error fetching matched jobs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get job details by ID
   */
  async getJobById(userId, jobId) {
    try {
      // Get match history entry
      const matchHistory = await MatchHistory.findOne({
        user_id: userId,
        job_id: jobId
      }).populate('job_id');

      if (!matchHistory) {
        throw new NotFoundError('Job not found in your matches');
      }

      // Mark as viewed
      if (!matchHistory.viewed) {
        matchHistory.viewed = true;
        matchHistory.viewed_at = new Date();
        await matchHistory.save();
      }

      const job = matchHistory.job_id;

      return {
        id: job._id,
        external_id: job.external_id,
        source: job.source,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary: job.salary,
        experience_required: job.experience_required,
        job_type: job.job_type,
        work_mode: job.work_mode,
        required_skills: job.required_skills,
        link: job.link,
        posted_date: job.posted_date,
        match_percentage: matchHistory.match_percentage,
        match_scores: matchHistory.match_scores,
        matched_skills: matchHistory.matched_skills,
        ranking_position: matchHistory.ranking_position,
        saved: matchHistory.saved,
        applied: matchHistory.applied,
        viewed_at: matchHistory.viewed_at,
        matched_at: matchHistory.matched_at
      };

    } catch (error) {
      logger.error(`Error fetching job details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save/bookmark a job
   */
  async saveJob(userId, jobId) {
    try {
      const matchHistory = await MatchHistory.findOne({
        user_id: userId,
        job_id: jobId
      });

      if (!matchHistory) {
        throw new NotFoundError('Job not found in your matches');
      }

      matchHistory.saved = true;
      await matchHistory.save();

      logger.info(`User ${userId} saved job ${jobId}`);
      return { saved: true };

    } catch (error) {
      logger.error(`Error saving job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unsave/unbookmark a job
   */
  async unsaveJob(userId, jobId) {
    try {
      const matchHistory = await MatchHistory.findOne({
        user_id: userId,
        job_id: jobId
      });

      if (!matchHistory) {
        throw new NotFoundError('Job not found in your matches');
      }

      matchHistory.saved = false;
      await matchHistory.save();

      logger.info(`User ${userId} unsaved job ${jobId}`);
      return { saved: false };

    } catch (error) {
      logger.error(`Error unsaving job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark job as applied
   */
  async markAsApplied(userId, jobId) {
    try {
      const matchHistory = await MatchHistory.findOne({
        user_id: userId,
        job_id: jobId
      });

      if (!matchHistory) {
        throw new NotFoundError('Job not found in your matches');
      }

      matchHistory.applied = true;
      matchHistory.applied_at = new Date();
      await matchHistory.save();

      logger.info(`User ${userId} applied to job ${jobId}`);
      return { applied: true };

    } catch (error) {
      logger.error(`Error marking job as applied: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get saved jobs for user
   */
  async getSavedJobs(userId, paginationParams = {}) {
    return this.getMatchedJobs(userId, { saved: true }, paginationParams);
  }

  /**
   * Get applied jobs for user
   */
  async getAppliedJobs(userId, paginationParams = {}) {
    return this.getMatchedJobs(userId, { applied: true }, paginationParams);
  }

  /**
   * Get match history statistics
   */
  async getMatchStatistics(userId) {
    try {
      const stats = await MatchHistory.aggregate([
        { $match: { user_id: userId } },
        {
          $group: {
            _id: null,
            total_matches: { $sum: 1 },
            viewed_count: { $sum: { $cond: ['$viewed', 1, 0] } },
            saved_count: { $sum: { $cond: ['$saved', 1, 0] } },
            applied_count: { $sum: { $cond: ['$applied', 1, 0] } },
            avg_match_score: { $avg: '$match_percentage' }
          }
        }
      ]);

      if (!stats || stats.length === 0) {
        return {
          total_matches: 0,
          viewed_count: 0,
          saved_count: 0,
          applied_count: 0,
          avg_match_score: 0
        };
      }

      return stats[0];

    } catch (error) {
      logger.error(`Error fetching match statistics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new JobService();
