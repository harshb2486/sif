// Database Configuration
// This module handles the MySQL connection pool for the application

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✓ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    // In development, allow server to start for setup purposes
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠ Development mode: Server will start, but database operations will fail');
      console.warn('⚠ Please ensure MySQL is running and database is initialized');
      console.warn('⚠ Run: mysql -u root -p < database.sql');
    }
  });

module.exports = pool;
