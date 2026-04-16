// Product Model
// Database queries for products table

const pool = require('../config/database');

/**
 * Create a new product
 */
const createProduct = async (name, price, commissionType, commissionValue, companyId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO products (name, price, commission_type, commission_value, company_id) VALUES (?, ?, ?, ?, ?)',
      [name, price, commissionType, commissionValue, companyId]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

/**
 * Get all products for a company
 */
const getProductsByCompany = async (companyId) => {
  const connection = await pool.getConnection();
  try {
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );
    return products;
  } finally {
    connection.release();
  }
};

/**
 * Find product by ID
 */
const findProductById = async (id, companyId) => {
  const connection = await pool.getConnection();
  try {
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    return products[0] || null;
  } finally {
    connection.release();
  }
};

/**
 * Update product
 */
const updateProduct = async (id, companyId, name, price, commissionType, commissionValue) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'UPDATE products SET name = ?, price = ?, commission_type = ?, commission_value = ? WHERE id = ? AND company_id = ?',
      [name, price, commissionType, commissionValue, id, companyId]
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

/**
 * Delete product
 */
const deleteProduct = async (id, companyId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'DELETE FROM products WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

/**
 * Get products with pagination and search
 */
const getProductsWithPagination = async (companyId, page = 1, limit = 10, search = '') => {
  const connection = await pool.getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM products WHERE company_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE company_id = ?';
    const params = [companyId];

    if (search) {
      query += ' AND name LIKE ?';
      countQuery += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const countParams = search ? [companyId, `%${search}%`] : [companyId];

    const [products] = await connection.execute(query, [...params, limit, offset]);
    const [countResult] = await connection.execute(countQuery, countParams);

    return {
      products,
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
  createProduct,
  getProductsByCompany,
  findProductById,
  updateProduct,
  deleteProduct,
  getProductsWithPagination
};
