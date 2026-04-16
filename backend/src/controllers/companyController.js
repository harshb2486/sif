// Company Controller
// Handles company-related operations

const User = require('../models/User');
const Company = require('../models/Company');
const emailService = require('../services/emailService');

/**
 * Get all sales persons (pending verification)
 * GET /companies/sales-persons?status=pending
 */
const getSalesPersons = async (req, res) => {
  try {
    const { status } = req.query;
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Invalid company ID'
      });
    }

    let users;

    if (status === 'pending') {
      users = await User.getPendingSalesPersons(companyId);
    } else {
      users = await User.getVerifiedSalesPersons(companyId);
    }

    return res.status(200).json({
      success: true,
      message: 'Sales persons retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Get Sales Persons Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Approve a sales person
 * PUT /companies/sales/:id/approve
 */
const approveSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Invalid company ID'
      });
    }

    // Verify the sales person belongs to the company
    const user = await User.findUserById(id);
    if (!user || user.company_id !== companyId) {
      return res.status(404).json({
        success: false,
        message: 'Sales person not found'
      });
    }

    // Verify it's a sales person
    if (user.role !== 'sales') {
      return res.status(400).json({
        success: false,
        message: 'User is not a sales person'
      });
    }

    // Approve sales person
    await User.verifySalesPerson(id, companyId);

    // Send approval email
    await emailService.sendApprovalNotification(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: 'Sales person approved successfully',
      data: {
        userId: id,
        approved: true
      }
    });
  } catch (error) {
    console.error('Approve Sales Person Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Get company details
 * GET /companies/:id
 */
const getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Verify access
    if (parseInt(id) !== companyId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const company = await Company.findCompanyById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company details retrieved successfully',
      data: company
    });
  } catch (error) {
    console.error('Get Company Details Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  getSalesPersons,
  approveSalesPerson,
  getCompanyDetails
};
