// Header Component
// Modern top navigation bar with user menu and actions

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  RiSearchLine,
  RiNotification3Line,
  RiSettings4Line,
  RiUserLine,
  RiLogoutBoxRLine,
  RiQuestionLine,
  RiArrowDownSLine,
  RiBarChartBoxLine
} from 'react-icons/ri';
import './Header.css';

const roleNameMap = {
  platform_admin: 'Platform Admin',
  company_admin: 'Company Admin',
  sales: 'Sales Executive'
};

const roleBadgeClass = {
  platform_admin: 'badge-admin',
  company_admin: 'badge-company',
  sales: 'badge-sales'
};

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  const quickNav = [
    { path: '/dashboard', label: 'Dashboard' },
    ...(user?.role === 'company_admin' ? [{ path: '/products', label: 'Products' }] : []),
    ...((user?.role === 'company_admin' || user?.role === 'sales') ? [{ path: '/owner-sales-chat', label: 'Team' }] : []),
    ...(user?.role === 'company_admin' || user?.role === 'platform_admin' ? [{ path: '/reports', label: 'Reports' }] : []),
    { path: '/chat', label: 'AI Assistant' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        {/* Left: Logo + Search */}
        <div className="header-left">
          <Link to="/dashboard" className="header-logo">
            <div className="header-logo-icon" aria-hidden="true">
              <RiBarChartBoxLine />
            </div>
            <span className="header-logo-text">SIF</span>
          </Link>

          <div className="header-search">
            <RiSearchLine className="header-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="header-search-input"
              placeholder="Search..."
              aria-label="Search"
              disabled
              title="Search coming soon"
            />
          </div>
        </div>

        {/* Center: Quick Navigation */}
        <nav className="header-nav" aria-label="Quick navigation">
          {quickNav.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`header-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions + User */}
        <div className="header-right">
          <button
            className="header-action-btn"
            aria-label="Notifications"
            title="Notifications (coming soon)"
            disabled
          >
            <RiNotification3Line />
          </button>

          <button
            className="header-action-btn"
            aria-label="Settings"
            title="Settings (coming soon)"
            disabled
          >
            <RiSettings4Line />
          </button>

          <div className="header-user-menu-wrapper" ref={dropdownRef}>
            <button
              className={`header-user-menu ${dropdownOpen ? 'open' : ''}`}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="header-user-avatar" aria-hidden="true">
                {getInitials(user?.name)}
              </div>
              <div className="header-user-info">
                <p className="header-user-name">{user?.name || 'User'}</p>
                <p className="header-user-role">
                  <span className={`badge badge-sm ${roleBadgeClass[user?.role] || 'badge-neutral'}`}>
                    {roleNameMap[user?.role] || user?.role}
                  </span>
                </p>
              </div>
              <RiArrowDownSLine className="header-user-chevron" aria-hidden="true" />
            </button>

            <div className={`header-dropdown ${dropdownOpen ? 'open' : ''}`} role="menu">
              <button
                className="header-dropdown-item"
                onClick={() => handleNavigation('/dashboard')}
                role="menuitem"
              >
                <RiUserLine />
                My Profile
              </button>
              <button
                className="header-dropdown-item"
                onClick={() => handleNavigation('/dashboard')}
                role="menuitem"
              >
                <RiSettings4Line />
                Settings
              </button>
              <button
                className="header-dropdown-item"
                onClick={() => handleNavigation('/dashboard')}
                role="menuitem"
              >
                <RiQuestionLine />
                Help Center
              </button>
              <div className="header-dropdown-divider"></div>
              <button
                className="header-dropdown-item danger"
                onClick={handleLogout}
                role="menuitem"
              >
                <RiLogoutBoxRLine />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
