// Dashboard Page

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import { Header, Sidebar } from '../components';
import './Dashboard.css';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reportsAPI.getDashboardStats();
        setStats(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Header />
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-container">
          <h1>Welcome, {user?.name}! 👋</h1>
          <p className="role-badge">Role: {user?.role}</p>

          {error && <div className="alert alert-error">{error}</div>}

          {stats && (
            <div className="stats-grid">
              {user?.role === 'company_admin' && (
                <>
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <h3>Total Sales</h3>
                      <p className="stat-value">${stats.totalSales?.toFixed(2) || '0'}</p>
                      <small>{stats.totalOrders || 0} orders</small>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <h3>Commissions Issued</h3>
                      <p className="stat-value">${stats.totalCommissionsIssued?.toFixed(2) || '0'}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <h3>Verified Sales Team</h3>
                      <p className="stat-value">{stats.verifiedSalesPersons || 0}</p>
                    </div>
                  </div>
                </>
              )}

              {user?.role === 'sales' && (
                <>
                  <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                      <h3>My Sales</h3>
                      <p className="stat-value">${stats.mySales?.toFixed(2) || '0'}</p>
                      <small>{stats.myOrders || 0} orders</small>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💵</div>
                    <div className="stat-content">
                      <h3>My Commissions</h3>
                      <p className="stat-value">${stats.myCommissions?.toFixed(2) || '0'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="info-box">
            <h3>ℹ️ Quick Info</h3>
            {user?.role === 'sales' && !user?.is_verified && (
              <p>Your account is pending admin approval. You'll be able to create sales once approved.</p>
            )}
            {user?.role === 'sales' && user?.is_verified && (
              <p>You're verified! Start creating sales and earn commissions.</p>
            )}
            {user?.role === 'company_admin' && (
              <p>Manage your sales team, products, and track performance from the sidebar.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};
