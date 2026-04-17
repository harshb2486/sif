// Global Error Handler Middleware
// Catches and formats all errors in a consistent manner

const logger = require('../utils/logger');
const { AppError } = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid input data';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry found';
  }

  // In production, don't expose internal errors
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    details = null;
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
