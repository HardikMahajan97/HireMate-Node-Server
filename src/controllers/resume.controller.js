const resumeService = require('../services/resume.service');
const ApiResponse = require('../utils/apiResponse');
const Joi = require('joi');

class ResumeController {
  /**
   * Process resume
   * POST /api/resume/process
   */
  async processResume(req, res, next) {
    try {
      const { s3_key } = req.body;
      const userId = req.user.id;

      const result = await resumeService.processResume(userId, s3_key);

      return ApiResponse.success(
        res,
        result,
        'Resume processed successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get parsed resume data
   * GET /api/resume/parsed
   */
  async getParsedResume(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await resumeService.getParsedResume(userId);

      return ApiResponse.success(
        res,
        result,
        'Parsed resume data retrieved'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete resume data
   * DELETE /api/resume
   */
  async deleteResume(req, res, next) {
    try {
      const userId = req.user.id;

      await resumeService.deleteResumeData(userId);

      return ApiResponse.success(
        res,
        null,
        'Resume data deleted successfully'
      );

    } catch (error) {
      next(error);
    }
  }
}

// Validation schemas
ResumeController.processSchema = {
  body: Joi.object({
    s3_key: Joi.string().pattern(/^resumes\//).required()
  })
};

module.exports = new ResumeController();
