// Dashboard Page - Modern SaaS Dashboard
// Role-based dashboard with stats, pending approvals, and quick info

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { companiesAPI, reportsAPI } from '../services/api';
import { Header, Sidebar } from '../components';
import { Link } from 'react-router-dom';
import notify from '../utils/notify';
import './Dashboard.css';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsResponse, pendingResponse] = await Promise.all([
          reportsAPI.getDashboardStats(),
          user?.role === 'platform_admin'
            ? companiesAPI.getSalesPersons('pending', '', 1, 5)
            : Promise.resolve({ data: { data: [] } })
        ]);

        setStats(statsResponse.data.data);
        setPendingApprovals(pendingResponse?.data?.data || []);
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.role]);

  const handleApproveFromDashboard = async (person) => {
    const confirmed = window.confirm(`Approve ${person.name} (${person.email})?`);
    if (!confirmed) return;

    try {
      setApprovingId(person.id);
      const response = await companiesAPI.approveSalesPerson(person.id);
      const emailSent = response?.data?.data?.emailSent;

      notify.success(emailSent ? 'Approved and email sent' : 'Approved (email not sent)');

      const [statsResponse, pendingResponse] = await Promise.all([
        reportsAPI.getDashboardStats(),
        companiesAPI.getSalesPersons('pending', '', 1, 5)
      ]);
      setStats(statsResponse.data.data);
      setPendingApprovals(pendingResponse?.data?.data || []);
    } catch (err) {
      console.error('Approve from dashboard failed', err);
      notify.error('Failed to approve user');
    } finally {
      setApprovingId(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <Sidebar />
        <main className="main-content">
          <div className="content-area">
            <div className="dashboard-loading">
              <div className="spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content-area">
          <div className="dashboard-container">
            {/* Welcome Section */}
            <div className="dashboard-welcome">
              <h1>
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p>Here's what's happening in your workspace today.</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="dashboard-alert error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Stats Grid */}
            {stats && (
              <div className="dashboard-stats">
                {/* Company Admin Stats */}
                {user?.role === 'company_admin' && (
                  <>
                    <div className="dashboard-stat-card">
                      <div className="stat-card-icon primary">📊</div>
                      <div className="stat-card-content">
                        <p className="stat-card-label">Total Sales</p>
                        <h3 className="stat-card-value">{formatCurrency(stats.totalSales)}</h3>
                        <p className="stat-card-meta">
                          {stats.totalOrders || 0} orders this period
                        </p>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="stat-card-icon success">💰</div>
                      <div className="stat-card-content">
                        <p className="stat-card-label">Commissions Issued</p>
                        <h3 className="stat-card-value">{formatCurrency(stats.totalCommissionsIssued)}</h3>
                        <p className="stat-card-meta">
                          Across all sales team
                        </p>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="stat-card-icon info">👥</div>
                      <div className="stat-card-content">
                        <p className="stat-card-label">Verified Sales Team</p>
                        <h3 className="stat-card-value">{stats.verifiedSalesPersons || 0}</h3>
                        <p className="stat-card-meta">
                          Active sales executives
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Platform Admin Stats */}
                {user?.role === 'platform_admin' && (
                  <>
                    <div className="dashboard-stat-card">
                      <div className="stat-card-icon primary">🌐</div>
                      <div className="stat-card-content">
                        <p className="stat-card-label">Global Sales</p>
                        <h3 className="stat-card-value">{formatCurrency(stats.totalSales)}</h3>
                        <p className="stat-card-meta">
                          {stats.totalOrders || 0} total orders
                        </p>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="stat-card-icon info">👥</div>
                      <div className="stat-card-content">
                        <p className="stat-card-label">Verified Sales Users</p>
                        <h3 className="stat-card-value">{stats.verifiedSalesPersons || 0}</h3>
                        <p className="stat-card-meta">
                          Across all companies
                        </p>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="stat-card-icon warning">⏳</div>
                      <div className="stat-card-content">
                        <p className="stat-card-label">Pending Approvals</p>
                        <h3 className="stat-card-value">{stats.pendingSalesApprovals || 0}</h3>
                        <p className="stat-card-meta">
                          Awaiting your review
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Sales Person Stats */}
                {user?.role === 'sales' && (
                  <>
                    <div className="dashboard-stat-card">
                      <div className="stat-card-icon primary">📋</div>
                      <div className="stat-card-content">
                        <p className="stat-card-label">My Sales</p>
                        <h3 className="stat-card-value">{formatCurrency(stats.mySales)}</h3>
                        <p className="stat-card-meta">
                          {stats.myOrders || 0} orders placed
                        </p>
                      </div>
                    </div>

                    <div className="dashboard-stat-card">
                      <div className="stat-card-icon success">💵</div>
                      <div className="stat-card-content">
                        <p className="stat-card-label">My Commissions</p>
                        <h3 className="stat-card-value">{formatCurrency(stats.myCommissions)}</h3>
                        <p className="stat-card-meta">
                          Total earnings
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Pending Approvals Panel (Platform Admin Only) */}
            {user?.role === 'platform_admin' && (
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <h3>🛂 Pending Sales Approvals</h3>
                  <div className="dashboard-panel-actions">
                    <Link className="btn btn-sm btn-secondary" to="/sales-persons">
                      View All
                    </Link>
                  </div>
                </div>

                {pendingApprovals.length === 0 ? (
                  <div className="dashboard-panel-body">
                    <div className="dashboard-empty">
                      <div className="dashboard-empty-icon">✅</div>
                      <p className="dashboard-empty-text">No pending approvals right now.</p>
                    </div>
                  </div>
                ) : (
                  <div className="dashboard-table-wrapper">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Registered</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingApprovals.map((person) => (
                          <tr key={person.id}>
                            <td>
                              <strong>{person.name}</strong>
                            </td>
                            <td>{person.email}</td>
                            <td>{formatDate(person.created_at)}</td>
                            <td>
                              <button
                                className="btn-approve"
                                disabled={approvingId === person.id}
                                onClick={() => handleApproveFromDashboard(person)}
                              >
                                {approvingId === person.id ? 'Processing...' : 'Approve'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Quick Info Box */}
            <div className="dashboard-info-box">
              <h3>ℹ️ Quick Info</h3>
              {user?.role === 'sales' && !user?.is_verified && (
                <p>
                  Your account is pending admin approval. You'll be able to create sales and earn commissions once approved.
                  Check your <Link to="/waiting-approval">approval status</Link> for updates.
                </p>
              )}
              {user?.role === 'sales' && user?.is_verified && (
                <p>
                  You're verified! Start <Link to="/create-order">creating sales</Link> to earn commissions.
                  Track your performance in <Link to="/my-orders">My Orders</Link> and <Link to="/my-commissions">Commissions</Link>.
                </p>
              )}
              {user?.role === 'company_admin' && (
                <p>
                  Manage your sales team, <Link to="/products">products</Link>, and track performance from the sidebar.
                  View detailed <Link to="/reports">reports</Link> to analyze sales trends.
                </p>
              )}
              {user?.role === 'platform_admin' && (
                <p>
                  Review pending sales approvals and monitor global platform performance.
                  Check <Link to="/sales-persons">Sales Approvals</Link> and <Link to="/reports">Global Reports</Link> for detailed insights.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};