const pool = require('../config/database');

let schemaInitPromise = null;

const ensureOwnerSalesChatSchema = async () => {
  if (schemaInitPromise) {
    return schemaInitPromise;
  }

  schemaInitPromise = (async () => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `CREATE TABLE IF NOT EXISTS owner_sales_conversations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          company_id INT NOT NULL,
          owner_id INT NOT NULL,
          sales_id INT NOT NULL,
          last_message_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (sales_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY uniq_owner_sales_conversation (company_id, owner_id, sales_id),
          INDEX idx_owner_sales_company (company_id),
          INDEX idx_owner_sales_owner (owner_id),
          INDEX idx_owner_sales_sales (sales_id)
        )`
      );

      await connection.execute(
        `CREATE TABLE IF NOT EXISTS owner_sales_messages (
          id INT PRIMARY KEY AUTO_INCREMENT,
          conversation_id INT NOT NULL,
          sender_id INT NOT NULL,
          message_type ENUM('text', 'system') DEFAULT 'text',
          content LONGTEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES owner_sales_conversations(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_owner_sales_messages_conversation (conversation_id, created_at),
          INDEX idx_owner_sales_messages_sender (sender_id)
        )`
      );
    } finally {
      connection.release();
    }
  })().catch((error) => {
    schemaInitPromise = null;
    throw error;
  });

  return schemaInitPromise;
};

const isOwnerSalesPair = (aRole, bRole) => {
  return (
    (aRole === 'company_admin' && bRole === 'sales') ||
    (aRole === 'sales' && bRole === 'company_admin')
  );
};

const getUserById = async (userId) => {
  await ensureOwnerSalesChatSchema();
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT id, name, email, role, company_id, is_verified FROM users WHERE id = ?',
      [userId]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
};

const getAvailableContacts = async (userId, companyId, role) => {
  await ensureOwnerSalesChatSchema();
  const connection = await pool.getConnection();
  try {
    if (role === 'company_admin') {
      if (!companyId) {
        return [];
      }

      const [rows] = await connection.execute(
        `SELECT id, name, email, role, is_verified
         FROM users
         WHERE role = 'sales'
           AND is_verified = TRUE
           AND (company_id = ? OR company_id IS NULL)
         ORDER BY name ASC`,
        [companyId]
      );
      return rows;
    }

    if (role === 'sales') {
      if (!companyId) {
        const [rows] = await connection.execute(
          `SELECT id, name, email, role, is_verified
           FROM users
           WHERE role = 'company_admin' AND company_id IS NOT NULL
           ORDER BY name ASC
           LIMIT 50`
        );
        return rows;
      }

      const [rows] = await connection.execute(
        `SELECT id, name, email, role, is_verified
         FROM users
         WHERE company_id = ? AND role = 'company_admin'
         ORDER BY name ASC`,
        [companyId]
      );
      return rows;
    }

    return [];
  } finally {
    connection.release();
  }
};

