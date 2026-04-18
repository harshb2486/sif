// Product Controller
// Handles product management operations

const Product = require('../models/Product');
const validator = require('validator');

/**
 * Create a new product
 * POST /products
 */
const createProduct = async (req, res) => {
  try {
    const { name, price, commissionType, commissionValue } = req.body;
    const companyId = req.user.companyId;

    // Validation
    if (!name || !price || !commissionType || commissionValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!['fixed', 'percentage'].includes(commissionType)) {
      return res.status(400).json({
        success: false,
        message: 'Commission type must be "fixed" or "percentage"'
      });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    if (isNaN(commissionValue) || commissionValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Commission value must be a non-negative number'
      });
    }

    // Create product
    const productId = await Product.createProduct(
      name,
      parseFloat(price),
      commissionType,
      parseFloat(commissionValue),
      companyId
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: productId,
        name,
        price: parseFloat(price),
        commissionType,
        commissionValue: parseFloat(commissionValue)
      }
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Get all products for company
 * GET /products
 */
const getProducts = async (req, res) => {
  try {
    const products = req.user.role === 'sales'
      ? await Product.getAllProducts()
      : await Product.getProductsByCompany(req.user.companyId);

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Get single product
 * GET /products/:id
 */
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = req.user.role === 'sales'
      ? await Product.findProductById(id)
      : await Product.findProductById(id, req.user.companyId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Get Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Update product
 * PUT /products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, commissionType, commissionValue } = req.body;
    const companyId = req.user.companyId;

    // Validation
    if (!name || !price || !commissionType || commissionValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if product exists
    const product = await Product.findProductById(id, companyId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product
    const updated = await Product.updateProduct(
      id,
      companyId,
      name,
      parseFloat(price),
      commissionType,
      parseFloat(commissionValue)
    );

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: {
        id,
        name,
        price: parseFloat(price),
        commissionType,
        commissionValue: parseFloat(commissionValue)
      }
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Delete product
 * DELETE /products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Check if product exists
    const product = await Product.findProductById(id, companyId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product
    const deleted = await Product.deleteProduct(id, companyId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
};
