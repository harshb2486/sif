// Validation Middleware
// Validates request body against Joi schemas

const { ValidationError } = require('../utils/AppError');
const logger = require('../utils/logger');

const validate = (schema, options = {}) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      ...options
    });

    if (error) {
      const details = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      logger.warn('Validation error', { details, body: req.body });
      
      return next(new ValidationError('Validation failed', details));
    }

    // Replace req.body with validated and cleaned data
    req.body = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return next(new ValidationError('Invalid query parameters', details));
    }

    req.query = value;
    next();
  };
};

module.exports = { validate, validateQuery };
