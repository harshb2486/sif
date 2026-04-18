// Order Model
// Database queries for orders table

const pool = require('../config/database');

/**
 * Create a new order
 */
const createOrder = async (productId, salesPersonId, clientName, amount, companyId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO orders (product_id, sales_person_id, client_name, amount, company_id) VALUES (?, ?, ?, ?, ?)',
      [productId, salesPersonId, clientName, amount, companyId]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

/**
 * Get all orders for a company
 */
const getOrdersByCompany = async (companyId) => {
  const connection = await pool.getConnection();
  try {
    const [orders] = await connection.execute(
      `SELECT o.id, o.product_id, o.sales_person_id, o.client_name, o.amount, o.company_id, o.created_at,
              p.name as product_name, u.name as sales_person_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN users u ON o.sales_person_id = u.id
       WHERE o.company_id = ?
       ORDER BY o.created_at DESC`,
      [companyId]
    );
    return orders;
  } finally {
    connection.release();
  }
};

/**
 * Get all orders across companies
 */
const getAllOrders = async () => {
  const connection = await pool.getConnection();
  try {
    const [orders] = await connection.execute(
      `SELECT o.id, o.product_id, o.sales_person_id, o.client_name, o.amount, o.company_id, o.created_at,
              p.name as product_name, u.name as sales_person_name, c.name as company_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN users u ON o.sales_person_id = u.id
       JOIN companies c ON o.company_id = c.id
       ORDER BY o.created_at DESC`
    );
    return orders;
  } finally {
    connection.release();
  }
};

/**
 * Get orders by sales person
 */
const getOrdersBySalesPerson = async (salesPersonId, companyId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = `SELECT o.id, o.product_id, o.client_name, o.amount, o.company_id, o.created_at,
                        p.name as product_name, c.name as company_name
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN companies c ON o.company_id = c.id
                 WHERE o.sales_person_id = ?`;
    const params = [salesPersonId];

    if (companyId) {
      query += ' AND o.company_id = ?';
      params.push(companyId);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await connection.execute(query, params);
    return orders;
  } finally {
    connection.release();
  }
};

/**
 * Find order by ID
 */
const findOrderById = async (id, companyId) => {
  const connection = await pool.getConnection();
  try {
    const [orders] = await connection.execute(
      'SELECT * FROM orders WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    return orders[0] || null;
  } finally {
    connection.release();
  }
};

/**
 * Get company orders with pagination and filters
 */
const getOrdersWithPagination = async (companyId, page = 1, limit = 10, search = '', minAmount = null, maxAmount = null, startDate = null, endDate = null) => {
  const connection = await pool.getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `SELECT o.id, o.product_id, o.sales_person_id, o.client_name, o.amount, o.company_id, o.created_at,
                        p.name as product_name, u.name as sales_person_name
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN users u ON o.sales_person_id = u.id
                 WHERE o.company_id = ?`;
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE company_id = ?';
    const params = [companyId];
    const countParams = [companyId];

    if (search) {
      query += ' AND (o.client_name LIKE ? OR p.name LIKE ?)';
      countQuery += ' AND (client_name LIKE ? OR id IN (SELECT id FROM products WHERE name LIKE ?))';
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (minAmount) {
      query += ' AND o.amount >= ?';
      countQuery += ' AND amount >= ?';
      params.push(minAmount);
      countParams.push(minAmount);
    }

    if (maxAmount) {
      query += ' AND o.amount <= ?';
      countQuery += ' AND amount <= ?';
      params.push(maxAmount);
      countParams.push(maxAmount);
    }

    if (startDate) {
      query += ' AND o.created_at >= ?';
      countQuery += ' AND created_at >= ?';
      params.push(startDate);
      countParams.push(startDate);
    }

    if (endDate) {
      query += ' AND o.created_at <= ?';
      countQuery += ' AND created_at <= ?';
      params.push(endDate);
      countParams.push(endDate);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [orders] = await connection.execute(query, params);
    const [countResult] = await connection.execute(countQuery, countParams);

    return {
      orders,
      total: countResult[0].total,
      page,
      limit,
      pages: Math.ceil(countResult[0].total / limit)
    };
  } finally {
    connection.release();
  }
};

/**
 * Get sales person orders with pagination
 */
const getOrdersByPersonWithPagination = async (salesPersonId, companyId = null, page = 1, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `SELECT o.id, o.product_id, o.client_name, o.amount, o.company_id, o.created_at,
                        p.name as product_name, c.name as company_name
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN companies c ON o.company_id = c.id
                 WHERE o.sales_person_id = ?`;
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE sales_person_id = ?';
    const params = [salesPersonId];
    const countParams = [salesPersonId];

    if (companyId) {
      query += ' AND o.company_id = ?';
      countQuery += ' AND company_id = ?';
      params.push(companyId);
      countParams.push(companyId);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';

    const [orders] = await connection.execute(query, [...params, limit, offset]);
    const [countResult] = await connection.execute(countQuery, countParams);

    return {
      orders,
      total: countResult[0].total,
      page,
      limit,
      pages: Math.ceil(countResult[0].total / limit)
    };
  } finally {
    connection.release();
  }
};

module.exports = {
  createOrder,
  getOrdersByCompany,
  getAllOrders,
  getOrdersBySalesPerson,
  findOrderById,
  getOrdersWithPagination,
  getOrdersByPersonWithPagination
};
