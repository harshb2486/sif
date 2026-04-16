// Register Page

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

export const RegisterPage = () => {
  const [tab, setTab] = useState('company'); // company or sales
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Company registration state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyEmail: ''
  });

  // Sales person registration state
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

      // Auto login
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
    <div className="auth-container">
      <div className="auth-box">
        <h1>📊 Field Sales Management</h1>
        <h2>Register</h2>

        <div className="tab-group">
          <button
            className={`tab-btn ${tab === 'company' ? 'active' : ''}`}
            onClick={() => setTab('company')}
          >
            Company Admin
          </button>
          <button
            className={`tab-btn ${tab === 'sales' ? 'active' : ''}`}
            onClick={() => setTab('sales')}
          >
            Sales Person
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {tab === 'company' ? (
          <form onSubmit={handleCompanySubmit}>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                value={companyForm.name}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                value={companyForm.email}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={companyForm.companyName}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Email</label>
              <input
                type="email"
                name="companyEmail"
                value={companyForm.companyEmail}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={companyForm.password}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={companyForm.confirmPassword}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register Company'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSalesSubmit}>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                value={salesForm.name}
                onChange={handleSalesChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={salesForm.email}
                onChange={handleSalesChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Company ID</label>
              <input
                type="number"
                name="companyId"
                value={salesForm.companyId}
                onChange={handleSalesChange}
                required
                placeholder="Enter your company ID"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={salesForm.password}
                onChange={handleSalesChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={salesForm.confirmPassword}
                onChange={handleSalesChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register as Sales Person'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="link">Login Here</Link>
        </div>
      </div>
    </div>
  );
};
