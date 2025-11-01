import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import AdminCardReview from './AdminCardReview.jsx';
import AdminThemeManager from './AdminThemeManager.jsx';
import './AdminPage.css';

/**
 * AdminPage component
 * Provides admin functionality: user management, password changes, progress reset, stats
 */
export default function AdminPage() {
  const { user, isAdmin: isAdminUser } = useAuth();
  
  // All hooks must be called before any conditional returns
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stats state
  const [stats, setStats] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms state
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
  const [passwordForm, setPasswordForm] = useState({ userId: '', newPassword: '', confirmPassword: '' });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Load system statistics
  const loadStats = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load stats');
      }
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load all users
  const loadUsers = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!newUser.email || !newUser.password) {
      setError('Email and password required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          email: newUser.email,
          password: newUser.password,
          role: newUser.role
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`User ${newUser.email} created successfully`);
        setNewUser({ email: '', password: '', role: 'user' });
        loadUsers();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (userId, updates) => {
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          userId,
          ...updates
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('User updated successfully');
        loadUsers();
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, email) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This will also delete all their progress.`)) {
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          userId
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`User ${email} deleted successfully`);
        loadUsers();
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!passwordForm.userId || !passwordForm.newPassword) {
      setError('User and new password required');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordForm.userId,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Password changed successfully');
        setPasswordForm({ userId: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset SM-2 progress
  const handleResetProgress = async (userId = null) => {
    const message = userId 
      ? `Reset SM-2 progress for this user? This cannot be undone.`
      : `Reset SM-2 progress for ALL users? This cannot be undone.`;
    
    if (!confirm(message)) {
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/admin/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          confirm: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(userId ? 'Progress reset for user' : 'Progress reset for all users');
      } else {
        setError(data.error || 'Failed to reset progress');
      }
    } catch (err) {
      setError('Failed to reset progress');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle admin role
  const handleToggleAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? null : 'admin';
    await handleUpdateUser(userId, { role: newRole });
  };

  // Load stats on mount - AFTER all function definitions, BEFORE conditional return
  useEffect(() => {
    if (!isAdminUser) return; // Early return inside useEffect is OK
    
    // Only auto-load if we haven't tried before (to avoid spamming errors)
    if (activeTab === 'stats' && !stats && !loading) {
      loadStats();
    } else if (activeTab === 'users' || activeTab === 'password') {
      if (users.length === 0 && !loading) {
        loadUsers();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdminUser]);

  // Redirect if not admin - check AFTER all hooks
  if (!isAdminUser) {
    return (
      <div className="admin-page">
        <h1>Access Denied</h1>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button
          className={`admin-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Reset Progress
        </button>
        <button
          className={`admin-tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          Card Review
        </button>
        <button
          className={`admin-tab ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          Themes
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="admin-message admin-error">
          {error}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}
      {success && (
        <div className="admin-message admin-success">
          {success}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="admin-tab-content">
          <h2>System Statistics</h2>
          {error && !stats ? (
            <div className="admin-message admin-error">
              <p><strong>Failed to load statistics:</strong> {error}</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                This usually means the admin API is not configured. Check that <code>SUPABASE_SERVICE_ROLE_KEY</code> is set in Vercel environment variables and redeploy.
              </p>
            </div>
          ) : loading && !stats ? (
            <p>Loading...</p>
          ) : stats ? (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Cards</h3>
                <p className="stat-value">{stats.totalCards}</p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
                <p className="stat-sub">{stats.adminCount} admin(s), {stats.userCount} user(s)</p>
              </div>
              <div className="stat-card">
                <h3>Total Progress Records</h3>
                <p className="stat-value">{stats.totalProgress}</p>
              </div>
              <div className="stat-card">
                <h3>Cards by Type</h3>
                <div className="stat-list">
                  {Object.entries(stats.cardsByType || {}).map(([type, count]) => (
                    <div key={type} className="stat-item">
                      <span className="stat-label">{type}:</span>
                      <span className="stat-number">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>No statistics available</p>
          )}
          <button onClick={loadStats} className="btn-secondary" disabled={loading}>
            Refresh
          </button>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-tab-content">
          <h2>User Management</h2>

          {/* Create User Form */}
          <div className="admin-section">
            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser} className="admin-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  disabled={loading}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                Create User
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="admin-section">
            <h3>All Users</h3>
            {loading && users.length === 0 ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Progress Records</th>
                      <th>Created</th>
                      <th>Last Sign In</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td>{u.progressCount}</td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                        <td>{u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString() : 'Never'}</td>
                        <td className="actions-cell">
                          <button
                            onClick={() => handleToggleAdmin(u.id, u.role)}
                            className="btn-small"
                            disabled={loading}
                            title={u.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                          >
                            {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => setPasswordForm({ ...passwordForm, userId: u.id })}
                            className="btn-small"
                            disabled={loading}
                          >
                            Change Password
                          </button>
                          <button
                            onClick={() => handleResetProgress(u.id)}
                            className="btn-small btn-danger"
                            disabled={loading}
                          >
                            Reset Progress
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="btn-small btn-danger"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button onClick={loadUsers} className="btn-secondary" disabled={loading}>
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="admin-tab-content">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword} className="admin-form">
            <div className="form-group">
              <label>User</label>
              <select
                value={passwordForm.userId}
                onChange={(e) => setPasswordForm({ ...passwordForm, userId: e.target.value })}
                required
                disabled={loading}
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email} {u.role === 'admin' ? '(Admin)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              Change Password
            </button>
          </form>
          {users.length === 0 && (
            <p className="hint">No users loaded. Switch to "User Management" tab first.</p>
          )}
        </div>
      )}

      {/* Reset Progress Tab */}
      {activeTab === 'progress' && (
        <div className="admin-tab-content">
          <h2>Reset SM-2 Progress</h2>
          <div className="admin-section">
            <h3>Reset Progress for Specific User</h3>
            <p className="warning">This will delete all SM-2 progress data for the selected user.</p>
            <select
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value || null)}
              disabled={loading}
            >
              <option value="">Select a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} ({u.progressCount} records)
                </option>
              ))}
            </select>
            <button
              onClick={() => handleResetProgress(selectedUser)}
              className="btn-danger"
              disabled={loading || !selectedUser}
            >
              Reset Progress for User
            </button>
          </div>

          <div className="admin-section danger-zone">
            <h3>⚠️ Danger Zone</h3>
            <p className="warning">Reset progress for ALL users. This cannot be undone!</p>
            <button
              onClick={() => handleResetProgress(null)}
              className="btn-danger btn-large"
              disabled={loading}
            >
              Reset Progress for ALL Users
            </button>
          </div>
        </div>
      )}

      {/* Card Review Tab */}
      {activeTab === 'cards' && (
        <div className="admin-tab-content">
          <AdminCardReview isAdmin={isAdminUser} />
        </div>
      )}

      {/* Themes Tab */}
      {activeTab === 'themes' && (
        <div className="admin-tab-content">
          <AdminThemeManager />
        </div>
      )}
    </div>
  );
}

