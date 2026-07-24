// Sidebar Component
// Modern navigation sidebar with role-based theming and react-icons

import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  RiDashboardLine,
  RiArchiveLine,
  RiBarChartBoxLine,
  RiChat3Line,
  RiPhoneLine,
  RiUserAddLine,
  RiAddCircleLine,
  RiFileListLine,
  RiCoinsLine,
  RiTimeLine,
  RiRobot2Line,
  RiMenuLine,
  RiCloseLine
} from 'react-icons/ri';
import './Sidebar.css';

const roleLabelMap = {
  platform_admin: 'Admin Console',
  company_admin: 'Company Workspace',
  sales: 'Sales Workspace'
};

const roleThemeMap = {
  platform_admin: 'role-admin',
  company_admin: 'role-company',
  sales: 'role-sales'
};

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMenuItems = () => {
    const common = [
      { path: '/dashboard', label: 'Dashboard', icon: RiDashboardLine }
    ];

    if (user?.role === 'company_admin') {
      return [
        ...common,
        { path: '/products', label: 'Products', icon: RiArchiveLine },
        { path: '/reports', label: 'Reports', icon: RiBarChartBoxLine },
        { path: '/owner-sales-chat', label: 'Team Chat', icon: RiPhoneLine },
        { path: '/chat', label: 'AI Assistant', icon: RiRobot2Line }
      ];
    }

    if (user?.role === 'platform_admin') {
      return [
        ...common,
        { path: '/sales-persons', label: 'Approvals', icon: RiUserAddLine },
        { path: '/reports', label: 'Global Reports', icon: RiBarChartBoxLine },
        { path: '/chat', label: 'AI Assistant', icon: RiRobot2Line }
      ];
    }

    if (user?.role === 'sales') {
      if (user?.is_verified) {
        return [
          ...common,
          { path: '/create-order', label: 'Create Sale', icon: RiAddCircleLine },
          { path: '/my-orders', label: 'My Orders', icon: RiFileListLine },
          { path: '/my-commissions', label: 'Commissions', icon: RiCoinsLine },
          { path: '/owner-sales-chat', label: 'Owner Chat', icon: RiChat3Line },
          { path: '/chat', label: 'AI Assistant', icon: RiRobot2Line }
        ];
      }
      return [
        ...common,
        { path: '/waiting-approval', label: 'Approval Status', icon: RiTimeLine },
        { path: '/chat', label: 'AI Assistant', icon: RiRobot2Line }
      ];
    }

    return [...common, { path: '/chat', label: 'AI Assistant', icon: RiRobot2Line }];
  };

  const menuItems = getMenuItems();

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

  const roleClass = roleThemeMap[user?.role] || 'role-default';

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
      >
        {isOpen ? <RiCloseLine /> : <RiMenuLine />}
      </button>

      {/* Mobile Backdrop */}
      {isMobile && (
        <div
          className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'} ${roleClass}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" aria-hidden="true">
              <RiBarChartBoxLine />
            </div>
            <div className="sidebar-logo-text">
              <h2 className="sidebar-brand">SIF</h2>
              <p className="sidebar-tagline">Field Sales CRM</p>
            </div>
          </div>
          <p className="sidebar-eyebrow">Welcome back</p>
          <h3 className="sidebar-workspace">{roleLabelMap[user?.role] || 'Workspace'}</h3>
        </div>

        <nav className="nav-menu" role="navigation" aria-label="Main navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={handleItemClick}
                end={item.path === '/dashboard'}
              >
                <span className="nav-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

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
