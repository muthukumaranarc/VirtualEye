/**
 * VirtualEye — Admin Users Page
 *
 * ADMIN only: view all users, create new users, delete existing users.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAllUsers, deleteUser, registerUser } from '../api/apiClient';
import './AdminUsers.css';

const DEFAULT_PERMS = {
  cameraAccess: true,
  userViewAccess: false,
};

export default function AdminUsers({ onNavigate }) {
  const { user: currentUser, isAdmin } = useAuth();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // userId to confirm
  const [deleting, setDeleting]   = useState(null);

  // ── Add User Modal state ──────────────────────────────────────────────
  const [showModal, setShowModal]   = useState(false);
  const [formData, setFormData]     = useState({
    name: '', email: '', password: '', role: 'USER',
    cameraAccess: true, userViewAccess: false,
  });
  const [formError, setFormError]   = useState('');
  const [creating, setCreating]     = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // ── Redirect non-admins ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) onNavigate('dashboard');
  }, [isAdmin, onNavigate]);

  // ── Fetch users ───────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAllUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Delete user ───────────────────────────────────────────────────────
  const handleDelete = async (userId) => {
    setDeleting(userId);
    setError('');
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSuccessMsg('User deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  // ── Create user ───────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        permissions: {
          cameraAccess: formData.cameraAccess,
          userViewAccess: formData.userViewAccess,
        },
      };
      await registerUser(payload);
      setSuccessMsg(`User "${formData.email}" created successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'USER', ...DEFAULT_PERMS });
      loadUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const roleClass = (role) => (role === 'ADMIN' ? 'badge badge-admin' : 'badge badge-user');

  return (
    <main className="admin-users">
      {/* ── Header ── */}
      <section className="admin-users__header animate-fade-in-up">
        <div>
          <nav className="admin-users__breadcrumb">
            <button className="breadcrumb-link" onClick={() => onNavigate('dashboard')}>
              Dashboard
            </button>
            <span className="breadcrumb-sep">›</span>
            <span>User Management</span>
          </nav>
          <h1 className="admin-users__title">
            User Management
          </h1>
          <p className="admin-users__desc">
            Manage platform users, roles, and permissions.
          </p>
        </div>
        <button
          id="add-user-btn"
          className="btn btn-primary"
          onClick={() => { setShowModal(true); setFormError(''); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon-sm">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add User
        </button>
      </section>

      {/* ── Success Banner ── */}
      {successMsg && (
        <div className="alert alert--success animate-fade-in-up" role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="alert alert--error animate-fade-in-up" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Users Table ── */}
      <section className="admin-users__table-wrap animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="users-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="users-skeleton">
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <div className="skeleton" style={{ flex: 1, height: 18 }} />
                <div className="skeleton" style={{ width: 80, height: 22 }} />
                <div className="skeleton" style={{ width: 90, height: 32 }} />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="users-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>No users found. Click <strong>Add User</strong> to create the first one.</p>
          </div>
        ) : (
          <table className="users-table" id="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Provider</th>
                <th>Permissions</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className={u._id === currentUser?._id ? 'users-table__row--self' : ''}>
                  {/* User info */}
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar" aria-hidden="true">
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="user-cell__name">
                          {u.name}
                          {u._id === currentUser?._id && (
                            <span className="badge badge-self">You</span>
                          )}
                        </p>
                        <p className="user-cell__email">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td>
                    <span className={roleClass(u.role)}>{u.role}</span>
                  </td>

                  {/* Auth provider */}
                  <td>
                    <span className="provider-badge">
                      {u.authProvider === 'GOOGLE' ? (
                        <>
                          <svg viewBox="0 0 533.5 544.3" width="14" height="14">
                            <path fill="#4285f4" d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"/>
                            <path fill="#34a853" d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"/>
                            <path fill="#fbbc04" d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"/>
                            <path fill="#ea4335" d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"/>
                          </svg>
                          Google
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          Local
                        </>
                      )}
                    </span>
                  </td>

                  {/* Permissions */}
                  <td>
                    <div className="permissions-list">
                      <PermDot label="Camera" on={u.permissions?.cameraAccess} />
                      <PermDot label="Users"  on={u.permissions?.userViewAccess} />
                    </div>
                  </td>

                  {/* Created at */}
                  <td className="user-cell__date">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>

                  {/* Actions */}
                  <td>
                    {u._id === currentUser?._id ? (
                      <span className="action-self-note">Cannot delete self</span>
                    ) : deleteConfirm === u._id ? (
                      <div className="delete-confirm">
                        <span>Sure?</span>
                        <button
                          id={`confirm-delete-${u._id}`}
                          className="btn btn-danger-sm"
                          disabled={deleting === u._id}
                          onClick={() => handleDelete(u._id)}
                        >
                          {deleting === u._id ? '…' : 'Yes'}
                        </button>
                        <button
                          className="btn btn-cancel-sm"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`delete-user-${u._id}`}
                        className="btn btn-ghost-danger"
                        onClick={() => setDeleteConfirm(u._id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ── Add User Modal ── */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add User">
          <div className="modal animate-fade-in-up" id="add-user-modal">
            <div className="modal__header">
              <h2 className="modal__title">Add New User</h2>
              <button className="modal__close" onClick={() => setShowModal(false)} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {formError && (
              <div className="alert alert--error" style={{ marginBottom: 'var(--space-4)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {formError}
              </div>
            )}

            <form className="modal__form" onSubmit={handleCreate}>
              <div className="modal-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="new-user-name">Full Name</label>
                  <input
                    id="new-user-name" type="text" className="form-input form-input--plain"
                    placeholder="Jane Doe" required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-user-email">Email</label>
                  <input
                    id="new-user-email" type="email" className="form-input form-input--plain"
                    placeholder="jane@example.com" required
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-user-password">Password</label>
                  <input
                    id="new-user-password" type="password" className="form-input form-input--plain"
                    placeholder="Min 8 characters" required minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-user-role">Role</label>
                  <select
                    id="new-user-role" className="form-input form-input--plain"
                    value={formData.role}
                    onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              {/* Permissions */}
              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <label className="form-label">Permissions</label>
                <div className="permissions-checkboxes">
                  {[
                    { key: 'cameraAccess', label: 'Camera Access' },
                    { key: 'userViewAccess', label: 'User View Access' },
                  ].map(({ key, label }) => (
                    <label key={key} className="perm-checkbox">
                      <input
                        type="checkbox"
                        checked={formData[key]}
                        onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.checked }))}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal__actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  id="create-user-submit-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? (
                    <><span className="spinner" aria-hidden="true" /> Creating…</>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Tiny sub-component: permission dot ── */
function PermDot({ label, on }) {
  return (
    <span className={`perm-dot ${on ? 'perm-dot--on' : 'perm-dot--off'}`} title={label}>
      <span className="perm-dot__indicator" />
      {label}
    </span>
  );
}
