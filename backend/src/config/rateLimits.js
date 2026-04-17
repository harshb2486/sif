// Rate Limiting Configuration
// Provides different rate limits for different endpoint groups

const rateLimit = require('express-rate-limit');

// General API limiter - broad requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Auth limiter - strict for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
  skip: (req) => req.method !== 'POST'
});

// Read operations limiter - relaxed for reporting
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // More generous for read-heavy operations
  message: 'Too many requests, please try again later'
});

// Write operations limiter - moderate for data mutations
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Stricter for write operations
  message: 'Too many write requests, please try again later',
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
});

// Export limiter - strict for bulk operations
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Only 10 exports per hour
  message: 'Too many export requests, please try again later'
});

module.exports = {
  generalLimiter,
  authLimiter,
  readLimiter,
  writeLimiter,
  exportLimiter
};
