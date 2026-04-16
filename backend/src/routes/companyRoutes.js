// Company Routes
// GET /companies/sales-persons
// PUT /companies/sales/:id/approve
// GET /companies/:id

const express = require('express');
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Get sales persons (admin only)
router.get(
  '/sales-persons',
  authMiddleware,
  roleMiddleware('company_admin', 'platform_admin'),
  companyController.getSalesPersons
);

// Approve sales person (admin only)
router.put(
  '/sales/:id/approve',
  authMiddleware,
  roleMiddleware('company_admin', 'platform_admin'),
  companyController.approveSalesPerson
);

// Get company details
router.get(
  '/:id',
  authMiddleware,
  companyController.getCompanyDetails
);

module.exports = router;
