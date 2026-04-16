// My Commissions Page

import React, { useEffect, useState } from 'react';
import { Header, Sidebar } from '../components';
import { salesAPI } from '../services/api';
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
    <>
      <Header />
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <h1>💰 My Commissions</h1>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading">Loading commissions...</div>
          ) : (
            <div className="commission-content">
              {data && (
                <>
                  <div className="commission-summary">
                    <div className="summary-large">
                      <h2>Total Earned</h2>
                      <p className="amount">${parseFloat(data.total).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="table-container">
                    {data.commissions.length === 0 ? (
                      <p className="no-data">No commissions earned yet.</p>
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
                              <td className="amount">${parseFloat(commission.amount).toFixed(2)}</td>
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
      </main>
    </>
  );
};
