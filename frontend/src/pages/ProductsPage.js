// Products Management Page

import React, { useEffect, useState } from 'react';
import { Header, Sidebar } from '../components';
import { productsAPI } from '../services/api';
import './Pages.css';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    commissionType: 'fixed',
    commissionValue: '',
    image: null,
    imagePreview: ''
  });

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ 
        ...prev, 
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('price', formData.price);
      formPayload.append('commissionType', formData.commissionType);
      formPayload.append('commissionValue', formData.commissionValue);
      
      if (formData.image) {
        formPayload.append('image', formData.image);
      }

      if (editingId) {
        await productsAPI.update(editingId, formPayload);
      } else {
        await productsAPI.create(formPayload);
      }
      
      setFormData({ 
        name: '', 
        price: '', 
        commissionType: 'fixed', 
        commissionValue: '', 
        image: null, 
        imagePreview: '' 
      });
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      commissionType: product.commission_type,
      commissionValue: product.commission_value
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-container">
          <div className="page-header">
            <h1>📦 Products</h1>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ name: '', price: '', commissionType: 'fixed', commissionValue: '' });
              }}
            >
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {showForm && (
            <div className="form-card">
              <h3>{editingId ? 'Edit Product' : 'Create New Product'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Commission Type</label>
                    <select
                      name="commissionType"
                      value={formData.commissionType}
                      onChange={handleChange}
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Commission Value</label>
                    <input
                      type="number"
                      name="commissionValue"
                      value={formData.commissionValue}
                      onChange={handleChange}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Product Image</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleChange}
                      className="file-input"
                    />
                    {formData.imagePreview && (
                      <div className="image-preview">
                        <img src={formData.imagePreview} alt="Product preview" />
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="table-container">
              {products.length === 0 ? (
                <p className="no-data">No products yet. Create your first product!</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Commission Type</th>
                      <th>Commission Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>${parseFloat(product.price).toFixed(2)}</td>
                        <td>{product.commission_type}</td>
                        <td>
                          {product.commission_type === 'percentage'
                            ? `${product.commission_value}%`
                            : `$${product.commission_value}`
                          }
                        </td>
                        <td>
                          <button
                            className="btn-sm btn-edit"
                            onClick={() => handleEdit(product)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-sm btn-delete"
                            onClick={() => handleDelete(product.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
