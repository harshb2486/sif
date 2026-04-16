// Waiting for Approval Page

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components';
import './Pages.css';

export const WaitingApprovalPage = () => {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <main className="main-content waiting-page">
        <div className="page-container">
          <div className="waiting-container">
            <div className="waiting-icon">⏳</div>
            <h1>Waiting for Approval</h1>
            <p className="waiting-message">
              Your account is pending administrator approval. You'll receive a notification once your account is verified.
            </p>

            <div className="waiting-info">
              <div className="info-item">
                <span className="info-label">Account Status:</span>
                <span className="info-value pending">Not Verified</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Type:</span>
                <span className="info-value">Sales Person</span>
              </div>
              <div className="info-item">
                <span className="info-label">Registered Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
            </div>

            <div className="waiting-tips">
              <h3>What happens next?</h3>
              <ul>
                <li>✓ Your company admin will review your profile</li>
                <li>✓ You'll be notified via email once approved</li>
                <li>✓ After approval, you can start creating sales and earning commissions</li>
              </ul>
            </div>

            <div className="waiting-contact">
              <p>Questions? Contact your company administrator for more information.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
