// Sales Routes
// GET /sales/products
// POST /sales/orders
// GET /sales/orders
// GET /sales/commissions

const express = require('express');
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');

const router = express.Router();

// Get products for sales person
router.get(
  '/products',
  authMiddleware,
  roleMiddleware('sales'),
  verificationMiddleware,
  salesController.getSalesProducts
);

// Create order (sale)
router.post(
  '/orders',
  authMiddleware,
  roleMiddleware('sales'),
  verificationMiddleware,
  salesController.createOrder
);

// Get my orders
router.get(
  '/orders',
  authMiddleware,
  roleMiddleware('sales'),
  verificationMiddleware,
  salesController.getMyOrders
);

// Get my commissions
router.get(
  '/commissions',
  authMiddleware,
  roleMiddleware('sales'),
  verificationMiddleware,
  salesController.getMyCommissions
);

module.exports = router;
