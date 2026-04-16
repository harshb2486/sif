-- Field Sales Management System - Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS field_sales_db;
USE field_sales_db;

-- Create Companies table
CREATE TABLE companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Create Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('platform_admin', 'company_admin', 'sales', 'client') NOT NULL DEFAULT 'sales',
  company_id INT,
  is_verified BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(500),
  reset_token_expiry DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company (company_id),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_reset_token (reset_token)
);

-- Create Products table
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  commission_type ENUM('fixed', 'percentage') NOT NULL,
  commission_value DECIMAL(10, 2) NOT NULL,
  company_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company (company_id)
);

-- Create Orders table
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  sales_person_id INT NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  company_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (sales_person_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company (company_id),
  INDEX idx_sales_person (sales_person_id),
  INDEX idx_product (product_id),
  INDEX idx_created (created_at)
);

-- Create Commissions table
CREATE TABLE commissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  sales_person_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  company_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (sales_person_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_sales_person (sales_person_id),
  INDEX idx_company (company_id),
  INDEX idx_created (created_at)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_company_role ON users(company_id, role);
CREATE INDEX idx_orders_company_created ON orders(company_id, created_at);
CREATE INDEX idx_commissions_company_created ON commissions(company_id, created_at);

-- Create Audit Logs table for tracking all changes
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id INT,
  old_value JSON,
  new_value JSON,
  company_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_created (company_id, created_at),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_table_action (table_name, action)
);
