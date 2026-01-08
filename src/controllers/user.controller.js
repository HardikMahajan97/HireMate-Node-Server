const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse');
const Joi = require('joi');

class UserController {
  /**
   * Get user profile
   * GET /api/user/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await userService.getProfile(userId);

      return ApiResponse.success(
        res,
        result,
        'Profile retrieved successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profileData = req.body;

      const result = await userService.updateProfile(userId, profileData);

      return ApiResponse.success(
        res,
        result,
        'Profile updated successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user preferences
   * GET /api/user/preferences
   */
  async getPreferences(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await userService.getPreferences(userId);

      return ApiResponse.success(
        res,
        result,
        'Preferences retrieved successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user preferences
   * PUT /api/user/preferences
   */
  async updatePreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const preferencesData = req.body;

      const result = await userService.updatePreferences(userId, preferencesData);

      return ApiResponse.success(
        res,
        result,
        'Preferences updated successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   * DELETE /api/user/account
   */
  async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;

      await userService.deleteAccount(userId);

      return ApiResponse.success(
        res,
        null,
        'Account deleted successfully'
      );

    } catch (error) {
      next(error);
    }
  }
}

// Validation schemas
UserController.updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
    location: Joi.string().max(100)
  }).min(1) // At least one field required
};

UserController.updatePreferencesSchema = {
  body: Joi.object({
    job_types: Joi.array().items(
      Joi.string().valid('internship', 'full-time', 'part-time', 'contract')
    ),
    locations: Joi.array().items(Joi.string()),
    work_mode: Joi.string().valid('remote', 'hybrid', 'onsite', 'any'),
    min_salary: Joi.number().min(0),
    industries: Joi.array().items(Joi.string())
  }).min(1)
};

module.exports = new UserController();
