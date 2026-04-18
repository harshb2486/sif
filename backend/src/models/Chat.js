// Chat Model
// Database queries for chat messages and sessions

const pool = require('../config/database');

/**
 * Create a new chat message
 */
const createMessage = async (userId, companyId, conversationId, role, content, tokensUsed = 0, contextData = null) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO chat_messages 
       (user_id, company_id, conversation_id, role, content, tokens_used, context_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, companyId, conversationId, role, content, tokensUsed, contextData ? JSON.stringify(contextData) : null]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

/**
 * Get messages from a conversation
 */
const getConversationMessages = async (companyId, conversationId, limit = 50) => {
  const connection = await pool.getConnection();
  try {
    const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0
      ? Number(limit)
      : 50;

    const [messages] = await connection.query(
      `SELECT id, role, content, context_data, created_at 
       FROM chat_messages 
       WHERE company_id = ? AND conversation_id = ? 
       ORDER BY created_at DESC 
       LIMIT ${safeLimit}`,
      [companyId, conversationId]
    );
    return messages.reverse(); // Return chronological order
  } finally {
    connection.release();
  }
};

/**
 * Get user's conversations
 */
const getUserConversations = async (userId, companyId, limit = 20) => {
  const connection = await pool.getConnection();
  try {
    const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0
      ? Number(limit)
      : 20;

    const [sessions] = await connection.query(
      `SELECT conversation_id, title, total_messages, total_tokens, created_at, updated_at 
       FROM chat_sessions 
       WHERE user_id = ? AND company_id = ? 
       ORDER BY updated_at DESC 
       LIMIT ${safeLimit}`,
      [userId, companyId]
    );
    return sessions;
  } finally {
    connection.release();
  }
};

/**
 * Create or get chat session
 */
const createOrUpdateSession = async (userId, companyId, conversationId, title = null) => {
  const connection = await pool.getConnection();
  try {
    // Check if session exists
    const [existing] = await connection.execute(
      `SELECT id FROM chat_sessions WHERE conversation_id = ? AND company_id = ?`,
      [conversationId, companyId]
    );

    if (existing.length > 0) {
      // Update session
      await connection.execute(
        `UPDATE chat_sessions 
         SET updated_at = CURRENT_TIMESTAMP, total_messages = total_messages + 1 
         WHERE conversation_id = ?`,
        [conversationId]
      );
      return existing[0].id;
    } else {
      // Create new session
      const [result] = await connection.execute(
        `INSERT INTO chat_sessions (user_id, company_id, conversation_id, title, total_messages) 
         VALUES (?, ?, ?, ?, 1)`,
        [userId, companyId, conversationId, title || `Chat ${new Date().toLocaleDateString()}`]
      );
      return result.insertId;
    }
  } finally {
    connection.release();
  }
};

/**
 * Update session tokens
 */
const updateSessionTokens = async (conversationId, tokensUsed) => {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      `UPDATE chat_sessions 
       SET total_tokens = total_tokens + ? 
       WHERE conversation_id = ?`,
      [tokensUsed, conversationId]
    );
  } finally {
    connection.release();
  }
};

/**
 * Search conversations by keyword
 */
const searchConversations = async (userId, companyId, keyword) => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(
      `SELECT DISTINCT cs.conversation_id, cs.title, cs.created_at, cs.updated_at, cs.total_messages
       FROM chat_sessions cs
       LEFT JOIN chat_messages cm ON cs.conversation_id = cm.conversation_id
       WHERE cs.user_id = ? AND cs.company_id = ? 
       AND (cs.title LIKE ? OR cm.content LIKE ?)
       ORDER BY cs.updated_at DESC`,
      [userId, companyId, `%${keyword}%`, `%${keyword}%`]
    );
    return results;
  } finally {
    connection.release();
  }
};

/**
 * Delete conversation
 */
const deleteConversation = async (conversationId, companyId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Delete messages
    await connection.execute(
      `DELETE FROM chat_messages WHERE conversation_id = ? AND company_id = ?`,
      [conversationId, companyId]
    );
    
    // Delete session
    await connection.execute(
      `DELETE FROM chat_sessions WHERE conversation_id = ? AND company_id = ?`,
      [conversationId, companyId]
    );
    
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createMessage,
  getConversationMessages,
  getUserConversations,
  createOrUpdateSession,
  updateSessionTokens,
  searchConversations,
  deleteConversation
};
