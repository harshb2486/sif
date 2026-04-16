// Utility Functions
// Common helper functions for the application

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash a password using bcryptjs
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Password hashing failed: ' + error.message);
  }
};

/**
 * Compare plain text password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Password comparison failed: ' + error.message);
  }
};

/**
 * Generate JWT token
 * @param {number} userId - User ID
 * @param {number} companyId - Company ID
 * @param {string} role - User role
 * @returns {string} - JWT token
 */
const generateToken = (userId, companyId, role) => {
  try {
    return jwt.sign(
      {
        id: userId,
        companyId: companyId,
        role: role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    );
  } catch (error) {
    throw new Error('Token generation failed: ' + error.message);
  }
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token: ' + error.message);
  }
};

/**
 * Calculate commission based on type and value
 * @param {string} commissionType - 'fixed' or 'percentage'
 * @param {number} commissionValue - Commission value
 * @param {number} productPrice - Product price
 * @returns {number} - Calculated commission amount
 */
const calculateCommission = (commissionType, commissionValue, productPrice) => {
  if (commissionType === 'fixed') {
    return parseFloat(commissionValue);
  } else if (commissionType === 'percentage') {
    return parseFloat((productPrice * commissionValue) / 100);
  }
  return 0;
};

/**
 * Format API response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object} data - Response data
 * @returns {object} - Formatted response
 */
const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data: data || {}
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  calculateCommission,
  formatResponse
};
