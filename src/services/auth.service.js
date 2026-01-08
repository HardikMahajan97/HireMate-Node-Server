const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError, ConflictError, ValidationError } = require('../utils/errorTypes');
const { sanitizeUser } = require('../utils/helpers');
const logger = require('../config/logger');

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    try {
      const { email, password, firstName, lastName } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create user
      const user = await User.create({
        email,
        password,
        profile: {
          firstName,
          lastName
        }
      });

      logger.info(`New user registered: ${email}`);

      // Generate token
      const token = this.generateToken(user._id);

      return {
        user: sanitizeUser(user),
        token
      };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Find user with password field
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Update last login
      user.last_login = new Date();
      await user.save();

      logger.info(`User logged in: ${email}`);

      // Generate token
      const token = this.generateToken(user._id);

      return {
        user: sanitizeUser(user),
        token
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  /**
   * Verify token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }
}

module.exports = new AuthService();
