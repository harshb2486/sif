// Reports Page

import React, { useEffect, useState } from 'react';
import { Header, Sidebar } from '../components';
import { reportsAPI } from '../services/api';
import './Pages.css';

export const ReportsPage = () => {
  const [tab, setTab] = useState('sales');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (type) => {
    try {
      setLoading(true);
      let response;
      if (type === 'sales') {
        response = await reportsAPI.getSalesReport();
      } else if (type === 'commission') {
        response = await reportsAPI.getCommissionReport();
      } else if (type === 'leaderboard') {
        response = await reportsAPI.getLeaderboard();
      }
      setData(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tab);
  }, [tab]);

  return (
    <>
      <Header />
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <h1>📈 Reports</h1>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="tab-group">
            <button
              className={`tab-btn ${tab === 'sales' ? 'active' : ''}`}
              onClick={() => setTab('sales')}
            >
              Sales Report
            </button>
            <button
              className={`tab-btn ${tab === 'commission' ? 'active' : ''}`}
              onClick={() => setTab('commission')}
            >
              Commission Report
            </button>
            <button
              className={`tab-btn ${tab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setTab('leaderboard')}
            >
              Leaderboard
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading report...</div>
          ) : (
            <div className="report-content">
              {tab === 'leaderboard' ? (
                <div>
                  <h2>Top Sales Persons 🏆</h2>
                  {data && data.length > 0 ? (
                    <div className="leaderboard">
                      {data.map((person, index) => (
                        <div key={person.id} className="leaderboard-item">
                          <div className="rank">#{index + 1}</div>
                          <div className="person-info">
                            <h3>{person.name}</h3>
                            <p>{person.total_commissions} commissions</p>
                          </div>
                          <div className="amount">${parseFloat(person.total_amount).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No leaderboard data</p>
                  )}
                </div>
              ) : (
                <div>
                  {data?.summary && (
                    <div className="stats-grid">
                      {tab === 'sales' ? (
                        <>
                          <div className="report-stat">
                            <h3>Total Sales</h3>
                            <p className="value">${parseFloat(data.summary.totalSales).toFixed(2)}</p>
                          </div>
                          <div className="report-stat">
                            <h3>Total Orders</h3>
                            <p className="value">{data.summary.totalOrders}</p>
                          </div>
                          <div className="report-stat">
                            <h3>Average Order Value</h3>
                            <p className="value">${parseFloat(data.summary.averageOrderValue).toFixed(2)}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="report-stat">
                            <h3>Total Commissions</h3>
                            <p className="value">${parseFloat(data.summary.totalCommissions).toFixed(2)}</p>
                          </div>
                          <div className="report-stat">
                            <h3>Total Records</h3>
                            <p className="value">{data.summary.totalRecords}</p>
                          </div>
                          <div className="report-stat">
                            <h3>Average Commission</h3>
                            <p className="value">${parseFloat(data.summary.averageCommission).toFixed(2)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {data?.details && data.details.length > 0 && (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            {tab === 'sales' ? (
                              <>
                                <th>Product</th>
                                <th>Sales Person</th>
                                <th>Client</th>
                                <th>Amount</th>
                                <th>Date</th>
                              </>
                            ) : (
                              <>
                                <th>Sales Person</th>
                                <th>Product</th>
                                <th>Client</th>
                                <th>Amount</th>
                                <th>Date</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {data.details.map((item) => (
                            <tr key={item.id}>
                              {tab === 'sales' ? (
                                <>
                                  <td>{item.product_name}</td>
                                  <td>{item.sales_person_name}</td>
                                  <td>{item.client_name}</td>
                                  <td>${parseFloat(item.amount).toFixed(2)}</td>
                                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                </>
                              ) : (
                                <>
                                  <td>{item.sales_person_name}</td>
                                  <td>{item.product_name}</td>
                                  <td>{item.client_name}</td>
                                  <td>${parseFloat(item.amount).toFixed(2)}</td>
                                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};
