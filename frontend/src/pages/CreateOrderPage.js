// Create Order Page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI } from '../services/api';
import {
  RiAddLine,
  RiAlertLine,
  RiCheckLine,
  RiCoinLine,
  RiShoppingCartLine
} from 'react-icons/ri';
import './Pages.css';

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    clientName: '',
    amount: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await salesAPI.getProducts();
        setProducts(response.data.data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await salesAPI.createOrder(formData);
      setSuccess('Order created successfully! Redirecting...');
      setFormData({ productId: '', clientName: '', amount: '' });
      setTimeout(() => navigate('/my-orders'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p.id === parseInt(formData.productId));

  const calculateCommission = () => {
    if (!selectedProduct || !formData.amount) return null;
    if (selectedProduct.commission_type === 'fixed') {
      return parseFloat(selectedProduct.commission_value);
    }
    return (parseFloat(selectedProduct.price) * parseFloat(selectedProduct.commission_value)) / 100;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <RiAddLine />
          Create Sale
        </h1>
        <p className="page-subtitle">Record a new customer order and earn commission</p>
      </div>

      {error && <div className="alert alert-error"><RiAlertLine /> {error}</div>}
      {success && <div className="alert alert-success"><RiCheckLine /> {success}</div>}

      {loading ? (
        <div className="loading-block">Loading products...</div>
      ) : (
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Select Product *</label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose a product --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${parseFloat(product.price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sale Amount ($) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="Enter sale amount"
                  required
                />
              </div>
            </div>

            {selectedProduct && (
              <div className="commission-preview">
                <h3><RiCoinLine /> Commission Preview</h3>
                <div className="commission-preview-grid">
                  <div>
                    <span>Product</span>
                    <strong>{selectedProduct.name}</strong>
                  </div>
                  <div>
                    <span>Commission Type</span>
                    <strong>{selectedProduct.commission_type}</strong>
                  </div>
                  <div>
                    <span>Commission Value</span>
                    <strong>
                      {selectedProduct.commission_type === 'percentage'
                        ? `${selectedProduct.commission_value}%`
                        : `$${selectedProduct.commission_value}`}
                    </strong>
                  </div>
                  {formData.amount && (
                    <div className="commission-preview-total">
                      <span>Your Commission</span>
                      <strong>${calculateCommission().toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <RiShoppingCartLine />
              {submitting ? 'Creating...' : 'Create Sale'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
