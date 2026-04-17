// Validation Schemas using Joi
// Centralized request validation for all endpoints

const Joi = require('joi');

// ============ AUTH SCHEMAS ============

const registerCompanySchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.base': 'Company name must be text',
    'string.min': 'Company name must be at least 2 characters',
    'any.required': 'Company name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required'
  })
});

const registerSalesPersonSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  companyId: Joi.number().integer().positive().required().messages({
    'number.base': 'Company ID must be a number',
    'any.required': 'Company ID is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  token: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

// ============ PRODUCT SCHEMAS ============

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  price: Joi.number().positive().required().messages({
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be greater than 0'
  }),
  commission_type: Joi.string().valid('fixed', 'percentage').required(),
  commission_value: Joi.number().positive().required(),
  description: Joi.string().max(1000).optional()
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  price: Joi.number().positive().optional(),
  commission_type: Joi.string().valid('fixed', 'percentage').optional(),
  commission_value: Joi.number().positive().optional(),
  description: Joi.string().max(1000).optional()
});

// ============ ORDER SCHEMAS ============

const createOrderSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1'
  }),
  customer_email: Joi.string().email().optional(),
  notes: Joi.string().max(500).optional()
});

// ============ COMMISSION SCHEMAS ============

const createCommissionSchema = Joi.object({
  sales_person_id: Joi.number().integer().positive().required(),
  order_id: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required()
});

// ============ REPORT SCHEMAS ============

const dateRangeSchema = Joi.object({
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required().messages({
    'date.min': 'End date must be after start date'
  })
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
  // Auth
  registerCompanySchema,
  registerSalesPersonSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  // Products
  createProductSchema,
  updateProductSchema,
  // Orders
  createOrderSchema,
  // Commissions
  createCommissionSchema,
  // Reports
  dateRangeSchema,
  paginationSchema
};
