// Product Routes
// POST /products
// GET /products
// GET /products/:id
// PUT /products/:id
// DELETE /products/:id

const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Create product (admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('company_admin', 'platform_admin'),
  productController.createProduct
);

// Get all products
router.get(
  '/',
  authMiddleware,
  productController.getProducts
);

// Get single product
router.get(
  '/:id',
  authMiddleware,
  productController.getProduct
);

// Update product (admin only)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('company_admin', 'platform_admin'),
  productController.updateProduct
);

// Delete product (admin only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('company_admin', 'platform_admin'),
  productController.deleteProduct
);

module.exports = router;
