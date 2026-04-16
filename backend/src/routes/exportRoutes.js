// Export Routes
// GET /exports/orders - Export orders as CSV
// GET /exports/commissions - Export commissions as CSV
// GET /exports/sales-report - Export sales report as CSV

const express = require('express');
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All export routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('company_admin'));

// Export orders
router.get('/orders', exportController.exportOrders);

// Export commissions
router.get('/commissions', exportController.exportCommissions);

// Export sales report
router.get('/sales-report', exportController.exportSalesReport);

module.exports = router;
