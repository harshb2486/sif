// My Orders Page

import React, { useEffect, useState } from 'react';
import { salesAPI } from '../services/api';
import {
  RiFileListLine,
  RiAlertLine,
  RiShoppingBagLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';
import './Pages.css';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await salesAPI.getMyOrders();
        setOrders(response.data.data);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalAmount = orders.reduce((sum, o) => sum + parseFloat(o.amount), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <RiFileListLine />
          My Orders
        </h1>
        <p className="page-subtitle">Track your sales history and performance</p>
      </div>

      {error && <div className="alert alert-error"><RiAlertLine /> {error}</div>}

      {loading ? (
        <div className="loading-block">Loading orders...</div>
      ) : (
        <>
          <div className="summary-stats">
            <div className="summary-card">
              <div className="summary-card-icon primary">
                <RiShoppingBagLine />
              </div>
              <div>
                <h4>Total Orders</h4>
                <p className="value">{orders.length}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon success">
                <RiMoneyDollarCircleLine />
              </div>
              <div>
                <h4>Total Amount</h4>
                <p className="value">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="table-container">
            {orders.length === 0 ? (
              <div className="empty-state">
                <RiFileListLine />
                <h4>No orders yet</h4>
                <p>You haven't created any orders yet. Start by creating a sale.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.client_name}</td>
                      <td>{order.product_name}</td>
                      <td>${parseFloat(order.amount).toFixed(2)}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};
