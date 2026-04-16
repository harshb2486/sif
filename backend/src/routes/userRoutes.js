// User Routes
// GET /users/profile - Get user profile
// PUT /users/profile - Update user profile  
// GET /users/company/members - Get all company members

const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Get company members (admin only)
router.get('/company/members', roleMiddleware('company_admin'), userController.getCompanyMembers);

module.exports = router;
