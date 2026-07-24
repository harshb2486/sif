// Dashboard Page - Modern SaaS Dashboard
// Role-based dashboard with stats, pending approvals, and quick info

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { companiesAPI, reportsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import notify from '../utils/notify';
import {
  RiBarChartBoxLine,
  RiCoinsLine,
  RiUserLine,
  RiGlobalLine,
  RiTimeLine,
  RiFileListLine,
  RiInformationLine,
  RiAlertLine,
  RiCheckLine,
  RiAddLine,
  RiPhoneLine,
  RiRobot2Line
} from 'react-icons/ri';
import './Dashboard.css';

const roleStatConfig = {
  company_admin: [
    { key: 'totalSales', label: 'Total Sales', meta: 'orders this period', icon: RiBarChartBoxLine, theme: 'primary' },
    { key: 'totalCommissionsIssued', label: 'Commissions Issued', meta: 'Across all sales team', icon: RiCoinsLine, theme: 'success' },
    { key: 'verifiedSalesPersons', label: 'Verified Sales Team', meta: 'Active sales executives', icon: RiUserLine, theme: 'info' }
  ],
  platform_admin: [
    { key: 'totalSales', label: 'Global Sales', meta: 'total orders', icon: RiGlobalLine, theme: 'primary' },
    { key: 'verifiedSalesPersons', label: 'Verified Sales Users', meta: 'Across all companies', icon: RiUserLine, theme: 'info' },
    { key: 'pendingSalesApprovals', label: 'Pending Approvals', meta: 'Awaiting your review', icon: RiTimeLine, theme: 'warning' }
  ],
  sales: [
    { key: 'mySales', label: 'My Sales', meta: 'orders placed', icon: RiBarChartBoxLine, theme: 'primary' },
    { key: 'myCommissions', label: 'My Commissions', meta: 'Total earnings', icon: RiCoinsLine, theme: 'success' }
  ]
};

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
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statItems = roleStatConfig[user?.role] || roleStatConfig.sales;

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
        <p>Here's what's happening in your workspace today.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="dashboard-alert error">
          <RiAlertLine />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="dashboard-stats">
          {statItems.map((stat) => {
            const Icon = stat.icon;
            const value = stat.key.includes('Sales') || stat.key.includes('Commissions')
              ? formatCurrency(stats[stat.key])
              : stats[stat.key] || 0;
            return (
              <div key={stat.key} className="dashboard-stat-card">
                <div className={`stat-card-icon ${stat.theme}`}>
                  <Icon />
                </div>
                <div className="stat-card-content">
                  <p className="stat-card-label">{stat.label}</p>
                  <h3 className="stat-card-value">{value}</h3>
                  <p className="stat-card-meta">
                    {stat.key.includes('Sales') || stat.key.includes('Commissions')
                      ? `${stats[stat.key === 'totalSales' ? 'totalOrders' : stat.key === 'mySales' ? 'myOrders' : '—'] || 0} ${stat.meta}`
                      : stat.meta}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending Approvals Panel */}
      {user?.role === 'platform_admin' && (
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3>
              <RiUserLine />
              Pending Sales Approvals
            </h3>
            <div className="dashboard-panel-actions">
              <Link className="btn btn-sm btn-secondary" to="/sales-persons">
                View All
              </Link>
            </div>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="dashboard-panel-body">
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  <RiCheckLine />
                </div>
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

      {/* Quick Actions */}
      <div className="dashboard-quick-actions">
        {user?.role === 'sales' && user?.is_verified && (
          <Link to="/create-order" className="quick-action-card">
            <div className="quick-action-icon primary">
              <RiAddLine />
            </div>
            <div>
              <h4>Create Sale</h4>
              <p>Record a new order</p>
            </div>
          </Link>
        )}
        {(user?.role === 'company_admin' || user?.role === 'sales') && (
          <Link to="/owner-sales-chat" className="quick-action-card">
            <div className="quick-action-icon info">
              <RiPhoneLine />
            </div>
            <div>
              <h4>Team Chat</h4>
              <p>Message or call your team</p>
            </div>
          </Link>
        )}
        <Link to="/chat" className="quick-action-card">
          <div className="quick-action-icon accent">
            <RiRobot2Line />
          </div>
          <div>
            <h4>AI Assistant</h4>
            <p>Ask about products & sales</p>
          </div>
        </Link>
      </div>

      {/* Quick Info Box */}
      <div className="dashboard-info-box">
        <h3>
          <RiInformationLine />
          Quick Info
        </h3>
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
  );
};
