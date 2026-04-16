// Express Server
// Main application entry point

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const exportRoutes = require('./routes/exportRoutes');

// Initialize express app
const app = express();

// Security Middleware
app.use(helmet()); // Add security headers

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts to 5 per 15 minutes
  message: 'Too many login attempts, please try again later',
  skip: (req) => req.method !== 'POST'
});

app.use(generalLimiter); // Apply general limiter to all routes

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/companies', companyRoutes);
app.use('/products', productRoutes);
app.use('/sales', salesRoutes);
app.use('/reports', reportRoutes);
app.use('/users', userRoutes);
app.use('/exports', exportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error: ' + err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║ Field Sales Management API Server      ║`);
  console.log(`║ Running on: http://localhost:${PORT}      ║`);
  console.log(`║ Environment: ${process.env.NODE_ENV.toUpperCase().padEnd(22)}║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

module.exports = app;
