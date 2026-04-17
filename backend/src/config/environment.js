// Environment Configuration
// Separate settings for development, staging, and production

const config = {
  development: {
    nodeEnv: 'development',
    port: process.env.PORT || 5000,
    database: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'field_sales_db',
      port: process.env.DB_PORT || 3306,
      connectionLimit: 5
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      expiresIn: '7d'
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    },
    logging: {
      level: 'debug',
      dir: 'logs'
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 1000,
      authMaxAttempts: 10
    },
    security: {
      enableCors: true,
      enableHelmet: true,
      enableXssProtection: true,
      csrfProtection: false // Disabled for development API
    }
  },

  staging: {
    nodeEnv: 'staging',
    port: process.env.PORT || 5000,
    database: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      connectionLimit: 10
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d'
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://staging.fieldsales.com',
      credentials: true
    },
    logging: {
      level: 'info',
      dir: 'logs'
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 500,
      authMaxAttempts: 5
    },
    security: {
      enableCors: true,
      enableHelmet: true,
      enableXssProtection: true,
      csrfProtection: true
    }
  },

  production: {
    nodeEnv: 'production',
    port: process.env.PORT || 5000,
    database: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      connectionLimit: 20,
      enableKeepAlive: true
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://fieldsales.com',
      credentials: true
    },
    logging: {
      level: 'warn',
      dir: '/var/log/field-sales'
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 200,
      authMaxAttempts: 3
    },
    security: {
      enableCors: true,
      enableHelmet: true,
      enableXssProtection: true,
      csrfProtection: true,
      forceHttps: true,
      trustProxy: true
    }
  }
};

const env = process.env.NODE_ENV || 'development';

if (!config[env]) {
  throw new Error(`Unknown environment: ${env}`);
}

module.exports = config[env];
