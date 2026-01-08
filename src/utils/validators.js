/**
 * Input validation helpers
 */

const Joi = require('joi');

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate S3 key format
 */
const isValidS3Key = (key) => {
  return /^resumes\/[0-9]+_[a-zA-Z0-9]+\.(pdf|docx)$/.test(key);
};

/**
 * Common Joi schemas
 */
const schemas = {
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  s3Key: Joi.string().pattern(/^resumes\//).required(),
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  })
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidS3Key,
  schemas
};
