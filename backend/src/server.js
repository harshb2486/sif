// Express Server
// Main application entry point

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const xss = require('xss-clean');
require('dotenv').config();

// Import utilities
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpec = require('./config/swagger');
const { authLimiter, readLimiter, writeLimiter, exportLimiter } = require('./config/rateLimits');

// Import routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const exportRoutes = require('./routes/exportRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Initialize express app
const app = express();

// Security Middleware
app.use(helmet()); // Add security headers

// Rate limiting - apply specific limiters to route groups
// Auth routes get stricter limits, read-only get looser limits

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(xss()); // Prevent XSS attacks

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Field Sales API Documentation'
}));

// Routes with specific rate limiting
app.use('/auth', authLimiter, authRoutes);
app.use('/companies', writeLimiter, companyRoutes);
app.use('/products', writeLimiter, productRoutes);
app.use('/sales', writeLimiter, salesRoutes);
app.use('/reports', readLimiter, reportRoutes);
app.use('/users', readLimiter, userRoutes);
app.use('/exports', exportLimiter, exportRoutes);
app.use('/chat', readLimiter, chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║ Field Sales Management API Server      ║`);
  console.log(`║ Running on: http://localhost:${PORT}      ║`);
  console.log(`║ Environment: ${process.env.NODE_ENV.toUpperCase().padEnd(22)}║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

module.exports = app;

