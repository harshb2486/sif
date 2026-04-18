// Header Component
// Modern top navigation bar with user menu and notifications

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleNameMap = {
    platform_admin: 'Platform Admin',
    company_admin: 'Company Admin',
    sales: 'Sales Executive'
  };

  const roleBadgeClass = {
    platform_admin: 'badge-secondary',
    company_admin: 'badge-primary',
    sales: 'badge-success'
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Left Section - Logo & Search */}
        <div className="header-left">
          <a href="/dashboard" className="header-logo">
            <div className="header-logo-icon" aria-hidden="true">
              📊
            </div>
            <span className="header-logo-text">SIF</span>
          </a>

          {/* Search Bar */}
          <div className="header-search">
            <span className="header-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="header-search-input"
              placeholder="Search orders, products, reports..."
              aria-label="Search"
            />
          </div>
        </div>

         {/* Center Section - Navigation Tabs */}
         <nav className="header-nav" aria-label="Quick navigation">
           <a href="/dashboard" className="header-nav-item active">
             Dashboard
           </a>
           {user?.role === 'company_admin' && (
             <a href="/products" className="header-nav-item">
               Products
             </a>
           )}
           <a href="/reports" className="header-nav-item">
             Reports
           </a>
           <a href="/chat" className="header-nav-item">
             AI Assistant
             <span className="header-nav-badge" aria-label="3 new messages">3</span>
           </a>
         </nav>

        {/* Right Section - User Menu & Actions */}
        <div className="header-right">
          {/* Notification Bell */}
          <button 
            className="header-action-btn" 
            aria-label="Notifications"
            title="Notifications"
          >
            🔔
            <span className="notification-dot" aria-hidden="true"></span>
          </button>

          {/* Settings Gear */}
          <button 
            className="header-action-btn" 
            aria-label="Settings"
            title="Settings"
          >
            ⚙️
          </button>

          {/* User Menu */}
          <div 
            className="header-user-menu-wrapper"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <div 
              className={`header-user-menu ${dropdownOpen ? 'open' : ''}`}
              role="button"
              tabIndex={0}
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
              <span className="header-user-chevron" aria-hidden="true">▼</span>
            </div>

            {/* Dropdown Menu */}
            <div className={`header-dropdown ${dropdownOpen ? 'open' : ''}`} role="menu">
              <button 
                className="header-dropdown-item" 
                onClick={() => handleNavigation('/profile')}
                role="menuitem"
              >
                👤 My Profile
              </button>
              <button 
                className="header-dropdown-item" 
                onClick={() => handleNavigation('/settings')}
                role="menuitem"
              >
                ⚙️ Settings
              </button>
              <button 
                className="header-dropdown-item" 
                onClick={() => handleNavigation('/help')}
                role="menuitem"
              >
                ❓ Help Center
              </button>
              <div className="header-dropdown-divider"></div>
              <button 
                className="header-dropdown-item danger" 
                onClick={handleLogout}
                role="menuitem"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};