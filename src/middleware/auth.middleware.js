const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errorTypes');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Verify JWT token and attach user to request
 * This is a hard requirement - no token = no access
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AuthenticationError('Authorization header is required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Invalid authorization format. Use: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Token is required');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token has expired. Please login again');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token');
      }
      throw error;
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.is_active) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email
    };

    logger.debug(`User authenticated: ${user.email}`);
    next();

  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate };
