// Login Page - Modern SaaS Design

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Auth.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;

      login(user, token);
      
      if (user.role === 'sales' && !user.is_verified) {
        navigate('/waiting-approval');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your Field Sales CRM account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-alert error">
            <span className="auth-alert-icon">⚠️</span>
            <div className="auth-alert-content">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="email">Email Address</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon" aria-hidden="true">✉️</span>
              <input
                id="email"
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon" aria-hidden="true">🔒</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="auth-options">
            <label className="auth-remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="auth-forgot-password">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Social Login */}
        <div className="auth-social-buttons">
          <button type="button" className="auth-social-btn">
            <span aria-hidden="true">G</span>
            Google
          </button>
          <button type="button" className="auth-social-btn">
            <span aria-hidden="true">f</span>
            Facebook
          </button>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};