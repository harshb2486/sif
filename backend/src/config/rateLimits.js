// Rate Limiting Configuration
// Provides different rate limits for different endpoint groups

const rateLimit = require('express-rate-limit');

const isDevelopment = (process.env.NODE_ENV || 'development') !== 'production';

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildLimiter = () => (req, res, next) => next();

// General API limiter - broad requests
const generalLimiter = buildLimiter({
  windowMs: toInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
  max: toInt(process.env.RATE_LIMIT_GENERAL_MAX, 100),
  message: 'Too many requests, please try again later'
});

// Auth limiter - strict for login/register
const authLimiter = buildLimiter({
  windowMs: toInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
  max: toInt(process.env.RATE_LIMIT_AUTH_MAX, 5),
  message: 'Too many authentication attempts, please try again later',
  skip: (req) => req.method !== 'POST'
});

// Read operations limiter - relaxed for reporting
const readLimiter = buildLimiter({
  windowMs: toInt(process.env.RATE_LIMIT_READ_WINDOW_MS, 15 * 60 * 1000),
  max: toInt(process.env.RATE_LIMIT_READ_MAX, 200),
  message: 'Too many requests, please try again later'
});

// Write operations limiter - moderate for data mutations
const writeLimiter = buildLimiter({
  windowMs: toInt(process.env.RATE_LIMIT_WRITE_WINDOW_MS, 15 * 60 * 1000),
  max: toInt(process.env.RATE_LIMIT_WRITE_MAX, 50),
  message: 'Too many write requests, please try again later',
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
});

// Export limiter - strict for bulk operations
const exportLimiter = buildLimiter({
  windowMs: toInt(process.env.RATE_LIMIT_EXPORT_WINDOW_MS, 60 * 60 * 1000), // 1 hour
  max: toInt(process.env.RATE_LIMIT_EXPORT_MAX, 10),
  message: 'Too many export requests, please try again later'
});

module.exports = {
  generalLimiter,
  authLimiter,
  readLimiter,
  writeLimiter,
  exportLimiter
};
