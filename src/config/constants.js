module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Error Codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
    ML_SERVICE_ERROR: 'ML_SERVICE_ERROR',
    S3_ERROR: 'S3_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALLOWED_EXTENSIONS: ['.pdf', '.docx']
  },

  // Job Types
  JOB_TYPES: ['internship', 'full-time', 'part-time', 'contract'],

  // Work Modes
  WORK_MODES: ['remote', 'hybrid', 'onsite', 'any'],

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // External APIs
  EXTERNAL_APIS: {
    JOOBLE: {
      NAME: 'jooble',
      BASE_URL: 'https://jooble.org/api',
      TIMEOUT: 10000,
      MAX_RETRIES: 2
    },
    THEIRSTACK: {
      NAME: 'theirstack',
      BASE_URL: process.env.THEIRSTACK_API_URL || 'https://api.theirstack.com/v1',
      TIMEOUT: 10000,
      MAX_RETRIES: 2
    }
  },

  // ML Service
  ML_SERVICE: {
    TIMEOUT: parseInt(process.env.ML_SERVICE_TIMEOUT) || 60000,
    MAX_RETRIES: 1
  }
};
