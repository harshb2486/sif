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
const getPendingSalesPersons = async (companyId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id, name, email, role, company_id, is_verified, created_at FROM users WHERE role = "sales" AND is_verified = FALSE';
    const params = [];

    if (companyId) {
      query += ' AND company_id = ?';
      params.push(companyId);
    }

    query += ' ORDER BY created_at DESC';
    const [users] = await connection.execute(query, params);
    return users;
  } finally {
    connection.release();
  }
};

/**
 * Get verified sales persons
 */
const getVerifiedSalesPersons = async (companyId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id, name, email, role, company_id, is_verified, created_at FROM users WHERE role = "sales" AND is_verified = TRUE';
    const params = [];

    if (companyId) {
      query += ' AND company_id = ?';
      params.push(companyId);
    }

    query += ' ORDER BY name ASC';
    const [users] = await connection.execute(query, params);
    return users;
  } finally {
    connection.release();
  }
};

/**
 * Get sales persons for admin view with filters and pagination
 */
const getSalesPersonsForAdmin = async ({ status = 'pending', search = '', page = 1, limit = 10 } = {}) => {
  const connection = await pool.getConnection();
  try {
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    // const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10)); // page limiter disabled
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (parsedPage - 1) * parsedLimit;

    let where = 'WHERE role = "sales"';
    const params = [];
    const countParams = [];

    if (status === 'verified') {
      where += ' AND is_verified = TRUE';
    } else if (status === 'pending') {
      where += ' AND is_verified = FALSE';
    }

    if (search && String(search).trim() !== '') {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      const searchPattern = `%${String(search).trim()}%`;
      params.push(searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern);
    }

    const [rows] = await connection.execute(
      `SELECT id, name, email, role, company_id, is_verified, created_at
       FROM users
       ${where}
       ORDER BY created_at DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    );

    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM users ${where}`,
      countParams
    );

    const [statusCounts] = await connection.execute(
      `SELECT
         SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified,
         SUM(CASE WHEN is_verified = FALSE THEN 1 ELSE 0 END) as pending
       FROM users
       WHERE role = "sales"`
    );

    const total = countResult[0]?.total || 0;
    return {
      users: rows,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.max(1, Math.ceil(total / parsedLimit))
      },
      counts: {
        pending: Number(statusCounts[0]?.pending || 0),
        verified: Number(statusCounts[0]?.verified || 0)
      }
    };
  } finally {
    connection.release();
  }
};

/**
 * Verify a sales person
 */
const verifySalesPerson = async (userId, companyId = null) => {
  const connection = await pool.getConnection();
  try {
    if (companyId) {
      await connection.execute(
        'UPDATE users SET is_verified = TRUE WHERE id = ? AND company_id = ? AND role = "sales"',
        [userId, companyId]
      );
    } else {
      await connection.execute(
        'UPDATE users SET is_verified = TRUE WHERE id = ? AND role = "sales"',
        [userId]
      );
    }
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
  getSalesPersonsForAdmin,
  verifySalesPerson,
  getUsersByCompany,
  setPasswordResetToken,
  findUserByResetToken,
  updatePassword,
  updateProfile,
  getUserProfile
};
