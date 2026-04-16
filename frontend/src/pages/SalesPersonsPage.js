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

  // Fetch list from API
  const fetchSalesPersons = async () => {
    try {
      setError('');
      const response = await companiesAPI.getSalesPersons(filter);
      const list = response.data.data || [];
      setSalesPersons(list);
      // reset paging
      setPage(1);
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
  }, [filter]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Derived filtered+searched list
  const filteredList = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return salesPersons;
    return salesPersons.filter(p => {
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    });
  }, [salesPersons, debouncedSearch]);

  const total = filteredList.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, pages);
  const paginated = filteredList.slice((currentPage - 1) * limit, currentPage * limit);

  useEffect(() => {
    if (page > pages) setPage(1);
  }, [pages]);

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
      await companiesAPI.approveSalesPerson(id);
      notify.success('Sales person approved');
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
                ⏳ Pending ({salesPersons.filter(s => !s.is_verified).length})
              </button>
              <button
                className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
                onClick={() => setFilter('verified')}
              >
                ✅ Verified ({salesPersons.filter(s => s.is_verified).length})
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
                      Showing <strong>{(currentPage - 1) * limit + 1}</strong> - <strong>{Math.min(currentPage * limit, total)}</strong> of <strong>{total}</strong>
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
