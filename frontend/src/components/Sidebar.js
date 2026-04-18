// Sidebar Component
// Modern navigation sidebar with role-based theming

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true); // Always open on desktop by default
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false); // Close on mobile
      } else {
        setIsOpen(true); // Always open on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const roleLabelMap = {
    platform_admin: 'Admin Console',
    company_admin: 'Company Workspace',
    sales: 'Sales Workspace'
  };

  const roleIconMap = {
    platform_admin: '🌐',
    company_admin: '🏢',
    sales: '💼'
  };

  const getMenuItems = () => {
    const common = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' }
    ];

    if (user?.role === 'company_admin') {
      return [
        ...common,
        { path: '/products', label: 'Products', icon: '📦' },
        { path: '/reports', label: 'Reports', icon: '📈' },
        { path: '/owner-sales-chat', label: 'Team Chat/Call', icon: '📞' },
        { path: '/chat', label: 'AI Assistant', icon: '🤖' }
      ];
    }

    if (user?.role === 'platform_admin') {
      return [
        ...common,
        { path: '/sales-persons', label: 'Sales Approvals', icon: '🛂' },
        { path: '/reports', label: 'Global Reports', icon: '🌐' },
        { path: '/chat', label: 'AI Assistant', icon: '🤖' }
      ];
    }

    if (user?.role === 'sales') {
      if (user?.is_verified) {
        return [
          ...common,
          { path: '/create-order', label: 'Create Sale', icon: '➕' },
          { path: '/my-orders', label: 'My Orders', icon: '📋' },
          { path: '/my-commissions', label: 'Commissions', icon: '💰' },
          { path: '/owner-sales-chat', label: 'Owner Chat/Call', icon: '📞' },
          { path: '/chat', label: 'AI Assistant', icon: '🤖' }
        ];
      } else {
        return [
          ...common,
          { path: '/waiting-approval', label: 'Approval Status', icon: '⏳' },
          { path: '/chat', label: 'AI Assistant', icon: '🤖' }
        ];
      }
    }

    return [...common, { path: '/chat', label: 'AI Assistant', icon: '🤖' }];
  };

  const menuItems = getMenuItems();
  const isActive = (path) => location.pathname === path;

  const handleItemClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Toggle Button - Only render on mobile */}
      {isMobile && (
        <button
          className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
          aria-expanded={isOpen}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && (
        <div 
          className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
          onClick={() => setIsOpen(false)} 
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'} role-${user?.role || 'default'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" aria-hidden="true">
              {roleIconMap[user?.role] || '📊'}
            </div>
            <div className="sidebar-logo-text">
              <h2 className="sidebar-brand">SIF</h2>
              <p className="sidebar-tagline">Field Sales CRM</p>
            </div>
          </div>
          <p className="sidebar-eyebrow">Welcome back</p>
          <h3 className="sidebar-workspace">{roleLabelMap[user?.role] || 'Workspace'}</h3>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu" role="navigation" aria-label="Main navigation">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={handleItemClick}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer with User Info */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <div className="sidebar-avatar" aria-hidden="true">
              {getInitials(user?.name)}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name || 'User'}</p>
              <p className="sidebar-user-role">{user?.email || ''}</p>
            </div>
            <span 
              className={`status-badge ${user?.is_verified ? 'verified' : 'pending'}`}
              title={user?.is_verified ? 'Verified' : 'Pending Verification'}
            >
              {user?.is_verified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};