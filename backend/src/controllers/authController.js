// Auth Controller
// Handles authentication logic: register, login

const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const User = require('../models/User');
const Company = require('../models/Company');
const emailService = require('../services/emailService');
const validator = require('validator');

/**
 * Register a new company and company admin
 * POST /auth/register/company
 */
const registerCompany = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, companyName, companyEmail } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword || !companyName || !companyEmail) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!validator.isEmail(email) || !validator.isEmail(companyEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findCompanyByEmail(companyEmail);
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: 'Company email already registered'
      });
    }

    // Check if user already exists
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create company
    const companyId = await Company.createCompany(companyName, companyEmail);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create company admin user
    const userId = await User.createUser(name, email, hashedPassword, 'company_admin', companyId);

    // Send welcome email
    await emailService.sendWelcomeEmail(email, companyName, name);

    // Generate token
    const token = generateToken(userId, companyId, 'company_admin');

    return res.status(201).json({
      success: true,
      message: 'Company and admin registered successfully',
      data: {
        token,
        user: {
          id: userId,
          name,
          email,
          role: 'company_admin',
          companyId
        }
      }
    });
  } catch (error) {
    console.error('Register Company Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Register a new sales person
 * POST /auth/register/sales
 */
const registerSalesPerson = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, companyId } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Global sales registration: company is optional.
    // If provided and valid, keep a preferred company link for reporting/reference.
    let linkedCompanyId = null;

    if (companyId !== undefined && companyId !== null && String(companyId).trim() !== '') {
      const trimmedCompanyId = String(companyId).trim();
      const parsedCompanyId = Number(trimmedCompanyId);

      if (Number.isInteger(parsedCompanyId) && parsedCompanyId > 0) {
        const company = await Company.findCompanyById(parsedCompanyId);
        if (company) {
          linkedCompanyId = parsedCompanyId;
        }
      }
    }

    // Check if user already exists
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create sales person user (not verified by default)
    const userId = await User.createUser(name, email, hashedPassword, 'sales', linkedCompanyId);

    return res.status(201).json({
      success: true,
      message: 'Sales person registered successfully. Waiting for platform admin approval.',
      data: {
        user: {
          id: userId,
          name,
          email,
          role: 'sales',
          companyId: linkedCompanyId,
          is_verified: false
        }
      }
    });
  } catch (error) {
    console.error('Register Sales Person Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Login user
 * POST /auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.company_id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.company_id,
          is_verified: user.is_verified
        }
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Request password reset
 * POST /auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not (security)
      return res.status(200).json({
        success: true,
        message: 'If an account exists for this email, you will receive a password reset link'
      });
    }

    // Generate reset token (valid for 1 hour)
    const { v4: uuidv4 } = require('uuid');
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await User.setPasswordResetToken(user.id, resetToken, resetTokenExpiry);

    // Send reset email
    await emailService.sendPasswordResetEmail(email, resetToken, user.name);

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Reset password with token
 * POST /auth/reset-password/:token
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validation
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirmation password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find user by reset token
    const user = await User.findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await User.updatePassword(user.id, hashedPassword);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Change password (logged in users)
 * PUT /auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get user
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await User.updatePassword(userId, hashedPassword);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  registerCompany,
  registerSalesPerson,
  login,
  forgotPassword,
  resetPassword,
  changePassword
};
