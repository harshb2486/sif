-- Chat Message and Session Tables Migration
-- Run this after the main database setup

-- Create Chat Messages table for sales assistant chatbot
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_id INT NOT NULL,
  conversation_id VARCHAR(50) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content LONGTEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  context_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_conversation (company_id, conversation_id),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_company_created (company_id, created_at)
);

-- Create Chat Sessions table for conversation metadata
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_id INT NOT NULL,
  conversation_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255),
  total_messages INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_user_company (user_id, company_id),
  INDEX idx_company_created (company_id, created_at)
);

-- Owner-Sales Conversations (Realtime Chat)
CREATE TABLE IF NOT EXISTS owner_sales_conversations (
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
);

-- Owner-Sales Messages (Realtime Chat)
CREATE TABLE IF NOT EXISTS owner_sales_messages (
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
);
