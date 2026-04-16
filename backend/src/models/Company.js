// Company Model
// Database queries for companies table

const pool = require('../config/database');

/**
 * Create a new company
 */
const createCompany = async (name, email) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO companies (name, email) VALUES (?, ?)',
      [name, email]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

/**
 * Find company by ID
 */
const findCompanyById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [companies] = await connection.execute(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );
    return companies[0] || null;
  } finally {
    connection.release();
  }
};

/**
 * Find company by email
 */
const findCompanyByEmail = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [companies] = await connection.execute(
      'SELECT * FROM companies WHERE email = ?',
      [email]
    );
    return companies[0] || null;
  } finally {
    connection.release();
  }
};

/**
 * Get all companies
 */
const getAllCompanies = async () => {
  const connection = await pool.getConnection();
  try {
    const [companies] = await connection.execute(
      'SELECT id, name, email, created_at FROM companies ORDER BY created_at DESC'
    );
    return companies;
  } finally {
    connection.release();
  }
};

module.exports = {
  createCompany,
  findCompanyById,
  findCompanyByEmail,
  getAllCompanies
};
