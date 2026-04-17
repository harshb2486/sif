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
