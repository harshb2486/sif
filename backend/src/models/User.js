// User Model
// Database queries for users table

const pool = require('../config/database');

/**
 * Create a new user
 */
const createUser = async (name, email, hashedPassword, role, companyId = null) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, companyId]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  } finally {
    connection.release();
  }
};

/**
 * Find user by ID
 */
const findUserById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT id, name, email, role, company_id, is_verified, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  } finally {
    connection.release();
  }
};

/**
 * Get pending sales persons (not verified)
 */
const getPendingSalesPersons = async (companyId) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT id, name, email, role, is_verified, created_at FROM users WHERE company_id = ? AND role = "sales" AND is_verified = FALSE ORDER BY created_at DESC',
      [companyId]
    );
    return users;
  } finally {
    connection.release();
  }
};

/**
 * Get verified sales persons
 */
const getVerifiedSalesPersons = async (companyId) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT id, name, email, role, is_verified FROM users WHERE company_id = ? AND role = "sales" AND is_verified = TRUE ORDER BY name ASC',
      [companyId]
    );
    return users;
  } finally {
    connection.release();
  }
};

/**
 * Verify a sales person
 */
const verifySalesPerson = async (userId, companyId) => {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE users SET is_verified = TRUE WHERE id = ? AND company_id = ? AND role = "sales"',
      [userId, companyId]
    );
  } finally {
    connection.release();
  }
};

/**
 * Get all users in a company
 */
const getUsersByCompany = async (companyId, role = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id, name, email, role, is_verified, created_at FROM users WHERE company_id = ?';
    const params = [companyId];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    const [users] = await connection.execute(query, params);
    return users;
  } finally {
    connection.release();
  }
};

/**
 * Set password reset token
 */
const setPasswordResetToken = async (userId, resetToken, expiry) => {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, expiry, userId]
    );
  } finally {
    connection.release();
  }
};

/**
 * Find user by reset token
 */
const findUserByResetToken = async (token) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT id, email, name FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    return users[0] || null;
  } finally {
    connection.release();
  }
};

/**
 * Update user password
 */
const updatePassword = async (userId, hashedPassword) => {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, userId]
    );
  } finally {
    connection.release();
  }
};

/**
 * Update user profile
 */
const updateProfile = async (userId, name, phone = null) => {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, userId]
    );
  } finally {
    connection.release();
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT id, name, email, role, phone, company_id, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );
    return users[0] || null;
  } finally {
    connection.release();
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getPendingSalesPersons,
  getVerifiedSalesPersons,
  verifySalesPerson,
  getUsersByCompany,
  setPasswordResetToken,
  findUserByResetToken,
  updatePassword,
  updateProfile,
  getUserProfile
};
