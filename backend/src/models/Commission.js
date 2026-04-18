// Commission Model
// Database queries for commissions table

const pool = require('../config/database');

/**
 * Create a new commission
 */
const createCommission = async (orderId, salesPersonId, amount, companyId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO commissions (order_id, sales_person_id, amount, company_id) VALUES (?, ?, ?, ?)',
      [orderId, salesPersonId, amount, companyId]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

/**
 * Get commissions by sales person
 */
const getCommissionsBySalesPerson = async (salesPersonId, companyId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = `SELECT c.id, c.amount, c.created_at, c.company_id,
                        o.client_name, p.name as product_name, comp.name as company_name
                 FROM commissions c
                 JOIN orders o ON c.order_id = o.id
                 JOIN products p ON o.product_id = p.id
                 JOIN companies comp ON c.company_id = comp.id
                 WHERE c.sales_person_id = ?`;
    const params = [salesPersonId];

    if (companyId) {
      query += ' AND c.company_id = ?';
      params.push(companyId);
    }

    query += ' ORDER BY c.created_at DESC';

    const [commissions] = await connection.execute(query, params);
    return commissions;
  } finally {
    connection.release();
  }
};

/**
 * Get total commission for a sales person
 */
const getTotalCommissionBySalesPerson = async (salesPersonId, companyId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT COALESCE(SUM(amount), 0) as total FROM commissions WHERE sales_person_id = ?';
    const params = [salesPersonId];

    if (companyId) {
      query += ' AND company_id = ?';
      params.push(companyId);
    }

    const [result] = await connection.execute(query, params);
    return result[0].total;
  } finally {
    connection.release();
  }
};

/**
 * Get commission leaderboard for a company
 */
const getLeaderboard = async (companyId = null, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    let query;
    let params;

    if (companyId) {
      query = `SELECT u.id, u.name, COUNT(c.id) as total_commissions, COALESCE(SUM(c.amount), 0) as total_amount
               FROM users u
               LEFT JOIN commissions c ON u.id = c.sales_person_id AND c.company_id = ?
               WHERE u.role = 'sales' AND u.is_verified = TRUE
               GROUP BY u.id, u.name
               ORDER BY total_amount DESC
               LIMIT ${parsedLimit}`;
      params = [companyId];
    } else {
      query = `SELECT u.id, u.name, COUNT(c.id) as total_commissions, COALESCE(SUM(c.amount), 0) as total_amount
               FROM users u
               LEFT JOIN commissions c ON u.id = c.sales_person_id
               WHERE u.role = 'sales' AND u.is_verified = TRUE
               GROUP BY u.id, u.name
               ORDER BY total_amount DESC
               LIMIT ${parsedLimit}`;
      params = [];
    }

    const [leaderboard] = await connection.execute(query, params);
    return leaderboard;
  } finally {
    connection.release();
  }
};

/**
 * Get commissions across all companies
 */
const getAllCommissions = async () => {
  const connection = await pool.getConnection();
  try {
    const [commissions] = await connection.execute(
      `SELECT c.id, c.amount, c.created_at, c.company_id,
              o.client_name, u.name as sales_person_name, p.name as product_name, comp.name as company_name
       FROM commissions c
       JOIN orders o ON c.order_id = o.id
       JOIN users u ON c.sales_person_id = u.id
       JOIN products p ON o.product_id = p.id
       JOIN companies comp ON c.company_id = comp.id
       ORDER BY c.created_at DESC`
    );
    return commissions;
  } finally {
    connection.release();
  }
};

/**
 * Get commissions by company
 */
const getCommissionsByCompany = async (companyId) => {
  const connection = await pool.getConnection();
  try {
    const [commissions] = await connection.execute(
      `SELECT c.id, c.amount, c.created_at, o.client_name, u.name as sales_person_name, p.name as product_name
       FROM commissions c
       JOIN orders o ON c.order_id = o.id
       JOIN users u ON c.sales_person_id = u.id
       JOIN products p ON o.product_id = p.id
       WHERE c.company_id = ?
       ORDER BY c.created_at DESC`,
      [companyId]
    );
    return commissions;
  } finally {
    connection.release();
  }
};

module.exports = {
  createCommission,
  getCommissionsBySalesPerson,
  getTotalCommissionBySalesPerson,
  getLeaderboard,
  getCommissionsByCompany,
  getAllCommissions
};
