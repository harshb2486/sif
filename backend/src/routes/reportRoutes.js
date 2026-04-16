// Report Routes
// GET /reports/commission
// GET /reports/sales
// GET /reports/leaderboard
// GET /reports/dashboard

const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Get commission report
router.get(
  '/commission',
  authMiddleware,
  roleMiddleware('company_admin', 'platform_admin'),
  reportController.getCommissionReport
);

// Get sales report
router.get(
  '/sales',
  authMiddleware,
  roleMiddleware('company_admin', 'platform_admin'),
  reportController.getSalesReport
);

// Get leaderboard
router.get(
  '/leaderboard',
  authMiddleware,
  roleMiddleware('company_admin', 'platform_admin'),
  reportController.getLeaderboard
);

// Get dashboard stats
router.get(
  '/dashboard',
  authMiddleware,
  reportController.getDashboardStats
);

module.exports = router;
