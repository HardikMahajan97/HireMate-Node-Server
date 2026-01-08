const { ValidationError } = require('../utils/errorTypes');

/**
 * Validate request using Joi schema
 * @param {Object} schema - Joi schema object with body/query/params keys
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow unknown keys that will be ignored
      stripUnknown: true // Remove unknown keys
    };

    // Validate body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        const details = error.details.map(detail => detail.message);
        return next(new ValidationError('Invalid request body', details));
      }
      req.body = value;
    }

    // Validate query params
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        const details = error.details.map(detail => detail.message);
        return next(new ValidationError('Invalid query parameters', details));
      }
      req.query = value;
    }

    // Validate route params
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        const details = error.details.map(detail => detail.message);
        return next(new ValidationError('Invalid route parameters', details));
      }
      req.params = value;
    }

    next();
  };
};

module.exports = validate;
