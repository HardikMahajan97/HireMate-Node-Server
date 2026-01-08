const User = require('../models/User');
const { NotFoundError, ValidationError } = require('../utils/errorTypes');
const { sanitizeUser } = require('../utils/helpers');
const logger = require('../config/logger');

class UserService {
  /**
   * Get user profile
   */
  async getProfile(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return sanitizeUser(user);

    } catch (error) {
      logger.error(`Error fetching profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Update profile fields
      if (profileData.firstName !== undefined) {
        user.profile.firstName = profileData.firstName;
      }
      if (profileData.lastName !== undefined) {
        user.profile.lastName = profileData.lastName;
      }
      if (profileData.phone !== undefined) {
        user.profile.phone = profileData.phone;
      }
      if (profileData.location !== undefined) {
        user.profile.location = profileData.location;
      }

      await user.save();

      logger.info(`Profile updated for user ${userId}`);
      return sanitizeUser(user);

    } catch (error) {
      logger.error(`Error updating profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId) {
    try {
      const user = await User.findById(userId).select('preferences');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user.preferences;

    } catch (error) {
      logger.error(`Error fetching preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, preferencesData) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Update preference fields
      if (preferencesData.job_types !== undefined) {
        user.preferences.job_types = preferencesData.job_types;
      }
      if (preferencesData.locations !== undefined) {
        user.preferences.locations = preferencesData.locations;
      }
      if (preferencesData.work_mode !== undefined) {
        user.preferences.work_mode = preferencesData.work_mode;
      }
      if (preferencesData.min_salary !== undefined) {
        user.preferences.min_salary = preferencesData.min_salary;
      }
      if (preferencesData.industries !== undefined) {
        user.preferences.industries = preferencesData.industries;
      }

      await user.save();

      logger.info(`Preferences updated for user ${userId}`);
      return user.preferences;

    } catch (error) {
      logger.error(`Error updating preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Soft delete - just deactivate
      user.is_active = false;
      await user.save();

      logger.info(`Account deactivated for user ${userId}`);
      return true;

    } catch (error) {
      logger.error(`Error deleting account: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new UserService();
