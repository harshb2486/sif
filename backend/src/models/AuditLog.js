// Audit Log Model
// Database queries for audit logs

const pool = require('../config/database');

/**
 * Create an audit log entry
 */
const createAuditLog = async (userId, action, tableName, recordId, oldValue = null, newValue = null, companyId = null) => {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value, company_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, action, tableName, recordId, JSON.stringify(oldValue), JSON.stringify(newValue), companyId]
    );
  } finally {
    connection.release();
  }
};

/**
 * Get audit logs for a company
 */
const getAuditLogsByCompany = async (companyId, page = 1, limit = 20) => {
  const connection = await pool.getConnection();
  try {
    const offset = (page - 1) * limit;
    const query = `SELECT al.id, al.user_id, al.action, al.table_name, al.record_id, 
                          al.old_value, al.new_value, al.created_at, u.name as user_name
                   FROM audit_logs al
                   LEFT JOIN users u ON al.user_id = u.id
                   WHERE al.company_id = ?
                   ORDER BY al.created_at DESC
                   LIMIT ? OFFSET ?`;
    
    const countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE company_id = ?';

    const [logs] = await connection.execute(query, [companyId, limit, offset]);
    const [countResult] = await connection.execute(countQuery, [companyId]);

    return {
      logs,
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
 * Get audit logs for a specific user
 */
const getAuditLogsByUser = async (userId, companyId, page = 1, limit = 20) => {
  const connection = await pool.getConnection();
  try {
    const offset = (page - 1) * limit;
    const query = `SELECT id, user_id, action, table_name, record_id, old_value, new_value, created_at
                   FROM audit_logs
                   WHERE user_id = ? AND company_id = ?
                   ORDER BY created_at DESC
                   LIMIT ? OFFSET ?`;
    
    const countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE user_id = ? AND company_id = ?';

    const [logs] = await connection.execute(query, [userId, companyId, limit, offset]);
    const [countResult] = await connection.execute(countQuery, [userId, companyId]);

    return {
      logs,
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
  createAuditLog,
  getAuditLogsByCompany,
  getAuditLogsByUser
};
