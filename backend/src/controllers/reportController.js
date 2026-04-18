// Report Controller
// Handles reporting and analytics

const Order = require('../models/Order');
const Commission = require('../models/Commission');
const User = require('../models/User');

/**
 * Get commission report for company
 * GET /reports/commission
 */
const getCommissionReport = async (req, res) => {
  try {
    const commissions = req.user.role === 'platform_admin'
      ? await Commission.getAllCommissions()
      : await Commission.getCommissionsByCompany(req.user.companyId);

    // Calculate summary
    const summary = {
      totalCommissions: commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0),
      totalRecords: commissions.length,
      averageCommission: commissions.length > 0 
        ? commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0) / commissions.length 
        : 0
    };

    return res.status(200).json({
      success: true,
      message: 'Commission report retrieved successfully',
      data: {
        summary,
        details: commissions
      }
    });
  } catch (error) {
    console.error('Get Commission Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Get sales report for company
 * GET /reports/sales
 */
const getSalesReport = async (req, res) => {
  try {
    const orders = req.user.role === 'platform_admin'
      ? await Order.getAllOrders()
      : await Order.getOrdersByCompany(req.user.companyId);

    // Calculate summary
    const summary = {
      totalSales: orders.reduce((sum, o) => sum + parseFloat(o.amount), 0),
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, o) => sum + parseFloat(o.amount), 0) / orders.length 
        : 0
    };

    return res.status(200).json({
      success: true,
      message: 'Sales report retrieved successfully',
      data: {
        summary,
        details: orders
      }
    });
  } catch (error) {
    console.error('Get Sales Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Get leaderboard for sales persons
 * GET /reports/leaderboard
 */
const getLeaderboard = async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const leaderboard = req.user.role === 'platform_admin'
      ? await Commission.getLeaderboard(null, parseInt(limit))
      : await Commission.getLeaderboard(req.user.companyId, parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: leaderboard
    });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Get dashboard statistics
 * GET /reports/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.user.companyId || null;
    const userId = req.user.id;
    const isPlatformAdmin = req.user.role === 'platform_admin';

    // Get all orders
    const allOrders = isPlatformAdmin
      ? await Order.getAllOrders()
      : await Order.getOrdersByCompany(companyId);
    
    // Get my orders if sales person
    let myOrders = [];
    if (req.user.role === 'sales') {
      myOrders = await Order.getOrdersBySalesPerson(userId);
    }

    // Get commissions
    const commissions = isPlatformAdmin
      ? await Commission.getAllCommissions()
      : await Commission.getCommissionsByCompany(companyId);
    
    // Get my commissions if sales person
    let myCommissions = [];
    if (req.user.role === 'sales') {
      myCommissions = await Commission.getCommissionsBySalesPerson(userId);
    }

    // Get verified sales persons count
    const salesPersons = isPlatformAdmin
      ? await User.getVerifiedSalesPersons()
      : await User.getVerifiedSalesPersons(companyId);

    const pendingSalesPersons = isPlatformAdmin
      ? await User.getPendingSalesPersons()
      : await User.getPendingSalesPersons(companyId);

    const stats = {
      totalSales: allOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0),
      totalOrders: allOrders.length,
      totalCommissionsIssued: commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0),
      verifiedSalesPersons: salesPersons.length,
      pendingSalesApprovals: pendingSalesPersons.length
    };

    // Add personal stats if sales person
    if (req.user.role === 'sales') {
      stats.mySales = myOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0);
      stats.myOrders = myOrders.length;
      stats.myCommissions = myCommissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    }

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  getCommissionReport,
  getSalesReport,
  getLeaderboard,
  getDashboardStats
};
