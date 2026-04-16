// Auth Routes
// POST /auth/register/company
// POST /auth/register/sales
// POST /auth/login
// POST /auth/forgot-password
// POST /auth/reset-password/:token
// PUT /auth/change-password

const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register company and admin
router.post('/register/company', authController.registerCompany);

// Register sales person
router.post('/register/sales', authController.registerSalesPerson);

// Login
router.post('/login', authController.login);

// Forgot password - send reset link
router.post('/forgot-password', authController.forgotPassword);

// Reset password with token
router.post('/reset-password/:token', authController.resetPassword);

// Change password (requires auth)
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
