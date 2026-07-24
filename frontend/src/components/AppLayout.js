// AppLayout.js
// Shared layout shell: sidebar + header + main content for all protected pages.

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './AppLayout.css';

export const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout-body">
        <Header />
        <main className="app-layout-main">
          <div className="app-layout-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
