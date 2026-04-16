// Verification Middleware
// Allows only verified users to access certain routes

const pool = require('../config/database');

/**
 * Verification Middleware - Allow only verified sales persons
 */
const verificationMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found'
      });
    }

    // Get user from database
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT is_verified FROM users WHERE id = ?',
      [req.user.id]
    );
    connection.release();

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!users[0].is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not verified yet. Please wait for admin approval.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = verificationMiddleware;
