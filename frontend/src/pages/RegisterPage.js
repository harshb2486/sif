// Register Page - Modern SaaS Design

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

export const RegisterPage = () => {
  const [tab, setTab] = useState('company');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [companyForm, setCompanyForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyEmail: ''
  });

  const [salesForm, setSalesForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyId: ''
  });

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSalesChange = (e) => {
    const { name, value } = e.target;
    setSalesForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.registerCompany(companyForm);
      const { token, user } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSalesSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.registerSalesPerson(salesForm);
      setSuccess('Registration successful! Please login with your credentials.');
      setSalesForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyId: ''
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-wrapper">
            <div className="auth-logo" aria-hidden="true">
              📊
            </div>
          </div>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Join our Field Sales CRM platform</p>
        </div>

        {/* Error/Success Alerts */}
        {error && (
          <div className="auth-alert error">
            <span className="auth-alert-icon">⚠️</span>
            <div className="auth-alert-content">{error}</div>
          </div>
        )}

        {success && (
          <div className="auth-alert success">
            <span className="auth-alert-icon">✅</span>
            <div className="auth-alert-content">{success}</div>
          </div>
        )}

        {/* Account Type Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'company' ? 'active' : ''}`}
            onClick={() => setTab('company')}
            type="button"
          >
            <span className="tab-icon">🏢</span>
            <span className="tab-label">Company Admin</span>
            <span className="tab-desc">Register your company</span>
          </button>
          <button
            className={`auth-tab ${tab === 'sales' ? 'active' : ''}`}
            onClick={() => setTab('sales')}
            type="button"
          >
            <span className="tab-icon">👤</span>
            <span className="tab-label">Sales Person</span>
            <span className="tab-desc">Join as sales executive</span>
          </button>
        </div>

        {/* Company Registration Form */}
        {tab === 'company' && (
          <form className="auth-form" onSubmit={handleCompanySubmit}>
            <div className="auth-form-section">
              <h3 className="auth-form-section-title">Personal Information</h3>
              
              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="company-name">Your Full Name</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon" aria-hidden="true">👤</span>
                    <input
                      id="company-name"
                      type="text"
                      className="auth-input"
                      name="name"
                      value={companyForm.name}
                      onChange={handleCompanyChange}
                      required
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="company-email">Your Email</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon" aria-hidden="true">✉️</span>
                    <input
                      id="company-email"
                      type="email"
                      className="auth-input"
                      name="email"
                      value={companyForm.email}
                      onChange={handleCompanyChange}
                      required
                      placeholder="john@company.com"
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-form-section">
              <h3 className="auth-form-section-title">Company Details</h3>
              
              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="company-name-field">Company Name</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon" aria-hidden="true">🏢</span>
                    <input
                      id="company-name-field"
                      type="text"
                      className="auth-input"
                      name="companyName"
                      value={companyForm.companyName}
                      onChange={handleCompanyChange}
                      required
                      placeholder="Acme Corporation"
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="company-email-field">Company Email</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon" aria-hidden="true">📧</span>
                    <input
                      id="company-email-field"
                      type="email"
                      className="auth-input"
                      name="companyEmail"
                      value={companyForm.companyEmail}
                      onChange={handleCompanyChange}
                      required
                      placeholder="info@company.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-form-section">
              <h3 className="auth-form-section-title">Security</h3>
              
              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="company-password">Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon" aria-hidden="true">🔒</span>
                    <input
                      id="company-password"
                      type="password"
                      className="auth-input"
                      name="password"
                      value={companyForm.password}
                      onChange={handleCompanyChange}
                      required
                      placeholder="Create a strong password"
                      minLength="8"
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="company-confirm-password">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon" aria-hidden="true">🔐</span>
                    <input
                      id="company-confirm-password"
                      type="password"
                      className="auth-input"
                      name="confirmPassword"
                      value={companyForm.confirmPassword}
                      onChange={handleCompanyChange}
                      required
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Company Account'
              )}
            </button>
          </form>
        )}

        {/* Sales Person Registration Form */}
        {tab === 'sales' && (
          <form className="auth-form" onSubmit={handleSalesSubmit}>
            <div className="auth-form-section">
              <h3 className="auth-form-section-title">Personal Information</h3>
              
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="sales-name">Your Full Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon" aria-hidden="true">👤</span>
                  <input
                    id="sales-name"
                    type="text"
                    className="auth-input"
                    name="name"
                    value={salesForm.name}
                    onChange={handleSalesChange}
                    required
                    placeholder="Jane Smith"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="sales-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon" aria-hidden="true">✉️</span>
                  <input
                    id="sales-email"
                    type="email"
                    className="auth-input"
                    name="email"
                    value={salesForm.email}
                    onChange={handleSalesChange}
                    required
                    placeholder="jane@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            <div className="auth-form-section">
              <h3 className="auth-form-section-title">Company Preference (Optional)</h3>
              
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="sales-company">Preferred Company ID</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon" aria-hidden="true">🏢</span>
                  <input
                    id="sales-company"
                    type="text"
                    className="auth-input"
                    name="companyId"
                    value={salesForm.companyId}
                    onChange={handleSalesChange}
                    placeholder="Enter company ID if you have one"
                  />
                </div>
                <p className="auth-input-hint">If you know your company's ID, enter it here to be linked automatically.</p>
              </div>
            </div>

            <div className="auth-form-section">
              <h3 className="auth-form-section-title">Security</h3>
              
              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="sales-password">Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon" aria-hidden="true">🔒</span>
                    <input
                      id="sales-password"
                      type="password"
                      className="auth-input"
                      name="password"
                      value={salesForm.password}
                      onChange={handleSalesChange}
                      required
                      placeholder="Create a strong password"
                      minLength="8"
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="sales-confirm-password">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon" aria-hidden="true">🔐</span>
                    <input
                      id="sales-confirm-password"
                      type="password"
                      className="auth-input"
                      name="confirmPassword"
                      value={salesForm.confirmPassword}
                      onChange={handleSalesChange}
                      required
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Sales Account'
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};