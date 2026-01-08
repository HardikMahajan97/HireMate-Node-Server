const jobService = require('../services/job.service');
const ApiResponse = require('../utils/apiResponse');
const Joi = require('joi');

class JobController {
  /**
   * Search/get matched jobs
   * GET /api/jobs/search
   */
  async searchJobs(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = {
        saved: req.query.saved,
        applied: req.query.applied
      };
      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await jobService.getMatchedJobs(userId, filters, pagination);

      return ApiResponse.paginated(
        res,
        result.jobs,
        result.pagination,
        'Jobs retrieved successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get job details by ID
   * GET /api/jobs/:id
   */
  async getJobById(req, res, next) {
    try {
      const userId = req.user.id;
      const jobId = req.params.id;

      const result = await jobService.getJobById(userId, jobId);

      return ApiResponse.success(
        res,
        result,
        'Job details retrieved'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Save/bookmark job
   * POST /api/jobs/save/:id
   */
  async saveJob(req, res, next) {
    try {
      const userId = req.user.id;
      const jobId = req.params.id;

      const result = await jobService.saveJob(userId, jobId);

      return ApiResponse.success(
        res,
        result,
        'Job saved successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Unsave job
   * DELETE /api/jobs/save/:id
   */
  async unsaveJob(req, res, next) {
    try {
      const userId = req.user.id;
      const jobId = req.params.id;

      const result = await jobService.unsaveJob(userId, jobId);

      return ApiResponse.success(
        res,
        result,
        'Job unsaved successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get saved jobs
   * GET /api/jobs/saved
   */
  async getSavedJobs(req, res, next) {
    try {
      const userId = req.user.id;
      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await jobService.getSavedJobs(userId, pagination);

      return ApiResponse.paginated(
        res,
        result.jobs,
        result.pagination,
        'Saved jobs retrieved'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark job as applied
   * POST /api/jobs/apply/:id
   */
  async applyToJob(req, res, next) {
    try {
      const userId = req.user.id;
      const jobId = req.params.id;

      const result = await jobService.markAsApplied(userId, jobId);

      return ApiResponse.success(
        res,
        result,
        'Job marked as applied'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get applied jobs
   * GET /api/jobs/applied
   */
  async getAppliedJobs(req, res, next) {
    try {
      const userId = req.user.id;
      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await jobService.getAppliedJobs(userId, pagination);

      return ApiResponse.paginated(
        res,
        result.jobs,
        result.pagination,
        'Applied jobs retrieved'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get match statistics
   * GET /api/jobs/stats
   */
  async getStatistics(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await jobService.getMatchStatistics(userId);

      return ApiResponse.success(
        res,
        result,
        'Statistics retrieved'
      );

    } catch (error) {
      next(error);
    }
  }
}

// Validation schemas
JobController.searchSchema = {
  query: Joi.object({
    saved: Joi.boolean(),
    applied: Joi.boolean(),
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100)
  })
};

JobController.jobIdSchema = {
  params: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  })
};

module.exports = new JobController();
