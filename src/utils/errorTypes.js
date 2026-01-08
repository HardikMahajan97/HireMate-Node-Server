/**
 * Custom Error Classes for standardized error handling
 */

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Operational errors vs programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Not authorized to access this resource') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'DUPLICATE_ERROR');
  }
}

class ExternalAPIError extends AppError {
  constructor(message = 'External API request failed', service = null) {
    super(message, 502, 'EXTERNAL_API_ERROR');
    this.service = service;
  }
}

class MLServiceError extends AppError {
  constructor(message = 'ML service request failed') {
    super(message, 502, 'ML_SERVICE_ERROR');
  }
}

class S3Error extends AppError {
  constructor(message = 'S3 operation failed') {
    super(message, 500, 'S3_ERROR');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ExternalAPIError,
  MLServiceError,
  S3Error,
  DatabaseError
};
