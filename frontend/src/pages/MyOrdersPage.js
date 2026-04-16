// My Orders Page

import React, { useEffect, useState } from 'react';
import { Header, Sidebar } from '../components';
import { salesAPI } from '../services/api';
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

  return (
    <>
      <Header />
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <h1>📋 My Orders</h1>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <div className="table-container">
              {orders.length === 0 ? (
                <p className="no-data">You haven't created any orders yet.</p>
              ) : (
                <>
                  <div className="summary-stats">
                    <div className="summary-card">
                      <h4>Total Orders</h4>
                      <p className="value">{orders.length}</p>
                    </div>
                    <div className="summary-card">
                      <h4>Total Amount</h4>
                      <p className="value">
                        ${orders.reduce((sum, o) => sum + parseFloat(o.amount), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

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
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};
