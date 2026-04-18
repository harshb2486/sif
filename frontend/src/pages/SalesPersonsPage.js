// Sales Persons Management Page

import React, { useEffect, useMemo, useState } from 'react';
import { Header, Sidebar } from '../components';
import { companiesAPI } from '../services/api';
import notify from '../utils/notify';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './Pages.css';

export const SalesPersonsPage = () => {
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [approvingIds, setApprovingIds] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

  // Fetch list from API
  const fetchSalesPersons = async () => {
    try {
      setError('');
      const response = await companiesAPI.getSalesPersons(filter, debouncedSearch, page, limit);
      const list = response.data.data || [];
      const meta = response.data.meta || {};
      setSalesPersons(list);
      setCounts(meta.counts || { pending: 0, verified: 0 });
      setPagination(meta.pagination || { page: 1, pages: 1, total: list.length, limit });
    } catch (err) {
      console.error('Fetch sales persons error', err);
      setError('Failed to load sales persons');
      notify.error('Failed to load sales persons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSalesPersons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, debouncedSearch, page, limit]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const total = pagination.total || salesPersons.length;
  const pages = pagination.pages || 1;
  const currentPage = pagination.page || page;
  const paginated = useMemo(() => salesPersons, [salesPersons]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const confirmApprove = async (person) => {
    const result = await Swal.fire({
      title: 'Approve sales person? ',
      text: `Approve ${person.name} (${person.email}) to start selling?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      await handleApprove(person.id);
    }
  };

  const handleApprove = async (id) => {
    try {
      setApprovingIds(prev => [...prev, id]);
      const response = await companiesAPI.approveSalesPerson(id);
      const emailSent = response?.data?.data?.emailSent;
      notify.success(emailSent ? 'Sales person approved and email sent' : 'Sales person approved (email not sent)');
      // re-fetch
      await fetchSalesPersons();
    } catch (err) {
      console.error('Approve error', err);
      setError('Failed to approve sales person');
      notify.error('Failed to approve sales person');
    } finally {
      setApprovingIds(prev => prev.filter(x => x !== id));
    }
  };

  return (
    <>
      <Header />
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <h1>👥 Sales Team</h1>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="toolbar" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div className="filter-group">
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                  ⏳ Pending ({counts.pending || 0})
              </button>
              <button
                className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
                onClick={() => setFilter('verified')}
              >
                  ✅ Verified ({counts.verified || 0})
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <input
                type="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-search"
                aria-label="Search sales persons"
              />
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 13 }}>Per page</label>
              <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-skeleton">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-row" style={{ height: 40, background: '#f3f3f3', marginBottom: 8, borderRadius: 6 }} />
              ))}
            </div>
          ) : (
            <div className="table-container">
              {total === 0 ? (
                <div className="empty-state">
                  <p className="no-data">No sales persons found.</p>
                </div>
              ) : (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Registered</th>
                        <th style={{ width: 160 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map(person => (
                        <tr key={person.id}>
                          <td>{person.name}</td>
                          <td>{person.email}</td>
                          <td>
                            <span className={`status-badge ${person.is_verified ? 'verified' : 'pending'}`}>
                              {person.is_verified ? '✅ Verified' : '⏳ Pending'}
                            </span>
                          </td>
                          <td>{person.created_at ? new Date(person.created_at).toLocaleDateString() : '-'}</td>
                          <td>
                            {!person.is_verified ? (
                              <button
                                className="btn-sm btn-approve"
                                onClick={() => confirmApprove(person)}
                                disabled={approvingIds.includes(person.id)}
                              >
                                {approvingIds.includes(person.id) ? 'Approving...' : '✓ Approve'}
                              </button>
                            ) : (
                              <span className="verified-tick">✅</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div>
                      Showing <strong>{total === 0 ? 0 : (currentPage - 1) * limit + 1}</strong> - <strong>{Math.min(currentPage * limit, total)}</strong> of <strong>{total}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
                      <span>Page</span>
                      <input type="number" value={currentPage} min={1} max={pages} onChange={(e) => setPage(Math.min(Math.max(1, parseInt(e.target.value || 1, 10)), pages))} style={{ width: 60 }} />
                      <span>of {pages}</span>
                      <button className="btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={currentPage === pages}>Next</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};
