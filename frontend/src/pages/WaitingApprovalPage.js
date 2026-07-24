// Waiting for Approval Page

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  RiTimeLine,
  RiCheckLine,
  RiMailLine,
  RiUserLine,
  RiDashboardLine
} from 'react-icons/ri';
import './Pages.css';

export const WaitingApprovalPage = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="waiting-approval-wrapper">
        <div className="waiting-icon">
          <RiTimeLine />
        </div>
        <h1>Waiting for Approval</h1>
        <p className="waiting-message">
          Your account is pending administrator approval. You'll receive a notification once your account is verified.
        </p>

        <div className="waiting-status-card">
          <div className="waiting-status-dot" />
          <span className="waiting-status-text">Pending admin review</span>
        </div>

        <div className="waiting-info">
          <div className="info-item">
            <RiUserLine />
            <span className="info-label">Account Status:</span>
            <span className="info-value pending">Not Verified</span>
          </div>
          <div className="info-item">
            <RiDashboardLine />
            <span className="info-label">Account Type:</span>
            <span className="info-value">Sales Person</span>
          </div>
          <div className="info-item">
            <RiMailLine />
            <span className="info-label">Registered Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
        </div>

        <div className="waiting-tips">
          <h3>What happens next?</h3>
          <ul>
            <li><RiCheckLine /> Platform admin will review your profile</li>
            <li><RiCheckLine /> You'll be notified via email once approved</li>
            <li><RiCheckLine /> After approval, you can start creating sales and earning commissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
