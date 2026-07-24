// Reports Page

import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import {
  RiBarChartBoxLine,
  RiCoinsLine,
  RiTrophyLine,
  RiAlertLine,
  RiFileListLine
} from 'react-icons/ri';
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

  const tabs = [
    { key: 'sales', label: 'Sales Report', icon: RiBarChartBoxLine },
    { key: 'commission', label: 'Commission Report', icon: RiCoinsLine },
    { key: 'leaderboard', label: 'Leaderboard', icon: RiTrophyLine }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <RiBarChartBoxLine />
          Reports
        </h1>
        <p className="page-subtitle">Analyze sales performance and commission data</p>
      </div>

      {error && <div className="alert alert-error"><RiAlertLine /> {error}</div>}

      <div className="tab-group">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <Icon />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="loading-block">Loading report...</div>
      ) : (
        <div className="report-content">
          {tab === 'leaderboard' ? (
            <div>
              <div className="page-header">
                <h2 className="page-title">
                  <RiTrophyLine />
                  Top Sales Persons
                </h2>
              </div>
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
                <div className="empty-state">
                  <RiTrophyLine />
                  <h4>No leaderboard data</h4>
                  <p>Leaderboard will populate as sales are recorded.</p>
                </div>
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

              {(!data?.details || data.details.length === 0) && (
                <div className="empty-state">
                  <RiFileListLine />
                  <h4>No records found</h4>
                  <p>There are no {tab} records for the selected period.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
