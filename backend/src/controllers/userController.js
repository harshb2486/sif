// User Controller
// Handles user profile and account management

const User = require('../models/User');
const Company = require('../models/Company');
const validator = require('validator');

/**
 * Get user profile
 * GET /users/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.getUserProfile(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get company info
    const company = await Company.findCompanyById(user.company_id);

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at
        },
        company: company ? {
          id: company.id,
          name: company.name,
          email: company.email
        } : null
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Update user profile
 * PUT /users/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (phone && !validator.isMobilePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number'
      });
    }

    // Update profile
    await User.updateProfile(userId, name, phone);

    const updatedUser = await User.getUserProfile(userId);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          is_verified: updatedUser.is_verified
        }
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Get all users in company (admin only)
 * GET /users/company/members
 */
const getCompanyMembers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { role, page = 1, limit = 10, search = '' } = req.query;

    const offset = (page - 1) * limit;
    
    let users = await User.getUsersByCompany(companyId, role);

    // Filter by search
    if (search) {
      users = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginate
    const total = users.length;
    const paginatedUsers = users.slice(offset, offset + limit);

    return res.status(200).json({
      success: true,
      message: 'Company members retrieved successfully',
      data: {
        users: paginatedUsers,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Company Members Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getCompanyMembers
};
