// Products Management Page

import React, { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import {
  RiArchiveLine,
  RiAddLine,
  RiCloseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiImageLine,
  RiAlertLine,
  RiCheckLine
} from 'react-icons/ri';
import './Pages.css';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
        setSuccess('Product updated successfully');
      } else {
        await productsAPI.create(formPayload);
        setSuccess('Product created successfully');
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
        setSuccess('Product deleted successfully');
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
      commissionValue: product.commission_value,
      image: null,
      imagePreview: product.image_url || ''
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', commissionType: 'fixed', commissionValue: '', image: null, imagePreview: '' });
    setEditingId(null);
    setShowForm(!showForm);
    setError('');
    setSuccess('');
  };

  return (
    <div className="page-container">
      <div className="page-header-with-actions">
        <div>
          <h1 className="page-title">
            <RiArchiveLine />
            Products
          </h1>
          <p className="page-subtitle">Manage your product catalog and commission rules</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={resetForm}
        >
          {showForm ? <><RiCloseLine /> Cancel</> : <><RiAddLine /> Add Product</>}
        </button>
      </div>

      {error && <div className="alert alert-error"><RiAlertLine /> {error}</div>}
      {success && <div className="alert alert-success"><RiCheckLine /> {success}</div>}

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
                  placeholder="e.g. Premium Widget"
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
                  placeholder="0.00"
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
                  placeholder={formData.commissionType === 'percentage' ? 'e.g. 10' : '0.00'}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Product Image</label>
                <div className="file-input-wrapper">
                  <RiImageLine />
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleChange}
                    className="file-input"
                  />
                  <span>{formData.image ? formData.image.name : 'Choose an image or drag it here'}</span>
                </div>
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
        <div className="loading-block">Loading products...</div>
      ) : (
        <div className="table-container">
          {products.length === 0 ? (
            <div className="empty-state">
              <RiArchiveLine />
              <h4>No products yet</h4>
              <p>Create your first product to get started.</p>
            </div>
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
                    <td>
                      <div className="product-row-image">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} />
                        ) : (
                          <div className="product-image-placeholder">
                            <RiImageLine />
                          </div>
                        )}
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>${parseFloat(product.price).toFixed(2)}</td>
                    <td>{product.commission_type}</td>
                    <td>
                      {product.commission_type === 'percentage'
                        ? `${product.commission_value}%`
                        : `$${product.commission_value}`}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-sm btn-edit"
                          onClick={() => handleEdit(product)}
                          title="Edit"
                        >
                          <RiEditLine />
                        </button>
                        <button
                          className="btn-sm btn-delete"
                          onClick={() => handleDelete(product.id)}
                          title="Delete"
                        >
                          <RiDeleteBinLine />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
