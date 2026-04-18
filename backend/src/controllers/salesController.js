// Sales Controller
// Handles sales operations: orders and sales tracking

const Order = require('../models/Order');
const Commission = require('../models/Commission');
const Product = require('../models/Product');
const { calculateCommission } = require('../utils/helpers');

/**
 * Get products available for sales person
 * GET /sales/products
 */
const getSalesProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (error) {
    console.error('Get Sales Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Create a new order (sale)
 * POST /sales/orders
 */
const createOrder = async (req, res) => {
  try {
    const { productId, clientName, amount } = req.body;
    const salesPersonId = req.user.id;

    // Validation
    if (!productId || !clientName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Product, client name, and amount are required'
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Check if product exists globally
    const product = await Product.findProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const companyId = product.company_id;

    // Create order
    const orderId = await Order.createOrder(
      productId,
      salesPersonId,
      clientName,
      parseFloat(amount),
      companyId
    );

    // Calculate commission
    const commissionAmount = calculateCommission(
      product.commission_type,
      product.commission_value,
      product.price
    );

    // Create commission record
    await Commission.createCommission(orderId, salesPersonId, commissionAmount, companyId);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId,
        productId,
        clientName,
        amount: parseFloat(amount),
        commission: commissionAmount
      }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Get orders for sales person
 * GET /sales/orders
 */
const getMyOrders = async (req, res) => {
  try {
    const salesPersonId = req.user.id;

    const orders = await Order.getOrdersBySalesPerson(salesPersonId);

    return res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Get my commissions
 * GET /sales/commissions
 */
const getMyCommissions = async (req, res) => {
  try {
    const salesPersonId = req.user.id;

    const commissions = await Commission.getCommissionsBySalesPerson(salesPersonId);
    const total = await Commission.getTotalCommissionBySalesPerson(salesPersonId);

    return res.status(200).json({
      success: true,
      message: 'Commissions retrieved successfully',
      data: {
        commissions,
        total: parseFloat(total)
      }
    });
  } catch (error) {
    console.error('Get My Commissions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  getSalesProducts,
  createOrder,
  getMyOrders,
  getMyCommissions
};
