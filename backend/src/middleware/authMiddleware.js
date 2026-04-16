// Authentication Middleware
// Verifies JWT token and attaches user info to request

const { verifyToken } = require('../utils/helpers');

/**
 * Auth Middleware - Verify JWT token
 * Attaches decoded token to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

// Export as function and also as named `verifyToken` for compatibility
authMiddleware.verifyToken = authMiddleware;
module.exports = authMiddleware;
