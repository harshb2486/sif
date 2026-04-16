// Export Controller
// Handles data export to CSV format

const Order = require('../models/Order');
const Commission = require('../models/Commission');
const { stringify } = require('csv-stringify/sync');

/**
 * Export orders as CSV
 * GET /exports/orders?format=csv
 */
const exportOrders = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;

    // Get orders
    let orders = await Order.getOrdersByCompany(companyId);

    // Filter by date if provided
    if (startDate) {
      orders = orders.filter(o => new Date(o.created_at) >= new Date(startDate));
    }
    if (endDate) {
      orders = orders.filter(o => new Date(o.created_at) <= new Date(endDate));
    }

    // Transform data for CSV
    const csvData = orders.map(order => ({
      'Order ID': order.id,
      'Sales Person': order.sales_person_name,
      'Client': order.client_name,
      'Product': order.product_name,
      'Amount': `$${order.amount.toFixed(2)}`,
      'Date': new Date(order.created_at).toLocaleDateString()
    }));

    // Generate CSV
    const csv = stringify(csvData, { header: true });

    // Send as file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Export commissions as CSV
 * GET /exports/commissions?format=csv
 */
const exportCommissions = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;

    // Get commissions
    let commissions = await Commission.getCommissionsByCompany(companyId);

    // Filter by date if provided
    if (startDate) {
      commissions = commissions.filter(c => new Date(c.created_at) >= new Date(startDate));
    }
    if (endDate) {
      commissions = commissions.filter(c => new Date(c.created_at) <= new Date(endDate));
    }

    // Transform data for CSV
    const csvData = commissions.map(commission => ({
      'Commission ID': commission.id,
      'Sales Person': commission.sales_person_name,
      'Amount': `$${commission.amount.toFixed(2)}`,
      'Order ID': commission.order_id,
      'Date': new Date(commission.created_at).toLocaleDateString()
    }));

    // Generate CSV
    const csv = stringify(csvData, { header: true });

    // Send as file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="commissions.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export Commissions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

/**
 * Export sales report as CSV
 * GET /exports/sales-report?format=csv
 */
const exportSalesReport = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    // Get orders
    const orders = await Order.getOrdersByCompany(companyId);

    // Calculate totals
    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.amount), 0);
    const totalOrders = orders.length;
    const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Group by sales person
    const salesByPerson = {};
    orders.forEach(order => {
      if (!salesByPerson[order.sales_person_id]) {
        salesByPerson[order.sales_person_id] = {
          name: order.sales_person_name,
          total: 0,
          count: 0
        };
      }
      salesByPerson[order.sales_person_id].total += parseFloat(order.amount);
      salesByPerson[order.sales_person_id].count += 1;
    });

    // Transform to CSV rows
    const reportData = [
      ['SALES REPORT'],
      ['Generated', new Date().toLocaleDateString()],
      [],
      ['SUMMARY STATISTICS'],
      ['Total Sales', `$${totalSales.toFixed(2)}`],
      ['Total Orders', totalOrders],
      ['Average Order Value', `$${averageOrder.toFixed(2)}`],
      [],
      ['SALES BY PERSON'],
      ['Sales Person', 'Total Sales', 'Number of Orders', 'Average Order'],
      ...Object.values(salesByPerson).map(person => [
        person.name,
        `$${person.total.toFixed(2)}`,
        person.count,
        `$${(person.total / person.count).toFixed(2)}`
      ])
    ];

    // Convert to CSV format
    const csv = reportData.map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    // Send as file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export Sales Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  exportOrders,
  exportCommissions,
  exportSalesReport
};
