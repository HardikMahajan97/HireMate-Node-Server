const logger = require('../config/logger');
const { AppError } = require('../utils/errorTypes');
const ApiResponse = require('../utils/apiResponse');

/**
 * Global error handler middleware
 * Must be registered last in app.js
 */
function errorHandler(err, req, res, next) {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });

  // Operational errors (known errors we throw)
  if (err instanceof AppError) {
    return ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.code,
      err.details || err.service
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return ApiResponse.error(
      res,
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      details
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return ApiResponse.error(
      res,
      `${field} already exists`,
      409,
      'DUPLICATE_ERROR'
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(
      res,
      'Invalid token',
      401,
      'AUTHENTICATION_ERROR'
    );
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(
      res,
      'Token expired',
      401,
      'AUTHENTICATION_ERROR'
    );
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.error(
      res,
      'Invalid ID format',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Default 500 error
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
}

module.exports = errorHandler;
