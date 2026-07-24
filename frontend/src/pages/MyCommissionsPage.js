// My Commissions Page

import React, { useEffect, useState } from 'react';
import { salesAPI } from '../services/api';
import {
  RiCoinsLine,
  RiAlertLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';
import './Pages.css';

export const MyCommissionsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const response = await salesAPI.getMyCommissions();
        setData(response.data.data);
      } catch (err) {
        setError('Failed to load commissions');
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <RiCoinsLine />
          My Commissions
        </h1>
        <p className="page-subtitle">Track your earnings and commission breakdown</p>
      </div>

      {error && <div className="alert alert-error"><RiAlertLine /> {error}</div>}

      {loading ? (
        <div className="loading-block">Loading commissions...</div>
      ) : (
        <div className="commission-content">
          {data && (
            <>
              <div className="commission-summary">
                <div className="summary-large">
                  <div className="summary-large-icon">
                    <RiMoneyDollarCircleLine />
                  </div>
                  <div>
                    <h2>Total Earned</h2>
                    <p className="amount">${parseFloat(data.total).toFixed(2)}</p>
                    <span>Across {data.commissions?.length || 0} orders</span>
                  </div>
                </div>
              </div>

              <div className="table-container">
                {data.commissions.length === 0 ? (
                  <div className="empty-state">
                    <RiCoinsLine />
                    <h4>No commissions yet</h4>
                    <p>Start creating sales to earn commissions.</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Product</th>
                        <th>Commission Amount</th>
                        <th>Date Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.commissions.map(commission => (
                        <tr key={commission.id}>
                          <td>{commission.client_name}</td>
                          <td>{commission.product_name}</td>
                          <td className="amount-cell">${parseFloat(commission.amount).toFixed(2)}</td>
                          <td>{new Date(commission.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
