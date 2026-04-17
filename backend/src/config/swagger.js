// Swagger/OpenAPI Configuration
// Auto-generate API documentation

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Field Sales Management System API',
      version: '1.0.0',
      description: 'Complete API documentation for the Field Sales Management System',
      contact: {
        name: 'Support Team',
        email: 'support@fieldsales.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      },
      {
        url: 'https://api.fieldsales.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            details: { type: 'array' },
            timestamp: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['platform_admin', 'company_admin', 'sales', 'client'] },
            company_id: { type: 'integer' },
            is_verified: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            price: { type: 'number' },
            commission_type: { type: 'string', enum: ['fixed', 'percentage'] },
            commission_value: { type: 'number' },
            company_id: { type: 'integer' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            sales_person_id: { type: 'integer' },
            product_id: { type: 'integer' },
            quantity: { type: 'integer' },
            total_amount: { type: 'number' },
            status: { type: 'string' }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/authRoutes.js',
    './src/routes/companyRoutes.js',
    './src/routes/productRoutes.js',
    './src/routes/salesRoutes.js',
    './src/routes/reportRoutes.js',
    './src/routes/userRoutes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