const canCommunicate = async (currentUser, targetUserId) => {
  const actorUser = await getUserById(currentUser?.id);
  const targetUser = await getUserById(targetUserId);

  if (!actorUser) {
    return { allowed: false, reason: 'Current user not found' };
  }

  if (!targetUser) {
    return { allowed: false, reason: 'Target user not found' };
  }

  if (!isOwnerSalesPair(actorUser.role, targetUser.role)) {
    return { allowed: false, reason: 'Only company admin and sales can communicate', targetUser };
  }

  const adminUser = actorUser.role === 'company_admin' ? actorUser : targetUser;
  const salesUser = actorUser.role === 'sales' ? actorUser : targetUser;

  if (!salesUser.company_id && adminUser.company_id) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE users
         SET company_id = ?
         WHERE id = ? AND role = 'sales' AND company_id IS NULL`,
        [adminUser.company_id, salesUser.id]
      );
      salesUser.company_id = adminUser.company_id;
      if (actorUser.id === salesUser.id) {
        actorUser.company_id = adminUser.company_id;
      } else {
        targetUser.company_id = adminUser.company_id;
      }
    } finally {
      connection.release();
    }
  }

  if (
    !adminUser.company_id ||
    Number(adminUser.company_id) !== Number(salesUser.company_id)
  ) {
    return { allowed: false, reason: 'Users are not in the same company', targetUser };
  }

  if (actorUser.role === 'sales' && !actorUser.is_verified) {
    return { allowed: false, reason: 'Sales person is not verified yet', targetUser };
  }

  if (actorUser.role === 'company_admin' && !targetUser.is_verified) {
    return { allowed: false, reason: 'Sales person is not verified yet', targetUser };
  }

  return {
    allowed: true,
    targetUser,
    companyId: Number(adminUser.company_id)
  };
};

const createOrGetConversation = async (companyId, userA, userB) => {
  await ensureOwnerSalesChatSchema();
  const ownerId = userA.role === 'company_admin' ? userA.id : userB.id;
  const salesId = userA.role === 'sales' ? userA.id : userB.id;

  const connection = await pool.getConnection();
  try {
    await connection.execute(
      `INSERT INTO owner_sales_conversations (company_id, owner_id, sales_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE updated_at = updated_at`,
      [companyId, ownerId, salesId]
    );

    const [createdOrExisting] = await connection.execute(
      `SELECT id, company_id, owner_id, sales_id, created_at, updated_at, last_message_at
       FROM owner_sales_conversations
       WHERE company_id = ? AND owner_id = ? AND sales_id = ?
       LIMIT 1`,
      [companyId, ownerId, salesId]
    );

    return createdOrExisting[0];
  } finally {
    connection.release();
  }
};

const getConversationListForUser = async (userId, companyId, role) => {
  await ensureOwnerSalesChatSchema();
  const connection = await pool.getConnection();
  try {
    const userFilter =
      role === 'company_admin'
        ? 'osc.owner_id = ?'
        : role === 'sales'
          ? 'osc.sales_id = ?'
          : '1 = 0';

    const [rows] = await connection.execute(
      `SELECT
         osc.id AS conversation_id,
         osc.owner_id,
         osc.sales_id,
         osc.last_message_at,
         osc.updated_at,
         ou.id AS owner_user_id,
         ou.name AS owner_name,
         su.id AS sales_user_id,
         su.name AS sales_name,
         lm.id AS last_message_id,
         lm.content AS last_message_content,
         lm.created_at AS last_message_created_at,
         lm.sender_id AS last_message_sender_id
       FROM owner_sales_conversations osc
       INNER JOIN users ou ON ou.id = osc.owner_id
       INNER JOIN users su ON su.id = osc.sales_id
       LEFT JOIN owner_sales_messages lm ON lm.id = (
         SELECT m2.id
         FROM owner_sales_messages m2
         WHERE m2.conversation_id = osc.id
         ORDER BY m2.id DESC
         LIMIT 1
       )
       WHERE osc.company_id = ? AND ${userFilter}
       ORDER BY COALESCE(osc.last_message_at, osc.updated_at) DESC`,
      [companyId, userId]
    );

    return rows;
  } finally {
    connection.release();
  }
};

const getMessagesByConversationId = async (conversationId, limit = 100) => {
  await ensureOwnerSalesChatSchema();
  const connection = await pool.getConnection();
  try {
    const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0
      ? Number(limit)
      : 100;

    const [rows] = await connection.query(
      `SELECT
         m.id,
         m.conversation_id,
         m.sender_id,
         m.message_type,
         m.content,
         m.created_at,
         u.name AS sender_name,
         u.role AS sender_role
       FROM owner_sales_messages m
       INNER JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = ?
       ORDER BY m.id DESC
       LIMIT ${safeLimit}`,
      [conversationId]
    );

    return rows.reverse();
  } finally {
    connection.release();
  }
};

const createMessage = async (conversationId, senderId, content, messageType = 'text') => {
  await ensureOwnerSalesChatSchema();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO owner_sales_messages (conversation_id, sender_id, message_type, content)
       VALUES (?, ?, ?, ?)`,
      [conversationId, senderId, messageType, content]
    );

    await connection.execute(
      `UPDATE owner_sales_conversations
       SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [conversationId]
    );

    const [rows] = await connection.execute(
      `SELECT
         m.id,
         m.conversation_id,
         m.sender_id,
         m.message_type,
         m.content,
         m.created_at,
         u.name AS sender_name,
         u.role AS sender_role
       FROM owner_sales_messages m
       INNER JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [result.insertId]
    );

    await connection.commit();
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getUserById,
  getAvailableContacts,
  canCommunicate,
  createOrGetConversation,
  getConversationListForUser,
  getMessagesByConversationId,
  createMessage
};