// Sidebar Component
// Navigation sidebar for authenticated users

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const getMenuItems = () => {
    const common = [
      { path: '/dashboard', label: '📊 Dashboard' }
    ];

    if (user?.role === 'company_admin') {
      return [
        ...common,
        { path: '/products', label: '📦 Products' },
        { path: '/sales-persons', label: '👥 Sales Team' },
        { path: '/reports', label: '📈 Reports' }
      ];
    }

    if (user?.role === 'sales') {
      if (user?.is_verified) {
        return [
          ...common,
          { path: '/create-order', label: '➕ Create Sale' },
          { path: '/my-orders', label: '📋 My Orders' },
          { path: '/my-commissions', label: '💰 Commissions' }
        ];
      } else {
        return [
          ...common,
          { path: '/waiting-approval', label: '⏳ Waiting Approval' }
        ];
      }
    }

    return common;
  };

  const menuItems = getMenuItems();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button 
        className="toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {isOpen && (
        <nav className="nav-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </aside>
  );
};
