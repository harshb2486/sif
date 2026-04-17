// Database Transaction Helper
// Manages multi-step operations with automatic rollback on error

const { pool } = require('../config/database');
const logger = require('./logger');

/**
 * Execute a transaction
 * @param {Function} callback - Async function that receives connection
 * @returns {Promise} - Result of the callback
 */
const executeTransaction = async (callback) => {
  const connection = await pool.getConnection();
  
  try {
    // Start transaction
    await connection.beginTransaction();
    logger.debug('Transaction started');
    
    // Execute callback with connection
    const result = await callback(connection);
    
    // Commit transaction
    await connection.commit();
    logger.debug('Transaction committed');
    
    return result;
  } catch (error) {
    // Rollback on error
    await connection.rollback();
    logger.error('Transaction rolled back', { error: error.message });
    throw error;
  } finally {
    // Always release connection
    connection.release();
  }
};

/**
 * Execute multiple queries in a transaction
 * @param {Array<{query: string, params: array}>} queries - Array of query objects
 * @returns {Promise<Array>} - Array of results
 */
const executeMultipleQueries = async (queries) => {
  return executeTransaction(async (connection) => {
    const results = [];
    
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    return results;
  });
};

module.exports = { executeTransaction, executeMultipleQueries };
